import mongoose from 'mongoose';

const SubscriptionPageSchema = new mongoose.Schema({
  bannerImage: {
    type: String,
    default: '',
  },
  bannerTitle: {
    type: String,
    default: '',
    trim: true,
  },
  bannerSubtitle: {
    type: String,
    default: '',
    trim: true,
  },
}, {
  timestamps: true,
});

export default mongoose.models.SubscriptionPage ||
  mongoose.model('SubscriptionPage', SubscriptionPageSchema);
