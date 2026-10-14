import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';

import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const requireAuth = asyncHandler(async (req, _res, next) => {
  const token = req.cookies?.accessToken;
  if (!token) throw new ApiError(401, 'Authentication required.');

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    throw new ApiError(401, 'Session expired. Please sign in again.');
  }

  const user = await User.findById(payload.sub);
  if (!user || !user.isActive) throw new ApiError(401, 'Account is not available.');
  if (user.passwordChangedAt && payload.iat < Math.floor(user.passwordChangedAt.getTime() / 1000)) {
    throw new ApiError(401, 'Session expired. Please sign in again.');
  }

  req.user = user; 
  next();
});

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      next(new ApiError(403, 'You do not have permission to do that.'));
      return;
    }
    next();
  };
}