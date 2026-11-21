import mongoose from 'mongoose';
import { requireAdmin } from '@/lib/admin/auth';
import { requireAuth } from '@/lib/authMiddleware';
import dbConnect from '@/lib/db';
import Episode from '@/models/Episode';
import User from '@/models/User';
import { getMasterSettings } from '@/lib/admin/data';
import { getUserEntitlements } from '@/lib/subscription/entitlementService';

export async function GET(request, { params }) {
  const adminAuth = await requireAdmin(request);
  const isAdmin = !adminAuth.error;

  let userId = null;
  let entitlements = null;
  let maxAllowedQuality = '1080p';

  if (!isAdmin) {
    const userAuth = await requireAuth(request);
    if (!userAuth.success) {
      return userAuth.error;
    }
    userId = userAuth.user.userId;
    try {
      entitlements = await getUserEntitlements(userId);
      maxAllowedQuality = entitlements?.features?.videoQuality || '1080p';
    } catch {
      entitlements = null;
    }
  } else {
    maxAllowedQuality = '4K';
  }

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

    // Perform entitlement validation for standard users (admins bypass)
    if (!isAdmin) {
      if (!episode.isFree) {
        const user = await User.findById(userId, { isPremium: 1, premiumExpiry: 1 }).lean();
        const now = new Date();
        const isPremium = Boolean(user?.isPremium && (!user?.premiumExpiry || new Date(user.premiumExpiry) > now));
        if (!isPremium) {
          return Response.json(
            { success: false, message: 'Premium subscription required to stream this episode', requiresUpgrade: true },
            { status: 403 }
          );
        }
      }
    }

    const origin = request.nextUrl.origin;
    const manifestUrl = `${origin}/api/episodes/${episodeId}/manifest`;
    const hasHls = Boolean(episode.hlsMasterUrl || episode.hlsMasterKey);
    const playbackUrl = hasHls ? manifestUrl : (episode.videoUrl || null);

    const qualitiesList = ['1080p', '720p', '480p', '360p'];
    const qualities = qualitiesList.map((q) => {
      const qConfig = episode.qualities?.[q] || {};
      const enabled = qConfig.enabled !== false;
      
      // Fallback logic for status
      let status = qConfig.status;
      if (!status) {
        if (episode.videoUrls?.[q]) {
          status = 'ready';
        } else if (episode.hlsMasterUrl || episode.hlsMasterKey || episode.videoUrl || episode.videoKey_HD || episode.videoKey_SD) {
          status = 'queued';
        } else if (q === '1080p' && episode.videoKey_HD) {
          status = 'ready';
        } else if (q === '720p' && episode.videoKey_SD) {
          status = 'ready';
        } else {
          status = 'pending';
        }
      }

      // Fallback path
      const s3Path =
        qConfig.s3Key ||
        qConfig.s3Url ||
        episode.videoUrls?.[q] ||
        (q === '1080p' ? episode.videoKey_HD : q === '720p' ? episode.videoKey_SD : '') ||
        '';

      return {
        quality: q,
        enabled,
        status,
        size: qConfig.size || 0,
        s3Path,
        jobId: qConfig.jobId || '',
        isPermittedByPlan: true,
      };
    });

    const filteredQualities = qualities;

    // Resolve CDN / S3 url for subtitles
    const resolveUrl = (raw) => {
      if (!raw) return null;
      if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
      const base = (process.env.CDN_URL || process.env.CLOUDFRONT_URL || '').replace(/\/$/, '');
      if (base) return `${base}/${raw}`;
      return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${raw}`;
    };

    // Check Admin Master Settings for global subtitles button control
    const masterSettings = await getMasterSettings().catch(() => ({}));
    const isSubtitlesMasterEnabled = masterSettings?.player?.enableSubtitles !== false;

    const subtitles = isSubtitlesMasterEnabled
      ? (episode.languages || [])
          .filter((l) => l.subtitleFile)
          .map((l) => ({
            language: l.language,
            name: l.language,
            url: resolveUrl(l.subtitleFile),
            type: l.subtitleFile.toLowerCase().endsWith('.srt') ? 'srt' : 'vtt',
          }))
      : [];

    return Response.json({
      success: true,
      manifestUrl,
      playbackUrl,
      streamType: hasHls ? 'hls' : 'direct',
      adsFree: isAdmin ? true : Boolean(entitlements?.features?.adsFree),
      maxAllowedQuality,
      qualities: filteredQualities,
      subtitlesEnabled: isSubtitlesMasterEnabled,
      subtitles,
    });
  } catch (err) {
    console.error('[GET /api/episodes/:episodeId/stream] Error:', err);
    return Response.json(
      { success: false, message: 'Failed to fetch stream details' },
      { status: 500 }
    );
  }
}
