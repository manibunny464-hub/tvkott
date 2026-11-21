import mongoose from 'mongoose';

const DownloadSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  episodeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Episode',
    required: true,
    index: true,
  },
  language: {
    type: String,
    trim: true,
    default: null,
  },
  quality: {
    type: String,
    trim: true,
    default: '720p',
  },
  downloadedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['pending', 'downloading', 'completed', 'failed'],
    default: 'completed',
  },
}, {
  timestamps: true,
});

// Ensure a user can only have one download record per episode + language + quality
DownloadSchema.index({ userId: 1, episodeId: 1, language: 1, quality: 1 }, { unique: true });

// Prevent cached model issues in dev/reloads
if (mongoose.models.Download) {
  delete mongoose.models.Download;
}

export default mongoose.models.Download || mongoose.model('Download', DownloadSchema);
