import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Episode from '@/models/Episode';
import Season from '@/models/Season';

export async function GET(request, { params }) {
  try {
    const { contentId, seasonId } = await params;

    if (!mongoose.Types.ObjectId.isValid(contentId) || !mongoose.Types.ObjectId.isValid(seasonId)) {
      return Response.json(
        { success: false, message: 'Invalid contentId or seasonId' },
        { status: 400 }
      );
    }

    await dbConnect();

    const objectId = new mongoose.Types.ObjectId(contentId);
    const seasonObjectId = new mongoose.Types.ObjectId(seasonId);
    const season = await Season.findOne(
      { _id: seasonObjectId, seriesId: objectId, isDeleted: { $ne: true } },
      { seasonNumber: 1 }
    ).lean();

    if (!season) {
      return Response.json(
        { success: false, message: 'Season not found' },
        { status: 404 }
      );
    }

    const episodes = await Episode.find({
      isActive: true,
      isDeleted: { $ne: true },
      $or: [
        { seriesId: objectId, seasonId: seasonObjectId },
        { contentId: objectId, season: season.seasonNumber },
      ],
    })
      .sort({ episodeNumber: 1 })
      .lean();

    return Response.json({
      success: true,
      episodes,
    });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message || 'Failed to fetch episodes' },
      { status: 500 }
    );
  }
}
