import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: [true, 'Please provide a phone number'],
    unique: true,
  },
  email: {
    type: String,
    required: false,
  },
  avatarUrl: {
    type: String,
  },
  name: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    enum: ['active', 'suspended'],
    default: 'active',
  },
  yearOfBirth: {
    type: Number,
    required: false,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'prefer_not_to_say'],
    required: false,
  },
  appLanguage: {
    type: String,
    default: 'en',
  },
  contentLanguages: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Language',
    default: [],
  },
  isPremium: {
    type: Boolean,
    default: false,
  },
  premiumExpiry: {
    type: Date,
    required: false,
  },
  watchHistory: [{
    contentId: {
      type: String, // or mongoose.Schema.Types.ObjectId if referencing a Content model
      required: true,
    },
    episodeId: {
      type: String, // or mongoose.Schema.Types.ObjectId
      required: false,
    },
    watchedAt: {
      type: Date,
      default: Date.now,
    },
    watchedSeconds: {
      type: Number,
      default: 0,
    },
    totalSeconds: {
      type: Number,
      default: 0,
    },
    progress: {
      type: Number, // percentage 0–100
      default: 0,
    },
  }],
  myList: [{
    type: String, // or mongoose.Schema.Types.ObjectId if referencing a Content model
  }],
  currentDeviceId: {
    type: String,
    required: false,
  },
  activeDevices: [{
    deviceId: { type: String, required: true },
    deviceName: { type: String, default: '' },
    sessionId: String,
    refreshHash: String,
    refreshExpiresAt: Date,
    lastActiveAt: { type: Date, default: Date.now },
  }],
}, {
  timestamps: true,
});

// Avoid OverwriteModelError in Next.js development
export default mongoose.models.User || mongoose.model('User', UserSchema);
