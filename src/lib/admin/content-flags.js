import BlockbusterItem from '@/models/BlockbusterItem';
import Content from '@/models/Content';
import TrendingItem from '@/models/TrendingItem';
import Banner from '@/models/Banner';
import ComingSoon from '@/models/ComingSoon';

export async function syncContentFlags(content, { isTrending, isBlockbuster, isFeatured, isComingSoon, expectedReleaseDate }) {
  if (!content?._id) return;

  const updates = {};
  if (typeof isTrending === 'boolean') updates.isTrending = isTrending;
  if (typeof isBlockbuster === 'boolean') updates.isBlockbuster = isBlockbuster;
  if (typeof isFeatured === 'boolean') updates.isFeatured = isFeatured;
  if (typeof isComingSoon === 'boolean') updates.isComingSoon = isComingSoon;
  if (expectedReleaseDate !== undefined) updates.expectedReleaseDate = expectedReleaseDate;

  if (Object.keys(updates).length) {
    await Content.findByIdAndUpdate(content._id, { $set: updates });
  }

  if (typeof isTrending === 'boolean') {
    if (isTrending) {
      await TrendingItem.findOneAndUpdate(
        { contentId: content._id },
        {
          $set: { contentType: content.type || 'movie' },
          $setOnInsert: { addedAt: new Date(), priority: content.trendingPriority || 0 },
        },
        { upsert: true }
      );
    } else {
      await TrendingItem.deleteOne({ contentId: content._id });
    }
  }

  if (typeof isBlockbuster === 'boolean') {
    if (isBlockbuster) {
      await BlockbusterItem.findOneAndUpdate(
        { contentId: content._id },
        {
          $set: { contentType: content.type || 'movie' },
          $setOnInsert: { addedAt: new Date(), priority: content.blockbusterPriority || 0 },
        },
        { upsert: true }
      );
    } else {
      await BlockbusterItem.deleteOne({ contentId: content._id });
    }
  }

  if (typeof isFeatured === 'boolean') {
    if (isFeatured) {
      await Banner.findOneAndUpdate(
        { linkedContentId: content._id },
        {
          $set: {
            title: content.title,
            subtitle: content.description || '',
            imageUrl: content.bannerUrl || content.thumbnailUrl || '',
            linkedContentType: content.type || 'series',
            isActive: true,
            isDeleted: false,
          },
          $setOnInsert: { order: 0 }
        },
        { upsert: true }
      );
    } else {
      await Banner.updateMany(
        { linkedContentId: content._id },
        { $set: { isDeleted: true, isActive: false, deletedAt: new Date() } }
      );
    }
  }

  const finalComingSoon = typeof isComingSoon === 'boolean' ? isComingSoon : content.isComingSoon;
  const finalExpectedReleaseDate = expectedReleaseDate !== undefined ? expectedReleaseDate : content.expectedReleaseDate;

  if (typeof isComingSoon === 'boolean' || expectedReleaseDate !== undefined) {
    if (finalComingSoon) {
      await ComingSoon.findOneAndUpdate(
        { linkedContentId: content._id },
        {
          $set: {
            title: content.title,
            description: content.description || '',
            posterUrl: content.posterUrl || content.thumbnailUrl || '',
            thumbnailUrl: content.thumbnailUrl || '',
            bannerUrl: content.bannerUrl || '',
            languages: content.language || content.languages || [],
            genres: content.genres || [],
            ageRating: content.ageRating || '',
            releaseYear: content.releaseYear,
            cast: content.cast || [],
            expectedReleaseDate: finalExpectedReleaseDate || null,
            isActive: true,
            isDeleted: false,
          }
        },
        { upsert: true }
      );
    } else {
      await ComingSoon.updateMany(
        { linkedContentId: content._id },
        { $set: { isDeleted: true, isActive: false, deletedAt: new Date() } }
      );
    }
  }
}
