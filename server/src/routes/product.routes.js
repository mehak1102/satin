import { Router } from 'express';
import { checkAvailability, getProductBySlug, listCategories, listProducts } from '../controllers/product.controller.js';

const router = Router();

router.get('/', listProducts);
router.get('/meta/filters', listCategories);
router.post('/availability', checkAvailability);
router.get('/:slug', getProductBySlug);

export default router;
