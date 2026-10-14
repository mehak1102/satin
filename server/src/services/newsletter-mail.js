import crypto from 'crypto';
import { env } from '../config/env.js';
import { Newsletter } from '../models/Newsletter.js';
import { SiteSetting } from '../models/SiteSetting.js';
import { ApiError } from '../utils/ApiError.js';
import { hashToken } from './auth.service.js';
import { sendMail, smtpEnabled } from './mail.service.js';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function supportLines(support = {}) {
  return [support.email, support.phone, support.tollFree, support.website, support.address].filter(Boolean);
}

function leaveLinkFor(token) {
  return `${String(env.clientUrl || '').replace(/\/$/, '')}/leave-notes?token=${token}`;
}

export function buildNewsletterConfirmation(support = {}, leaveLink = '') {
  const care = supportLines(support);
  const text = [
    'Your email is saved for Satin product notes.',
    ...(leaveLink ? ['', 'To leave the list, open this link:', leaveLink] : []),
    ...(care.length ? ['', 'Customer care:', ...care] : []),
  ].join('\n');
  const html = [
    '<p>Your email is saved for Satin product notes.</p>',
    ...(leaveLink ? [`<p>To leave the list, open <a href="${escapeHtml(leaveLink)}">this link</a>.</p>`] : []),
    ...(care.length ? [`<p>Customer care:<br>${care.map(escapeHtml).join('<br>')}</p>`] : []),
  ].join('');

  return {
    subject: 'You are on the Satin notes list',
    text,
    html,
  };
}

export function buildNewsletterLeave(leaveLink) {
  return {
    subject: 'Leave the Satin notes list',
    text: `Open this link to stop Satin product notes.\n\n${leaveLink}\n\nIf you did not ask for this, you can ignore this email.`,
    html: `<p>Open this link to stop Satin product notes.</p><p><a href="${escapeHtml(leaveLink)}">Leave the list</a></p><p>If you did not ask for this, you can ignore this email.</p>`,
  };
}

async function notifyNewsletter(email, send, token) {
  if (!smtpEnabled()) return false;

  const claimed = await Newsletter.updateOne(
    { email, confirmationSent: { $ne: true } },
    { $set: { confirmationSent: true } },
  );
  if (claimed.modifiedCount !== 1) return false;

  try {
    const settings = await SiteSetting.findOne({ key: 'store' }).select('support').lean();
    const message = buildNewsletterConfirmation(settings?.support || {}, leaveLinkFor(token));
    await send({ to: email, ...message });
    return true;
  } catch (error) {
    await Newsletter.updateOne({ email }, { $set: { confirmationSent: false } });
    console.error('Newsletter email failed:', error.message);
    return false;
  }
}

export async function subscribeNewsletter(email, send = sendMail) {
  const normalized = String(email || '').trim().toLowerCase();
  const existing = await Newsletter.findOne({ email: normalized }).select('active confirmationSent').lean();
  if (existing && existing.active !== false && existing.confirmationSent) {
    return { emailed: false, already: true };
  }

  const token = crypto.randomBytes(32).toString('hex');
  await Newsletter.updateOne(
    { email: normalized },
    {
      $set: {
        active: true,
        confirmationSent: false,
        unsubscribeTokenHash: hashToken(token),
      },
      $setOnInsert: { email: normalized },
    },
    { upsert: true },
  );

  const emailed = await notifyNewsletter(normalized, send, token);
  return { emailed, already: false };
}

export async function requestNewsletterLeave(email, send = sendMail) {
  if (!smtpEnabled()) throw new ApiError(503, 'Email could not be sent. Try again shortly.');

  const normalized = String(email || '').trim().toLowerCase();
  const current = await Newsletter.findOne({ email: normalized, active: { $ne: false } });
  if (!current) return { sent: false };

  const token = crypto.randomBytes(32).toString('hex');
  const previous = current.unsubscribeTokenHash;
  current.unsubscribeTokenHash = hashToken(token);
  await current.save();

  try {
    await send({ to: normalized, ...buildNewsletterLeave(leaveLinkFor(token)) });
  } catch (error) {
    await Newsletter.updateOne(
      { _id: current._id },
      previous ? { $set: { unsubscribeTokenHash: previous } } : { $unset: { unsubscribeTokenHash: 1 } },
    );
    console.error('Newsletter leave email failed:', error.message);
    throw new ApiError(503, 'Email could not be sent. Try again shortly.');
  }

  return { sent: true };
}

export async function unsubscribeNewsletter(token) {
  const updated = await Newsletter.findOneAndUpdate(
    { unsubscribeTokenHash: hashToken(String(token || '')), active: { $ne: false } },
    { $set: { active: false }, $unset: { unsubscribeTokenHash: 1 } },
    { returnDocument: 'after' },
  );
  if (!updated) throw new ApiError(400, 'This link is invalid or was already used.');
  return { removed: true };
}
