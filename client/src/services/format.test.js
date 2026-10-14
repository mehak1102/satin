import assert from 'node:assert/strict';
import test from 'node:test';
import { formatPrice } from './api.js';

test('prices are shown in rupees', () => {
  const regular = formatPrice(40);
  assert.equal(regular.includes('40'), true);
  assert.equal(regular.includes('₹') || regular.includes('INR'), true);
  assert.equal(formatPrice(60).includes('60'), true);
});
