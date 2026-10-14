import { Router } from 'express';
import { createReview, listApproved, listRecent, myReview } from '../controllers/review.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Approved notes from paid orders. Registered before /:productId.
router.get('/recent', listRecent);
router.get('/mine/:productId', requireAuth, myReview);
router.get('/:productId', listApproved);
router.post('/', requireAuth, createReview);

export default router;

