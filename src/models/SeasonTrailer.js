import mongoose from 'mongoose';

const SeasonTrailerSchema = new mongoose.Schema({
  seasonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Season',
    required: true,
    unique: true,
  },
  seriesId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content',
    required: true,
  },
  videoUrl: { type: String, required: true },
  videoKey: { type: String, required: false },
  duration: { type: Number, required: false, default: 0 },
  fileSize: { type: Number, required: false },
  mimeType: { type: String, required: false },
  likesCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
});

if (mongoose.models.SeasonTrailer) {
  delete mongoose.models.SeasonTrailer;
}
export default mongoose.models.SeasonTrailer || mongoose.model('SeasonTrailer', SeasonTrailerSchema);
