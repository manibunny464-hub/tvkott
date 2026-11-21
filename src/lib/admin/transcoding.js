import { cdnUrlForKey } from '@/lib/admin/media';

const QUALITIES = ['1080p', '720p', '480p', '360p'];

export function buildQueuedRenditions() {
  return QUALITIES.map((quality) => ({ quality, status: 'queued' }));
}

export function buildInitialQualityState(rawVideoUrl = '') {
  return QUALITIES.reduce((acc, quality) => {
    acc[quality] = {
      status: rawVideoUrl ? 'ready' : 'pending',
      enabled: true,
      size: 0,
      s3Key: '',
      s3Url: '',
      jobId: '',
    };
    return acc;
  }, {});
}

export function buildHlsUrls(contentId) {
  const base = `transcoded/${contentId}`;
  return {
    videoUrls: {
      '1080p': cdnUrlForKey(`${base}/1080p/index.m3u8`),
      '720p': cdnUrlForKey(`${base}/720p/index.m3u8`),
      '480p': cdnUrlForKey(`${base}/480p/index.m3u8`),
      '360p': cdnUrlForKey(`${base}/360p/index.m3u8`),
    },
    hlsMasterUrl: cdnUrlForKey(`${base}/master.m3u8`),
  };
}

export function buildEpisodeHlsUrl(episodeId) {
  if (!episodeId) return '';
  return cdnUrlForKey(`transcoded/episodes/${episodeId}/master.m3u8`);
}

export function buildEpisodeHlsKey(episodeId) {
  if (!episodeId) return '';
  return `transcoded/episodes/${episodeId}/master.m3u8`;
}

export function initialTranscodingFields(rawVideoUrl = '') {
  return {
    videoUrl: rawVideoUrl,
    transcodingStatus: 'live',
    renditions: [],
  };
}

export function initialEpisodeUploadFields(rawVideoUrl = '', episodeId = '') {
  const hlsMasterKey = rawVideoUrl && episodeId ? buildEpisodeHlsKey(episodeId) : '';
  return {
    videoUrl: rawVideoUrl,
    transcodingStatus: 'live',
    renditions: [],
    qualities: buildInitialQualityState(rawVideoUrl),
    hlsMasterKey,
    hlsMasterUrl: '',
  };
}

export async function enqueueTranscodingJob({ document }) {
  if (!document?.videoUrl && !document?.videoSource?.key) {
    return { queued: false, provider: 'none' };
  }

  return {
    queued: true,
    provider: process.env.TRANSCODING_PROVIDER || 'manual-worker',
    message:
      'Video is queued. Configure a MediaConvert or FFmpeg worker to consume raw S3 keys and call the completion webhook.',
  };
}
