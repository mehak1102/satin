import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    excerpt: { type: String, default: '' },
    content: { type: String, default: '' },
    coverImage: {
      publicId: { type: String, default: '' },
      url: { type: String, default: '' },
      alt: { type: String, default: '' },
    },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    authorName: { type: String, default: 'Satin' },
    category: { type: String, default: 'Journal' },
    tags: [{ type: String, trim: true }],
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: false },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

blogSchema.index({ title: 'text', excerpt: 'text', content: 'text', tags: 'text' });
blogSchema.index({ published: 1, publishedAt: -1, category: 1 });

export const Blog = mongoose.model('Blog', blogSchema);
