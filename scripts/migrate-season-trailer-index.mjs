import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error('MONGODB_URI is required.');

await mongoose.connect(uri);
try {
  const trailers = mongoose.connection.collection('seasontrailers');
  // Install the replacement first so each season/language remains unique.
  await trailers.createIndex({ seasonId: 1, language: 1 }, { unique: true });
  const indexes = await trailers.indexes();
  const legacy = indexes.find(({ key, unique }) =>
    unique && key.seasonId === 1 && Object.keys(key).length === 1);
  if (legacy) await trailers.dropIndex(legacy.name);
  console.log('Season trailer indexes ready.');
} finally {
  await mongoose.disconnect();
}
