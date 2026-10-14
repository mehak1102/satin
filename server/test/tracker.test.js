import 'dotenv/config';
import assert from 'node:assert/strict';
import { createServer } from 'http';
import { after, before, test } from 'node:test';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { connectDb } from '../src/config/db.js';
import { CycleLog } from '../src/models/CycleLog.js';
import { User } from '../src/models/User.js';
import { buildCycleReminder, sendDueReminders } from '../src/services/cycle-reminder.js';
import { addDays, cycleSummary, periodsFrom, todayIn } from '../src/utils/cycle.js';

const email = `tracker-${Date.now()}@example.com`;
let base = '';
let server;
let cookie = '';
let userId = '';

function jarFrom(response) {
  const rows = typeof response.headers.getSetCookie === 'function' ? response.headers.getSetCookie() : [];
  return rows.map((row) => row.split(';')[0]).join('; ');
}

async function api(path, options = {}) {
  const response = await fetch(`${base}${path}`, {
    ...options,
    headers: { 'content-type': 'application/json', cookie, ...(options.headers || {}) },
  });
  const body = await response.json().catch(() => ({}));
  return { status: response.status, body, jar: jarFrom(response) };
}

function range(start, count) {
  return Array.from({ length: count }, (_, index) => addDays(start, index));
}

before(async () => {
  await connectDb();
  server = createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
  const created = await api('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: 'Tracker Check', email, password: 'tracker-pass-123' }),
  });
  assert.equal(created.status, 201);
  userId = created.body.user._id;
  cookie = created.jar;
});

after(async () => {
  if (userId) await CycleLog.deleteMany({ user: userId });
  await User.deleteOne({ email });
  server?.close();
  await mongoose.disconnect();
});

test('logged days group into periods and give an estimate', () => {
  const dates = [...range('2026-08-01', 5), ...range('2026-08-29', 5), ...range('2026-09-26', 5)];
  const summary = cycleSummary(dates, '2026-10-13');
  assert.equal(summary.periods.length, 3);
  assert.equal(summary.avgCycle, 28);
  assert.equal(summary.avgPeriod, 5);
  assert.equal(summary.nextStart, '2026-10-24');
  assert.equal(summary.daysUntil, 11);
  assert.equal(summary.inPeriod, false);
});

test('one skipped day does not split a period, and one period gives no estimate', () => {
  assert.equal(periodsFrom(['2026-10-01', '2026-10-03', '2026-10-04']).length, 1);
  const single = cycleSummary(range('2026-10-01', 4), '2026-10-13');
  assert.equal(single.nextStart, null);
  assert.equal(single.avgPeriod, 4);
});

test('tracker data is private to the account and can be deleted', async () => {
  const anonymous = await fetch(`${base}/api/tracker`);
  assert.equal(anonymous.status, 401);

  const empty = await api('/api/tracker');
  assert.equal(empty.status, 200);
  assert.equal(empty.body.synced, false);

  const future = addDays(todayIn(), 10);
  const saved = await api('/api/tracker', {
    method: 'PUT',
    body: JSON.stringify({ days: [{ date: '2026-09-01', flow: 'heavy' }, { date: future, flow: 'light' }] }),
  });
  assert.equal(saved.status, 200);
  assert.equal(saved.body.synced, true);
  assert.deepEqual(saved.body.days, [{ date: '2026-09-01', flow: 'heavy' }]);

  const invalid = await api('/api/tracker', { method: 'PUT', body: JSON.stringify({ days: [{ date: '2026-02-30' }] }) });
  assert.equal(invalid.status, 400);

  const removed = await api('/api/tracker', { method: 'DELETE' });
  assert.equal(removed.body.synced, false);
  assert.equal(await CycleLog.countDocuments({ user: userId }), 0);
});

test('reminder goes out once, two days before the estimate', async () => {
  const today = todayIn();
  const nextStart = addDays(today, 2);
  const days = [...range(addDays(nextStart, -56), 4), ...range(addDays(nextStart, -28), 4)].map((date) => ({ date, flow: 'medium' }));
  const saved = await api('/api/tracker', { method: 'PUT', body: JSON.stringify({ days, reminder: true }) });
  assert.equal(saved.body.reminder, true);

  const outbox = [];
  const send = async (message) => outbox.push(message);
  const filter = { user: userId };
  assert.equal(await sendDueReminders({ today, send, filter }), 1);
  assert.equal(outbox[0].to, email);
  assert.equal(outbox[0].subject, 'A note from Satin');
  assert.match(outbox[0].text, /not medical advice/);
  assert.equal(await sendDueReminders({ today, send, filter }), 0);
});

test('reminder mail escapes names and links to the tracker', () => {
  const message = buildCycleReminder({
    name: '<b>Asha</b> K',
    nextStart: '2026-10-24',
    packName: 'Satin XL',
    packLink: 'http://localhost:5173/product/satin-xl',
    trackerLink: 'http://localhost:5173/tracker',
  });
  assert.doesNotMatch(message.html, /<b>Asha/);
  assert.match(message.html, /href="http:\/\/localhost:5173\/tracker"/);
  assert.match(message.text, /Reorder Satin XL/);
});
