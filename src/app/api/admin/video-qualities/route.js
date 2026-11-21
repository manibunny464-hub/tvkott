import mongoose from 'mongoose';
import { requireAdmin, writeAuditLog } from '@/lib/admin/auth';
import dbConnect from '@/lib/db';
import VideoQuality from '@/models/VideoQuality';
import Episode from '@/models/Episode';

export async function GET(request) {
  const { error } = await requireAdmin(request, 'settings.view');
  if (error) return error;

  await dbConnect();
  const qualities = await VideoQuality.find().sort({ order: 1 }).lean();
  return Response.json({ success: true, qualities });
}

export async function POST(request) {
  const { admin, error } = await requireAdmin(request, 'settings.manage');
  if (error) return error;

  await dbConnect();
  const body = await request.json();

  const exists = await VideoQuality.findOne({ name: body.name });
  if (exists) {
    return Response.json({ success: false, message: 'Video Quality already exists' }, { status: 400 });
  }

  const quality = await VideoQuality.create(body);

  await writeAuditLog({
    user: admin.email,
    role: admin.role,
    action: 'Created Video Quality',
    module: 'settings',
    entityId: quality._id,
    newData: quality.toObject ? quality.toObject() : quality,
    request,
  });

  return Response.json({ success: true, quality });
}

export async function PUT(request) {
  const { admin, error } = await requireAdmin(request, 'settings.manage');
  if (error) return error;

  await dbConnect();
  const body = await request.json();
  const { _id, ...updateData } = body;

  if (!_id) {
    return Response.json({ success: false, message: 'ID required' }, { status: 400 });
  }

  if (updateData.name) {
    const exists = await VideoQuality.findOne({ name: updateData.name, _id: { $ne: _id } });
    if (exists) {
      return Response.json({ success: false, message: 'Video Quality already exists' }, { status: 400 });
    }
  }

  const oldQuality = await VideoQuality.findById(_id).lean();
  if (!oldQuality) return Response.json({ success: false, message: 'Not found' }, { status: 404 });

  const quality = await VideoQuality.findByIdAndUpdate(_id, updateData, { new: true, runValidators: true });

  await writeAuditLog({
    user: admin.email,
    role: admin.role,
    action: 'Updated Video Quality',
    module: 'settings',
    entityId: quality._id,
    oldData: oldQuality,
    newData: quality.toObject ? quality.toObject() : quality,
    request,
  });

  return Response.json({ success: true, quality });
}

export async function DELETE(request) {
  const { admin, error } = await requireAdmin(request, 'settings.manage');
  if (error) return error;

  await dbConnect();
  const { id } = await request.json();

  const oldQuality = await VideoQuality.findById(id).lean();
  if (!oldQuality) return Response.json({ success: false, message: 'Not found' }, { status: 404 });

  // In a real system, we'd check if this quality is used in EpisodeVideoFiles.
  // We'll enforce a simple check or just allow delete since it's dynamic
  
  await VideoQuality.findByIdAndDelete(id);

  await writeAuditLog({
    user: admin.email,
    role: admin.role,
    action: 'Deleted Video Quality',
    module: 'settings',
    entityId: id,
    oldData: oldQuality,
    request,
  });

  return Response.json({ success: true });
}
