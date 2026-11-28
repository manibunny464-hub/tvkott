import dbConnect from '@/lib/db';
import { requireAuth } from '@/lib/authMiddleware';
import { getTrailerEngagement, interactionError, resolveTrailer } from '@/lib/trailer-interactions';

export async function GET(request, { params }) {
  const auth = request.headers.has('authorization') ? await requireAuth(request) : null;
  if (auth?.error) return auth.error;
  await dbConnect();
  const key = await resolveTrailer((await params).trailerId, new URL(request.url).searchParams.get('language'));
  if (!key) return interactionError('Trailer not found', 404);
  return Response.json({ success: true, ...await getTrailerEngagement(key, auth?.user?.userId) }, { headers: { 'Cache-Control': 'private, no-store' } });
}
