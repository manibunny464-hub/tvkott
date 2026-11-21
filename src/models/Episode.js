import mongoose from 'mongoose';

const EpisodeVideoFileSchema = new mongoose.Schema({
  quality: { type: String, required: true }, // e.g. 1080p, 720p
  videoUrl: { type: String, required: true },
  videoKey: { type: String },
  fileSize: { type: Number },
  duration: { type: Number },
  mimeType: { type: String },
});

const EpisodeLanguageVariantSchema = new mongoose.Schema({
  language: { type: String, required: true }, // e.g. Telugu, Hindi
  title: { type: String, required: true },
  description: { type: String },
  thumbnailUrl: { type: String },
  subtitleFile: { type: String },
  audioFile: { type: String },
  videoFiles: [EpisodeVideoFileSchema],
});

const EpisodeSchema = new mongoose.Schema({
  seriesId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content',
    required: true,
  },
  seasonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Season',
    required: true,
  },
  episodeNumber: {
    type: Number,
    required: [true, 'Please provide an episode number'],
  },
  title: {
    type: String, // fallback/internal title
    required: [true, 'Please provide a title'],
  },
  description: {
    type: String,
  },
  thumbnailUrl: {
    type: String,
  },
  duration: {
    type: Number, // Fallback duration
  },
  status: {
    type: String,
    enum: ['Draft', 'Scheduled', 'Published', 'Inactive'],
    default: 'Draft',
  },
  releaseDate: {
    type: Date,
  },
  languages: [EpisodeLanguageVariantSchema],
  isActive: {
    type: Boolean,
    default: true,
  },
  isFree: {
    type: Boolean,
    default: false,
  },
  isDownloadable: {
    type: Boolean,
    default: false,
  },
  airDate: {
    type: Date,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

EpisodeSchema.index({ seasonId: 1, episodeNumber: 1 });
EpisodeSchema.index({ seriesId: 1, seasonId: 1, isDeleted: 1, episodeNumber: 1 });

if (mongoose.models.Episode) {
  delete mongoose.models.Episode;
}
export default mongoose.models.Episode || mongoose.model('Episode', EpisodeSchema);
