import mongoose from 'mongoose';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dbConnect from '@/lib/db';
import { requireAuth } from '@/lib/authMiddleware';
import s3 from '@/lib/s3';
import User from '@/models/User';
import Episode from '@/models/Episode';

const EXPIRES_IN = 3600;

export async function POST(request, { params }) {
  const { success, user, message } = await requireAuth(request);
  if (!success) {
    return Response.json({ success: false, message }, { status: 401 });
  }

  try {
    const { episodeId } = await params;
    const body = await request.json();
    const quality = body?.quality;

    if (quality !== 'HD' && quality !== 'SD') {
      return Response.json(
        { success: false, message: 'quality must be "HD" or "SD"' },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(episodeId)) {
      return Response.json(
        { success: false, message: 'Invalid episodeId' },
        { status: 400 }
      );
    }

    await dbConnect();

    const episode = await Episode.findOne(
      { _id: episodeId, isActive: true },
      { isFree: 1, videoKey_HD: 1, videoKey_SD: 1 }
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

    const videoKey = quality === 'HD' ? episode.videoKey_HD : episode.videoKey_SD;

    if (!videoKey) {
      return Response.json(
        { success: false, message: `${quality} quality is not available for this episode` },
        { status: 404 }
      );
    }

    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: videoKey,
    });

    const url = await getSignedUrl(s3, command, { expiresIn: EXPIRES_IN });

    return Response.json({ success: true, url, expiresIn: EXPIRES_IN });
  } catch (err) {
    return Response.json(
      { success: false, message: 'Failed to generate stream URL' },
      { status: 500 }
    );
  }
}
