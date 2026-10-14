import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { sendMail, smtpEnabled } from '../services/mail.service.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { parseBody, registerSchema, loginSchema, forgotSchema, resetSchema } from '../validators/index.js';
import {
  cookieOptions,
  hashPassword,
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyPassword,
} from '../services/auth.service.js';

const ACCESS_MAX = 15 * 60 * 1000;
const REFRESH_MAX = 7 * 24 * 60 * 60 * 1000;

function setAuthCookies(res, user) {
  res.cookie('accessToken', signAccessToken(user), cookieOptions(ACCESS_MAX));
  res.cookie('refreshToken', signRefreshToken(user), cookieOptions(REFRESH_MAX));
}

export const register = asyncHandler(async (req, res) => {
  const data = parseBody(registerSchema, req.body);
  const existing = await User.findOne({ email: data.email.toLowerCase() });
  if (existing) throw new ApiError(409, 'An account with this email already exists.');

  const user = await User.create({
    name: data.name,
    email: data.email.toLowerCase(),
    phone: data.phone,
    passwordHash: await hashPassword(data.password),
  });

  setAuthCookies(res, user);
  res.status(201).json({ success: true, user });
});

export const login = asyncHandler(async (req, res) => {
  const data = parseBody(loginSchema, req.body);
  const user = await User.findOne({ email: data.email.toLowerCase() }).select('+passwordHash');
  if (!user || !user.isActive) throw new ApiError(401, 'Email or password is incorrect.');

  const matches = await verifyPassword(data.password, user.passwordHash);
  if (!matches) throw new ApiError(401, 'Email or password is incorrect.');

  user.passwordHash = undefined;
  setAuthCookies(res, user);
  res.json({ success: true, user });
});

export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie('accessToken', cookieOptions(ACCESS_MAX));
  res.clearCookie('refreshToken', cookieOptions(REFRESH_MAX));
  res.json({ success: true });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw new ApiError(401, 'Authentication required.');

  let payload;
  try {
    payload = jwt.verify(token, env.jwtRefreshSecret);
  } catch {
    throw new ApiError(401, 'Session expired. Please sign in again.');
  }

  const user = await User.findById(payload.sub);
  if (!user || !user.isActive) throw new ApiError(401, 'Account is not available.');
  if (user.passwordChangedAt && payload.iat < Math.floor(user.passwordChangedAt.getTime() / 1000)) {
    throw new ApiError(401, 'Session expired. Please sign in again.');
  }

  setAuthCookies(res, user);
  res.json({ success: true, user });
});

const RESET_MS = 30 * 60 * 1000;
const resetMessage = 'If an account exists for that email, a reset link is on its way.';

export const forgotPassword = asyncHandler(async (req, res) => {
  const data = parseBody(forgotSchema, req.body);
  if (!smtpEnabled()) throw new ApiError(503, 'Email is not configured yet.');

  const user = await User.findOne({ email: data.email.toLowerCase() });
  if (!user || !user.isActive) {
    res.json({ success: true, message: resetMessage });
    return;
  }

  const token = crypto.randomBytes(32).toString('hex');
  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        passwordResetTokenHash: hashToken(token),
        passwordResetExpires: new Date(Date.now() + RESET_MS),
      },
    },
  );

  const link = `${env.clientUrl}/reset-password?token=${token}`;
  try {
    await sendMail({
      to: user.email,
      subject: 'Reset your Satin password',
      text: `Use this link to choose a new password. It expires in 30 minutes.\n\n${link}\n\nIf you did not ask for this, you can ignore this email.`,
      html: `<p>Use this link to choose a new password. It expires in 30 minutes.</p><p><a href="${link}">Choose a new password</a></p><p>If you did not ask for this, you can ignore this email.</p>`,
    });
  } catch {
    await User.updateOne(
      { _id: user._id },
      { $unset: { passwordResetTokenHash: 1, passwordResetExpires: 1 } },
    );
    throw new ApiError(503, 'Email could not be sent. Try again shortly.');
  }

  res.json({ success: true, message: resetMessage });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const data = parseBody(resetSchema, req.body);
  const user = await User.findOne({
    passwordResetTokenHash: hashToken(data.token),
    passwordResetExpires: { $gt: new Date() },
    isActive: true,
  }).select('+passwordResetTokenHash +passwordResetExpires');

  if (!user) throw new ApiError(400, 'This reset link is invalid or has expired.');

  user.passwordChangedAt = new Date();
  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        passwordHash: await hashPassword(data.password),
        passwordChangedAt: user.passwordChangedAt,
      },
      $unset: { passwordResetTokenHash: 1, passwordResetExpires: 1 },
    },
  );

  setAuthCookies(res, user);
  res.json({ success: true, user });
});
