import { Router } from 'express';
import { addAddress, changePassword, deleteAddress, deleteAvatar, updateAddress, updateProfile, uploadAvatar } from '../controllers/account.controller.js';
import { acceptImageUpload } from '../services/product-image.js';

const router = Router();

router.post('/avatar', acceptImageUpload, uploadAvatar);
router.delete('/avatar', deleteAvatar);
router.patch('/profile', updateProfile);
router.patch('/password', changePassword);
router.post('/addresses', addAddress);
router.patch('/addresses/:id', updateAddress);
router.delete('/addresses/:id', deleteAddress);

export default router;
