import mongoose from 'mongoose';

const ArtistTypeSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, immutable: true },
  name: { type: String, required: true, trim: true, maxlength: 80 },
  nameKey: { type: String, required: true, unique: true },
  isActive: { type: Boolean, required: true, default: true },
}, { timestamps: true });

export default mongoose.models.ArtistType || mongoose.model('ArtistType', ArtistTypeSchema);
