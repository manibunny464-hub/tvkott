import { isLocalizationReady } from "@/lib/localization-readiness";
import { normalizeMovieSubtitles } from '@/lib/admin/movie-subtitles';
import {
  AbortMultipartUploadCommand, CompleteMultipartUploadCommand, CreateMultipartUploadCommand,
  GetObjectCommand, HeadObjectCommand, ListPartsCommand, UploadPartCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'node:crypto';
import mongoose from 'mongoose';
import Content from '@/models/Content';
import s3 from '@/lib/s3';

export const movieQualities = ['360p', '480p', '720p', '1080p', '2160p'];
const MiB = 1024 * 1024;
const slots = () => mongoose.connection.collection('movie_media_slots');
const subtitles = () => mongoose.connection.collection('movie_subtitle_tracks');
const respond = (message, status) => Response.json({ success: false, message }, { status });
const success = (data = {}) => Response.json({ success: true, ...data });

export async function getMovieMedia(movieId) {
  const records = await slots().find({ movieId }).sort({ language: 1, quality: 1 }).toArray();
  return records.map(({ language, quality, asset, upload }) => ({
    language, quality,
    asset: asset ? { name: asset.name, size: asset.size, duration: asset.duration } : null,
    pending: upload ? { name: upload.name, size: upload.size } : null,
  }));
}

export async function getMovieSubtitles(movieId) {
  return subtitles().find({ movieId }, { projection: { _id: 0, language: 1, subtitleLanguage: 1, name: 1 } })
    .sort({ language: 1, subtitleLanguage: 1 }).toArray();
}

async function handleSubtitle(movieId, language, action, data) {
  const { subtitleLanguage, name, text } = data;
  if (typeof subtitleLanguage !== 'string' || !/^[a-zA-Z]{2,8}(?:-[a-zA-Z0-9]{2,8}){0,3}$/.test(subtitleLanguage)) {
    return respond('Select a subtitle language.', 400);
  }
  const _id = JSON.stringify([movieId, language, subtitleLanguage]);
  if (action === 'subtitle-read') {
    const track = await subtitles().findOne({ _id });
    return track ? success({ text: track.text }) : respond('Subtitle track not found.', 404);
  }
  if (action === 'subtitle-remove') {
    await subtitles().deleteOne({ _id });
    return success();
  }
  const vtt = normalizeMovieSubtitles(name, text);
  if (!vtt) return respond('Choose a valid WebVTT or SRT subtitle file up to 512 KB.', 400);
  await subtitles().updateOne({ _id }, {
    $set: { movieId, language, subtitleLanguage, name, text: vtt },
  }, { upsert: true });
  return success({ subtitle: { language, subtitleLanguage, name } });
}

async function readParts(upload) {
  const parts = [];
  let marker;
  do {
    const result = await s3.send(new ListPartsCommand({
      Bucket: upload.bucket, Key: upload.key, UploadId: upload.awsId, PartNumberMarker: marker,
    }));
    parts.push(...(result.Parts ?? []));
    marker = result.IsTruncated ? result.NextPartNumberMarker : undefined;
  } while (marker);
  return parts;
}

function expectedSize(upload, number) {
  return Math.min(upload.partSize, upload.size - (number - 1) * upload.partSize);
}

async function visibleMovieFields(movie, variants, inactive) {
  const visible = variants.filter(({ language }) => !inactive.includes(language));
  if (!visible.length) return { isActive: false, movieHiddenByLanguage: true, language: [], languages: [] };

  const primary = visible.find((item) => item.language === movie.primaryLanguage) || visible[0];
  const Language = (await import('@/models/Language')).default;
  const options = await Language.find({ code: { $in: visible.map((item) => item.language) } }).select('code englishName').lean();
  const names = visible.map((item) => options.find((option) => option.code === item.language)?.englishName || item.language);
  return {
    isActive: true, movieHiddenByLanguage: false, title: primary.title, description: primary.description,
    posterUrl: primary.posterUrl, thumbnailUrl: primary.posterUrl, bannerUrl: primary.bannerUrl,
    trailerUrl: primary.trailerUrl ?? '', language: names, languages: names,
  };
}

async function setMovieLanguageAvailability(movieId, language, active) {
  if (typeof language !== 'string' || typeof active !== 'boolean') {
    return respond('Choose a saved movie language and its availability.', 400);
  }
  const filter = { _id: movieId, type: 'movie', isDeleted: { $ne: true }, 'localizations.language': language };
  const movie = await Content.findOne(filter)
    .select('+primaryLanguage +publishedMovie +inactiveMovieLanguages +movieHiddenByLanguage').lean();
  if (!movie) return respond('Save this language in Movie Details first.', 404);

  const inactive = new Set(movie.inactiveMovieLanguages || []);
  if (active) inactive.delete(language);
  else inactive.add(language);
  const inactiveMovieLanguages = [...inactive];
  const variants = movie.publishedMovie || [];
  const catalog = (movie.isActive || movie.movieHiddenByLanguage) && variants.some((row) => row.language === language)
    ? await visibleMovieFields(movie, variants, inactiveMovieLanguages) : {};
  const result = await Content.updateOne({ ...filter, updatedAt: movie.updatedAt }, { $set: { ...catalog, inactiveMovieLanguages } });
  return result.matchedCount ? success({ inactiveMovieLanguages, isActive: catalog.isActive ?? movie.isActive,
    movieHiddenByLanguage: catalog.movieHiddenByLanguage ?? Boolean(movie.movieHiddenByLanguage) })
    : respond('Movie details changed. Reload the studio and try again.', 409);
}

async function publishMovie(movieId, language) {
  if (typeof language !== 'string' || !language) return respond('Choose a language to publish.', 400);
  const filter = { _id: movieId, type: 'movie', isDeleted: { $ne: true } };
  const movie = await Content.findOne(filter).select('+localizations +primaryLanguage +publishedMovie +inactiveMovieLanguages +movieHiddenByLanguage').lean();
  if (!movie) return respond('Movie not found.', 404);
  const inactive = movie.inactiveMovieLanguages || [];
  if (inactive.includes(language)) return respond('Make this language active before publishing.', 409);
  const row = movie.localizations?.find((item) => item.language === language);
  if (!row?.title || !row.description || !row.posterUrl || !row.bannerUrl) {
    return respond(`Complete the title, description, poster, and banner for ${language} in Details.`, 400);
  }
  const media = await slots().find({ movieId, language, asset: { $exists: true } }).toArray();
  if (!media.length) return respond(`Upload at least one video quality for ${language}.`, 400);

  const tracks = movie.subtitlesEnabled === false ? [] : await subtitles().find({ movieId, language }).toArray();
  const variant = {
    ...row,
    trailerUrl: row.trailerUrl ?? (!movie.publishedMovie?.length && language === movie.primaryLanguage ? movie.trailerUrl : ''),
    files: media.map(({ quality, asset }) => ({
      quality, bucket: asset.bucket, key: asset.key, duration: asset.duration,
    })),
    tracks: tracks.map(({ subtitleLanguage, text }) => ({ subtitleLanguage, text })),
  };
  const previous = movie.isActive || movie.movieHiddenByLanguage ? movie.publishedMovie || [] : [];
  const variants = previous.some((item) => item.language === language)
    ? previous.map((item) => item.language === language ? variant : item)
    : [...previous, variant];
  if (Buffer.byteLength(JSON.stringify(variants)) > 8 * MiB) return respond('Subtitle attachments are too large for this publication.', 400);
  const catalog = await visibleMovieFields(movie, variants, inactive);
  const result = await Content.updateOne({ ...filter, updatedAt: movie.updatedAt }, {
    $set: { ...catalog, isComingSoon: false, publishedMovie: variants },
  });
  return result.matchedCount ? success({ publishedLanguages: variants.map((item) => item.language) })
    : respond('Movie details changed. Reload the studio and try again.', 409);
}

export async function publishedMovieLanguages(content, canWatch) {
  const movie = await Content.findById(content._id).select('isActive +publishedMovie +inactiveMovieLanguages').lean();
  if (!movie?.isActive || !movie.publishedMovie) return null;
  return Promise.all(movie.publishedMovie.filter(({ language }) => !movie.inactiveMovieLanguages?.includes(language)).map(async ({ files, tracks, ...metadata }) => ({
    ...metadata,
    videoFiles: canWatch ? await Promise.all(files.map(async ({ quality, bucket, key, duration }) => ({
      quality, duration,
      videoUrl: await getSignedUrl(s3, new GetObjectCommand({ Bucket: bucket, Key: key }), { expiresIn: 21600 }),
    }))) : [],
    subtitles: canWatch ? tracks : [],
  })));
}

export async function handleMovieMedia(movieId, admin, data) {
  const { language, quality, mediaAction: action } = data;
  if (!mongoose.isObjectIdOrHexString(movieId)) return respond('Invalid movie.', 400);
  if (action === 'language-availability') return setMovieLanguageAvailability(movieId, language, data.active);
  if (action === 'publish') return publishMovie(movieId, language);
  if (action === 'draft') {
    const result = await Content.updateOne({ _id: movieId, type: 'movie', isDeleted: { $ne: true } },
      { $set: { isActive: false, isComingSoon: false, movieHiddenByLanguage: false } });
    return result.matchedCount ? success() : respond('Movie not found.', 404);
  }
  if (action === 'subtitle-toggle') {
    if (typeof data.enabled !== 'boolean') return respond('Choose whether subtitles are enabled.', 400);
    const result = await Content.updateOne({ _id: movieId, type: 'movie', isDeleted: { $ne: true } },
      { $set: { subtitlesEnabled: data.enabled } });
    return result.matchedCount ? success() : respond('Movie not found.', 404);
  }
  const subtitleAction = ['subtitle-save', 'subtitle-remove', 'subtitle-read'].includes(action);
  if (!mongoose.isObjectIdOrHexString(movieId) || typeof language !== 'string' || (!subtitleAction && !movieQualities.includes(quality))) {
    return respond('Choose a movie language and video quality.', 400);
  }
  const movie = await Content.findOne({
    _id: movieId, type: 'movie', isDeleted: { $ne: true }, 'localizations.language': language,
  }).select('subtitlesEnabled +localizations').lean();
  if (!movie) return respond('Save this language in the Movie Studio before uploading.', 404);

  if (['start', 'subtitle-save'].includes(action) &&
      !isLocalizationReady(movie.localizations?.find((row) => row.language === language))) {
    return respond('Save the language title, description, poster, and banner before uploading.', 409);
  }

  if (subtitleAction) {
    if (movie.subtitlesEnabled === false && action === 'subtitle-save') {
      return respond('Enable subtitles before attaching tracks.', 400);
    }
    return handleSubtitle(movieId, language, action, data);
  }

  const collection = slots();
  const id = JSON.stringify([movieId, language, quality]);
  const owner = String(admin._id || admin.id || admin.email);
  const slot = await collection.findOne({ _id: id });
  const upload = slot?.upload;

  if (action === 'preview') {
    if (!slot?.asset) return respond('No saved video is available.', 404);
    const { bucket, key } = slot.asset;
    const url = await getSignedUrl(s3, new GetObjectCommand({ Bucket: bucket, Key: key }), { expiresIn: 900 });
    return success({ url });
  }

  if (action === 'start') {
    const { name, size, duration, fingerprint, contentType } = data;
    if (typeof name !== 'string' || !name.trim() || name.length > 255 ||
        !Number.isSafeInteger(size) || size <= 0 || size > 5 * 1024 ** 4 ||
        !Number.isSafeInteger(duration) || duration <= 0 ||
        typeof fingerprint !== 'string' || !/^[a-f0-9]{64}$/.test(fingerprint) ||
        !['video/mp4', 'video/webm'].includes(contentType)) {
      return respond('Choose a playable MP4 or WebM file with a detectable duration.', 400);
    }

    if (upload) {
      if (upload.owner !== owner || upload.fingerprint !== fingerprint) {
        return respond('This quality has a pending upload. Resume the same file or cancel the pending upload.', 409);
      }
      let completedParts;
      try {
        const parts = await readParts(upload);
        completedParts = parts.filter((part) => part.Size === expectedSize(upload, part.PartNumber))
          .map((part) => part.PartNumber);
      } catch (error) {
        if (error.name !== 'NoSuchUpload') throw error;
        const file = await s3.send(new HeadObjectCommand({ Bucket: upload.bucket, Key: upload.key })).catch((headError) => {
          if (headError.$metadata?.httpStatusCode !== 404) throw headError;
          return null;
        });
        if (file?.ContentLength !== upload.size) {
          return respond('The storage session expired. Cancel the pending upload and start again.', 409);
        }
        completedParts = Array.from({ length: Math.ceil(upload.size / upload.partSize) }, (_, index) => index + 1);
      }
      return success({ partSize: upload.partSize, completedParts });
    }

    const bucket = process.env.S3_BUCKET_NAME;
    if (!bucket || !process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      return respond('Video storage is not configured.', 503);
    }

    const key = `movies/${movieId}/${randomUUID()}.${contentType === 'video/mp4' ? 'mp4' : 'webm'}`;
    const created = await s3.send(new CreateMultipartUploadCommand({ Bucket: bucket, Key: key, ContentType: contentType }));
    const minimumPartSize = size <= 48 * MiB ? 5 * MiB : 16 * MiB;
    const partSize = Math.max(minimumPartSize, Math.ceil(size / 10000 / MiB) * MiB);
    const pending = { owner, name, size, duration, fingerprint, bucket, key, awsId: created.UploadId, partSize };
    try {
      await collection.updateOne({ _id: id, upload: { $exists: false } }, {
        $setOnInsert: { movieId, language, quality },
        $set: { upload: pending },
      }, { upsert: true });
    } catch (error) {
      await s3.send(new AbortMultipartUploadCommand({ Bucket: bucket, Key: key, UploadId: created.UploadId }));
      if (error.code === 11000) return respond('An upload already started for this quality.', 409);
      throw error;
    }
    return success({ partSize, completedParts: [] });
  }

  if (!upload || upload.owner !== owner) return respond('Upload session not found.', 404);
  const target = { Bucket: upload.bucket, Key: upload.key, UploadId: upload.awsId };

  if (action === 'sign') {
    const { partNumber } = data;
    if (!Number.isInteger(partNumber) || partNumber < 1 || partNumber > Math.ceil(upload.size / upload.partSize)) {
      return respond('Invalid upload part.', 400);
    }
    const url = await getSignedUrl(s3, new UploadPartCommand({
      ...target, PartNumber: partNumber, ContentLength: expectedSize(upload, partNumber),
    }), { expiresIn: 900 });
    return success({ url });
  }

  if (action === 'cancel') {
    await s3.send(new AbortMultipartUploadCommand(target)).catch((error) => {
      if (error.name !== 'NoSuchUpload') throw error;
    });
    await collection.updateOne({ _id: id, 'upload.awsId': upload.awsId }, { $unset: { upload: '' } });
    return success();
  }

  if (action === 'complete') {
    const object = { Bucket: upload.bucket, Key: upload.key };
    const head = () => s3.send(new HeadObjectCommand(object));
    let file = await head().catch((error) => {
      if (error.$metadata?.httpStatusCode !== 404) throw error;
      return null;
    });

    if (!file) {
      const parts = await readParts(upload);
      const expectedParts = Math.ceil(upload.size / upload.partSize);
      if (parts.length !== expectedParts || parts.some((part, index) =>
        part.PartNumber !== index + 1 || part.Size !== expectedSize(upload, part.PartNumber) || !part.ETag
      )) return respond('Some video parts are missing. Resume the upload.', 409);
      await s3.send(new CompleteMultipartUploadCommand({
        ...target, MultipartUpload: { Parts: parts.map(({ PartNumber, ETag }) => ({ PartNumber, ETag })) },
      }));
      file = await head();
    }

    if (file.ContentLength !== upload.size) return respond('Uploaded file size could not be verified.', 409);
    const { bucket, key, name, size, duration } = upload;
    const saved = await collection.updateOne({ _id: id, 'upload.awsId': upload.awsId }, {
      $set: { asset: { bucket, key, name, size, duration } },
      $unset: { upload: '' },
    });
    if (!saved.matchedCount) return respond('The upload session changed. Reload the Movie Studio.', 409);
    return success({ asset: { name, size, duration } });
  }

  return respond('Unknown media action.', 400);
}
