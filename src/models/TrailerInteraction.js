import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  trailerKey: { type: String, required: true },
  kind: { type: String, enum: ['settings', 'like', 'comment'], required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  likesEnabled: Boolean,
  commentsEnabled: Boolean,
  showLikeCount: Boolean,
  text: String,
  hidden: { type: Boolean, default: false },
}, { timestamps: true });

schema.index({ trailerKey: 1, kind: 1, userId: 1 }, {
  unique: true, partialFilterExpression: { kind: 'like' },
});
schema.index({ trailerKey: 1, kind: 1 }, { unique: true, partialFilterExpression: { kind: 'settings' } });
schema.index({ trailerKey: 1, kind: 1, hidden: 1, _id: -1 });

export default mongoose.models.TrailerInteraction || mongoose.model('TrailerInteraction', schema);
