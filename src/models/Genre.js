import mongoose from 'mongoose';

const GenreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a genre name'],
  },
  slug: {
    type: String,
    required: [true, 'Please provide a slug'],
    unique: true,
  },
  description: {
    type: String,
  },
  imageUrl: {
    type: String,
  },
  borderColor: {
    type: String,
    default: '#06b6d4',
  },
  color: {
    type: String,
    default: '0xFFE91E63',
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  displayOrder: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Genre || mongoose.model('Genre', GenreSchema);
