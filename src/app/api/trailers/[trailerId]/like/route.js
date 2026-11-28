import dbConnect from '@/lib/db';
import { requireAuth } from '@/lib/authMiddleware';
import { getTrailerEngagement, getTrailerSettings, interactionError, resolveTrailer } from '@/lib/trailer-interactions';
import Interaction from '@/models/TrailerInteraction';

async function setLike(request, params, liked) {
  const { user, error } = await requireAuth(request);
  if (error) return error;
  if (!user.deviceId) return interactionError('User session required', 403);
  await dbConnect();
  const key = await resolveTrailer((await params).trailerId, new URL(request.url).searchParams.get('language'));
  if (!key) return interactionError('Trailer not found', 404);
  if (!(await getTrailerSettings(key)).likesEnabled) return interactionError('Likes are disabled', 403);
  const filter = { trailerKey: key, kind: 'like', userId: user.userId };
  if (liked) {
    try {
      await Interaction.updateOne(filter, { $setOnInsert: filter }, { upsert: true });
    } catch (err) {
      if (err.code !== 11000) throw err;
    }
  } else {
    await Interaction.deleteOne(filter);
  }
  return Response.json({ success: true, ...await getTrailerEngagement(key, user.userId) });
}

export const POST = (request, { params }) => setLike(request, params, true);
export const DELETE = (request, { params }) => setLike(request, params, false);
