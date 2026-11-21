import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import { requireAuth } from '@/lib/authMiddleware';
import Content from '@/models/Content';
import SearchHistory from '@/models/SearchHistory';
import TrendingSearch from '@/models/TrendingSearch';

import { getUserPreferredLanguages } from '@/lib/userLanguages';

export async function POST(request) {
  const { user, error } = await requireAuth(request);
  if (error) return error;

  try {
    const body = await request.json();
    const { contentId, query } = body;

    if (!contentId) {
      return Response.json(
        { success: false, message: 'contentId is required' },
        { status: 400 }
      );
    }

    if (!query || typeof query !== 'string' || !query.trim()) {
      return Response.json(
        { success: false, message: 'query is required' },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(contentId)) {
      return Response.json(
        { success: false, message: 'Invalid contentId' },
        { status: 400 }
      );
    }

    const preferredLangs = await getUserPreferredLanguages(request);

    await dbConnect();

    // Verify content exists, is active, and matches user preferred language if set
    const contentQuery = { _id: contentId, isActive: true, isDeleted: { $ne: true } };
    if (preferredLangs.length > 0) {
      contentQuery.language = { $in: preferredLangs };
    }

    const content = await Content.findOne(contentQuery);
    if (!content) {
      return Response.json(
        { success: false, message: 'Content not found or inactive' },
        { status: 404 }
      );
    }

    // Upsert SearchHistory by userId + contentId — update searchedAt and query, create if not exists
    await SearchHistory.findOneAndUpdate(
      { userId: user.userId, contentId },
      { $set: { searchedAt: new Date(), query: query.trim() } },
      { upsert: true }
    );

    // Upsert TrendingSearch by query — increment count, set contentId
    await TrendingSearch.updateOne(
      { query: query.trim() },
      { $inc: { count: 1 }, $set: { contentId: content._id } },
      { upsert: true }
    );

    return Response.json({ success: true });
  } catch (err) {
    console.error('Failed to add search result:', err);
    return Response.json(
      { success: false, message: 'Failed to add search result' },
      { status: 500 }
    );
  }
}
