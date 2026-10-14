import { z } from 'zod';
import { ApiError } from '../utils/ApiError.js';

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160),
  password: z.string().min(8).max(72),
  phone: z.string().trim().max(20).optional().default(''),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1).max(72),
});

export const forgotSchema = z.object({
  email: z.string().trim().email().max(160),
});

export const resetSchema = z.object({
  token: z.string().trim().min(20).max(200),
  password: z.string().min(8).max(72),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  phone: z.string().trim().max(20).optional().default(''),
  subject: z.string().trim().min(2).max(140),
  message: z.string().trim().min(10).max(4000),
});

export const newsletterSchema = z.object({
  email: z.string().trim().email(),
});

export const newsletterLeaveSchema = z.object({
  token: z.string().trim().min(20).max(200),
});

export function parseBody(schema, body) {
  const result = schema.safeParse(body);
  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
    throw new ApiError(400, 'Please check the form and try again.', details);
  }
  return result.data;
}
