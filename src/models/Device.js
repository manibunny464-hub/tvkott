import mongoose from 'mongoose';

const DeviceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  deviceId: {
    type: String,
    required: true,
  },
  deviceName: {
    type: String,
  },
  os: {
    type: String,
  },
  ipAddress: {
    type: String,
  },
  loginTime: {
    type: Date,
    default: Date.now,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
  fcmToken: {
    type: String,
    default: null,
    index: true,
  },
  platform: {
    type: String,
    enum: ['android', 'ios', 'web', 'other'],
    default: 'web',
  },
  isPushActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

DeviceSchema.index({ userId: 1, deviceId: 1 }, { unique: true });

export default mongoose.models.Device || mongoose.model('Device', DeviceSchema);
