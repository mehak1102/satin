import mongoose from 'mongoose';
import { z } from 'zod';
import { Blog } from '../models/Blog.js';
import { ContactMessage } from '../models/ContactMessage.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { SiteSetting } from '../models/SiteSetting.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { slugify } from '../utils/slug.js';
import { parseBody } from '../validators/index.js';
import { env } from '../config/env.js';
import { notifyOrderDelivered, notifyOrderShipped } from '../services/order-mail.js';
import { removeStoredImage, removeUploadedProductImage, writeProductImage, writeStoredImage } from '../services/product-image.js';

function assertId(id) {
  if (!mongoose.isValidObjectId(id)) throw new ApiError(404, 'That record was not found.');
}

const productPatch = z
  .object({
    stock: z.number().int().min(0).max(100000).optional(),
    price: z.number().min(0).max(100000).optional(),
    compareAtPrice: z.number().min(0).max(100000).nullable().optional(),
    lowStockThreshold: z.number().int().min(0).max(10000).optional(),
    active: z.boolean().optional(),
    featured: z.boolean().optional(),
    name: z.string().trim().min(2).max(120).optional(),
    shortDescription: z.string().trim().max(300).optional(),
    description: z.string().trim().max(4000).optional(),
    category: z.string().trim().min(2).max(80).optional(),
    size: z.string().trim().max(40).optional(),
    packSize: z.number().int().min(1).max(100).nullable().optional(),
    features: z.array(z.string().trim().min(1).max(200)).max(12).optional(),
    specifications: z
      .array(
        z.object({
          label: z.string().trim().min(1).max(80),
          value: z.string().trim().min(1).max(200),
        }),
      )
      .max(24)
      .optional(),
  })
  .refine((value) => Object.keys(value).length > 0);

const orderPatch = z.object({
  orderStatus: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
  trackingNumber: z.string().trim().max(80).optional().default(''),
});

const messagePatch = z.object({
  status: z.enum(['new', 'read', 'resolved']),
});

const socialUrl = z
  .string()
  .trim()
  .max(200)
  .refine((value) => value === '' || /^https:\/\/\S+$/i.test(value), 'Use a full https link, or leave it blank.');

const settingsPatch = z.object({
  support: z.object({
    email: z.string().trim().email().max(160),
    phone: z.string().trim().max(30),
    tollFree: z.string().trim().max(30),
    website: z.string().trim().max(160),
    address: z.string().trim().max(240),
  }),
  shippingSummary: z.string().trim().max(4000),
  method: z
    .object({
      name: z.string().trim().min(1).max(80),
      description: z.string().trim().max(240).optional().default(''),
      price: z.number().min(0).max(100000),
      freeAbove: z.number().min(0).max(1000000).nullable(),
    })
    .nullable(),
  returns: z.string().trim().max(8000),
  privacy: z.string().trim().max(8000),
  terms: z.string().trim().max(8000),
  taxRate: z.number().min(0).max(1),
  social: z
    .object({
      instagram: socialUrl,
      facebook: socialUrl,
      linkedin: socialUrl,
      youtube: socialUrl,
    })
    .optional()
    .default({ instagram: '', facebook: '', linkedin: '', youtube: '' }),
});

export const overview = asyncHandler(async (_req, res) => {
  const lowStockFilter = { active: true, $expr: { $lte: ['$stock', '$lowStockThreshold'] } };
  const [products, lowStock, lowStockItems, orders, paid, newMessages, customers] = await Promise.all([
    Product.countDocuments(),
    Product.countDocuments(lowStockFilter),
    Product.find(lowStockFilter).select('name stock lowStockThreshold').sort({ stock: 1, name: 1 }).limit(12).lean(),
    Order.countDocuments(),
    Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
    ]),
    ContactMessage.countDocuments({ status: 'new' }),
    User.countDocuments({ role: 'customer' }),
  ]);

  res.json({
    success: true,
    overview: {
      products,
      lowStock,
      lowStockItems,
      orders,
      paidOrders: paid[0]?.count || 0,
      paidTotal: Math.round((paid[0]?.total || 0) * 100) / 100,
      newMessages,
      customers,
    },
  });
});

export const listProducts = asyncHandler(async (_req, res) => {
  const products = await Product.find()
    .select('name slug sku price compareAtPrice stock lowStockThreshold active featured')
    .sort({ name: 1 });
  res.json({ success: true, products });
});

const adminProductFields =
  'name slug sku shortDescription description category size packSize price stock lowStockThreshold active featured features specifications images dataNotes';

const productCreate = z.object({
  name: z.string().trim().min(2).max(120),
  sku: z.string().trim().min(2).max(40),
  price: z.number().min(0).max(100000),
  category: z.string().trim().min(2).max(80),
  shortDescription: z.string().trim().max(300).optional().default(''),
  description: z.string().trim().max(4000).optional().default(''),
  size: z.string().trim().max(40).optional().default(''),
  packSize: z.number().int().min(1).max(100).nullable().optional().default(null),
  stock: z.number().int().min(0).max(100000).optional().default(0),
  lowStockThreshold: z.number().int().min(0).max(10000).optional().default(10),
});

export const createProduct = asyncHandler(async (req, res) => {
  const data = parseBody(productCreate, req.body);
  const slug = slugify(data.name);
  if (!slug) throw new ApiError(400, 'Enter a name that can be used in the shop address.');
  try {
    const product = await Product.create({
      ...data,
      sku: data.sku.toUpperCase(),
      slug,
      features: [],
      specifications: [],
      images: [],
      active: false,
      featured: false,
    });
    res.status(201).json({ success: true, product });
  } catch (error) {
    if (error?.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];
      throw new ApiError(409, field === 'sku' ? 'That SKU is already used.' : 'A pack with that name already exists.');
    }
    throw error;
  }
});

export const deleteProduct = asyncHandler(async (req, res) => {
  assertId(req.params.id);
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found.');
  const used = await Order.exists({ 'items.product': product._id });
  if (used) throw new ApiError(400, 'This pack is on an order. Turn it off instead of deleting it.');
  for (const image of product.images || []) removeUploadedProductImage(image.url);
  await product.deleteOne();
  res.json({ success: true });
});

export const getAdminProduct = asyncHandler(async (req, res) => {
  assertId(req.params.id);
  const product = await Product.findById(req.params.id).select(adminProductFields);
  if (!product) throw new ApiError(404, 'Product not found.');
  res.json({ success: true, product });
});

export const updateProduct = asyncHandler(async (req, res) => {
  assertId(req.params.id);
  const data = parseBody(productPatch, req.body);
  const product = await Product.findByIdAndUpdate(req.params.id, data, { returnDocument: 'after', runValidators: true }).select(
    adminProductFields,
  );
  if (!product) throw new ApiError(404, 'Product not found.');
  res.json({ success: true, product });
});

const imageAlt = z.object({
  alt: z.string().trim().max(160).optional().default(''),
  mode: z.enum(['replace', 'add']).optional().default('replace'),
});

const imageRemove = z.object({
  url: z.string().trim().min(1).max(500),
});

const maxPackPhotos = 6;

export const uploadProductImage = asyncHandler(async (req, res) => {
  assertId(req.params.id);
  if (!req.file?.buffer?.length) throw new ApiError(400, 'Choose an image.');
  const { alt, mode } = parseBody(imageAlt, req.body || {});
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found.');
  if (mode === 'add' && (product.images || []).length >= maxPackPhotos) {
    throw new ApiError(400, 'This pack already has 6 photos.');
  }

  const previous = mode === 'replace' ? product.images?.[0]?.url || '' : '';
  const saved = writeProductImage(product.slug, req.file.buffer);
  const image = {
    publicId: '',
    url: `${env.serverUrl.replace(/\/$/, '')}${saved.relativeUrl}`,
    alt: alt || (mode === 'replace' ? product.images?.[0]?.alt : '') || product.name,
  };
  product.images = mode === 'add' ? [...(product.images || []), image] : [image, ...(product.images || []).slice(1)];

  try {
    await product.save();
  } catch (error) {
    removeUploadedProductImage(image.url);
    throw error;
  }

  if (previous && previous !== image.url) removeUploadedProductImage(previous);
  const fresh = await Product.findById(product._id).select(adminProductFields);
  res.json({ success: true, product: fresh });
});

export const removeProductImage = asyncHandler(async (req, res) => {
  assertId(req.params.id);
  const { url } = parseBody(imageRemove, req.body || {});
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found.');
  if ((product.images || []).length < 2) throw new ApiError(400, 'Keep at least one pack photo.');
  const next = product.images.filter((image) => image.url !== url);
  if (next.length === product.images.length) throw new ApiError(404, 'That photo was not found.');
  product.images = next;
  await product.save();
  removeUploadedProductImage(url);
  const fresh = await Product.findById(product._id).select(adminProductFields);
  res.json({ success: true, product: fresh });
});

const paymentFilters = ['pending', 'paid', 'failed', 'refunded'];
const fulfilmentFilters = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

export const listOrders = asyncHandler(async (req, res) => {
  const q = String(req.query.q || '').trim().slice(0, 80);
  const filter = {};
  if (paymentFilters.includes(req.query.paymentStatus)) filter.paymentStatus = req.query.paymentStatus;
  if (fulfilmentFilters.includes(req.query.orderStatus)) filter.orderStatus = req.query.orderStatus;
  if (q) {
    const pattern = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ orderNumber: pattern }, { contactEmail: pattern }, { trackingNumber: pattern }];
  }

  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .limit(50)
    .select('orderNumber contactEmail total paymentStatus orderStatus trackingNumber createdAt');
  res.json({ success: true, orders });
});

export const getOrder = asyncHandler(async (req, res) => {
  assertId(req.params.id);
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found.');
  res.json({ success: true, order });
});

export const updateOrder = asyncHandler(async (req, res) => {
  assertId(req.params.id);
  const data = parseBody(orderPatch, req.body);
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found.');

  order.orderStatus = data.orderStatus;
  order.trackingNumber = data.trackingNumber;
  await order.save();

  let emailed = false;
  if (order.orderStatus === 'shipped') emailed = await notifyOrderShipped(order);
  if (order.orderStatus === 'delivered') emailed = await notifyOrderDelivered(order);
  const saved = await Order.findById(order._id);
  res.json({ success: true, order: saved, emailed });
});

export const listMessages = asyncHandler(async (_req, res) => {
  const messages = await ContactMessage.find().sort({ createdAt: -1 }).limit(50);
  res.json({ success: true, messages });
});

export const updateMessage = asyncHandler(async (req, res) => {
  assertId(req.params.id);
  const data = parseBody(messagePatch, req.body);
  const message = await ContactMessage.findByIdAndUpdate(req.params.id, { status: data.status }, { new: true });
  if (!message) throw new ApiError(404, 'Message not found.');
  res.json({ success: true, message });
});

export const getSettings = asyncHandler(async (_req, res) => {
  const settings = await SiteSetting.findOne({ key: 'store' }).lean();
  res.json({ success: true, settings });
});

export const updateSettings = asyncHandler(async (req, res) => {
  const data = parseBody(settingsPatch, req.body);
  const methods = data.method
    ? [
        {
          name: data.method.name,
          description: data.method.description,
          price: data.method.price,
          freeAbove: data.method.freeAbove,
        },
      ]
    : [];

  const settings = await SiteSetting.findOneAndUpdate(
    { key: 'store' },
    {
      $set: {
        support: data.support,
        shipping: { summary: data.shippingSummary, methods },
        returns: data.returns,
        privacy: data.privacy,
        terms: data.terms,
        taxRate: data.taxRate,
        social: data.social,
      },
      $setOnInsert: { key: 'store' },
    },
    { new: true, upsert: true },
  ).lean();

  res.json({ success: true, settings });
});

const noteBody = z.object({
  title: z.string().trim().min(2).max(160),
  slug: z.string().trim().max(160).optional().default(''),
  excerpt: z.string().trim().max(300).optional().default(''),
  content: z.string().trim().max(20000).optional().default(''),
  category: z.string().trim().min(1).max(40).optional().default('Journal'),
  tags: z.array(z.string().trim().min(1).max(40)).max(8).optional().default([]),
  coverUrl: z.string().trim().max(400).optional().default(''),
  coverAlt: z.string().trim().max(160).optional().default(''),
  featured: z.boolean().optional().default(false),
  published: z.boolean(),
});

async function uniqueSlug(raw, currentId) {
  const base = slugify(raw) || 'note';
  let slug = base;
  let n = 2;
  while (await Blog.exists({ slug, ...(currentId ? { _id: { $ne: currentId } } : {}) })) {
    slug = `${base}-${n}`;
    n += 1;
  }
  return slug;
}

function noteFields(data, user, existing) {
  return {
    title: data.title,
    excerpt: data.excerpt,
    content: data.content,
    category: data.category,
    tags: data.tags,
    coverImage: { publicId: '', url: data.coverUrl, alt: data.coverAlt },
    author: user._id,
    authorName: user.name || 'Satin',
    featured: Boolean(data.featured) && Boolean(data.published),
    published: data.published,
    publishedAt: data.published ? existing?.publishedAt || new Date() : existing?.publishedAt || null,
  };
}

export const listNotes = asyncHandler(async (_req, res) => {
  const notes = await Blog.find().sort({ updatedAt: -1 }).select('title slug excerpt published publishedAt updatedAt');
  res.json({ success: true, notes });
});

export const getNote = asyncHandler(async (req, res) => {
  assertId(req.params.id);
  const note = await Blog.findById(req.params.id);
  if (!note) throw new ApiError(404, 'Note not found.');
  res.json({ success: true, note });
});

export const createNote = asyncHandler(async (req, res) => {
  const data = parseBody(noteBody, req.body);
  const slug = await uniqueSlug(data.slug || data.title);
  const note = await Blog.create({ ...noteFields(data, req.user, null), slug });
  res.status(201).json({ success: true, note });
});

export const updateNote = asyncHandler(async (req, res) => {
  assertId(req.params.id);
  const existing = await Blog.findById(req.params.id);
  if (!existing) throw new ApiError(404, 'Note not found.');
  const data = parseBody(noteBody, req.body);
  const slug = await uniqueSlug(data.slug || data.title, existing._id);
  const previousCover = existing.coverImage?.url || '';
  Object.assign(existing, noteFields(data, req.user, existing), { slug });
  await existing.save();
  if (previousCover !== existing.coverImage?.url) removeStoredImage('notes', previousCover);
  res.json({ success: true, note: existing });
});

export const uploadNoteCover = asyncHandler(async (req, res) => {
  assertId(req.params.id);
  if (!req.file?.buffer?.length) throw new ApiError(400, 'Choose an image.');
  const { alt } = parseBody(imageAlt, req.body || {});
  const note = await Blog.findById(req.params.id);
  if (!note) throw new ApiError(404, 'Note not found.');

  const previous = note.coverImage?.url || '';
  const saved = writeStoredImage('notes', note.slug, req.file.buffer);
  const coverImage = {
    publicId: '',
    url: `${env.serverUrl.replace(/\/$/, '')}${saved.relativeUrl}`,
    alt: alt || note.coverImage?.alt || note.title,
  };
  note.coverImage = coverImage;

  try {
    await note.save();
  } catch (error) {
    removeStoredImage('notes', coverImage.url);
    throw error;
  }

  if (previous !== coverImage.url) removeStoredImage('notes', previous);
  res.json({ success: true, note });
});

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const customerPatch = z.object({
  isActive: z.boolean(),
});

function customerShape(customer, orderCount) {
  return {
    id: customer._id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone || '',
    role: customer.role,
    isActive: customer.isActive,
    createdAt: customer.createdAt,
    ...(orderCount === undefined ? {} : { orderCount }),
  };
}

export const listCustomers = asyncHandler(async (req, res) => {
  const q = String(req.query.q || '').trim().slice(0, 80);
  const filter = {};
  if (q) {
    const pattern = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ name: pattern }, { email: pattern }];
  }

  const customers = await User.find(filter).select('name email phone role isActive createdAt').sort({ createdAt: -1 }).limit(50);
  const counts = customers.length
    ? await Order.aggregate([
        { $match: { user: { $in: customers.map((customer) => customer._id) } } },
        { $group: { _id: '$user', count: { $sum: 1 } } },
      ])
    : [];
  const byUser = new Map(counts.map((row) => [String(row._id), row.count]));

  res.json({
    success: true,
    customers: customers.map((customer) => customerShape(customer, byUser.get(String(customer._id)) || 0)),
  });
});

export const getCustomer = asyncHandler(async (req, res) => {
  assertId(req.params.id);
  const customer = await User.findById(req.params.id).select('name email phone role isActive createdAt');
  if (!customer) throw new ApiError(404, 'That customer was not found.');
  const orders = await Order.find({ user: customer._id })
    .select('orderNumber total paymentStatus orderStatus createdAt')
    .sort({ createdAt: -1 })
    .limit(20);
  res.json({ success: true, customer: customerShape(customer), orders });
});

export const updateCustomer = asyncHandler(async (req, res) => {
  assertId(req.params.id);
  const data = parseBody(customerPatch, req.body);
  if (String(req.user._id) === req.params.id && data.isActive === false) {
    throw new ApiError(400, 'You cannot disable your own account.');
  }

  const customer = await User.findById(req.params.id).select('name email phone role isActive createdAt');
  if (!customer) throw new ApiError(404, 'That customer was not found.');

  if (customer.role === 'admin' && customer.isActive && data.isActive === false) {
    const others = await User.countDocuments({ role: 'admin', isActive: true, _id: { $ne: customer._id } });
    if (!others) throw new ApiError(400, 'The last active admin account cannot be disabled.');
  }

  customer.isActive = data.isActive;
  await customer.save();
  res.json({ success: true, customer: customerShape(customer) });
});

export const deleteNote = asyncHandler(async (req, res) => {
  assertId(req.params.id);
  const note = await Blog.findByIdAndDelete(req.params.id);
  if (!note) throw new ApiError(404, 'Note not found.');
  removeStoredImage('notes', note.coverImage?.url);
  res.json({ success: true });
});
