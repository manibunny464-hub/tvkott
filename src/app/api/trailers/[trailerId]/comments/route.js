import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import { requireAuth } from '@/lib/authMiddleware';
import { getTrailerSettings, interactionError, resolveTrailer } from '@/lib/trailer-interactions';
import Interaction from '@/models/TrailerInteraction';

async function context(request, params) {
  const { user, error } = await requireAuth(request);
  if (error) return { error };
  if (!user.deviceId) return { error: interactionError('User session required', 403) };
  await dbConnect();
  const query = new URL(request.url).searchParams;
  const trailerKey = await resolveTrailer((await params).trailerId, query.get('language'));
  if (!trailerKey) return { error: interactionError('Trailer not found', 404) };
  if (!(await getTrailerSettings(trailerKey)).commentsEnabled) return { error: interactionError('Comments are disabled', 403) };
  return { user, query, trailerKey };
}

export async function GET(request, { params }) {
  const { error, query, trailerKey } = await context(request, params);
  if (error) return error;
  const before = query.get('before');
  if (before && !mongoose.isObjectIdOrHexString(before)) return interactionError('Invalid cursor', 400);
  const rows = await Interaction.find({ trailerKey, kind: 'comment', hidden: false, ...(before ? { _id: { $lt: before } } : {}) })
    .sort({ _id: -1 }).limit(21).populate('userId', 'name').lean();
  const comments = rows.slice(0, 20).map(row => ({
    id: row._id, text: row.text, author: row.userId?.name || 'Viewer', createdAt: row.createdAt,
  }));
  return Response.json({ success: true, comments, nextCursor: rows.length > 20 ? comments.at(-1).id : null });
}

export async function POST(request, { params }) {
  const { error, trailerKey, user } = await context(request, params);
  if (error) return error;
  const body = await request.json().catch(() => null);
  const text = typeof body?.text === 'string' ? body.text.trim() : '';
  if (!text || text.length > 1000) return interactionError('Enter a comment of 1–1000 characters', 400);
  const comment = await Interaction.create({ trailerKey, kind: 'comment', userId: user.userId, text });
  return Response.json({ success: true, comment: { id: comment._id, text, createdAt: comment.createdAt } }, { status: 201 });
}

export async function DELETE(request, { params }) {
  const { error, trailerKey, query, user } = await context(request, params);
  if (error) return error;
  const id = query.get('commentId');
  if (!mongoose.isObjectIdOrHexString(id)) return interactionError('Invalid comment ID', 400);
  const result = await Interaction.deleteOne({ _id: id, trailerKey, kind: 'comment', userId: user.userId });
  if (!result.deletedCount) return interactionError('Comment not found', 404);
  return Response.json({ success: true });
}
