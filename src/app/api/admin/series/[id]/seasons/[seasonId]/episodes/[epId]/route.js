import { requireAdmin } from '@/lib/admin/auth';
import { readBody, softDeletePatch, toBoolean } from '@/lib/admin/api';
import { uploadFormFile } from '@/lib/admin/media';
import { initialEpisodeUploadFields } from '@/lib/admin/transcoding';
import dbConnect from '@/lib/db';
import Episode from '@/models/Episode';

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

export async function PUT(request, { params }) {
  const { error } = await requireAdmin(request, ['super_admin', 'editor']);
  if (error) return error;

  try {
    const { id, seasonId, epId } = await params;
    const { data, formData } = await readBody(request);

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

    await dbConnect();
    const duplicate = await Episode.findOne({
      _id: { $ne: epId },
      seriesId: id,
      seasonId,
      episodeNumber,
      isDeleted: { $ne: true },
    }).lean();

    if (duplicate) {
      return validationResponse(
        `Episode ${episodeNumber} already exists in this season.`,
        { episodeNumber: 'This episode number is already used in this season.' },
        409
      );
    }

    const thumbnail = await uploadFormFile(formData?.get('thumbnailImage'), 'episode-thumbnails');
    const parsedIsActive = data.isActive !== undefined ? toBoolean(data.isActive) : undefined;
    let setFields = {
      episodeNumber,
      title,
      description: data.description || '',
      airDate: null,
      isDownloadable: toBoolean(data.isDownloadable),
      isFree: toBoolean(data.isFree),
      duration,
      isActive: parsedIsActive,
    };
    if (parsedIsActive !== undefined) {
      setFields.status = parsedIsActive ? 'Published' : 'Draft';
    }

    if (thumbnail.url) {
      setFields.thumbnailUrl = thumbnail.url;
    } else if (data.thumbnailUrl !== undefined) {
      setFields.thumbnailUrl = data.thumbnailUrl;
    }

    if (data.languages) {
      setFields.languages = typeof data.languages === 'string' ? JSON.parse(data.languages) : data.languages;
      if (Array.isArray(setFields.languages) && setFields.languages.length > 0) {
        const firstLang = setFields.languages[0];
        if (setFields.thumbnailUrl !== undefined) {
          firstLang.thumbnailUrl = setFields.thumbnailUrl;
        } else if (firstLang.thumbnailUrl) {
          setFields.thumbnailUrl = firstLang.thumbnailUrl;
        }
        if (!setFields.title) setFields.title = firstLang.title || `Episode ${episodeNumber}`;
        if (!setFields.description && firstLang.description) setFields.description = firstLang.description;
        if (!setFields.duration) {
          setFields.duration = Number(firstLang.videoFiles?.[0]?.duration || 0);
        }
      }
    }

    const video = await uploadFormFile(videoFile, 'raw');
    if (video.url || video.key || data.videoUrl || data.videoKey_HD) {
      const videoFields = video.url || data.videoUrl ? initialEpisodeUploadFields(video.url || data.videoUrl) : {};
      setFields = {
        ...setFields,
        rawVideoKey: video.key || data.videoKey_HD || undefined,
        ...videoFields,
        ...(video.url || data.videoUrl ? initialEpisodeUploadFields(video.url || data.videoUrl || '', epId) : {}),
      };
    }

    const episode = await Episode.findOneAndUpdate(
      { _id: epId, seriesId: id, seasonId, isDeleted: { $ne: true } },
      { $set: setFields },
      { returnDocument: 'after', runValidators: true }
    );

    if (!episode) return Response.json({ success: false, message: 'Episode not found' }, { status: 404 });

    if (video.url || video.key || data.videoUrl || data.videoKey_HD) {
      setFields.transcodingStatus = 'live';
    }

    return Response.json({ success: true, episode });
  } catch (error) {
    console.error('[admin/episodes] PUT error:', error);
    return Response.json(
      { success: false, message: error.message || 'Failed to update episode' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const { error } = await requireAdmin(request, ['super_admin']);
  if (error) return error;

  try {
    const { id, seasonId, epId } = await params;
    await dbConnect();
    await Episode.findOneAndUpdate({ _id: epId, seriesId: id, seasonId }, { $set: softDeletePatch() });
    return Response.json({ success: true });
  } catch (error) {
    console.error('[admin/episodes] DELETE error:', error);
    return Response.json(
      { success: false, message: error.message || 'Failed to delete episode' },
      { status: 500 }
    );
  }
}
