import dbConnect from '@/lib/db';
import Artist from '@/models/Artist';
import { requireAdmin } from '@/lib/admin/auth';

export async function PUT(request, { params }) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  try {
    const { id } = await params;
    const body = await request.json();
    const { name, type, bio, photo } = body;

    if (!name || !type) {
      return Response.json(
        { success: false, message: 'Name and type are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const artist = await Artist.findByIdAndUpdate(
      id,
      {
        $set: {
          name,
          type,
          bio: bio || '',
          photo: photo || '',
        },
      },
      { new: true, runValidators: true }
    );

    if (!artist) {
      return Response.json(
        { success: false, message: 'Artist not found' },
        { status: 404 }
      );
    }

    return Response.json({ success: true, artist });
  } catch (error) {
    console.error('[api/artists/[id]] PUT error:', error);
    return Response.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  try {
    const { id } = await params;

    await dbConnect();

    const artist = await Artist.findByIdAndDelete(id);

    if (!artist) {
      return Response.json(
        { success: false, message: 'Artist not found' },
        { status: 404 }
      );
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('[api/artists/[id]] DELETE error:', error);
    return Response.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
