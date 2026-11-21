import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    adminNotificationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdminNotification',
      required: false,
    },
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
      enum: ['all', 'subscribed', 'non-subscribed'],
      default: 'all',
    },
    type: {
      type: String,
      enum: ['coming_soon', 'broadcast', 'episode_release', 'subscription', 'system', 'recommendation'],
      default: 'broadcast',
      index: true,
    },
    comingSoonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ComingSoon',
      required: false,
    },
    targetId: {
      type: String,
      default: null,
    },
    deepLink: {
      type: String,
      default: null,
    },
    imageUrl: {
      type: String,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
    isCleared: {
      type: Boolean,
      default: false,
      index: true,
    },
    clearedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
