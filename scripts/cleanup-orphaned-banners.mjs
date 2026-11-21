import mongoose from 'mongoose';
import Banner from '../src/models/Banner.js';
import Content from '../src/models/Content.js';

const MONGODB_URI = 'REPLACE_WITH_ENVIRONMENT_VALUE';

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const banners = await Banner.find({ isDeleted: { $ne: true } });
  console.log('Active/non-deleted banners found:', banners.length);

  let cleanedCount = 0;
  for (const banner of banners) {
    if (banner.linkedContentId) {
      const content = await Content.findById(banner.linkedContentId);
      if (!content || content.isDeleted === true) {
        console.log(`Cleaning up banner "${banner.title}" (Linked content ${banner.linkedContentId} is deleted or missing)`);
        banner.isDeleted = true;
        banner.isActive = false;
        banner.deletedAt = new Date();
        await banner.save();
        cleanedCount++;
      }
    }
  }

  console.log(`Successfully cleaned up ${cleanedCount} orphaned banners.`);
  await mongoose.disconnect();
}

run().catch(console.error);
