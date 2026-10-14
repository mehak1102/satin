import 'dotenv/config';
import assert from 'node:assert/strict';
import crypto from 'crypto';
import { createServer } from 'http';
import { after, before, test } from 'node:test';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { connectDb } from '../src/config/db.js';
import { env } from '../src/config/env.js';
import { Order } from '../src/models/Order.js';
import { User } from '../src/models/User.js';

const email = `critical-${Date.now()}@example.com`;
const password = 'test-pass-123';
let base = '';
let server;
let cookie = '';
let userId = '';

function jarFrom(response) {
  const rows = typeof response.headers.getSetCookie === 'function' ? response.headers.getSetCookie() : [];
  return rows.map((row) => row.split(';')[0]).join('; ');
}

async function api(path, options = {}) {
  const response = await fetch(`${base}${path}`, options);
  const body = await response.json().catch(() => ({}));
  return { status: response.status, body, jar: jarFrom(response) };
}

before(async () => {
  await connectDb();
  server = createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (userId) await Order.deleteMany({ user: userId });
  await User.deleteOne({ email });
  server?.close();
  await mongoose.disconnect();
});

test('registration creates an account without returning the password', async () => {
  const created = await api('/api/auth/register', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'Critical Check', email, password }),
  });
  assert.equal(created.status, 201);
  assert.equal(created.body.success, true);
  assert.equal(Object.hasOwn(created.body.user, 'passwordHash'), false);
  userId = created.body.user._id;
  cookie = created.jar;

  const duplicate = await api('/api/auth/register', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'Critical Check', email, password }),
  });
  assert.equal(duplicate.status, 409);
});

test('login accepts the right password and rejects the wrong one', async () => {
  const wrong = await api('/api/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password: 'wrong-pass-123' }),
  });
  assert.equal(wrong.status, 401);

  const right = await api('/api/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  assert.equal(right.status, 200);
  assert.equal(right.body.user.email, email);
  cookie = right.jar;
});

test('refresh cookie alone renews the session', async () => {
  const refreshOnly = cookie
    .split('; ')
    .filter((row) => row.startsWith('refreshToken='))
    .join('; ');
  const expired = await api('/api/auth/me', { headers: { cookie: refreshOnly } });
  assert.equal(expired.status, 401);

  const renewed = await api('/api/auth/refresh', { method: 'POST', headers: { cookie: refreshOnly } });
  assert.equal(renewed.status, 200);
  assert.equal(renewed.body.user.email, email);
  assert.match(renewed.jar, /accessToken=/);

  const me = await api('/api/auth/me', { headers: { cookie: renewed.jar } });
  assert.equal(me.status, 200);

  const none = await api('/api/auth/refresh', { method: 'POST' });
  assert.equal(none.status, 401);
});

test('product API returns the four packs and hides internal notes', async () => {
  const list = await api('/api/products');
  assert.equal(list.status, 200);
  const slugs = list.body.items.map((item) => item.slug);
  for (const slug of ['satin-regular', 'satin-xl', 'satin-ultra-pack-of-2', 'satin-ultra-box']) {
    assert.equal(slugs.includes(slug), true);
  }
  assert.equal(list.body.items.some((item) => Object.hasOwn(item, 'dataNotes')), false);

  const detail = await api('/api/products/satin-regular');
  assert.equal(detail.status, 200);
  assert.equal(detail.body.product.sku, 'SATIN-REG-L-6');
  assert.equal(Object.hasOwn(detail.body.product, 'dataNotes'), false);
});

test('cart quote uses the stored price', async () => {
  const detail = await api('/api/products/satin-regular');
  const product = detail.body.product;
  const quote = await api('/api/payments/quote', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ items: [{ productId: product._id, quantity: 2, price: 1 }] }),
  });
  assert.equal(quote.status, 200);
  assert.equal(quote.body.quote.lines[0].unitPrice, product.price);
  assert.equal(quote.body.quote.subtotal, Math.round(product.price * 2 * 100) / 100);

  const tooMany = await api('/api/payments/quote', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ items: [{ productId: product._id, quantity: 99 }] }),
  });
  assert.equal(tooMany.status, 400);
});

test('checkout creates an order from the server total', async () => {
  const guest = await api('/api/payments/create-order', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ items: [] }),
  });
  assert.equal(guest.status, 401);

  const detail = await api('/api/products/satin-regular');
  const product = detail.body.product;
  const created = await api('/api/payments/create-order', {
    method: 'POST',
    headers: { 'content-type': 'application/json', cookie },
    body: JSON.stringify({
      contactEmail: email,
      shippingAddress: {
        fullName: 'Critical Check',
        phone: '01124335055',
        line1: 'C-374 Defence Colony',
        city: 'New Delhi',
        state: 'Delhi',
        postalCode: '110024',
      },
      items: [{ productId: product._id, quantity: 1, price: 1 }],
    }),
  });
  assert.equal(created.status, 201);
  assert.equal(created.body.checkout.summary.total >= product.price, true);
  assert.equal(created.body.checkout.amount, Math.round(created.body.checkout.summary.total * 100));
  assert.equal(created.body.checkout.currency, 'INR');

  const saved = await Order.findById(created.body.checkout.orderId).lean();
  assert.equal(saved.paymentStatus, 'pending');
  assert.equal(saved.items[0].unitPrice, product.price);
  assert.equal(saved.user.toString(), userId);
});

test('Razorpay webhook rejects a bad signature and accepts a signed event', async () => {
  const previous = env.razorpayWebhookSecret;
  env.razorpayWebhookSecret = 'hook-test-secret';
  try {
    const raw = JSON.stringify({
      event: 'payment.captured',
      payload: { payment: { entity: { id: 'pay_test', order_id: 'order_missing' } } },
    });
    const signature = crypto.createHmac('sha256', env.razorpayWebhookSecret).update(raw).digest('hex');
    const bad = await api('/api/payments/webhook', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-razorpay-signature': 'not-the-signature' },
      body: raw,
    });
    assert.equal(bad.status, 400);

    const good = await api('/api/payments/webhook', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-razorpay-signature': signature },
      body: raw,
    });
    assert.equal(good.status, 200);

    env.razorpayWebhookSecret = '';
    const unconfigured = await api('/api/payments/webhook', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-razorpay-signature': signature },
      body: raw,
    });
    assert.equal(unconfigured.status, 503);
  } finally {
    env.razorpayWebhookSecret = previous;
  }
});

test('cart quantity and another customer payment cannot be forced', async () => {
  const detail = await api('/api/products/satin-regular');
  const productId = detail.body.product._id;
  const tooMany = await api('/api/cart/items', {
    method: 'POST',
    headers: { 'content-type': 'application/json', cookie },
    body: JSON.stringify({ productId, quantity: 21 }),
  });
  assert.equal(tooMany.status, 400);
  assert.equal(Object.hasOwn(tooMany.body, 'stack'), false);

  const badId = await api('/api/cart/items', {
    method: 'POST',
    headers: { 'content-type': 'application/json', cookie },
    body: JSON.stringify({ productId: 'not-an-id', quantity: 1 }),
  });
  assert.equal(badId.status, 400);
  assert.equal(badId.body.message, 'Please check the form and try again.');

  const razorpayOrderId = `order_auth_${Date.now()}`;
  const outsider = await Order.create({
    orderNumber: `AUTH-${Date.now()}`,
    user: new mongoose.Types.ObjectId(),
    items: [
      {
        product: productId,
        name: 'Satin Regular',
        slug: 'satin-regular',
        sku: 'SATIN-REG-L-6',
        unitPrice: 40,
        quantity: 1,
        lineTotal: 40,
      },
    ],
    shippingAddress: {
      fullName: 'Other Customer',
      phone: '01124335055',
      line1: 'C-374 Defence Colony',
      city: 'New Delhi',
      state: 'Delhi',
      postalCode: '110024',
    },
    contactEmail: `other-${Date.now()}@example.com`,
    subtotal: 40,
    total: 40,
    paymentStatus: 'pending',
    razorpayOrderId,
  });
  try {
    const signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|pay_auth`)
      .digest('hex');
    const verified = await api('/api/payments/verify', {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({
        razorpayOrderId,
        razorpayPaymentId: 'pay_auth',
        razorpaySignature: signature,
      }),
    });
    assert.equal(verified.status, 404);
    const saved = await Order.findById(outsider._id).select('paymentStatus').lean();
    assert.equal(saved.paymentStatus, 'pending');
  } finally {
    await Order.findByIdAndDelete(outsider._id);
  }
});

test('a malformed order id is a 400, not a server error', async () => {
  const bad = await api('/api/orders/not-an-id', { headers: { cookie } });
  assert.equal(bad.status, 400);

  const missing = await api('/api/orders/0123456789abcdef01234567', { headers: { cookie } });
  assert.equal(missing.status, 404);
});

test('admin routes stay closed to customers', async () => {
  const forbidden = await api('/api/admin/overview', { headers: { cookie } });
  assert.equal(forbidden.status, 403);

  const guest = await api('/api/admin/overview');
  assert.equal(guest.status, 401);

  const admin = await api('/api/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD }),
  });
  assert.equal(admin.status, 200);
  const overview = await api('/api/admin/overview', { headers: { cookie: admin.jar } });
  assert.equal(overview.status, 200);
  assert.equal(typeof overview.body.overview.products, 'number');
});
