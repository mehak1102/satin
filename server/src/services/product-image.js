import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';

const publicDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../public');
// Shop uploads stay on this server and are served from /media.
// Cloudinary is used only by the seed script, and only when its keys are set.
const folders = {
  products: path.join(publicDir, 'products', 'uploads'),
  notes: path.join(publicDir, 'notes', 'uploads'),
  avatars: path.join(publicDir, 'avatars', 'uploads'),
};

const kinds = {
  png: { ext: 'png' },
  jpeg: { ext: 'jpg' },
  webp: { ext: 'webp' },
};

export function detectImage(buffer) {
  if (!buffer || buffer.length < 12) return null;
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return kinds.png;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return kinds.jpeg;
  if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') return kinds.webp;
  return null;
}

export function acceptImageUpload(req, res, next) {
  multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 4 * 1024 * 1024, files: 1 },
  }).single('image')(req, res, (error) => {
    if (error) next(new ApiError(400, 'Choose a PNG, JPEG, or WebP image under 4 MB.'));
    else next();
  });
}

export const acceptProductImage = acceptImageUpload;

export function writeStoredImage(folder, slug, buffer) {
  const dir = folders[folder];
  if (!dir) throw new ApiError(400, 'That image could not be stored.');
  const kind = detectImage(buffer);
  if (!kind) throw new ApiError(400, 'Choose a PNG, JPEG, or WebP image.');
  const safeSlug = String(slug || '')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '');
  if (!safeSlug) throw new ApiError(400, 'That record cannot take an image.');
  fs.mkdirSync(dir, { recursive: true });
  const filename = `${safeSlug}-${Date.now()}.${kind.ext}`;
  fs.writeFileSync(path.join(dir, filename), buffer);
  return { filename, relativeUrl: `/media/${folder}/uploads/${filename}` };
}

export function writeProductImage(slug, buffer) {
  return writeStoredImage('products', slug, buffer);
}

export function removeStoredImage(folder, url) {
  const dir = folders[folder];
  const marker = `/media/${folder}/uploads/`;
  if (!dir || !url || !String(url).includes(marker)) return;
  let filename = '';
  try {
    filename = path.basename(new URL(url, 'http://local').pathname);
  } catch {
    return;
  }
  if (!/^[a-z0-9-]+\.(png|jpe?g|webp)$/.test(filename)) return;
  const filePath = path.resolve(dir, filename);
  const relative = path.relative(dir, filePath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) return;
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

export function removeUploadedProductImage(url) {
  removeStoredImage('products', url);
}
