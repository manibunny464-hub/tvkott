import mongoose from 'mongoose';

const SearchHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide a userId'],
  },
  query: {
    type: String,
    required: [true, 'Please provide a search query'],
  },
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content',
  },
  searchedAt: {
    type: Date,
    default: Date.now,
  },
});

if (mongoose.models.SearchHistory) {
  delete mongoose.models.SearchHistory;
}

export default mongoose.models.SearchHistory || mongoose.model('SearchHistory', SearchHistorySchema);
