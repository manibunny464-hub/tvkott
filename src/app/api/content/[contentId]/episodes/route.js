import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Content from '@/models/Content';
import Episode from '@/models/Episode';

export async function GET(request, { params }) {
  try {
    const { contentId } = await params;
    const { searchParams } = new URL(request.url);
    const season = parseInt(searchParams.get('season')) || 1;

    if (!mongoose.Types.ObjectId.isValid(contentId)) {
      return Response.json(
        { success: false, message: 'Invalid contentId' },
        { status: 400 }
      );
    }

    await dbConnect();
    const objectId = new mongoose.Types.ObjectId(contentId);

    const content = await Content.findOne(
      { _id: objectId, isActive: true },
      { title: 1, totalSeasons: 1, rating: 1 }
    ).lean();

    if (!content) {
      return Response.json(
        { success: false, message: 'Content not found' },
        { status: 404 }
      );
    }

    const episodes = await Episode.find(
      {
        isActive: true,
        isDeleted: { $ne: true },
        $or: [
          { contentId: objectId, season },
          { seriesId: objectId, season },
        ],
      },
      { _id: 1, episodeNumber: 1, title: 1, description: 1, duration: 1, isFree: 1, thumbnailUrl: 1, season: 1 }
    )
      .sort({ episodeNumber: 1 })
      .lean();

    return Response.json({
      success: true,
      content: {
        title: content.title,
        totalSeasons: content.totalSeasons,
        rating: content.rating,
      },
      episodes,
    });
  } catch (error) {
    return Response.json(
      { success: false, message: 'Failed to fetch episodes' },
      { status: 500 }
    );
  }
}
