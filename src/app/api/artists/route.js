import dbConnect from '@/lib/db';
import Artist from '@/models/Artist';
import { requireAdmin } from '@/lib/admin/auth';

function escapeRegex(string) {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const search = searchParams.get('search');

    await dbConnect();

    const query = {};
    if (type) {
      query.type = type;
    }
    if (search && search.trim()) {
      query.name = { $regex: escapeRegex(search.trim()), $options: 'i' };
    }

    const artists = await Artist.find(query).sort({ name: 1 }).lean();
    return Response.json({ success: true, artists });
  } catch (error) {
    console.error('[api/artists] GET error:', error);
    return Response.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  try {
    const body = await request.json();
    const { name, type, bio, photo } = body;

    if (!name || !type) {
      return Response.json(
        { success: false, message: 'Name and type are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const artist = await Artist.create({
      name,
      type,
      bio: bio || '',
      photo: photo || '',
    });

    return Response.json({ success: true, artist });
  } catch (error) {
    console.error('[api/artists] POST error:', error);
    return Response.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
