import { Router } from 'express';
import { ContactMessage } from '../models/ContactMessage.js';
import { notifyContactMessage } from '../services/contact-mail.js';
import { requestNewsletterLeave, subscribeNewsletter, unsubscribeNewsletter } from '../services/newsletter-mail.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { contactSchema, newsletterLeaveSchema, newsletterSchema, parseBody } from '../validators/index.js';

const router = Router();

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const data = parseBody(contactSchema, req.body);
    const message = await ContactMessage.create(data);
    const emailed = await notifyContactMessage(message);
    res.status(201).json({ success: true, id: message._id, emailed });
  }),
);

router.post(
  '/newsletter',
  asyncHandler(async (req, res) => {
    const data = parseBody(newsletterSchema, req.body);
    const result = await subscribeNewsletter(data.email);
    res.status(201).json({ success: true, ...result });
  }),
);

router.post(
  '/newsletter/leave',
  asyncHandler(async (req, res) => {
    const data = parseBody(newsletterSchema, req.body);
    await requestNewsletterLeave(data.email);
    res.json({
      success: true,
      message: 'If that email is on the list, a link to leave was sent.',
    });
  }),
);

router.post(
  '/newsletter/unsubscribe',
  asyncHandler(async (req, res) => {
    const data = parseBody(newsletterLeaveSchema, req.body);
    await unsubscribeNewsletter(data.token);
    res.json({ success: true, message: 'Product notes will no longer be sent to that email.' });
  }),
);

export default router;
