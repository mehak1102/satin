import { Router } from 'express';
import { forgotPassword, login, logout, me, refresh, register, resetPassword } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { authLimiter, loginLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', loginLimiter, login);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', requireAuth, me);

export default router;
