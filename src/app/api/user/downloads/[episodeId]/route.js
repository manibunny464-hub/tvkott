import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import { requireAuth } from '@/lib/authMiddleware';
import Download from '@/models/Download';

// DELETE /api/user/downloads/{episodeId}
// Removes download entry for the logged-in user when deleted on device
export async function DELETE(request, { params }) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  const userId = auth.user.userId;

  try {
    const { episodeId } = await params;

    if (!episodeId || !mongoose.Types.ObjectId.isValid(episodeId)) {
      return Response.json(
        { success: false, message: 'A valid episodeId is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const url = new URL(request.url);
    const language = url.searchParams.get('language');
    const quality = url.searchParams.get('quality');

    const filter = { userId, episodeId };
    if (language) filter.language = String(language).trim();
    if (quality) filter.quality = String(quality).trim();

    const deleteResult = await Download.deleteMany(filter);

    if (deleteResult.deletedCount === 0) {
      return Response.json(
        { success: false, message: 'Download record not found' },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      message: 'Download entry removed successfully',
      deletedCount: deleteResult.deletedCount,
    });
  } catch (error) {
    console.error('[/api/user/downloads/[episodeId]] DELETE error:', error);
    return Response.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/user/downloads/{episodeId}
// Checks whether the logged-in user has saved download entries for this episode
export async function GET(request, { params }) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;

  const userId = auth.user.userId;

  try {
    const { episodeId } = await params;

    if (!episodeId || !mongoose.Types.ObjectId.isValid(episodeId)) {
      return Response.json(
        { success: false, message: 'A valid episodeId is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const downloads = await Download.find({ userId, episodeId })
      .sort({ downloadedAt: -1 })
      .lean();

    if (!downloads || downloads.length === 0) {
      return Response.json({
        success: true,
        isDownloaded: false,
        downloads: [],
      });
    }

    return Response.json({
      success: true,
      isDownloaded: true,
      count: downloads.length,
      downloads: downloads.map(d => ({
        id: d._id.toString(),
        episodeId: d.episodeId.toString(),
        language: d.language || null,
        quality: d.quality || '720p',
        status: d.status,
        downloadedAt: d.downloadedAt,
      })),
    });
  } catch (error) {
    console.error('[/api/user/downloads/[episodeId]] GET error:', error);
    return Response.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
