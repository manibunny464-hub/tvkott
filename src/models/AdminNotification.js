import mongoose from 'mongoose';

const AdminNotificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    audience: {
      type: String,
      enum: ['all', 'subscribed', 'non-subscribed', 'free', 'premium'],
      default: 'all',
    },
    status: {
      type: String,
      enum: ['scheduled', 'sent', 'failed', 'draft'],
      default: 'scheduled',
    },
    scheduledAt: {
      type: Date,
    },
    sentAt: {
      type: Date,
    },
    deliveryCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.models.AdminNotification ||
  mongoose.model('AdminNotification', AdminNotificationSchema);
