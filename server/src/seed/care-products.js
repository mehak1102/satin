import mongoose from 'mongoose';
import { connectDb } from '../config/db.js';
import { env } from '../config/env.js';
import { Product } from '../models/Product.js';

const media = (file) => `${env.serverUrl.replace(/\/$/, '')}/media/products/${file}`;

const products = [
  {
    name: 'Stallion Complete Condom · Pack of 3',
    slug: 'stallion-complete-3',
    sku: 'STALLION-3',
    category: 'Condoms',
    size: '3 pcs',
    packSize: 3,
    price: 30,
    featured: false,
    shortDescription: 'Extra dotted, flavoured, coloured, extra time. ₹30 for 3 condoms.',
    description:
      'Stallion: The Complete Condom. Pack of 3. Pack lines include Extra Dotted, Flavoured, Coloured, and Extra Time. Flavours printed: Strawberry, Mango, Chocolate. MRP shown as ₹30 for 3 condoms.',
    features: ['Extra dotted', 'Flavoured', 'Coloured', 'Extra time', 'Strawberry, mango, chocolate'],
    specifications: [
      { label: 'Net quantity', value: '3 condoms' },
      { label: 'MRP', value: '₹30 for 3 condoms' },
      { label: 'Flavours', value: 'Strawberry, Mango, Chocolate' },
    ],
    dataNotes: 'Copied from Stallion pack artwork and price strip. Stock is not printed.',
    images: [{ publicId: '', url: media('stallion.png'), alt: 'Stallion Complete Condom packs' }],
  },
  {
    name: 'Stallion Complete Condom · 10+2',
    slug: 'stallion-complete-12',
    sku: 'STALLION-12',
    category: 'Condoms',
    size: '10+2',
    packSize: 12,
    price: 100,
    featured: false,
    shortDescription: 'Extra dotted, flavoured value pack. ₹100 for 10+2 condoms.',
    description:
      'Stallion: The Complete Condom. Pack marked 10+2. Pack lines include Extra Dotted, Flavoured, Coloured, and Extra Time. Flavours printed: Strawberry, Mango, Chocolate. MRP shown as ₹100 for 10+2 condoms.',
    features: ['Extra dotted', 'Flavoured', 'Coloured', 'Extra time', 'Value pack 10+2'],
    specifications: [
      { label: 'Net quantity', value: '10+2 condoms' },
      { label: 'MRP', value: '₹100 for 10+2 condoms' },
      { label: 'Flavours', value: 'Strawberry, Mango, Chocolate' },
    ],
    dataNotes: 'Copied from Stallion pack artwork and price strip. Stock is not printed.',
    images: [{ publicId: '', url: media('stallion.png'), alt: 'Stallion Complete Condom packs' }],
  },
  {
    name: 'Rider Long Lasting · 3+1',
    slug: 'rider-long-lasting-4',
    sku: 'RIDER-4',
    category: 'Condoms',
    size: '3+1',
    packSize: 4,
    price: 40,
    featured: false,
    shortDescription: 'Long lasting premium condoms. ₹40 for 4 condoms.',
    description:
      'Rider Long Lasting Premium Condoms. Pack marked 3+1 Pc. Pack lines include Extra Raised Dots and “for the Lion in you.” MRP shown as ₹40 for 4 condoms.',
    features: ['Long lasting', 'Extra raised dots', 'Premium condoms', 'Pack of 3+1'],
    specifications: [
      { label: 'Net quantity', value: '3+1 condoms (4)' },
      { label: 'MRP', value: '₹40 for 4 condoms' },
    ],
    dataNotes: 'Copied from Rider pack artwork and price strip. Stock is not printed.',
    images: [{ publicId: '', url: media('rider.png'), alt: 'Rider Long Lasting condom packs' }],
  },
  {
    name: 'Rider Long Lasting · Pack of 8',
    slug: 'rider-long-lasting-8',
    sku: 'RIDER-8',
    category: 'Condoms',
    size: '8 pcs',
    packSize: 8,
    price: 70,
    featured: false,
    shortDescription: 'Long lasting premium condoms. ₹70 for 8 condoms.',
    description:
      'Rider Long Lasting Premium Condoms. Pack marked 8 Pc. Pack lines include Extra Raised Dots and “for the Lion in you.” MRP shown as ₹70 for 8 condoms.',
    features: ['Long lasting', 'Extra raised dots', 'Premium condoms', 'Pack of 8'],
    specifications: [
      { label: 'Net quantity', value: '8 condoms' },
      { label: 'MRP', value: '₹70 for 8 condoms' },
    ],
    dataNotes: 'Copied from Rider pack artwork and price strip. Stock is not printed.',
    images: [{ publicId: '', url: media('rider.png'), alt: 'Rider Long Lasting condom packs' }],
  },
  {
    name: 'Sawan Premium Pink Condoms · 2+1',
    slug: 'sawan-premium-3',
    sku: 'SAWAN-3',
    category: 'Condoms',
    size: '2+1',
    packSize: 3,
    price: 10,
    featured: false,
    shortDescription: 'Pink condoms. Extra pleasure. ₹10 for 2+1 condoms.',
    description:
      'Sawan Premium Condoms. Pack marked 3 pieces / offer shown as 2+1. Pack lines include Extra Pleasure and Pink Condoms. MRP shown as ₹10 for 2+1 condoms.',
    features: ['Premium condoms', 'Pink condoms', 'Extra pleasure', 'Pack offer 2+1'],
    specifications: [
      { label: 'Net quantity', value: '2+1 condoms' },
      { label: 'MRP', value: '₹10 for 2+1 condoms' },
    ],
    dataNotes: 'Copied from Sawan pack artwork and price strip. Stock is not printed.',
    images: [{ publicId: '', url: media('sawan.png'), alt: 'Sawan Premium Pink Condom packs' }],
  },
  {
    name: 'Sawan Premium Pink Condoms · Pack of 10',
    slug: 'sawan-premium-10',
    sku: 'SAWAN-10',
    category: 'Condoms',
    size: '10 pcs',
    packSize: 10,
    price: 30,
    featured: false,
    shortDescription: 'Pink condoms. Extra pleasure. ₹30 for 10 condoms.',
    description:
      'Sawan Premium Condoms. Pack marked 10 pieces. Pack lines include Extra Pleasure and Pink Condoms. MRP shown as ₹30 for 10 condoms.',
    features: ['Premium condoms', 'Pink condoms', 'Extra pleasure', 'Pack of 10'],
    specifications: [
      { label: 'Net quantity', value: '10 condoms' },
      { label: 'MRP', value: '₹30 for 10 condoms' },
    ],
    dataNotes: 'Copied from Sawan pack artwork and price strip. Stock is not printed.',
    images: [{ publicId: '', url: media('sawan.png'), alt: 'Sawan Premium Pink Condom packs' }],
  },
  {
    name: 'Night Bliss XTRA Pleasure · Pack of 3',
    slug: 'night-bliss-3',
    sku: 'NIGHT-BLISS-3',
    category: 'Condoms',
    size: '3 pcs',
    packSize: 3,
    price: 20,
    featured: false,
    shortDescription: 'Dotted, contoured, ribbed, lubricated. ₹20 for 3 condoms.',
    description:
      'Night Bliss condoms for XTRA Pleasure. Pack of 3 pcs. Pack lines include Dotted, Contoured, Ribbed, and Lubricated. MRP shown as ₹20 for 3 condoms.',
    features: ['Dotted', 'Contoured', 'Ribbed', 'Lubricated', 'For XTRA pleasure'],
    specifications: [
      { label: 'Net quantity', value: '3 condoms' },
      { label: 'MRP', value: '₹20 for 3 condoms' },
    ],
    dataNotes: 'Copied from Night Bliss pack artwork and price strip. Stock is not printed.',
    images: [{ publicId: '', url: media('night-bliss.png'), alt: 'Night Bliss XTRA Pleasure condom pack' }],
  },
  {
    name: 'Ecroz Gold · 1 Cycle Pack',
    slug: 'ecroz-gold-cycle',
    sku: 'ECROZ-GOLD-1',
    category: 'Contraception',
    size: '1 cycle',
    packSize: 1,
    price: 30,
    featured: false,
    shortDescription: 'Combined oral contraceptive pills with iron. ₹30 per cycle.',
    description:
      'Ecroz Gold combined oral contraceptive pills with iron. Pack lines include Levonorgestrel & Ethinyloestradiol Tablets I.P. with Ferrous Fumarate Tablets I.P., and Sure / Safe / Secure. Marked 1 Cycle Pack. Price shown as ₹30 per cycle. This shop lists pack facts only — ask a clinician before use.',
    features: ['Combined oral contraceptive with iron', '1 cycle pack', 'Sure, safe, secure (pack lines)'],
    specifications: [
      { label: 'Pack', value: '1 cycle pack' },
      { label: 'Price shown', value: '₹30 per cycle' },
      { label: 'Actives (pack)', value: 'Levonorgestrel & Ethinyloestradiol with Ferrous Fumarate' },
    ],
    dataNotes: 'Copied from Ecroz Gold pack artwork and price tag. Stock is not printed. Not medical advice.',
    images: [{ publicId: '', url: media('ecroz-gold.png'), alt: 'Ecroz Gold combined oral contraceptive pack' }],
  },
  {
    name: 'Nopreg Injection · 150 mg/ml',
    slug: 'nopreg-injection-150',
    sku: 'NOPREG-150',
    category: 'Contraception',
    size: '1 ml',
    packSize: 1,
    price: 289,
    featured: false,
    shortDescription: 'Medroxyprogesterone acetate injection IP 150 mg/ml. ₹289. Rx.',
    description:
      'Nopreg prevents pregnancy. Medroxyprogesterone Acetate Injection IP 150 mg/ml. Pack marked 1 ml single-use prefilled syringe for intramuscular use only. Price shown as ₹289. Rx product — use only with clinician guidance. This shop lists pack facts only.',
    features: ['Prevents pregnancy (pack line)', '150 mg/ml', '1 ml prefilled syringe', 'Intramuscular use only', 'Rx'],
    specifications: [
      { label: 'Strength', value: '150 mg/ml' },
      { label: 'Pack', value: '1 ml single-use prefilled syringe' },
      { label: 'Price shown', value: '₹289' },
      { label: 'Use', value: 'Intramuscular use only' },
    ],
    dataNotes: 'Copied from Nopreg pack artwork and price tag. Stock is not printed. Not medical advice.',
    images: [{ publicId: '', url: media('nopreg.png'), alt: 'Nopreg medroxyprogesterone acetate injection pack' }],
  },
  {
    name: 'Iron Plus · Ferrous Ascorbate & Folic Acid',
    slug: 'iron-plus-tablets',
    sku: 'IRON-PLUS-10X10',
    category: 'Nutrition',
    size: '10 × 10 tablets',
    packSize: 100,
    price: 0,
    featured: false,
    shortDescription: 'Ferrous ascorbate and folic acid tablets IP. 10 × 10 tablets. Pack facts only.',
    description:
      'Iron Plus. Ferrous Ascorbate & Folic Acid Tablets IP. Pack marked 10 × 10 tablets. Pack composition lines include Ferrous Ascorbate IP (equivalent to elemental iron) and Folic Acid IP 1.5 mg. Marketed by Parivar Seva Sanstha. Marked for therapeutic use. No MRP is printed on this pack image. This shop lists pack facts only — ask a clinician before use.',
    features: ['Ferrous ascorbate & folic acid tablets IP', '10 × 10 tablets', 'Marketed by Parivar Seva Sanstha'],
    specifications: [
      { label: 'Pack', value: '10 × 10 tablets' },
      { label: 'Actives (pack)', value: 'Ferrous ascorbate IP; folic acid IP 1.5 mg' },
      { label: 'Marked by', value: 'Parivar Seva Sanstha' },
    ],
    dataNotes: 'Copied from Iron Plus pack artwork. MRP is not printed. Not medical advice.',
    images: [{ publicId: '', url: media('iron-plus.png'), alt: 'Iron Plus ferrous ascorbate and folic acid tablets pack' }],
  },
  {
    name: 'IFA-Shakti · Iron and Folic Acid Tablets',
    slug: 'ifa-shakti-tablets',
    sku: 'IFA-SHAKTI-10X10',
    category: 'Nutrition',
    size: '10 × 10 tablets',
    packSize: 100,
    price: 0,
    featured: false,
    shortDescription: 'Iron and folic acid tablets IP. Iron 60 mg and folic acid 0.5 mg. Pack facts only.',
    description:
      'IFA-Shakti. Iron and Folic Acid Tablets IP. Pack marked 10 × 10 tablets. Pack lines include Iron 60 mg and Folic Acid 0.5 mg. Composition lines include dried ferrous sulphate IP 200 mg, equivalent to elemental iron 60 mg, and folic acid 0.5 mg. No MRP is printed on this pack image. This shop lists pack facts only — ask a clinician before use.',
    features: ['Iron and folic acid tablets IP', 'Iron 60 mg and folic acid 0.5 mg (pack)', '10 × 10 tablets'],
    specifications: [
      { label: 'Pack', value: '10 × 10 tablets' },
      { label: 'Actives (pack)', value: 'Elemental iron 60 mg; folic acid 0.5 mg' },
    ],
    dataNotes: 'Copied from IFA-Shakti pack artwork. MRP is not printed. Not medical advice.',
    images: [{ publicId: '', url: media('ifa-shakti.png'), alt: 'IFA-Shakti iron and folic acid tablets pack' }],
  },
];

async function seed() {
  await connectDb();
  const results = [];
  for (const product of products) {
    const saved = await Product.findOneAndUpdate(
      { slug: product.slug },
      {
        $set: {
          ...product,
          currency: 'INR',
          active: true,
          discount: 0,
          compareAtPrice: null,
        },
        $setOnInsert: {
          stock: 80,
          lowStockThreshold: 10,
        },
      },
      { upsert: true, returnDocument: 'after' },
    );
    results.push({ slug: saved.slug, category: saved.category, price: saved.price });
  }
  console.log(JSON.stringify({ upserted: results.length, products: results }, null, 2));
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
