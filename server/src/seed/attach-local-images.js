import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { connectDb } from '../config/db.js';
import { env } from '../config/env.js';
import { Product } from '../models/Product.js';

const packs = [
  ['satin-regular', 'regular.png', 'Satin Regular pack of 6 large pads'],
  ['satin-xl', 'xl.png', 'Satin XL pack of 7 pads'],
  ['satin-ultra-pack-of-2', 'ultra2.png', 'Satin Ultra pack of 2'],
  ['satin-ultra-box', 'ultra15.png', 'Satin Ultra box of 15 pads'],
];

const src = path.resolve('tmp-packs');
const dest = path.resolve('public/products');
fs.mkdirSync(dest, { recursive: true });

for (const [, file] of packs) {
  fs.copyFileSync(path.join(src, file), path.join(dest, file));
}

await connectDb();
for (const [slug, file, alt] of packs) {
  const url = `${env.serverUrl.replace(/\/$/, '')}/media/products/${file}`;
  const result = await Product.updateOne({ slug }, { $set: { images: [{ publicId: '', url, alt }] } });
  console.log(slug, result.matchedCount ? 'image set' : 'missing product');
}
await mongoose.disconnect();
