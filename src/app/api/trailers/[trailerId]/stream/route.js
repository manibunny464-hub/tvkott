import mongoose from 'mongoose';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dbConnect from '@/lib/db';
import { requireAuth } from '@/lib/authMiddleware';
import s3 from '@/lib/s3';
import SeasonTrailer from '@/models/SeasonTrailer';

const EXPIRES_IN = 3600;

export async function GET(request, { params }) {
  const { user, error } = await requireAuth(request);
  if (error) return error;

  try {
    const { trailerId } = await params;

    if (!mongoose.Types.ObjectId.isValid(trailerId)) {
      return Response.json(
        { success: false, message: 'Invalid trailerId' },
        { status: 400 }
      );
    }

    await dbConnect();

    const trailer = await SeasonTrailer.findOne(
      { _id: trailerId, isActive: true },
      { videoKey: 1 }
    ).lean();

    if (!trailer) {
      return Response.json(
        { success: false, message: 'Trailer not found' },
        { status: 404 }
      );
    }

    if (!trailer.videoKey) {
      return Response.json(
        { success: false, message: 'Stream not available for this trailer' },
        { status: 404 }
      );
    }

    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: trailer.videoKey,
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
