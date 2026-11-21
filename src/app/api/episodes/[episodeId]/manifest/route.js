import { GetObjectCommand } from '@aws-sdk/client-s3';
import s3 from '@/lib/s3';
import dbConnect from '@/lib/db';
import Episode from '@/models/Episode';
import mongoose from 'mongoose';
import AdminSetting from '@/models/AdminSetting';
import { requireAuth } from '@/lib/authMiddleware';
import { requireAdmin } from '@/lib/admin/auth';
import { getUserEntitlements, isQualityAllowed } from '@/lib/subscription/entitlementService';

// Helper to get S3 key from CDN / S3 URL
function getS3KeyFromUrl(urlOrKey) {
  if (!urlOrKey) return '';
  if (urlOrKey.startsWith('http://') || urlOrKey.startsWith('https://')) {
    try {
      const parsed = new URL(urlOrKey);
      return decodeURIComponent(parsed.pathname.slice(1));
    } catch {
      return urlOrKey;
    }
  }
  return urlOrKey;
}

export async function GET(request, { params }) {
  try {
    const { episodeId } = await params;

    if (!mongoose.Types.ObjectId.isValid(episodeId)) {
      return new Response('Invalid episode ID', { status: 400 });
    }

    await dbConnect();
    const episode = await Episode.findById(episodeId).lean();

    if (!episode) {
      return new Response('Episode not found', { status: 404 });
    }

    // Check authorization and entitlements for non-free episodes
    const adminAuth = await requireAdmin(request);
    const isAdmin = !adminAuth.error;

    let maxAllowedQuality = '4K';

    if (!isAdmin) {
      if (!episode.isFree) {
        const userAuth = await requireAuth(request);
        if (!userAuth.success) {
          return new Response('Unauthorized: Authorization required to stream this episode', { status: 401 });
        }
        const entitlements = await getUserEntitlements(userAuth.user.userId);
        if (!entitlements.isPremium || !entitlements.features.premiumContentAccess) {
          return new Response('Forbidden: Premium subscription required to stream this episode', { status: 403 });
        }
        maxAllowedQuality = entitlements.features.videoQuality || '480p';
      } else {
        const userAuth = await requireAuth(request);
        if (userAuth.success) {
          const entitlements = await getUserEntitlements(userAuth.user.userId);
          maxAllowedQuality = entitlements.features.videoQuality || '480p';
        } else {
          maxAllowedQuality = '480p';
        }
      }
    }

    // Resolve the hlsMasterUrl or similar
    let masterUrl = episode.hlsMasterUrl || episode.hlsMasterKey;
    if (masterUrl && !masterUrl.startsWith('http://') && !masterUrl.startsWith('https://')) {
      const settings = await AdminSetting.findOne({ key: 'master-app-settings' }).lean();
      const cdnUrl = settings?.storage?.cdnUrl?.trim() || process.env.CDN_URL || process.env.CLOUDFRONT_URL || '';
      const bucket = settings?.storage?.bucket || process.env.S3_BUCKET_NAME;
      if (cdnUrl) {
        masterUrl = `${cdnUrl.replace(/\/$/, '')}/${masterUrl}`;
      } else {
        masterUrl = `https://${bucket}.s3.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com/${masterUrl}`;
      }
    }

    if (!masterUrl) {
      if (episode.videoUrl) {
        return Response.redirect(episode.videoUrl);
      }
      return new Response('HLS stream not available for this episode', { status: 404 });
    }

    let key = episode.hlsMasterKey || getS3KeyFromUrl(episode.hlsMasterUrl || masterUrl);
    if (!key) {
      return new Response('HLS key not found', { status: 404 });
    }

    const settings = await AdminSetting.findOne({ key: 'master-app-settings' }).lean();
    const bucket = settings?.storage?.bucket || process.env.S3_BUCKET_NAME;

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    
    const s3Response = await s3.send(command);
    const manifestContent = await s3Response.Body.transformToString();

    // Parse and filter manifest content
    const lines = manifestContent.split(/\r?\n/);
    const filteredLines = [];
    let currentStreamInf = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      if (line.startsWith('#EXT-X-STREAM-INF:')) {
        currentStreamInf = line;
      } else if (currentStreamInf) {
        // Resolve quality from resolution info or URL
        let quality = null;
        if (currentStreamInf.includes('RESOLUTION=1920x1080') || line.includes('1080p')) {
          quality = '1080p';
        } else if (currentStreamInf.includes('RESOLUTION=1280x720') || line.includes('720p')) {
          quality = '720p';
        } else if (currentStreamInf.includes('RESOLUTION=854x480') || currentStreamInf.includes('RESOLUTION=848x480') || line.includes('480p')) {
          quality = '480p';
        } else if (currentStreamInf.includes('RESOLUTION=640x360') || line.includes('360p')) {
          quality = '360p';
        }

        const qualityConfig = episode.qualities?.[quality];
        const isEpisodeQualityEnabled = qualityConfig ? qualityConfig.enabled !== false : true;
        const isQualityEntitled = isQualityAllowed(maxAllowedQuality, quality);

        // Only include stream if it's both enabled by admin AND permitted by the user's subscription
        if (isEpisodeQualityEnabled && isQualityEntitled) {
          filteredLines.push(currentStreamInf);
          
          let absoluteUrl = line;
          if (!line.startsWith('http://') && !line.startsWith('https://')) {
            const lastSlash = masterUrl.lastIndexOf('/');
            const baseUrl = lastSlash !== -1 ? masterUrl.slice(0, lastSlash + 1) : '';
            absoluteUrl = baseUrl + line;
          }
          filteredLines.push(absoluteUrl);
        }
        currentStreamInf = null;
      } else {
        filteredLines.push(line);
      }
    }

    const filteredManifest = filteredLines.join('\n');

    return new Response(filteredManifest, {
      headers: {
        'Content-Type': 'application/x-mpegURL',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });

  } catch (err) {
    console.error('[GET /api/episodes/:episodeId/manifest] Error:', err);
    return new Response('Failed to generate manifest', { status: 500 });
  }
}
