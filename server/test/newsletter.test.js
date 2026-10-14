import 'dotenv/config';
import assert from 'node:assert/strict';
import crypto from 'crypto';
import { createServer } from 'http';
import { after, before, test } from 'node:test';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { connectDb } from '../src/config/db.js';
import { Newsletter } from '../src/models/Newsletter.js';
import { hashToken } from '../src/services/auth.service.js';
import { buildNewsletterConfirmation } from '../src/services/newsletter-mail.js';

const email = `notes-leave-${Date.now()}@example.com`;
let base = '';
let server;
let token = '';

before(async () => {
  await connectDb();
  token = crypto.randomBytes(32).toString('hex');
  await Newsletter.create({
    email,
    active: true,
    confirmationSent: true,
    unsubscribeTokenHash: hashToken(token),
  });
  server = createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await Newsletter.deleteOne({ email });
  server?.close();
  await mongoose.disconnect();
});

test('confirmation mail includes a leave link', () => {
  const message = buildNewsletterConfirmation({}, 'http://localhost:5173/leave-notes?token=abc');
  assert.match(message.text, /leave-notes\?token=abc/);
  assert.match(message.html, /href="http:\/\/localhost:5173\/leave-notes\?token=abc"/);
});

test('a leave link removes the address once', async () => {
  const removed = await fetch(`${base}/api/contact/newsletter/unsubscribe`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  const body = await removed.json();
  assert.equal(removed.status, 200);
  assert.equal(body.success, true);
  const saved = await Newsletter.findOne({ email }).lean();
  assert.equal(saved.active, false);
  assert.equal(saved.unsubscribeTokenHash, undefined);

  const again = await fetch(`${base}/api/contact/newsletter/unsubscribe`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  assert.equal(again.status, 400);
});
