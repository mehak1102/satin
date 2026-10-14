import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import hpp from 'hpp';
import { env } from './config/env.js';
import apiRoutes from './routes/index.js';
import seoRoutes from './routes/seo.routes.js';
import { errorHandler, notFound } from './middleware/error.js';
import { publicMediaUrls } from './middleware/media.js';
import { apiLimiter } from './middleware/rateLimit.js';

function sanitizeValue(value) {
  if (!value || typeof value !== 'object') return;
  for (const key of Object.keys(value)) {
    if (key.startsWith('$') || key.includes('.')) delete value[key];
    else sanitizeValue(value[key]);
  }
}

function sanitizeRequest(req, _res, next) {
  sanitizeValue(req.body);
  sanitizeValue(req.params);
  sanitizeValue(req.query);
  next();
}

const app = express();

app.set('trust proxy', 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);
const publicDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public');
app.use('/media', express.static(publicDir));
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use(sanitizeRequest);
app.use(hpp());
app.use('/api', apiLimiter, publicMediaUrls, apiRoutes);
app.use(seoRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
