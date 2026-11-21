import mongoose from 'mongoose';

const TrendingSearchSchema = new mongoose.Schema({
  query: {
    type: String,
    required: [true, 'Please provide a search query'],
    unique: true,
  },
  count: {
    type: Number,
    default: 1,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  displayOrder: {
    type: Number,
  },
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content',
  },
});

if (mongoose.models.TrendingSearch) {
  delete mongoose.models.TrendingSearch;
}

export default mongoose.models.TrendingSearch || mongoose.model('TrendingSearch', TrendingSearchSchema);
