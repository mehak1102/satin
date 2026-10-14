import { env } from '../config/env.js';
import { Order } from '../models/Order.js';
import { SiteSetting } from '../models/SiteSetting.js';
import { sendMail, smtpEnabled } from './mail.service.js';

function inr(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(amount) || 0);
}

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

export function buildOrderConfirmation(order, support = {}) {
  const address = order.shippingAddress || {};
  const lines = (order.items || []).map(
    (item) => `${item.name} × ${item.quantity} — ${inr(item.lineTotal)}`,
  );
  const addressLines = [
    address.fullName,
    address.line1,
    address.line2,
    [address.city, address.state, address.postalCode].filter(Boolean).join(', '),
    address.phone,
  ].filter(Boolean);
  const care = supportLines(support);
  const link = `${env.clientUrl}/order/${order._id}`;

  const text = [
    `Your Satin order ${order.orderNumber} is confirmed.`,
    '',
    ...lines,
    '',
    `Subtotal ${inr(order.subtotal)}`,
    `Shipping ${inr(order.shipping)}`,
    `Tax ${inr(order.tax)}`,
    `Total ${inr(order.total)}`,
    '',
    'Ship to:',
    ...addressLines,
    '',
    `View the order: ${link}`,
    ...(care.length ? ['', 'Customer care:', ...care] : []),
  ].join('\n');

  const html = [
    `<p>Your Satin order ${escapeHtml(order.orderNumber)} is confirmed.</p>`,
    '<ul>',
    ...(order.items || []).map(
      (item) => `<li>${escapeHtml(item.name)} × ${escapeHtml(item.quantity)} — ${escapeHtml(inr(item.lineTotal))}</li>`,
    ),
    '</ul>',
    `<p>Subtotal ${escapeHtml(inr(order.subtotal))}<br>Shipping ${escapeHtml(inr(order.shipping))}<br>Tax ${escapeHtml(inr(order.tax))}<br>Total ${escapeHtml(inr(order.total))}</p>`,
    `<p>Ship to:<br>${addressLines.map(escapeHtml).join('<br>')}</p>`,
    `<p><a href="${escapeHtml(link)}">View the order</a></p>`,
    ...(care.length ? [`<p>Customer care:<br>${care.map(escapeHtml).join('<br>')}</p>`] : []),
  ].join('');

  return {
    subject: `Satin order ${order.orderNumber} is confirmed`,
    text,
    html,
  };
}

export function buildShipmentNotice(order, support = {}) {
  const tracking = String(order.trackingNumber || '').trim();
  const link = `${env.clientUrl}/order/${order._id}`;
  const care = supportLines(support);
  const text = [
    `Your Satin order ${order.orderNumber} has been marked shipped.`,
    ...(tracking ? ['', `Tracking number: ${tracking}`] : []),
    '',
    `View the order: ${link}`,
    ...(care.length ? ['', 'Customer care:', ...care] : []),
  ].join('\n');
  const html = [
    `<p>Your Satin order ${escapeHtml(order.orderNumber)} has been marked shipped.</p>`,
    ...(tracking ? [`<p>Tracking number: ${escapeHtml(tracking)}</p>`] : []),
    `<p><a href="${escapeHtml(link)}">View the order</a></p>`,
    ...(care.length ? [`<p>Customer care:<br>${care.map(escapeHtml).join('<br>')}</p>`] : []),
  ].join('');

  return {
    subject: `Satin order ${order.orderNumber} has shipped`,
    text,
    html,
  };
}

export function buildDeliveryNotice(order, support = {}) {
  const tracking = String(order.trackingNumber || '').trim();
  const link = `${env.clientUrl}/order/${order._id}`;
  const care = supportLines(support);
  const text = [
    `Your Satin order ${order.orderNumber} has been marked delivered.`,
    ...(tracking ? ['', `Tracking number: ${tracking}`] : []),
    '',
    `View the order: ${link}`,
    ...(care.length ? ['', 'Customer care:', ...care] : []),
  ].join('\n');
  const html = [
    `<p>Your Satin order ${escapeHtml(order.orderNumber)} has been marked delivered.</p>`,
    ...(tracking ? [`<p>Tracking number: ${escapeHtml(tracking)}</p>`] : []),
    `<p><a href="${escapeHtml(link)}">View the order</a></p>`,
    ...(care.length ? [`<p>Customer care:<br>${care.map(escapeHtml).join('<br>')}</p>`] : []),
  ].join('');

  return {
    subject: `Satin order ${order.orderNumber} has been delivered`,
    text,
    html,
  };
}

export function buildRefundNotice(order, support = {}) {
  const link = `${env.clientUrl}/order/${order._id}`;
  const care = supportLines(support);
  const text = [
    `The payment for your Satin order ${order.orderNumber} has been marked refunded.`,
    '',
    `Total ${inr(order.total)}`,
    '',
    `View the order: ${link}`,
    ...(care.length ? ['', 'Customer care:', ...care] : []),
  ].join('\n');
  const html = [
    `<p>The payment for your Satin order ${escapeHtml(order.orderNumber)} has been marked refunded.</p>`,
    `<p>Total ${escapeHtml(inr(order.total))}</p>`,
    `<p><a href="${escapeHtml(link)}">View the order</a></p>`,
    ...(care.length ? [`<p>Customer care:<br>${care.map(escapeHtml).join('<br>')}</p>`] : []),
  ].join('');

  return {
    subject: `Satin order ${order.orderNumber} has been refunded`,
    text,
    html,
  };
}

export async function notifyOrderRefunded(order, send = sendMail) {
  if (!order?.contactEmail || order.paymentStatus !== 'refunded' || !smtpEnabled()) return false;

  const claimed = await Order.updateOne(
    { _id: order._id, refundSent: { $ne: true } },
    { $set: { refundSent: true } },
  );
  if (claimed.modifiedCount !== 1) return false;

  try {
    const settings = await SiteSetting.findOne({ key: 'store' }).select('support').lean();
    const message = buildRefundNotice(order, settings?.support || {});
    await send({ to: order.contactEmail, ...message });
    return true;
  } catch (error) {
    await Order.updateOne({ _id: order._id }, { $set: { refundSent: false } });
    console.error('Refund email failed:', error.message);
    return false;
  }
}

export async function notifyOrderDelivered(order, send = sendMail) {
  if (!order?.contactEmail || order.paymentStatus !== 'paid' || order.orderStatus !== 'delivered' || !smtpEnabled()) {
    return false;
  }

  const claimed = await Order.updateOne(
    { _id: order._id, deliverySent: { $ne: true } },
    { $set: { deliverySent: true } },
  );
  if (claimed.modifiedCount !== 1) return false;

  try {
    const settings = await SiteSetting.findOne({ key: 'store' }).select('support').lean();
    const message = buildDeliveryNotice(order, settings?.support || {});
    await send({ to: order.contactEmail, ...message });
    return true;
  } catch (error) {
    await Order.updateOne({ _id: order._id }, { $set: { deliverySent: false } });
    console.error('Delivery email failed:', error.message);
    return false;
  }
}

export async function notifyOrderShipped(order, send = sendMail) {
  if (!order?.contactEmail || order.paymentStatus !== 'paid' || order.orderStatus !== 'shipped' || !smtpEnabled()) {
    return false;
  }

  const claimed = await Order.updateOne(
    { _id: order._id, shipmentSent: { $ne: true } },
    { $set: { shipmentSent: true } },
  );
  if (claimed.modifiedCount !== 1) return false;

  try {
    const settings = await SiteSetting.findOne({ key: 'store' }).select('support').lean();
    const message = buildShipmentNotice(order, settings?.support || {});
    await send({ to: order.contactEmail, ...message });
    return true;
  } catch (error) {
    await Order.updateOne({ _id: order._id }, { $set: { shipmentSent: false } });
    console.error('Shipment email failed:', error.message);
    return false;
  }
}

export async function notifyOrderPaid(order, send = sendMail) {
  if (!order?.contactEmail || !smtpEnabled()) return false;

  const claimed = await Order.updateOne(
    { _id: order._id, confirmationSent: { $ne: true } },
    { $set: { confirmationSent: true } },
  );
  if (claimed.modifiedCount !== 1) return false;

  try {
    const settings = await SiteSetting.findOne({ key: 'store' }).select('support').lean();
    const message = buildOrderConfirmation(order, settings?.support || {});
    await send({ to: order.contactEmail, ...message });
    return true;
  } catch (error) {
    await Order.updateOne({ _id: order._id }, { $set: { confirmationSent: false } });
    console.error('Order confirmation email failed:', error.message);
    return false;
  }
}
