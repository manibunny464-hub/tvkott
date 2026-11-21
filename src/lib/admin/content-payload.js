import { optionalObjectId, toArray, toBoolean } from '@/lib/admin/api';
import { uploadFormFile } from '@/lib/admin/media';
import { initialTranscodingFields } from '@/lib/admin/transcoding';

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function buildContentPayload({ data, formData, type }) {
  const poster = await uploadFormFile(formData?.get('posterImage'), 'posters');
  const banner = await uploadFormFile(formData?.get('bannerImage'), 'banners');
  const trailerPoster = await uploadFormFile(formData?.get('trailerPosterImage'), 'posters');
  const video = await uploadFormFile(formData?.get('videoFile'), 'raw');
  const videoUrl = video.url || data.videoUrl || '';

  let castPayload = [];
  try {
    if (data.cast) {
      const parsed = typeof data.cast === 'string' ? JSON.parse(data.cast) : data.cast;
      if (parsed && (parsed.actors || parsed.directors || parsed.writers)) {
        // new structured cast format
        castPayload = {
          actors: (parsed.actors || []).map(a => ({
            artistId: a.artistId,
            name: a.name || '',
            photo: a.photo || '',
          })),
          directors: (parsed.directors || []).map(d => ({
            artistId: d.artistId,
            name: d.name || '',
            photo: d.photo || '',
          })),
          writers: (parsed.writers || []).map(w => ({
            artistId: w.artistId,
            name: w.name || '',
            photo: w.photo || '',
          })),
        };
      } else {
        // fallback to legacy array parsing
        const parsedArray = Array.isArray(parsed) ? parsed : toArray(data.cast);
        castPayload = parsedArray.map(c => {
          if (typeof c === 'string') {
            return { role: 'Cast', name: c, imageUrl: '' };
          }
          return {
            role: c.role || 'Cast',
            name: c.name || '',
            imageUrl: c.imageUrl || '',
          };
        });
      }
    }
  } catch (e) {
    console.error('Error parsing cast payload:', e);
    castPayload = [];
  }

  const title = String(data.title || '').trim();
  let slugVal = undefined;
  if (data.slug && String(data.slug).trim() !== '') {
    slugVal = slugify(data.slug);
  } else if (title) {
    slugVal = slugify(title);
  }

  const payload = {
    title,
    slug: slugVal,
    color: data.color ? String(data.color).trim() : undefined,
    description: data.description || '',
    releaseYear: data.releaseYear ? Number(data.releaseYear) : undefined,
    genres: toArray(data.genres),
    ageRating: data.ageRating || '',
    language: toArray(data.language),
    languages: toArray(data.language),
    trailerUrl: data.trailerUrl || '',
    cast: castPayload,
    director: toArray(data.director),
    musicDirector: toArray(data.musicDirector),
    producer: toArray(data.producer),
    type,
    duration: Number(data.duration || 0),
    pricing: data.pricing || 'free',
    freeEpisodeCount: Number(data.freeEpisodeCount || 0),
    isTrending: toBoolean(data.isTrending),
    isBlockbuster: toBoolean(data.isBlockbuster),
    isFeatured: toBoolean(data.isFeatured),
    isComingSoon: toBoolean(data.isComingSoon),
    expectedReleaseDate: data.expectedReleaseDate ? new Date(data.expectedReleaseDate) : undefined,
    isActive: toBoolean(data.isActive, true),
    linkedContentId: optionalObjectId(data.linkedContentId),
    ...initialTranscodingFields(videoUrl),
  };

  if (poster.url) {
    payload.posterUrl = poster.url;
    payload.thumbnailUrl = poster.url;
  } else if (data.posterUrl !== undefined) {
    payload.posterUrl = data.posterUrl;
    payload.thumbnailUrl = data.posterUrl;
  } else if (data.thumbnailUrl !== undefined) {
    payload.posterUrl = data.thumbnailUrl;
    payload.thumbnailUrl = data.thumbnailUrl;
  }

  if (banner.url) {
    payload.bannerUrl = banner.url;
  } else if (data.bannerUrl !== undefined) {
    payload.bannerUrl = data.bannerUrl;
  }

  if (trailerPoster.url) {
    payload.trailerPoster = trailerPoster.url;
  } else if (data.trailerPoster !== undefined) {
    payload.trailerPoster = data.trailerPoster;
  }

  if (video.key) {
    payload.videoSource = {
      key: video.key,
      bucket: process.env.S3_BUCKET_NAME,
      size: formData?.get('videoFile')?.size || 0,
      contentType: formData?.get('videoFile')?.type || 'video/mp4',
    };
  }

  return payload;
}

export function buildContentFilters(searchParams, type) {
  const query = { type, isDeleted: { $ne: true } };
  const genre = searchParams.get('genre');
  const language = searchParams.get('language');
  const trending = searchParams.get('trending');
  const blockbuster = searchParams.get('blockbuster');
  const search = searchParams.get('search');

  if (genre) query.genres = genre;
  if (language) query.language = language;
  if (trending) query.isTrending = toBoolean(trending);
  if (blockbuster) query.isBlockbuster = toBoolean(blockbuster);
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { genres: { $regex: search, $options: 'i' } },
      { 'cast.actors.name': { $regex: search, $options: 'i' } },
      { 'cast.directors.name': { $regex: search, $options: 'i' } },
      { 'cast.writers.name': { $regex: search, $options: 'i' } }
    ];
  }

  return query;
}
