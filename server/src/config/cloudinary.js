import { v2 as cloudinary } from 'cloudinary';
import { env } from './env.js';

const configured = Boolean(
  env.cloudinaryCloudName && env.cloudinaryApiKey && env.cloudinaryApiSecret,
);

if (configured) {
  cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret,
    secure: true,
  });
}

export const imagePresets = {
  thumbnail: { width: 160, height: 160, crop: 'fill', gravity: 'auto', fetch_format: 'auto', quality: 'auto' },
  card: { width: 720, height: 900, crop: 'fill', gravity: 'auto', fetch_format: 'auto', quality: 'auto' },
  detail: { width: 1400, height: 1600, crop: 'limit', fetch_format: 'auto', quality: 'auto' },
  blogCard: { width: 960, height: 640, crop: 'fill', gravity: 'auto', fetch_format: 'auto', quality: 'auto' },
  blogHero: { width: 1800, height: 1000, crop: 'fill', gravity: 'auto', fetch_format: 'auto', quality: 'auto' },
};

export function buildImageUrl(publicId, preset = 'card') {
  if (!publicId || !configured) return '';
  return cloudinary.url(publicId, imagePresets[preset] || imagePresets.card);
}

export function cloudinaryEnabled() {
  return configured;
}

export { cloudinary };
