import { requireAdmin, writeAuditLog } from '@/lib/admin/auth';
import { artistTypeFields, serializeArtistType } from '@/lib/admin/artist-types';
import dbConnect from '@/lib/db';
import ArtistType from '@/models/ArtistType';

export async function PUT(request, { params }) {
  const { admin, error } = await requireAdmin(request, 'content');
  if (error) return error;
  const { key } = await params;
  const fields = artistTypeFields(await request.json().catch(() => null));
  if (!fields) return Response.json({ success: false, message: 'Enter an artist type name and status.' }, { status: 400 });
  await dbConnect();
  try {
    const type = await ArtistType.findOneAndUpdate({ key }, { $set: fields }, { returnDocument: 'after', runValidators: true });
    if (!type) return Response.json({ success: false, message: 'Artist type not found.' }, { status: 404 });
    await writeAuditLog({ user: admin.email, role: admin.role, action: 'Updated Artist Type', module: 'artists', entityId: key, request });
    return Response.json({ success: true, type: serializeArtistType(type) });
  } catch (error) {
    if (error.code !== 11000) throw error;
    return Response.json({ success: false, message: 'An artist type with this name already exists.' }, { status: 409 });
  }
}
