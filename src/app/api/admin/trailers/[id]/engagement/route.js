import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import { requireAdmin } from '@/lib/admin/auth';
import { getTrailerEngagement, interactionDefaults, interactionError, resolveTrailer } from '@/lib/trailer-interactions';
import Interaction from '@/models/TrailerInteraction';

async function context(request, params) {
  const { error } = await requireAdmin(request, 'trailers');
  if (error) return { error };
  await dbConnect();
  const query = new URL(request.url).searchParams;
  const trailerKey = await resolveTrailer((await params).id, query.get('language'), { admin: true });
  return trailerKey ? { trailerKey, query } : { error: interactionError('Trailer not found', 404) };
}

export async function GET(request, { params }) {
  const { error, trailerKey, query } = await context(request, params);
  if (error) return error;
  const before = query.get('before');
  if (before && !mongoose.isObjectIdOrHexString(before)) return interactionError('Invalid cursor', 400);
  const rows = await Interaction.find({ trailerKey, kind: 'comment', ...(before ? { _id: { $lt: before } } : {}) })
    .sort({ _id: -1 }).limit(21).select('text hidden createdAt').lean();
  const comments = rows.slice(0, 20);
  return Response.json({
    success: true, ...await getTrailerEngagement(trailerKey), comments,
    nextCursor: rows.length > 20 ? comments.at(-1)._id : null,
  });
}

export async function PATCH(request, { params }) {
  const { error, trailerKey } = await context(request, params);
  if (error) return error;
  const body = await request.json().catch(() => null);
  if (body?.commentId) {
    if (!mongoose.isObjectIdOrHexString(body.commentId)) return interactionError('Invalid comment ID', 400);
    const filter = { trailerKey, kind: 'comment', _id: body.commentId };
    if (body.action === 'delete') await Interaction.deleteOne(filter);
    else if (['hide', 'restore'].includes(body.action)) await Interaction.updateOne(filter, { hidden: body.action === 'hide' });
    else return interactionError('Invalid moderation action', 400);
  } else {
    const fields = Object.keys(interactionDefaults);
    if (!fields.every(field => typeof body?.[field] === 'boolean')) return interactionError('Provide all three engagement settings', 400);
    const settings = Object.fromEntries(fields.map(field => [field, body[field]]));
    await Interaction.updateOne({ trailerKey, kind: 'settings' }, { $set: settings }, { upsert: true });
  }
  return Response.json({ success: true });
}
