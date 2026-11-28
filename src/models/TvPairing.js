import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  code: { type: String, index: { unique: true }, required: true },
  deviceSecretHash: { type: String, required: true },
  deviceName: { type: String, required: true },
  state: { type: String, enum: ['pending', 'approved', 'active'], required: true },
  userId: mongoose.Schema.Types.ObjectId,
  expiresAt: { type: Date, index: { expires: 0 }, required: true },
}, { timestamps: true });

export default mongoose.models.TvPairing || mongoose.model('TvPairing', schema);
