import mongoose from 'mongoose';
import { z } from 'zod';
import { User } from '../models/User.js';
import {
  cookieOptions,
  hashPassword,
  signAccessToken,
  signRefreshToken,
  verifyPassword,
} from '../services/auth.service.js';
import { env } from '../config/env.js';
import { removeStoredImage, writeStoredImage } from '../services/product-image.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { parseBody } from '../validators/index.js';

const ACCESS_MAX = 15 * 60 * 1000;
const REFRESH_MAX = 7 * 24 * 60 * 60 * 1000;

const MAX_ADDRESSES = 8;

const passwordSchema = z.object({
  currentPassword: z.string().min(1).max(72),
  password: z.string().min(8).max(72),
});

const profileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().max(20).optional().default(''),
});

const addressSchema = z.object({
  label: z
    .string()
    .trim()
    .max(40)
    .optional()
    .default('Home')
    .transform((value) => value || 'Home'),
  fullName: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(8).max(20),
  line1: z.string().trim().min(3).max(160),
  line2: z.string().trim().max(160).optional().default(''),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
  postalCode: z.string().trim().min(4).max(12),
  country: z.string().trim().max(60).optional().default('India'),
  isDefault: z.boolean().optional(),
});

function ensureDefault(user) {
  if (!user.addresses.length) return;
  if (!user.addresses.some((item) => item.isDefault)) user.addresses[0].isDefault = true;
}

function addressById(user, id) {
  if (!mongoose.isValidObjectId(id)) throw new ApiError(404, 'That address was not found.');
  const address = user.addresses.id(id);
  if (!address) throw new ApiError(404, 'That address was not found.');
  return address;
}

function setAuthCookies(res, user) {
  res.cookie('accessToken', signAccessToken(user), cookieOptions(ACCESS_MAX));
  res.cookie('refreshToken', signRefreshToken(user), cookieOptions(REFRESH_MAX));
}

export const changePassword = asyncHandler(async (req, res) => {
  const data = parseBody(passwordSchema, req.body);
  const user = await User.findById(req.user._id).select('+passwordHash');
  if (!user || !user.isActive) throw new ApiError(401, 'Account is not available.');

  const matches = await verifyPassword(data.currentPassword, user.passwordHash);
  if (!matches) throw new ApiError(400, 'The current password is incorrect.');
  if (data.currentPassword === data.password) throw new ApiError(400, 'Choose a different password.');

  user.passwordHash = await hashPassword(data.password);
  user.passwordChangedAt = new Date();
  await user.save();
  user.passwordHash = undefined;
  setAuthCookies(res, user);
  res.json({ success: true, user });
});

export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file?.buffer?.length) throw new ApiError(400, 'Choose an image.');
  const user = await User.findById(req.user._id);
  if (!user || !user.isActive) throw new ApiError(401, 'Account is not available.');
  const previous = user.avatar?.url || '';
  const saved = writeStoredImage('avatars', String(user._id), req.file.buffer);
  user.avatar = {
    publicId: '',
    url: `${env.serverUrl.replace(/\/$/, '')}${saved.relativeUrl}`,
    alt: user.name,
  };
  try {
    await user.save();
  } catch (error) {
    removeStoredImage('avatars', user.avatar.url);
    throw error;
  }
  if (previous && previous !== user.avatar.url) removeStoredImage('avatars', previous);
  res.json({ success: true, user });
});

export const deleteAvatar = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user || !user.isActive) throw new ApiError(401, 'Account is not available.');
  removeStoredImage('avatars', user.avatar?.url);
  user.avatar = { publicId: '', url: '', alt: '' };
  await user.save();
  res.json({ success: true, user });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const data = parseBody(profileSchema, req.body);
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name: data.name, phone: data.phone },
    { returnDocument: 'after' },
  );
  res.json({ success: true, user });
});

export const addAddress = asyncHandler(async (req, res) => {
  const data = parseBody(addressSchema, req.body);
  const user = await User.findById(req.user._id);
  if (user.addresses.length >= MAX_ADDRESSES) {
    throw new ApiError(400, 'You can save up to 8 addresses.');
  }

  const makeDefault = Boolean(data.isDefault) || user.addresses.length === 0;
  if (makeDefault) user.addresses.forEach((item) => {
    item.isDefault = false;
  });

  user.addresses.push({ ...data, isDefault: makeDefault });
  await user.save();
  res.status(201).json({ success: true, user });
});

export const updateAddress = asyncHandler(async (req, res) => {
  const data = parseBody(addressSchema, req.body);
  const user = await User.findById(req.user._id);
  const address = addressById(user, req.params.id);

  if (data.isDefault) {
    user.addresses.forEach((item) => {
      item.isDefault = false;
    });
  }

  address.label = data.label;
  address.fullName = data.fullName;
  address.phone = data.phone;
  address.line1 = data.line1;
  address.line2 = data.line2;
  address.city = data.city;
  address.state = data.state;
  address.postalCode = data.postalCode;
  address.country = data.country || 'India';
  if (data.isDefault) address.isDefault = true;
  ensureDefault(user);
  await user.save();
  res.json({ success: true, user });
});

export const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const address = addressById(user, req.params.id);
  address.deleteOne();
  ensureDefault(user);
  await user.save();
  res.json({ success: true, user });
});
