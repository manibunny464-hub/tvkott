import { requireAdmin } from '@/lib/admin/auth';
import { paginationMeta, parsePagination, readBody, toBoolean } from '@/lib/admin/api';
import { uploadFormFile } from '@/lib/admin/media';
import { initialEpisodeUploadFields } from '@/lib/admin/transcoding';
import { dispatchNewEpisodeNotification } from '@/lib/notifications/episodeBroadcaster';
import dbConnect from '@/lib/db';
import Episode from '@/models/Episode';
import Season from '@/models/Season';
import mongoose from 'mongoose';

function validationResponse(message, fields = {}, status = 400) {
  return Response.json({ success: false, message, fields }, { status });
}

function cleanEpisodeNumber(value) {
  const episodeNumber = Number(value);
  return Number.isInteger(episodeNumber) && episodeNumber > 0 ? episodeNumber : null;
}

function hasUploadedFile(file) {
  return Boolean(file && typeof file !== 'string' && Number(file.size || 0) > 0);
}

export async function GET(request, { params }) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  try {
    const { id, seasonId } = await params;
    const { page, limit, skip } = parsePagination(request);
    await dbConnect();

    const season = await Season.findOne({ _id: seasonId, seriesId: id, isDeleted: { $ne: true } });
    if (!season) return Response.json({ success: false, message: 'Season not found' }, { status: 404 });

    const query = { seriesId: id, seasonId, isDeleted: { $ne: true } };
    const [episodes, total] = await Promise.all([
      Episode.find(query).sort({ episodeNumber: 1 }).skip(skip).limit(limit).lean(),
      Episode.countDocuments(query),
    ]);

    return Response.json({ success: true, episodes, pagination: paginationMeta(page, limit, total) });
  } catch (error) {
    console.error('[admin/episodes] GET error:', error);
    return Response.json(
      { success: false, message: error.message || 'Failed to load episodes' },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  const { error } = await requireAdmin(request, ['super_admin', 'editor']);
  if (error) return error;

  try {
    const { id, seasonId } = await params;
    const { data, formData } = await readBody(request);

    await dbConnect();
    const season = await Season.findOne({ _id: seasonId, seriesId: id, isDeleted: { $ne: true } });
    if (!season) return Response.json({ success: false, message: 'Season not found' }, { status: 404 });

    if (Array.isArray(data.episodes)) {
      const episodeNumbers = data.episodes.map((episode) => cleanEpisodeNumber(episode.episodeNumber));
      if (episodeNumbers.some((episodeNumber) => !episodeNumber)) {
        return validationResponse('Every episode needs a valid episode number.', {
          episodes: 'Episode numbers must be whole numbers greater than 0.',
        });
      }

      const missingTitle = data.episodes.findIndex((episode) => !String(episode.title || '').trim());
      if (missingTitle >= 0) {
        return validationResponse('Every episode needs a title.', {
          title: `Episode row ${missingTitle + 1} is missing a title.`,
        });
      }

      const duplicateInRequest = episodeNumbers.find(
        (episodeNumber, index) => episodeNumbers.indexOf(episodeNumber) !== index
      );
      if (duplicateInRequest) {
        return validationResponse(
          `Episode ${duplicateInRequest} is repeated in this upload.`,
          { episodeNumber: duplicateInRequest },
          409
        );
      }

      const existing = await Episode.findOne({
        seriesId: id,
        seasonId,
        episodeNumber: { $in: episodeNumbers },
        isDeleted: { $ne: true },
      }).lean();

      if (existing) {
        return validationResponse(
          `Episode ${existing.episodeNumber} already exists in this season.`,
          { episodeNumber: existing.episodeNumber },
          409
        );
      }

      const episodes = await Episode.insertMany(
        data.episodes.map((episode, index) => ({
          contentId: id,
          seriesId: id,
          seasonId,
          season: season.seasonNumber,
          episodeNumber: episodeNumbers[index],
          title: String(episode.title || '').trim(),
          description: episode.description || '',
          airDate: null,
          thumbnailUrl: episode.thumbnailUrl || '',
          videoUrl: episode.videoUrl || '',
          hlsMasterUrl: episode.hlsMasterUrl || '',
          isFree: toBoolean(episode.isFree),
          isDownloadable: toBoolean(episode.isDownloadable),
          duration: Number(episode.duration || 0),
          transcodingStatus: 'live',
        }))
      );

      episodes.forEach((ep) => {
        dispatchNewEpisodeNotification(id, ep).catch((e) =>
          console.error('[episodes/route] Notification error:', e)
        );
      });

      return Response.json({ success: true, episodes });
    }

    const episodeNumber = cleanEpisodeNumber(data.episodeNumber);
    if (!episodeNumber) {
      return validationResponse('Episode number must be a whole number greater than 0.', {
        episodeNumber: 'Enter a valid episode number.',
      });
    }

    const languages = data.languages ? (typeof data.languages === 'string' ? JSON.parse(data.languages) : data.languages) : [];
    let title = String(data.title || '').trim();
    if (!title) {
      const firstLangWithTitle = languages.find(l => String(l.title || '').trim());
      if (firstLangWithTitle) {
        title = firstLangWithTitle.title;
      }
    }
    if (!title) {
      title = `Episode ${episodeNumber}`;
    }

    const videoFile = formData?.get('videoFile');
    const duration = Number(data.duration || 0);
    if (hasUploadedFile(videoFile) && (!Number.isFinite(duration) || duration <= 0)) {
      return validationResponse('Video duration could not be detected.', {
        duration: 'Choose a valid video file so duration can be detected automatically.',
      });
    }

    const existingEpisode = await Episode.findOne({
      seriesId: id,
      seasonId,
      episodeNumber,
      isDeleted: { $ne: true },
    }).lean();

    if (existingEpisode) {
      return validationResponse(
        `Episode ${episodeNumber} already exists in this season.`,
        { episodeNumber: 'This episode number is already used in this season.' },
        409
      );
    }

    const thumbnail = await uploadFormFile(formData?.get('thumbnailImage'), 'episode-thumbnails');
    const episodeId = new mongoose.Types.ObjectId();

    const isActive = toBoolean(data.isActive, true);
    const resolvedThumb = thumbnail.url || data.thumbnailUrl || '';
    let episodeData = {
      _id: episodeId,
      seriesId: id,
      seasonId,
      episodeNumber,
      title,
      description: data.description || '',
      airDate: null,
      thumbnailUrl: resolvedThumb,
      isFree: toBoolean(data.isFree),
      isDownloadable: toBoolean(data.isDownloadable),
      duration,
      isActive,
      status: isActive ? 'Published' : 'Draft',
      languages: data.languages ? (typeof data.languages === 'string' ? JSON.parse(data.languages) : data.languages) : [],
    };

    if (Array.isArray(episodeData.languages) && episodeData.languages.length > 0) {
      const firstLang = episodeData.languages[0];
      if (resolvedThumb) {
        firstLang.thumbnailUrl = resolvedThumb;
      } else if (firstLang.thumbnailUrl) {
        episodeData.thumbnailUrl = firstLang.thumbnailUrl;
      }
      if (!episodeData.title) episodeData.title = firstLang.title || `Episode ${episodeNumber}`;
      if (!episodeData.description && firstLang.description) episodeData.description = firstLang.description;
      if (!episodeData.duration) {
        episodeData.duration = Number(firstLang.videoFiles?.[0]?.duration || 0);
      }
    }

    if (hasUploadedFile(videoFile)) {
      const video = await uploadFormFile(videoFile, 'raw');
      episodeData = {
        ...episodeData,
        rawVideoKey: video.key || data.videoKey_HD || '',
        videoKey_HD: video.key || data.videoKey_HD || '',
        ...initialEpisodeUploadFields(video.url || data.videoUrl || '', episodeId.toString()),
        transcodingStatus: 'live',
      };
      
      const episode = await Episode.create(episodeData);
      if (isActive) {
        dispatchNewEpisodeNotification(id, episode).catch((e) =>
          console.error('[episodes/route] Notification error:', e)
        );
      }
      return Response.json({ success: true, episode });
    } else {
      episodeData.transcodingStatus = 'live';
      const episode = await Episode.create(episodeData);
      if (isActive) {
        dispatchNewEpisodeNotification(id, episode).catch((e) =>
          console.error('[episodes/route] Notification error:', e)
        );
      }
      return Response.json({ success: true, episode });
    }
  } catch (error) {
    console.error('[admin/episodes] POST error:', error);
    return Response.json(
      { success: false, message: error.message || 'Failed to save episode' },
      { status: 500 }
    );
  }
}
