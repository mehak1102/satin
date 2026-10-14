import { Router } from 'express';
import { env } from '../config/env.js';
import { Blog } from '../models/Blog.js';
import { Product } from '../models/Product.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

const staticPaths = ['/', '/shop', '/about', '/blogs', '/faq', '/contact', '/tracker', '/leave-notes', '/shipping', '/returns', '/privacy', '/terms'];

function siteOrigin() {
  return String(env.clientUrl || 'http://localhost:5173').replace(/\/$/, '');
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

router.get('/robots.txt', (_req, res) => {
  const site = siteOrigin();
  res.type('text/plain').send(
    [
      'User-agent: *',
      'Allow: /',
      'Disallow: /admin',
      'Disallow: /account',
      'Disallow: /checkout',
      'Disallow: /cart',
      'Disallow: /order',
      'Disallow: /forgot-password',
      'Disallow: /reset-password',
      '',
      `Sitemap: ${site}/sitemap.xml`,
      '',
    ].join('\n'),
  );
});

router.get(
  '/sitemap.xml',
  asyncHandler(async (_req, res) => {
    const site = siteOrigin();
    const [products, notes] = await Promise.all([
      Product.find({ active: true }).select('slug updatedAt').sort({ slug: 1 }),
      Blog.find({ published: true }).select('slug updatedAt').sort({ slug: 1 }),
    ]);

    const urls = [
      ...staticPaths.map((path) => ({ loc: path === '/' ? `${site}/` : `${site}${path}` })),
      ...products.map((product) => ({ loc: `${site}/product/${product.slug}`, lastmod: product.updatedAt })),
      ...notes.map((note) => ({ loc: `${site}/blogs/${note.slug}`, lastmod: note.updatedAt })),
    ];

    const body = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...urls.map((url) => {
        const lastmod = url.lastmod ? `\n    <lastmod>${url.lastmod.toISOString().slice(0, 10)}</lastmod>` : '';
        return `  <url>\n    <loc>${escapeXml(url.loc)}</loc>${lastmod}\n  </url>`;
      }),
      '</urlset>',
      '',
    ].join('\n');

    res.type('application/xml').send(body);
  }),
);

export default router;
