import mongoose from 'mongoose';
import { requireAdmin } from '@/lib/admin/auth';
import dbConnect from '@/lib/db';
import Episode from '@/models/Episode';

export async function PUT(request, { params }) {
  const { error } = await requireAdmin(request, ['super_admin', 'editor']);
  if (error) return error;

  try {
    const { episodeId, quality } = await params;
    const body = await request.json();
    const { enabled } = body;

    if (typeof enabled !== 'boolean') {
      return Response.json(
        { success: false, message: 'enabled field must be boolean' },
        { status: 400 }
      );
    }

    const qualitiesList = ['1080p', '720p', '480p', '360p'];
    if (!qualitiesList.includes(quality)) {
      return Response.json(
        { success: false, message: `Invalid quality: ${quality}` },
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
    
    const updatePath = `qualities.${quality}.enabled`;
    const episode = await Episode.findByIdAndUpdate(
      episodeId,
      { $set: { [updatePath]: enabled } },
      { new: true, runValidators: true }
    );

    if (!episode) {
      return Response.json(
        { success: false, message: 'Episode not found' },
        { status: 404 }
      );
    }

    const updatedQualities = qualitiesList.map((q) => {
      const qConfig = episode.qualities?.[q] || {};
      const s3Path = qConfig.s3Key || qConfig.s3Url || episode.videoUrls?.[q] || (q === '1080p' ? episode.videoKey_HD : q === '720p' ? episode.videoKey_SD : '') || '';
      
      let status = qConfig.status;
      if (!status) {
        if (episode.videoUrls?.[q]) {
          status = 'ready';
        } else if (episode.hlsMasterUrl || episode.videoUrl || episode.videoKey_HD || episode.videoKey_SD) {
          status = 'queued';
        } else if (q === '1080p' && episode.videoKey_HD) {
          status = 'ready';
        } else if (q === '720p' && episode.videoKey_SD) {
          status = 'ready';
        } else {
          status = 'pending';
        }
      }

      return {
        quality: q,
        enabled: qConfig.enabled !== false,
        status,
        size: qConfig.size || 0,
        s3Path,
        jobId: qConfig.jobId || '',
      };
    });

    return Response.json({
      success: true,
      qualities: updatedQualities,
    });
  } catch (err) {
    console.error('[PUT /api/episodes/:episodeId/qualities/:quality/toggle] Error:', err);
    return Response.json(
      { success: false, message: 'Failed to toggle quality' },
      { status: 500 }
    );
  }
}
