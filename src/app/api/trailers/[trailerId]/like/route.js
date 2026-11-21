import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import { requireAuth } from '@/lib/authMiddleware';
import SeasonTrailer from '@/models/SeasonTrailer';

export async function POST(request, { params }) {
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

    const trailer = await SeasonTrailer.findOneAndUpdate(
      { _id: trailerId, isActive: true },
      { $inc: { likesCount: 1 } },
      { returnDocument: 'after', projection: { likesCount: 1 } }
    ).lean();

    if (!trailer) {
      return Response.json(
        { success: false, message: 'Trailer not found' },
        { status: 404 }
      );
    }

    return Response.json({ success: true, likesCount: trailer.likesCount });
  } catch (err) {
    return Response.json(
      { success: false, message: 'Failed to like trailer' },
      { status: 500 }
    );
  }
}
