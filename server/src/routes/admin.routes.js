import { Router } from 'express';
import {
  getOrder,
  getSettings,
  createNote,
  deleteNote,
  getNote,
  listMessages,
  listNotes,
  listOrders,
  listCustomers,
  getCustomer,
  updateCustomer,
  listProducts,
  getAdminProduct,
  createProduct,
  deleteProduct,
  overview,
  updateMessage,
  updateOrder,
  updateNote,
  uploadNoteCover,
  updateProduct,
  uploadProductImage,
  removeProductImage,
  updateSettings,
} from '../controllers/admin.controller.js';
import { acceptImageUpload, acceptProductImage } from '../services/product-image.js';
import { deleteReview, listReviews, updateReview } from '../controllers/review.controller.js';

const router = Router();


router.get('/overview', overview);
router.get('/products', listProducts);
router.post('/products', createProduct);
router.get('/products/:id', getAdminProduct);
router.delete('/products/:id', deleteProduct);
router.patch('/products/:id', updateProduct);
router.post('/products/:id/image', acceptProductImage, uploadProductImage);
router.delete('/products/:id/image', removeProductImage);
router.get('/customers', listCustomers);
router.get('/customers/:id', getCustomer);
router.patch('/customers/:id', updateCustomer);
router.get('/orders', listOrders);
router.get('/orders/:id', getOrder);
router.patch('/orders/:id', updateOrder);
router.get('/messages', listMessages);
router.patch('/messages/:id', updateMessage);
router.get('/settings', getSettings);
router.put('/settings', updateSettings);
router.get('/notes', listNotes);
router.post('/notes', createNote);
router.get('/notes/:id', getNote);
router.patch('/notes/:id', updateNote);
router.post('/notes/:id/cover', acceptImageUpload, uploadNoteCover);
router.delete('/notes/:id', deleteNote);
router.get('/reviews', listReviews);
router.patch('/reviews/:id', updateReview);
router.delete('/reviews/:id', deleteReview);

export default router;
