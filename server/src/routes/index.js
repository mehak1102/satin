import { Router } from 'express';
import { contactLimiter } from '../middleware/rateLimit.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

import authRoutes from './auth.routes.js';
import productRoutes from './product.routes.js';
import cartRoutes from './cart.routes.js';
import wishlistRoutes from './wishlist.routes.js';
import orderRoutes from './order.routes.js';
import paymentRoutes from './payment.routes.js';
import reviewRoutes from './review.routes.js';
import blogRoutes from './blog.routes.js';
import contactRoutes from './contact.routes.js';
import adminRoutes from './admin.routes.js';
import contentRoutes from './content.routes.js';
import accountRoutes from './account.routes.js';
import trackerRoutes from './tracker.routes.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, service: 'satin-api', time: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/account', requireAuth, accountRoutes);
router.use('/cart', requireAuth, cartRoutes);
router.use('/wishlist', requireAuth, wishlistRoutes);
router.use('/tracker', requireAuth, trackerRoutes);
router.use('/orders', requireAuth, orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/reviews', reviewRoutes);
router.use('/blogs', blogRoutes);
router.use('/contact', contactLimiter, contactRoutes);
router.use('/content', contentRoutes);
router.use('/admin', requireAuth, requireRole('admin'), adminRoutes);

export default router;
