import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Episode from '@/models/Episode';
import Content from '@/models/Content';
import Season from '@/models/Season';
import { getMasterSettings } from '@/lib/admin/data';

export async function GET(request, { params }) {
  try {
    const { episodeId } = await params;

    if (!episodeId || !mongoose.Types.ObjectId.isValid(episodeId)) {
      return Response.json(
        { success: false, message: 'A valid episodeId is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Fetch episode with Series and Season metadata populated
    const episode = await Episode.findById(episodeId)
      .populate('seriesId', 'title description posterUrl verticalPoster thumbnailUrl genres ageRating')
      .populate('seasonId', 'seasonNumber title description poster')
      .lean();

    if (!episode || episode.isDeleted) {
      return Response.json(
        { success: false, message: 'Episode not found' },
        { status: 404 }
      );
    }

    const settings = await getMasterSettings().catch(() => ({}));
    const playStoreUrl =
      process.env.NEXT_PUBLIC_PLAYSTORE_URL ||
      settings?.playStoreUrl ||
      'https://play.google.com/store/apps/details?id=com.chirpii.app';

    const series = episode.seriesId || {};
    const season = episode.seasonId || {};

    const seriesId = series._id ? series._id.toString() : '';
    const seriesTitle = series.title || 'Chirpii Original';
    const seasonId = season._id ? season._id.toString() : '';
    const seasonNumber = season.seasonNumber ?? 1;
    const seasonTitle = season.title || `Season ${seasonNumber}`;
    const episodeNumber = episode.episodeNumber ?? 1;
    const episodeTitle = episode.title || `Episode ${episodeNumber}`;
    const description = episode.description || series.description || 'Watch now on Chirpii Mini OTT!';
    const thumbnailUrl = episode.thumbnailUrl || season.poster || series.posterUrl || series.verticalPoster || '';

    // Smart Deep Link (Opens directly in Chirpii Mobile App if already installed)
    const deepLink = `chirpii://watch?seriesId=${seriesId}&seasonId=${seasonId}&episodeId=${episodeId}&season=${seasonNumber}&episode=${episodeNumber}`;

    // Formatted Social Share Text (For WhatsApp, Telegram, Twitter, SMS)
    const formattedShareTitle = `${seriesTitle} | ${seasonTitle} - Episode ${episodeNumber}${episodeTitle !== `Episode ${episodeNumber}` ? `: ${episodeTitle}` : ''}`;
    const formattedShareMessage = `🎬 Watch ${formattedShareTitle}\n\n🔥 ${description}\n\n👉 Install & Watch now on Chirpii Mini OTT:\n${playStoreUrl}`;

    return Response.json({
      success: true,
      shareData: {
        seriesId,
        seriesTitle,
        seasonId,
        seasonNumber,
        seasonTitle,
        episodeId,
        episodeNumber,
        episodeTitle,
        fullTitle: formattedShareTitle,
        description,
        thumbnailUrl,
        deepLink,
        playStoreUrl,
        playstoreUrl: playStoreUrl,
        shareUrl: playStoreUrl,
        webUrl: playStoreUrl,
        shareMessage: formattedShareMessage,
        isFree: Boolean(episode.isFree),
        duration: episode.duration || 0,
        // OpenGraph metadata for link previews
        openGraph: {
          title: formattedShareTitle,
          description,
          image: thumbnailUrl,
          url: playStoreUrl,
          type: 'video.episode',
          siteName: 'Chirpii Mini OTT',
        },
      },
    });
  } catch (error) {
    console.error('[/api/episodes/[episodeId]/share] Error:', error);
    return Response.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
