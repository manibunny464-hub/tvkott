import mongoose from 'mongoose';

const CouponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
    unique: true,
  },
  type: {
    type: String,
    enum: ['flat', 'percentage'],
    required: true,
    default: 'flat',
  },
  value: {
    type: Number,
    required: true,
    min: 0,
  },
  applicablePlans: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'SubscriptionPlan',
    default: [],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  expiresAt: {
    type: Date,
    default: null,
  },
  maxUses: {
    type: Number,
    default: null,
  },
  usedCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema);
