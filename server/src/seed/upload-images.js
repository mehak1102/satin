// Seed-only. New shop, journal, and profile photos are written to disk by the API.
import { connectDb } from '../config/db.js';
import { cloudinary, cloudinaryEnabled } from '../config/cloudinary.js';
import { Product } from '../models/Product.js';
import mongoose from 'mongoose';
import path from 'path';

const packs = [
  { slug: 'satin-regular', file: 'regular.png', alt: 'Satin Regular pack of 6 large pads' },
  { slug: 'satin-xl', file: 'xl.png', alt: 'Satin XL pack of 7 pads' },
  { slug: 'satin-ultra-pack-of-2', file: 'ultra2.png', alt: 'Satin Ultra pack of 2' },
  { slug: 'satin-ultra-box', file: 'ultra15.png', alt: 'Satin Ultra box of 15 pads' },
];

const folder = path.resolve('tmp-packs');

async function uploadImages() {
  if (!cloudinaryEnabled()) {
    throw new Error('Cloudinary is not configured.');
  }
  await connectDb();

  for (const pack of packs) {
    const uploaded = await cloudinary.uploader.upload(path.join(folder, pack.file), {
      folder: 'satin/products',
      public_id: pack.slug,
      overwrite: true,
      resource_type: 'image',
    });
    const result = await Product.updateOne(
      { slug: pack.slug },
      {
        $set: {
          images: [
            {
              publicId: uploaded.public_id,
              url: uploaded.secure_url,
              alt: pack.alt,
            },
          ],
        },
      },
    );
    console.log(pack.slug, result.matchedCount ? 'updated' : 'not found');
  }

  await mongoose.disconnect();
}

uploadImages().catch(async (error) => {
  const detail = error?.error?.message || error.message;
  console.error('upload failed:', detail);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
