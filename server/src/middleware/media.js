import { env } from '../config/env.js';

const LOCAL_HOST = /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/;
const LOCAL_MEDIA = /https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?\/media\//g;

function publicBase(req) {
  const configured = String(env.serverUrl || '').replace(/\/$/, '');
  if (configured && !LOCAL_HOST.test(configured)) return configured;
  return `${req.protocol}://${req.get('host')}`;
}

// Image URLs saved while running locally point at localhost; a deployed server
// answers with its own address instead so browsers can load them.
export function publicMediaUrls(req, res, next) {
  const base = publicBase(req);
  if (LOCAL_HOST.test(base)) return next();
  const json = res.json.bind(res);
  res.json = (body) => json(JSON.parse(JSON.stringify(body ?? null).replace(LOCAL_MEDIA, `${base}/media/`)));
  next();
}
