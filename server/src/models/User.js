import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, default: 'Home' },
    fullName: { type: String, trim: true, required: true },
    phone: { type: String, trim: true, required: true },
    line1: { type: String, trim: true, required: true },
    line2: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, required: true },
    state: { type: String, trim: true, required: true },
    postalCode: { type: String, trim: true, required: true },
    country: { type: String, trim: true, default: 'India' },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true },
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    phone: { type: String, trim: true, default: '' },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    avatar: {
      publicId: { type: String, default: '' },
      url: { type: String, default: '' },
      alt: { type: String, default: '' },
    },
    addresses: [addressSchema],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    isActive: { type: Boolean, default: true },
    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    passwordChangedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

userSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.passwordHash;
    delete ret.passwordResetTokenHash;
    delete ret.passwordResetExpires;
    return ret;
  },
});

export const User = mongoose.model('User', userSchema);
