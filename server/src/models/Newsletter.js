import mongoose from 'mongoose';

const newsletterSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    confirmationSent: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    unsubscribeTokenHash: { type: String },
  },
  { timestamps: true },
);

export const Newsletter = mongoose.model('Newsletter', newsletterSchema);
