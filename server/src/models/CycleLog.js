import mongoose from 'mongoose';

const cycleDaySchema = new mongoose.Schema(
  {
    date: { type: String, required: true },
    flow: { type: String, enum: ['light', 'medium', 'heavy'], default: 'medium' },
  },
  { _id: false },
);

// Period data is kept apart from User so admin customer views never load it.
const cycleLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    days: { type: [cycleDaySchema], default: [] },
    reminder: { type: Boolean, default: false },
    remindedFor: { type: String, default: '' },
  },
  { timestamps: true },
);

cycleLogSchema.index({ reminder: 1 });

export const CycleLog = mongoose.model('CycleLog', cycleLogSchema);
