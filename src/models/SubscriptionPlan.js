import mongoose from 'mongoose';

const IconFeatureSchema = new mongoose.Schema({
  icon: { type: String, default: '' },
  label: { type: String, default: '' },
}, { _id: false });

const SubscriptionPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  duration: {
    type: Number,
  },
  price: {
    type: Number,
    required: true,
  },
  originalPrice: {
    type: Number,
  },
  label: {
    type: String,
    trim: true,
  },
  tagline: {
    type: String,
    default: '',
    trim: true,
  },
  iconFeatures: {
    type: [IconFeatureSchema],
    default: [],
  },
  benefits: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PlanBenefit' }],
    default: [],
  },
  isTrial: {
    type: Boolean,
    default: false,
  },
  trialPrice: {
    type: Number,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  autoRenew: {
    type: Boolean,
    default: true,
  },
  razorpayPlanId: {
    type: String,
    trim: true,
  },
  version: {
    type: Number,
    default: 1,
  },
  features: {
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
    tvAccess: { type: Boolean, default: false },
    simultaneousDevices: {
      type: Number,
      default: 1,
      min: 1,
      max: 10,
    },
    monthlyDownloadLimit: {
      type: Number,
      default: 0, // 0 = unlimited
      min: 0,
    },
  },
  displayOrder: {
    type: Number,
  },
}, {
  timestamps: true,
});

if (mongoose.models.SubscriptionPlan) {
  delete mongoose.models.SubscriptionPlan;
}

export default mongoose.models.SubscriptionPlan || mongoose.model('SubscriptionPlan', SubscriptionPlanSchema);
