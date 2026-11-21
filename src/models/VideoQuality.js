import mongoose from 'mongoose';

const VideoQualitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // e.g. "1080p", "720p"
    trim: true,
  },
  width: {
    type: Number,
    required: true,
  },
  height: {
    type: Number,
    required: true,
  },
  display_order: {
    type: Number,
    default: 0,
  },
  is_active: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.VideoQuality || mongoose.model('VideoQuality', VideoQualitySchema);
