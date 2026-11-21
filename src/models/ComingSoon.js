import mongoose from 'mongoose';

const NotifyUserSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    registeredAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ComingSoonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    posterUrl: { type: String, default: '' },
    thumbnailUrl: { type: String, default: '' },
    bannerUrl: { type: String, default: '' },
    languages: { type: [String], default: [] },
    genres: { type: [String], default: [] },
    ageRating: { type: String },
    releaseYear: { type: Number },
    cast: {
      type: [{
        role: { type: String },
        name: { type: String },
        imageUrl: { type: String }
      }],
      default: [],
    },
    expectedReleaseDate: { type: Date },
    linkedContentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Content' },
    isActive: { type: Boolean, default: true },
    notifyUsers: { type: [NotifyUserSchema], default: [] },
    lastNotifiedAt: { type: Date },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    rank: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ComingSoonSchema.index({ isDeleted: 1, rank: 1, expectedReleaseDate: 1 });

export default mongoose.models.ComingSoon ||
  mongoose.model('ComingSoon', ComingSoonSchema);
