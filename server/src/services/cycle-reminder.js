import { env } from '../config/env.js';
import { CycleLog } from '../models/CycleLog.js';
import { Order } from '../models/Order.js';
import { cycleSummary, todayIn } from '../utils/cycle.js';
import { sendMail, smtpEnabled } from './mail.service.js';

const REMIND_WITHIN = 2;
const SEND_FROM_HOUR = 9;

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function siteUrl(path) {
  return `${String(env.clientUrl || '').replace(/\/$/, '')}${path}`;
}

function longDate(date) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
}

// The subject stays neutral because inbox previews are often visible to others.
export function buildCycleReminder({ name = '', nextStart, packName = '', packLink, trackerLink }) {
  const hello = name ? `Hi ${name.split(/\s+/)[0]},` : 'Hi,';
  const when = longDate(nextStart);
  const reorder = packName ? `Reorder ${packName}` : 'Shop Satin packs';
  const text = [
    hello,
    '',
    `Based on the dates you logged, your next period may start around ${when}.`,
    'This is an estimate from your own log, not medical advice.',
    '',
    `${reorder}: ${packLink}`,
    `Open your tracker: ${trackerLink}`,
    '',
    'To stop these reminders, turn them off on the tracker page.',
  ].join('\n');
  const html = [
    `<p>${escapeHtml(hello)}</p>`,
    `<p>Based on the dates you logged, your next period may start around <strong>${escapeHtml(when)}</strong>.<br>This is an estimate from your own log, not medical advice.</p>`,
    `<p><a href="${escapeHtml(packLink)}">${escapeHtml(reorder)}</a> &middot; <a href="${escapeHtml(trackerLink)}">Open your tracker</a></p>`,
    '<p style="color:#5b7280;font-size:13px">To stop these reminders, turn them off on the tracker page.</p>',
  ].join('');
  return { subject: 'A note from Satin', text, html };
}

async function usualPack(userId) {
  const order = await Order.findOne({ user: userId, paymentStatus: 'paid' }).sort({ createdAt: -1 }).select('items').lean();
  const item = order?.items?.[0];
  return item ? { packName: item.name, packLink: siteUrl(`/product/${item.slug}`) } : { packName: '', packLink: siteUrl('/shop') };
}

export async function sendDueReminders({ today = todayIn(), send = sendMail, filter = {} } = {}) {
  if (!smtpEnabled() && send === sendMail) return 0;
  const logs = await CycleLog.find({ ...filter, reminder: true }).populate('user', 'email name isActive').lean();
  let sent = 0;

  for (const log of logs) {
    if (!log.user?.email || log.user.isActive === false) continue;
    const summary = cycleSummary(log.days.map((day) => day.date), today);
    if (!summary.nextStart || summary.inPeriod) continue;
    if (summary.daysUntil < 0 || summary.daysUntil > REMIND_WITHIN) continue;
    if (log.remindedFor === summary.nextStart) continue;

    const claimed = await CycleLog.updateOne(
      { _id: log._id, remindedFor: { $ne: summary.nextStart } },
      { $set: { remindedFor: summary.nextStart } },
    );
    if (claimed.modifiedCount !== 1) continue;

    try {
      const message = buildCycleReminder({
        name: log.user.name,
        nextStart: summary.nextStart,
        trackerLink: siteUrl('/tracker'),
        ...(await usualPack(log.user._id)),
      });
      await send({ to: log.user.email, ...message });
      sent += 1;
    } catch (error) {
      await CycleLog.updateOne({ _id: log._id }, { $set: { remindedFor: log.remindedFor || '' } });
      console.error('Cycle reminder failed:', error.message);
    }
  }
  return sent;
}

export function startCycleReminders() {
  const run = () => {
    const hour = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', hour12: false }).format(new Date()));
    if (hour < SEND_FROM_HOUR) return;
    sendDueReminders().catch((error) => console.error('Cycle reminders failed:', error.message));
  };
  setTimeout(run, 60 * 1000).unref();
  setInterval(run, 60 * 60 * 1000).unref();
}
