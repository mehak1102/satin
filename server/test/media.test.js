import assert from 'node:assert/strict';
import { test } from 'node:test';
import { publicMediaUrls } from '../src/middleware/media.js';

function run(host) {
  const req = { protocol: 'https', get: () => host };
  let sent;
  const res = { json: (body) => (sent = body) };
  publicMediaUrls(req, res, () => {});
  res.json({
    items: [{ images: [{ url: 'http://localhost:5000/media/products/xl-7-front.png' }] }],
    order: { image: 'http://127.0.0.1:5000/media/products/regular-side.png' },
    other: 'https://res.cloudinary.com/x/image.png',
  });
  return sent;
}

test('deployed server rewrites localhost image URLs to its own address', () => {
  const body = run('satin-api.onrender.com');
  assert.equal(body.items[0].images[0].url, 'https://satin-api.onrender.com/media/products/xl-7-front.png');
  assert.equal(body.order.image, 'https://satin-api.onrender.com/media/products/regular-side.png');
  assert.equal(body.other, 'https://res.cloudinary.com/x/image.png');
});

test('local server leaves image URLs alone', () => {
  const body = run('localhost:5000');
  assert.equal(body.items[0].images[0].url, 'http://localhost:5000/media/products/xl-7-front.png');
});
