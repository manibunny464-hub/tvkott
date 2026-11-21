import mongoose from 'mongoose';

const ArtistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide an artist name'],
    trim: true,
  },
  type: {
    type: String,
    enum: ['actor', 'director', 'writer'],
    required: [true, 'Please provide an artist type'],
  },
  bio: {
    type: String,
    default: '',
  },
  photo: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

if (mongoose.models.Artist) {
  delete mongoose.models.Artist;
}
export default mongoose.models.Artist || mongoose.model('Artist', ArtistSchema);
