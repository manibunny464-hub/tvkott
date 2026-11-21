import mongoose from 'mongoose';
import { requireAdmin, writeAuditLog } from '@/lib/admin/auth';
import dbConnect from '@/lib/db';
import Language from '@/models/Language';
import Content from '@/models/Content';

export async function GET(request) {
  const { error } = await requireAdmin(request, 'settings.view');
  if (error) return error;

  await dbConnect();
  const languages = await Language.find().sort({ order: 1 }).lean();
  return Response.json({ success: true, languages });
}

export async function POST(request) {
  const { admin, error } = await requireAdmin(request, 'settings.manage');
  if (error) return error;

  await dbConnect();
  const body = await request.json();

  const exists = await Language.findOne({ code: body.code });
  if (exists) {
    return Response.json({ success: false, message: 'Language code already exists' }, { status: 400 });
  }

  const language = await Language.create(body);

  await writeAuditLog({
    user: admin.email,
    role: admin.role,
    action: 'Created Language',
    module: 'settings',
    entityId: language._id,
    newData: language.toObject ? language.toObject() : language,
    request,
  });

  return Response.json({ success: true, language });
}

export async function PUT(request) {
  const { admin, error } = await requireAdmin(request, 'settings.manage');
  if (error) return error;

  await dbConnect();
  const body = await request.json();
  const { _id, ...updateData } = body;

  if (!_id) {
    return Response.json({ success: false, message: 'Language ID required' }, { status: 400 });
  }

  if (updateData.code) {
    const exists = await Language.findOne({ code: updateData.code, _id: { $ne: _id } });
    if (exists) {
      return Response.json({ success: false, message: 'Language code already exists' }, { status: 400 });
    }
  }

  const oldLang = await Language.findById(_id).lean();
  if (!oldLang) return Response.json({ success: false, message: 'Not found' }, { status: 404 });

  const language = await Language.findByIdAndUpdate(_id, updateData, { new: true, runValidators: true });

  await writeAuditLog({
    user: admin.email,
    role: admin.role,
    action: 'Updated Language',
    module: 'settings',
    entityId: language._id,
    oldData: oldLang,
    newData: language.toObject ? language.toObject() : language,
    request,
  });

  return Response.json({ success: true, language });
}

export async function DELETE(request) {
  const { admin, error } = await requireAdmin(request, 'settings.manage');
  if (error) return error;

  await dbConnect();
  const { id } = await request.json();

  // Validate constraint: Cannot delete if actively used in Content
  const oldLang = await Language.findById(id).lean();
  if (!oldLang) return Response.json({ success: false, message: 'Not found' }, { status: 404 });

  const inUse = await Content.countDocuments({
    $or: [
      { languages: oldLang.code },
      { language: oldLang.code },
      { languages: oldLang.englishName },
      { language: oldLang.englishName },
    ],
    isDeleted: { $ne: true },
  });
  if (inUse > 0) {
    return Response.json(
      { success: false, message: 'Cannot delete language because it is assigned to active content.' },
      { status: 400 }
    );
  }

  await Language.findByIdAndDelete(id);

  await writeAuditLog({
    user: admin.email,
    role: admin.role,
    action: 'Deleted Language',
    module: 'settings',
    entityId: id,
    oldData: oldLang,
    request,
  });

  return Response.json({ success: true });
}
