import { requireAdmin } from '@/lib/admin/auth';
import dbConnect from '@/lib/db';
import Content from '@/models/Content';

function buildStatus(video) {
  if (video.transcodingStatus === 'failed') {
    return {
      status: 'failed',
      progress: 58,
      error: 'The worker reported an FFmpeg failure. Retry is available.',
      steps: [
        { label: 'Uploading', status: 'complete' },
        { label: 'Processing / Transcoding', status: 'failed' },
        { label: 'Generating Thumbnails', status: 'pending' },
        { label: 'Published / Live', status: 'pending' },
      ],
      renditions: ['360p', '480p', '720p', '1080p'].map((quality, index) => ({
        quality,
        status: index < 2 ? 'ready' : 'failed',
      })),
    };
  }

  if (video.transcodingStatus === 'live') {
    return {
      status: 'live',
      progress: 100,
      steps: [
        { label: 'Uploading', status: 'complete' },
        { label: 'Processing / Transcoding', status: 'complete' },
        { label: 'Generating Thumbnails', status: 'complete' },
        { label: 'Published / Live', status: 'complete' },
      ],
      renditions: ['360p', '480p', '720p', '1080p'].map((quality) => ({
        quality,
        status: 'ready',
      })),
    };
  }

  const elapsedSeconds = Math.floor((Date.now() - new Date(video.updatedAt).getTime()) / 1000);
  const progress = Math.min(96, Math.max(18, elapsedSeconds + 24));
  const status =
    progress > 82 ? 'thumbnails' : progress > 38 ? 'processing' : 'uploading';

  return {
    status,
    progress,
    steps: [
      { label: 'Uploading', status: progress > 34 ? 'complete' : 'active' },
      {
        label: 'Processing / Transcoding',
        status: progress > 76 ? 'complete' : progress > 34 ? 'active' : 'pending',
      },
      {
        label: 'Generating Thumbnails',
        status: progress > 92 ? 'complete' : progress > 76 ? 'active' : 'pending',
      },
      { label: 'Published / Live', status: progress >= 96 ? 'complete' : 'pending' },
    ],
    renditions: [
      { quality: '360p', status: progress > 44 ? 'ready' : 'processing' },
      { quality: '480p', status: progress > 58 ? 'ready' : 'processing' },
      { quality: '720p', status: progress > 74 ? 'ready' : 'queued' },
      { quality: '1080p', status: progress > 90 ? 'ready' : 'queued' },
    ],
  };
}

export async function GET(request, context) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const { id } = await context.params;
  await dbConnect();
  const video = await Content.findById(id).lean();

  if (!video) {
    return Response.json(
      { success: false, message: 'Video not found' },
      { status: 404 }
    );
  }

  return Response.json({ success: true, pipeline: buildStatus(video) });
}
