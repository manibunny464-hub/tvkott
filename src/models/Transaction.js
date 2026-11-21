import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubscriptionPlan',
    required: true,
  },
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
  },
  razorpayOrderId: {
    type: String,
  },
  razorpaySubscriptionId: {
    type: String,
  },
  isRecurring: {
    type: Boolean,
    default: false,
  },
  razorpayPaymentId: {
    type: String,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  paymentMethod: {
    type: String,
  },
  couponCode: {
    type: String,
  },
  discountPercent: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'refunded'],
    default: 'pending',
  },
  refundId: {
    type: String,
  },
  refundedAmount: {
    type: Number,
  },
  paidAt: {
    type: Date,
  },
  reconcileAttempts: {
    type: Number,
    default: 0,
  },
  lastReconciledAt: {
    type: Date,
  },
  reconcileNotes: {
    type: String,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);
