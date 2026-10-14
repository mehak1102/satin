import { Router } from 'express';
import { Blog } from '../models/Blog.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(24, Math.max(1, Number(req.query.limit) || 9));
    const filter = { published: true };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.tag) filter.tags = req.query.tag;
    if (req.query.q) filter.$text = { $search: String(req.query.q).slice(0, 80) };

    try {
      const [docs, total] = await Promise.all([
        Blog.find(filter)
          .sort({ featured: -1, publishedAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit),
        Blog.countDocuments(filter),
      ]);
      const items = docs.map((doc) => {
        const item = doc.toObject();
        const readingMinutes = readingMinutesFor(item.content);
        delete item.content;
        return { ...item, readingMinutes };
      });
      res.json({ success: true, items, total, page, pages: Math.ceil(total / limit) || 0 });
    } catch (error) {
      if (!/stop word|no valid search|requires a language/i.test(String(error?.message || ''))) throw error;
      res.json({ success: true, items: [], total: 0, page, pages: 0 });
    }
  }),
);

// About 200 words a minute, from the saved article text.
function readingMinutesFor(content) {
  const words = String(content || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  if (!words) return 0;
  return Math.max(1, Math.ceil(words / 200));
}

router.get(
  '/meta/filters',
  asyncHandler(async (_req, res) => {
    const [categories, tags] = await Promise.all([
      Blog.distinct('category', { published: true, category: { $ne: '' } }),
      Blog.distinct('tags', { published: true, tags: { $ne: '' } }),
    ]);
    res.json({ success: true, categories, tags });
  }),
);

router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const blog = await Blog.findOne({ slug: req.params.slug, published: true });
    if (!blog) throw new ApiError(404, 'Article not found.');
    const related = await Blog.find({
      published: true,
      _id: { $ne: blog._id },
      ...(blog.category ? { category: blog.category } : {}),
    })
      .sort({ publishedAt: -1 })
      .limit(3)
      .select('title slug excerpt category publishedAt');
    const article = blog.toObject();
    article.readingMinutes = readingMinutesFor(article.content);
    res.json({ success: true, blog: article, related });
  }),
);

export default router;
