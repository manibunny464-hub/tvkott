import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect({ skipMaintenance = false } = {}) {
  if (!skipMaintenance && mongoose.connection.readyState === 1) {
    try {
      const Content = mongoose.models.Content || (await import('../models/Content')).default;
      const ComingSoon = mongoose.models.ComingSoon || (await import('../models/ComingSoon')).default;
      if (Content && ComingSoon) {
        let lastCheck = global.lastReleaseCheck || 0;
        const now = Date.now();
        if (now - lastCheck >= 60000) {
          global.lastReleaseCheck = now;
          const nowObj = new Date();
          const maturedContents = await Content.find(
            { isComingSoon: true, expectedReleaseDate: { $lte: nowObj } },
            { _id: 1 }
          ).lean();
          if (maturedContents.length > 0) {
            const ids = maturedContents.map(c => c._id);
            await Promise.all([
              Content.updateMany(
                { _id: { $in: ids } },
                { $set: { isComingSoon: false } }
              ),
              ComingSoon.updateMany(
                { linkedContentId: { $in: ids } },
                { $set: { isDeleted: true, isActive: false, deletedAt: nowObj } }
              )
            ]);
            console.log(`[Auto-release] Released ${maturedContents.length} coming soon content item(s).`);
          }
        }
      }
    } catch (err) {
      console.error("Auto-release check error:", err);
    }
  }

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (cached.conn && mongoose.connection.readyState === 0) {
    cached.conn = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000,
      socketTimeoutMS: 15000,
      maxPoolSize: 10,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    cached.conn = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
