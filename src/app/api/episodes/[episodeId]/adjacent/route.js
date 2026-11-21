import mongoose from 'mongoose';
import { requireAdmin } from '@/lib/admin/auth';
import dbConnect from '@/lib/db';
import Episode from '@/models/Episode';

export async function GET(request, { params }) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  try {
    const { episodeId } = await params;

    if (!mongoose.Types.ObjectId.isValid(episodeId)) {
      return Response.json(
        { success: false, message: 'Invalid episodeId' },
        { status: 400 }
      );
    }

    await dbConnect();
    const episode = await Episode.findById(episodeId).lean();

    if (!episode) {
      return Response.json(
        { success: false, message: 'Episode not found' },
        { status: 404 }
      );
    }

    const seriesId = episode.seriesId || episode.contentId;
    const seasonId = episode.seasonId;

    if (!seriesId || !seasonId) {
      return Response.json({
        success: true,
        previousEpisodeId: null,
        nextEpisodeId: null,
      });
    }

    const [prevEpisode, nextEpisode] = await Promise.all([
      Episode.findOne({
        seriesId,
        seasonId,
        episodeNumber: { $lt: episode.episodeNumber },
        isDeleted: { $ne: true },
        isActive: true,
      })
        .sort({ episodeNumber: -1 })
        .select('_id')
        .lean(),
      Episode.findOne({
        seriesId,
        seasonId,
        episodeNumber: { $gt: episode.episodeNumber },
        isDeleted: { $ne: true },
        isActive: true,
      })
        .sort({ episodeNumber: 1 })
        .select('_id')
        .lean(),
    ]);

    return Response.json({
      success: true,
      previousEpisodeId: prevEpisode?._id?.toString() || null,
      nextEpisodeId: nextEpisode?._id?.toString() || null,
    });
  } catch (err) {
    console.error('[GET /api/episodes/:episodeId/adjacent] Error:', err);
    return Response.json(
      { success: false, message: 'Failed to fetch adjacent episodes' },
      { status: 500 }
    );
  }
}
