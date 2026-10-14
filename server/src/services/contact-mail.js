import { SiteSetting } from '../models/SiteSetting.js';
import { sendMail, smtpEnabled } from './mail.service.js';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function oneLine(value) {
  return String(value || '').replace(/[\r\n]+/g, ' ').trim();
}

export function buildContactNotice(message) {
  const lines = [`Name: ${message.name}`, `Email: ${message.email}`];
  if (message.phone) lines.push(`Phone: ${message.phone}`);
  lines.push('', message.message);
  const text = lines.join('\n');
  const html = [
    `<p>${lines
      .slice(0, message.phone ? 3 : 2)
      .map((line) => escapeHtml(line))
      .join('<br>')}</p>`,
    `<p>${escapeHtml(message.message).replace(/\n/g, '<br>')}</p>`,
  ].join('');

  return {
    subject: `Satin: ${oneLine(message.subject)}`,
    text,
    html,
  };
}

export async function notifyContactMessage(message, send = sendMail) {
  if (!smtpEnabled()) return false;
  const settings = await SiteSetting.findOne({ key: 'store' }).select('support.email').lean();
  const to = settings?.support?.email?.trim();
  if (!to) return false;

  try {
    await send({
      to,
      replyTo: message.email,
      ...buildContactNotice(message),
    });
    return true;
  } catch (error) {
    console.error('Contact email failed:', error.message);
    return false;
  }
}
