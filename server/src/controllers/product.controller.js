import mongoose from 'mongoose';
import { z } from 'zod';
import { Product } from '../models/Product.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { parseBody } from '../validators/index.js';

const satinCategories = ['Regular', 'XL', 'Ultra'];
const condomCategories = ['Condoms'];
const medicineCategories = ['Contraception', 'Nutrition'];
const otherCategories = [...condomCategories, ...medicineCategories];

function queryText(value) {
  if (Array.isArray(value)) return String(value[0] || '');
  if (typeof value === 'string') return value;
  if (value && typeof value.get === 'function') return String(value.get('line') || value.get('category') || '');
  return String(value || '');
}

function publicFilter(query) {
  const filter = { active: true };
  const line = queryText(query.line || (typeof query.get === 'function' ? query.get('line') : '')).toLowerCase();
  const category = queryText(query.category || (typeof query.get === 'function' ? query.get('category') : ''));

  if (line === 'satin') {
    filter.category = category && satinCategories.includes(category) ? category : { $in: satinCategories };
  } else if (line === 'condoms') {
    filter.category = category && condomCategories.includes(category) ? category : { $in: condomCategories };
  } else if (line === 'medicine') {
    filter.category = category && medicineCategories.includes(category) ? category : { $in: medicineCategories };
  } else if (line === 'other') {
    filter.category = category && otherCategories.includes(category) ? category : { $in: otherCategories };
  } else if (category.includes(',')) {
    filter.category = { $in: category.split(',').map((item) => item.trim()).filter(Boolean) };
  } else if (category) {
    filter.category = category;
  }

  if (query.size) filter.size = query.size;
  if (query.featured === 'true') filter.featured = true;
  if (query.minPrice || query.maxPrice) {
    const price = {};
    const min = Number(query.minPrice);
    const max = Number(query.maxPrice);
    if (query.minPrice && Number.isFinite(min)) price.$gte = min;
    if (query.maxPrice && Number.isFinite(max)) price.$lte = max;
    if (Object.keys(price).length) filter.price = price;
  }
  if (query.q) {
    filter.$text = { $search: String(query.q).slice(0, 80) };
  }
  return filter;
}

function sortFromQuery(sort) {
  switch (sort) {
    case 'price-asc':
      return { price: 1, _id: 1 };
    case 'price-desc':
      return { price: -1, _id: 1 };
    case 'newest':
      return { createdAt: -1, _id: 1 };
    case 'rating':
      return { rating: -1, reviewCount: -1, _id: 1 };
    default:
      // Satin pad categories first, then condoms / contraception, then the rest.
      return { satinFirst: 1, featured: -1, createdAt: -1, _id: 1 };
  }
}

function satinFirstStage() {
  return {
    $addFields: {
      satinFirst: {
        $cond: [{ $in: ['$category', ['Regular', 'XL', 'Ultra']] }, 0, 1],
      },
    },
  };
}

function emptyTextSearch(error) {
  const message = String(error?.message || '');
  return /stop word|no valid search|requires a language/i.test(message);
}

export const listProducts = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(48, Math.max(1, Number(req.query.limit) || 12));
  const filter = publicFilter(req.query);
  const sort = sortFromQuery(req.query.sort);
  const useSatinFirst = Object.prototype.hasOwnProperty.call(sort, 'satinFirst');
  try {
    const [pageResult, total] = await Promise.all([
      useSatinFirst
        ? Product.aggregate([
            { $match: filter },
            satinFirstStage(),
            { $sort: sort },
            { $skip: (page - 1) * limit },
            { $limit: limit },
            { $project: { dataNotes: 0, satinFirst: 0 } },
          ])
        : Product.find(filter)
            .select('-dataNotes')
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
      Product.countDocuments(filter),
    ]);
    res.json({ success: true, items: pageResult, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    if (!emptyTextSearch(error)) throw error;
    res.json({ success: true, items: [], total: 0, page, pages: 0 });
  }
});

export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, active: true }).select('-dataNotes');
  if (!product) throw new ApiError(404, 'Product not found.');
  res.json({ success: true, product });
});

const availabilityBody = z.object({
  ids: z.array(z.string()).max(20).optional().default([]),
});

export const checkAvailability = asyncHandler(async (req, res) => {
  const { ids } = parseBody(availabilityBody, req.body || {});
  const unique = [...new Set(ids.map(String))].filter((id) => mongoose.isValidObjectId(id)).slice(0, 20);
  const products = await Product.find({ _id: { $in: unique }, active: true }).select(
    'name slug price images stock category packSize size specifications',
  );
  res.json({
    success: true,
    items: products.map((product) => ({
      id: String(product._id),
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images?.[0]?.url || '',
      stock: product.stock,
      packSize: product.packSize,
      category: product.category,
      size: product.size,
      specifications: product.specifications,
    })),
  });
});

export const listCategories = asyncHandler(async (_req, res) => {
  const categories = await Product.distinct('category', { active: true });
  const sizes = await Product.distinct('size', { active: true, size: { $ne: '' } });
  res.json({ success: true, categories, sizes });
});
