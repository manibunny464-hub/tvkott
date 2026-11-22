import mongoose from 'mongoose';

const SeasonSchema = new mongoose.Schema(
  {
    seriesId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Content',
      required: true,
    },
    seriesIds: { type: [mongoose.Schema.Types.ObjectId], ref: 'Content', default: undefined },
    seasonNumber: { type: Number, required: true },
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    poster: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    cast: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({ actors: [], directors: [], writers: [] }),
    },
  },
  { timestamps: true }
);

SeasonSchema.index({ seriesId: 1, seasonNumber: 1 }, { unique: true });
SeasonSchema.index({ seriesId: 1, isDeleted: 1, seasonNumber: 1 });

export default mongoose.models.Season || mongoose.model('Season', SeasonSchema);
