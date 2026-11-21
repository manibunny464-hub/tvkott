import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import { requireAuth } from '@/lib/authMiddleware';
import User from '@/models/User';
import Episode from '@/models/Episode';

export async function GET(request, { params }) {
  const { success, user, message } = await requireAuth(request);
  if (!success) {
    return Response.json({ success: false, message }, { status: 401 });
  }

  try {
    const { episodeId } = await params;

    if (!mongoose.Types.ObjectId.isValid(episodeId)) {
      return Response.json(
        { success: false, message: 'Invalid episodeId' },
        { status: 400 }
      );
    }

    await dbConnect();

    const episode = await Episode.findOne(
      { _id: episodeId, isActive: true },
      { _id: 1, episodeNumber: 1, title: 1, description: 1, duration: 1, season: 1, thumbnailUrl: 1, isFree: 1 }
    ).lean();

    if (!episode) {
      return Response.json(
        { success: false, message: 'Episode not found' },
        { status: 404 }
      );
    }

    if (!episode.isFree) {
      const dbUser = await User.findById(user.userId, { isPremium: 1, premiumExpiry: 1 }).lean();
      const now = new Date();
      const hasPremium = dbUser?.isPremium && dbUser?.premiumExpiry && dbUser.premiumExpiry > now;

      if (!hasPremium) {
        return Response.json(
          { success: false, message: 'Premium required', requiresUpgrade: true },
          { status: 403 }
        );
      }
    }

    return Response.json({
      success: true,
      episode,
      hasAccess: true,
    });
  } catch (error) {
    return Response.json(
      { success: false, message: 'Failed to fetch episode' },
      { status: 500 }
    );
  }
}
