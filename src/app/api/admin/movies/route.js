import { requireAdmin } from '@/lib/admin/auth';
import { activeQuery, paginationMeta, parsePagination, readBody } from '@/lib/admin/api';
import { buildContentFilters, buildContentPayload } from '@/lib/admin/content-payload';
import { syncContentFlags } from '@/lib/admin/content-flags';
import dbConnect from '@/lib/db';
import Content from '@/models/Content';

export async function GET(request) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const { searchParams, page, limit, skip } = parsePagination(request);
  const query = buildContentFilters(searchParams, 'movie');
  await dbConnect();

  const [movies, total] = await Promise.all([
    Content.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Content.countDocuments(query),
  ]);

  return Response.json({ success: true, movies, pagination: paginationMeta(page, limit, total) });
}

export async function POST(request) {
  const { error } = await requireAdmin(request, ['super_admin', 'editor']);
  if (error) return error;

  const { data, formData } = await readBody(request);
  await dbConnect();

  const payload = await buildContentPayload({ data, formData, type: 'movie' });
  if (!payload.title) {
    return Response.json({ success: false, message: 'Title is required' }, { status: 400 });
  }

  const movie = await Content.create(payload);
  await syncContentFlags(movie, {
    isTrending: payload.isTrending,
    isBlockbuster: payload.isBlockbuster,
    isFeatured: payload.isFeatured,
  });

  return Response.json({ success: true, movie });
}
