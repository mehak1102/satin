import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export function smtpEnabled() {
  return Boolean(env.smtpHost && env.smtpUser && env.smtpPassword);
}

function createTransport() {
  if (!smtpEnabled()) return null;
  return nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPassword,
    },
  });
}

export async function sendMail({ to, subject, text, html }) {
  const transport = createTransport();
  if (!transport) {
    throw new ApiError(503, 'Email is not configured yet.');
  }

  return transport.sendMail({
    from: env.smtpFrom,
    to,
    subject,
    text,
    html,
  });
}
