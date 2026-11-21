import mongoose from 'mongoose';

const ContentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
  },
  slug: {
    type: String,
    unique: true,
  },
  description: {
    type: String,
  },
  languages: {
    type: [String],
    default: [],
  },
  language: {
    type: [String],
    default: [],
  },
  isComingSoon: {
    type: Boolean,
    default: false,
  },
  expectedReleaseDate: {
    type: Date,
  },
  genres: {
    type: [String],
    default: [],
  },
  type: {
    type: String,
    enum: ['series', 'movie', 'short'],
    required: [true, 'Please provide a content type'],
  },
  ageRating: {
    type: String,
  },
  releaseYear: {
    type: Number,
  },
  thumbnailUrl: {
    type: String,
  },
  posterUrl: {
    type: String,
  },
  bannerUrl: {
    type: String,
  },
  trailerPoster: {
    type: String,
  },
  trailerUrl: {
    type: String,
  },
  cast: {
    type: mongoose.Schema.Types.Mixed,
    default: () => ({ actors: [], directors: [], writers: [] }),
  },
  director: {
    type: [String],
    default: [],
  },
  musicDirector: {
    type: [String],
    default: [],
  },
  producer: {
    type: [String],
    default: [],
  },
  videoSource: {
    key: { type: String },
    bucket: { type: String },
    size: { type: Number },
    contentType: { type: String },
    uploadId: { type: String },
  },
  hlsManifestUrl: {
    type: String,
  },
  hlsMasterUrl: {
    type: String,
  },
  videoUrl: {
    type: String,
  },
  videoUrls: {
    '1080p': { type: String },
    '720p': { type: String },
    '480p': { type: String },
    '360p': { type: String },
  },
  duration: {
    type: Number,
  },
  pricing: {
    type: String,
    enum: ['free', 'premium'],
    default: 'free',
  },
  freeEpisodeCount: {
    type: Number,
    default: 0,
  },
  scheduledPublishAt: {
    type: Date,
  },
  transcodingStatus: {
    type: String,
    enum: ['pending', 'queued', 'uploading', 'processing', 'thumbnails', 'completed', 'live', 'failed'],
    default: 'queued',
  },
  renditions: [{
    quality: { type: String },
    status: {
      type: String,
      enum: ['queued', 'processing', 'ready', 'failed'],
      default: 'queued',
    },
    url: { type: String },
    bitrate: { type: Number },
  }],
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isTrending: {
    type: Boolean,
    default: false,
  },
  isBlockbuster: {
    type: Boolean,
    default: false,
  },
  trendingRank: {
    type: Number,
  },
  blockbusterRank: {
    type: Number,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
  },
  totalSeasons: {
    type: Number,
    default: 1,
  },
  tags: {
    type: [String],
    default: [],
  },
  color: {
    type: String,
    default: '0xFF1A1A2E',
  },
}, {
  timestamps: true,
});

ContentSchema.index({ title: 'text', description: 'text', tags: 'text' }, { language_override: 'textLang' });
ContentSchema.index({ type: 1, isDeleted: 1, genres: 1, isActive: 1 });
ContentSchema.index({ type: 1, isDeleted: 1, title: 1 });
ContentSchema.index({ type: 1, isDeleted: 1, releaseYear: -1 });
ContentSchema.index({ type: 1, isDeleted: 1, createdAt: -1 });
ContentSchema.index({ isDeleted: 1, createdAt: -1 });

export default mongoose.models.Content || mongoose.model('Content', ContentSchema);
