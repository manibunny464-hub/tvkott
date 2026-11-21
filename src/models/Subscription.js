import mongoose from 'mongoose';

const SubscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubscriptionPlan',
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  nextRenewalDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled', 'paused'],
  },
  autoRenew: {
    type: Boolean,
    default: true,
  },
  paymentMethod: {
    type: String,
  },
  planVersion: {
    type: Number,
    default: 1,
  },
  featuresSnapshot: {
    adsFree: {
      type: Boolean,
      default: false,
    },
    premiumContentAccess: {
      type: Boolean,
      default: true,
    },
    offlineDownloads: {
      type: Boolean,
      default: false,
    },
    videoQuality: {
      type: String,
      enum: ['480p', '720p', '1080p', '4K'],
      default: '1080p',
    },
    simultaneousDevices: {
      type: Number,
      default: 1,
      min: 1,
      max: 10,
    },
    monthlyDownloadLimit: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  razorpaySubscriptionId: {
    type: String,
  },
  razorpayCustomerId: {
    type: String,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Subscription || mongoose.model('Subscription', SubscriptionSchema);
