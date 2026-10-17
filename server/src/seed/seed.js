import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDb } from '../config/db.js';
import { cloudinary, cloudinaryEnabled } from '../config/cloudinary.js';
import { env } from '../config/env.js';
import { Product } from '../models/Product.js';
import { SiteSetting } from '../models/SiteSetting.js';
import { User } from '../models/User.js';

const products = [
  {
    name: 'Satin Regular',
    slug: 'satin-regular',
    sku: 'SATIN-REG-L-6',
    category: 'Regular',
    size: 'Large',
    packSize: 6,
    price: 40,
    compareAtPrice: null,
    discount: 0,
    featured: true,
    shortDescription: 'Large pads with wings. Soft, absorbent, for bold moves.',
    description:
      'Satin Regular is a pack of 6 large sanitary napkins with wings, size 240 mm. The pack is printed with SAP granules for high absorbency. Maximum retail price is ₹40.00 inclusive of all taxes (₹6.66 per unit).',
    features: [
      'Pads with wings',
      'SAP granules with high absorbency',
      'Soft absorbent for bold moves',
      'Jee Bhar Kar Jee Lo',
    ],
    specifications: [
      { label: 'Net quantity', value: '6 sanitary napkins' },
      { label: 'Size', value: '240 mm' },
      { label: 'Fit', value: 'Large' },
      { label: 'MRP', value: '₹40.00 inclusive of all taxes' },
      { label: 'Unit price', value: '₹6.66' },
      { label: 'Standard', value: 'IS 5405' },
      { label: 'BIS licence', value: 'CM/L-8530105818' },
      { label: 'Best use', value: '3 years from manufacture date' },
    ],
    dataNotes: 'Copied from Satin Regular packaging dated 29 July 2026. Stock is not printed on the pack.',
  },
  {
    name: 'Satin XL',
    slug: 'satin-xl',
    sku: 'SATIN-XL-7',
    category: 'XL',
    size: 'XL',
    packSize: 7,
    price: 60,
    compareAtPrice: null,
    discount: 0,
    featured: true,
    shortDescription: 'Extra large pads with wings and SAP granules.',
    description:
      'Satin XL is a pack of 7 extra large sanitary napkins with wings, size 280 mm. The pack is printed with high absorbency SAP granules. Maximum retail price is ₹60.00 inclusive of all taxes (₹8.57 per unit).',
    features: [
      'Pads with wings',
      'High absorbency with SAP granules',
      'Soft absorbent for bold moves',
      'Jee Bhar Kar Jee Lo',
    ],
    specifications: [
      { label: 'Net quantity', value: '7 sanitary napkins' },
      { label: 'Size', value: '280 mm' },
      { label: 'Fit', value: 'XL' },
      { label: 'MRP', value: '₹60.00 inclusive of all taxes' },
      { label: 'Unit price', value: '₹8.57' },
      { label: 'Standard', value: 'IS 5405' },
      { label: 'BIS licence', value: 'CM/L-8530105818' },
      { label: 'Best use', value: '3 years from manufacture date' },
    ],
    dataNotes: 'Copied from Satin Extra Large 7 pieces packaging dated 20 April 2026. Stock is not printed on the pack.',
  },
  {
    name: 'Satin Ultra Pack of 2',
    slug: 'satin-ultra-pack-of-2',
    sku: 'SATIN-ULTRA-2',
    category: 'Ultra',
    size: 'Extra Large',
    packSize: 2,
    price: 25,
    compareAtPrice: null,
    discount: 0,
    featured: true,
    shortDescription: 'Extra large ultra pads with wings. Carry it with you.',
    description:
      'Satin Ultra pack of 2 extra large pads with wings. Printed claims: 3 times super absorbent, ultra soft and thin. Maximum retail price ₹25.',
    features: [
      '3 times super absorbent',
      'Ultra soft and thin',
      'Pads with wings',
      'Carry it with you',
    ],
    specifications: [
      { label: 'Net quantity', value: '2 sanitary napkins' },
      { label: 'Fit', value: 'Extra Large' },
      { label: 'MRP', value: '₹25' },
      { label: 'Standard', value: 'IS 5405' },
      { label: 'BIS licence', value: 'CM/L-8530105818' },
      { label: 'Best use', value: '3 years from manufacture date' },
    ],
    dataNotes:
      'Copied from Satin pack of 2 artwork dated 6 July 2026. Pad length in millimetres is not printed on this pack. Stock is not printed.',
  },
  {
    name: 'Satin Ultra Box',
    slug: 'satin-ultra-box',
    sku: 'SATIN-ULTRA-XL-15',
    category: 'Ultra',
    size: 'XL',
    packSize: 15,
    price: 140,
    compareAtPrice: null,
    discount: 0,
    featured: true,
    shortDescription: 'Satin Ultra XL box of 15 pads with wings.',
    description:
      'Satin Ultra box marked XL 15 pads with wings. Printed price ₹140. Visible pack lines: ultra soft and comfortable with anti-rash layer, 3 times super absorbent SAP sheet for long-lasting dryness, and ultra thin with a protective layer to prevent leakage.',
    features: [
      'Ultra soft and comfortable with anti-rash layer',
      '3 times super absorbent SAP sheet for long-lasting dryness',
      'Ultra thin protective layer to prevent leakage',
      'Pads with wings',
      'Ruko mat, Jee Bhar Ke Jee Lo',
    ],
    specifications: [
      { label: 'Net quantity', value: '15 sanitary napkins' },
      { label: 'Fit', value: 'XL' },
      { label: 'MRP', value: '₹140' },
      { label: 'Carton', value: 'L 165 mm × W 95 mm × H 110 mm' },
    ],
    dataNotes:
      'Taken from page 1 of the Satin Ultra Box artwork dated 6 July 2026. Pad length for the 15-piece box is not clearly printed on page 1. Stock is not printed. The 8-piece box is a separate pack.',
  },
  {
    name: 'Satin Ultra XL 8',
    slug: 'satin-ultra-xl-8',
    sku: 'SATIN-ULTRA-XL-8',
    category: 'Ultra',
    size: 'XL',
    packSize: 8,
    price: 80,
    compareAtPrice: null,
    discount: 0,
    featured: true,
    shortDescription: 'Satin Ultra XL box of 8 pads with wings.',
    description:
      'Satin Ultra box marked XL 8 pads with wings, size 280 mm. Maximum retail price is ₹80 (₹10 per unit). The front is printed ultra soft and comfortable with an anti-rash layer, 3 times super absorbent, and ultra thin.',
    features: [
      'Ultra soft and comfortable with anti-rash layer',
      '3 times super absorbent SAP sheet for long-lasting dryness',
      'Ultra thin protective layer to prevent leakage',
      'Pads with wings',
      'Ruko mat, Jee Bhar Ke Jee Lo',
    ],
    specifications: [
      { label: 'Net quantity', value: '8 sanitary napkins' },
      { label: 'Size', value: '280 mm' },
      { label: 'Fit', value: 'XL' },
      { label: 'MRP', value: '₹80' },
      { label: 'Unit price', value: '₹10' },
      { label: 'Carton', value: 'L 95 mm × W 50 mm × H 110 mm' },
    ],
    dataNotes:
      'Count, 280 mm, MRP ₹80, unit price ₹10, and carton size were recorded from the 8-piece dieline. Box art supplied later is the shop photo. Side-panel company lines on that render are not copied here.',
  },
];

async function seed() {
  if (!env.mongodbUri) {
    throw new Error('Set MONGODB_URI before running the seed.');
  }
  await connectDb();

  for (const product of products) {
    await Product.updateOne(
      { sku: product.sku },
      {
        $set: {
          ...product,
          currency: 'INR',
          active: true,
        },
        $setOnInsert: {
          stock: 100,
          lowStockThreshold: 10,
        },
      },
      { upsert: true },
    );
  }

  await SiteSetting.updateOne(
    { key: 'store' },
    {
      $setOnInsert: {
        key: 'store',
        support: {
          email: 'customercare@parivarseva.org',
          phone: '011-24335055',
          tollFree: '1800-123-7075',
          website: 'https://www.parivarseva.org',
          address: 'Parivar Seva Sanstha, C-374, Defence Colony, New Delhi 110024',
        },
        social: {
          instagram: 'https://www.instagram.com/parivarseva/',
          facebook: 'https://www.facebook.com/parivarseva',
          linkedin: 'https://www.linkedin.com/company/parivarsevasanstha',
          youtube: '',
        },
        shipping: { summary: '', methods: [] },
        returns: '',
        privacy: '',
        terms: '',
        taxRate: 0,
      },
    },
    { upsert: true },
  );

  if (env.adminEmail && env.adminPassword) {
    const passwordHash = await bcrypt.hash(env.adminPassword, 12);
    await User.updateOne(
      { email: env.adminEmail.toLowerCase() },
      {
        $set: {
          name: env.adminName,
          email: env.adminEmail.toLowerCase(),
          passwordHash,
          role: 'admin',
          isActive: true,
        },
      },
      { upsert: true },
    );
    console.log('Admin account ready for', env.adminEmail);
  } else {
    console.log('ADMIN_EMAIL and ADMIN_PASSWORD were not set, so no admin user was created.');
  }

  await attachMissingImages();
  console.log('Seeded Satin products:', products.map((item) => item.sku).join(', '));
  await mongoose.disconnect();
}

const packFiles = [
  ['satin-regular', [
    ['regular-pack-front.png', 'Satin Regular pack of 6'],
    ['regular-side.png', 'Satin Regular pack back'],
  ]],
  ['satin-xl', [
    ['xl-7-front.png', 'Satin XL pack of 7'],
    ['xl-7-back.png', 'Satin XL pack back'],
  ]],
  ['satin-ultra-pack-of-2', [
    ['ultra-carry-front.png', 'Satin Ultra carry pack'],
    ['ultra-carry-back.png', 'Satin Ultra carry pack back'],
  ]],
  ['satin-ultra-box', [
    ['ultra-xl-15-front.png', 'Satin Ultra box of 15'],
    ['ultra-xl-15-back.png', 'Satin Ultra box of 15 back'],
  ]],
  ['satin-ultra-xl-8', [
    ['ultra-xl-8-front.png', 'Satin Ultra box of 8'],
    ['ultra-xl-8-back.png', 'Satin Ultra box of 8 back'],
  ]],
];

async function attachMissingImages() {
  const dest = path.resolve('public/products');
  const src = path.resolve('tmp-packs');
  fs.mkdirSync(dest, { recursive: true });

  for (const [slug, files] of packFiles) {
    const product = await Product.findOne({ slug }).select('images');
    if (product?.images?.some((image) => image.url)) continue;

    const images = [];
    for (const [file, alt] of files) {
      const localFile = path.join(dest, file);
      const fromTmp = path.join(src, file);
      if (fs.existsSync(fromTmp)) fs.copyFileSync(fromTmp, localFile);
      if (!fs.existsSync(localFile)) continue;
      let image = {
        publicId: '',
        url: `${env.serverUrl.replace(/\/$/, '')}/media/products/${file}`,
        alt,
      };
      if (cloudinaryEnabled()) {
        try {
          const uploaded = await cloudinary.uploader.upload(localFile, {
            folder: 'satin/products',
            public_id: `${slug}-${file.replace(/\.[^.]+$/, '')}`,
            overwrite: true,
            resource_type: 'image',
          });
          image = { publicId: uploaded.public_id, url: uploaded.secure_url, alt };
        } catch (error) {
          console.log('Cloudinary was not used for', slug, error?.message || 'upload failed');
        }
      }
      images.push(image);
    }
    if (images.length) await Product.updateOne({ slug }, { $set: { images } });
  }
}

seed().catch(async (error) => {
  console.error(error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
