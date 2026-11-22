import { randomUUID } from 'node:crypto';
import { requireAdmin, writeAuditLog } from '@/lib/admin/auth';
import { artistTypeFields, initializeArtistTypes, serializeArtistType } from '@/lib/admin/artist-types';
import dbConnect from '@/lib/db';
import ArtistType from '@/models/ArtistType';

export async function GET(request) {
  const { error } = await requireAdmin(request, 'content');
  if (error) return error;
  await dbConnect();
  await initializeArtistTypes();
  const types = await ArtistType.find().sort({ nameKey: 1 }).lean();
  return Response.json({ success: true, types: types.map(serializeArtistType) });
}

export async function POST(request) {
  const { admin, error } = await requireAdmin(request, 'content');
  if (error) return error;
  const fields = artistTypeFields(await request.json().catch(() => null));
  if (!fields) return Response.json({ success: false, message: 'Enter an artist type name and status.' }, { status: 400 });
  await dbConnect();
  await initializeArtistTypes();
  try {
    const type = await ArtistType.create({ key: randomUUID(), ...fields });
    await writeAuditLog({ user: admin.email, role: admin.role, action: 'Created Artist Type', module: 'artists', entityId: type.key, request });
    return Response.json({ success: true, type: serializeArtistType(type) }, { status: 201 });
  } catch (error) {
    if (error.code !== 11000) throw error;
    return Response.json({ success: false, message: 'An artist type with this name already exists.' }, { status: 409 });
  }
}
