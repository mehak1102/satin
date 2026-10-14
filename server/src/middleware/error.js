import { ApiError } from '../utils/ApiError.js';

export function notFound(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(err, req, res, _next) {
  if (err?.name === 'CastError' && err.kind === 'ObjectId') err = new ApiError(400, 'That link is not valid.');
  const statusCode = err.statusCode || 500;
  const operational = Boolean(err.isOperational);
  const message = operational ? err.message : 'Something went wrong.';

  if (!operational) console.error(err);

  res.status(statusCode).json({
    success: false,
    message,
    details: operational && statusCode < 500 ? err.details : undefined,
  });
}
