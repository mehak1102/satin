import { Router } from 'express';
import { SiteSetting } from '../models/SiteSetting.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

const fallback = {
  support: {
    email: 'customercare@parivarseva.org',
    phone: '011-24335055',
    tollFree: '1800-123-7075',
    website: 'https://www.parivarseva.org',
    address: 'Parivar Seva Sanstha, C-374, Defence Colony, New Delhi 110024',
  },
  social: { instagram: '', facebook: '', youtube: '' },
  shipping: { summary: '', methods: [] },
  returns: '',
  privacy: '',
  terms: '',
  taxRate: 0,
};

router.get(
  '/settings',
  asyncHandler(async (_req, res) => {
    const stored = await SiteSetting.findOne({ key: 'store' }).lean();
    res.json({ success: true, settings: stored || fallback });
  }),
);

export default router;
