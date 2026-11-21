import mongoose from 'mongoose';

const TrendingItemSchema = new mongoose.Schema(
  {
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Content',
      required: true,
      unique: true,
    },
    contentType: {
      type: String,
      enum: ['movie', 'series', 'short'],
      default: 'movie',
    },
    rank: { type: Number, default: 0 },
    addedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

TrendingItemSchema.index({ rank: 1, addedAt: -1 });

export default mongoose.models.TrendingItem ||
  mongoose.model('TrendingItem', TrendingItemSchema);
