import mongoose from 'mongoose';

const TrailerSchema = new mongoose.Schema({
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content',
    required: [true, 'Please provide a contentId'],
  },
  title: {
    type: String,
    required: [true, 'Please provide a title'],
  },
  description: {
    type: String,
  },
  genre: {
    type: String,
  },
  year: {
    type: Number,
  },
  rating: {
    type: String,
  },
  videoKey: {
    type: String,
  },
  videoUrl: {
    type: String,
  },
  thumbnailUrl: {
    type: String,
  },
  contentType: {
    type: String,
    enum: ['movie', 'series', 'short'],
    default: 'movie',
  },
  duration: {
    type: Number,
    default: 0,
  },
  likesCount: {
    type: Number,
    default: 0,
  },
  commentsCount: {
    type: Number,
    default: 0,
  },
  isNew: {
    type: Boolean,
    default: false,
  },
  displayOrder: {
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
}, {
  timestamps: true,
  suppressReservedKeysWarning: true,
});

export default mongoose.models.Trailer || mongoose.model('Trailer', TrailerSchema);
