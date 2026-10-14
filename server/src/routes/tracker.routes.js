import { Router } from 'express';
import { z } from 'zod';
import { CycleLog } from '../models/CycleLog.js';
import { smtpEnabled } from '../services/mail.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { addDays, isRealDate, todayIn } from '../utils/cycle.js';
import { parseBody } from '../validators/index.js';

const router = Router();

const trackerSchema = z.object({
  days: z
    .array(
      z.object({
        date: z.string().refine(isRealDate, 'Use real dates.'),
        flow: z.enum(['light', 'medium', 'heavy']).default('medium'),
      }),
    )
    .max(2000),
  reminder: z.boolean().optional(),
});

function shape(log) {
  return {
    success: true,
    synced: Boolean(log),
    days: log?.days || [],
    reminder: Boolean(log?.reminder),
    emailReady: smtpEnabled(),
  };
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const log = await CycleLog.findOne({ user: req.user._id }).lean();
    res.json(shape(log));
  }),
);

router.put(
  '/',
  asyncHandler(async (req, res) => {
    const data = parseBody(trackerSchema, req.body);
    const latest = addDays(todayIn(), 1);
    const byDate = new Map();
    for (const day of data.days) if (day.date <= latest) byDate.set(day.date, day);
    const days = [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
    const update = { days };
    if (data.reminder !== undefined) update.reminder = data.reminder;
    const log = await CycleLog.findOneAndUpdate(
      { user: req.user._id },
      { $set: update, $setOnInsert: { user: req.user._id } },
      { upsert: true, returnDocument: 'after', lean: true },
    );
    res.json(shape(log));
  }),
);

router.delete(
  '/',
  asyncHandler(async (req, res) => {
    await CycleLog.deleteOne({ user: req.user._id });
    res.json(shape(null));
  }),
);

export default router;
