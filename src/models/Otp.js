import mongoose from 'mongoose';

const OtpSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  isUsed: {
    type: Boolean,
    default: false,
  },
  attempts: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

OtpSchema.index({ phone: 1, createdAt: -1 });
OtpSchema.index({ phone: 1, isUsed: 1, expiresAt: -1 });

export default mongoose.models.Otp || mongoose.model('Otp', OtpSchema);
