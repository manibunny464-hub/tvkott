import mongoose from 'mongoose';

const BannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, default: '', trim: true },
    imageUrl: { type: String, required: true },
    linkedContentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Content' },
    linkedContentType: {
      type: String,
      enum: ['movie', 'series', 'short'],
      default: 'movie',
    },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);

BannerSchema.index({ isDeleted: 1, order: 1 });

export default mongoose.models.Banner || mongoose.model('Banner', BannerSchema);
