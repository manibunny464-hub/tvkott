import mongoose from 'mongoose';
import Content from '@/models/Content';
import SeasonTrailer from '@/models/SeasonTrailer';
import Interaction from '@/models/TrailerInteraction';

export const interactionDefaults = { likesEnabled: true, commentsEnabled: false, showLikeCount: true };

export async function resolveTrailer(trailerId, language, { admin = false } = {}) {
  if (!mongoose.isObjectIdOrHexString(trailerId)) return null;
  const id = trailerId.toLowerCase();
  const visibility = admin ? {} : { isActive: true, isComingSoon: { $ne: true } };
  if (language !== null) {
    if (!language || language.length > 80) return null;
    const movie = await Content.findOne({ _id: id, type: 'movie', isDeleted: { $ne: true }, ...visibility })
      .select('+localizations +primaryLanguage +publishedMovie +inactiveMovieLanguages trailerUrl').lean();
    const variants = admin ? movie?.localizations : movie?.publishedMovie ?? movie?.localizations;
    const variant = variants?.find(item => item.language === language);
    const url = variant?.trailerUrl ?? ((!movie?.publishedMovie || admin) && movie?.primaryLanguage === language ? movie.trailerUrl : null);
    if (!movie || !url || (!admin && movie.inactiveMovieLanguages?.includes(language))) return null;
    return `movie:${id}:${language}`;
  }

  const trailer = await SeasonTrailer.findOne({ _id: id, ...(admin ? {} : { isActive: true }) }).select('seriesId').lean();
  if (!trailer) return null;
  if (!admin && !await Content.exists({ _id: trailer.seriesId, isDeleted: { $ne: true }, ...visibility })) return null;
  return `season:${id}`;
}

export async function getTrailerSettings(trailerKey) {
  const row = await Interaction.findOne({ trailerKey, kind: 'settings' }).lean();
  return Object.fromEntries(Object.entries(interactionDefaults).map(([key, value]) => [key, row?.[key] ?? value]));
}

export async function getTrailerEngagement(trailerKey, userId) {
  const settings = await getTrailerSettings(trailerKey);
  const [like, count] = await Promise.all([
    settings.likesEnabled && userId && Interaction.exists({ trailerKey, kind: 'like', userId }),
    settings.likesEnabled && settings.showLikeCount && Interaction.countDocuments({ trailerKey, kind: 'like' }),
  ]);
  return { ...settings, liked: Boolean(like), ...(typeof count === 'number' ? { likesCount: count } : {}) };
}

export function interactionError(message, status) {
  return Response.json({ success: false, message }, { status });
}
