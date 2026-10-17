import mongoose from 'mongoose';

const siteSettingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    shipping: {
      summary: { type: String, default: '' },
      methods: [
        {
          name: String,
          description: String,
          price: { type: Number, default: 0 },
          freeAbove: { type: Number, default: null },
        },
      ],
    },
    returns: { type: String, default: '' },
    privacy: { type: String, default: '' },
    terms: { type: String, default: '' },
    support: {
      email: { type: String, default: 'customercare@parivarseva.org' },
      phone: { type: String, default: '011-24335055' },
      tollFree: { type: String, default: '1800-123-7075' },
      website: { type: String, default: 'https://www.parivarseva.org' },
      address: {
        type: String,
        default: 'Parivar Seva Sanstha, C-374, Defence Colony, New Delhi 110024',
      },
    },
    social: {
      instagram: { type: String, default: 'https://www.instagram.com/parivarseva/' },
      facebook: { type: String, default: 'https://www.facebook.com/parivarseva' },
      linkedin: { type: String, default: 'https://www.linkedin.com/company/parivarsevasanstha' },
      youtube: { type: String, default: '' },
    },
    taxRate: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const SiteSetting = mongoose.model('SiteSetting', siteSettingSchema);
