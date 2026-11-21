import mongoose from 'mongoose';

const LanguageSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  englishName: {
    type: String,
    required: true,
    trim: true,
  },
  nativeName: {
    type: String,
    required: true,
    trim: true,
  },
  imageUrl: {
    type: String,
    required: false,
    default: '',
  },
  color: {
    type: String,
    default: '0xFF00D2FF',
  },
  order: {
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

export default mongoose.models.Language || mongoose.model('Language', LanguageSchema);
