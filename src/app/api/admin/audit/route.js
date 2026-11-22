import { requireAdmin } from '@/lib/admin/auth';
import { paginationMeta } from '@/lib/admin/api';
import dbConnect from '@/lib/db';
import AuditLog from '@/models/AuditLog';

export async function GET(request) {
  const { error } = await requireAdmin(request, 'audit.view');
  if (error) return error;

  const params = new URL(request.url).searchParams;
  const page = Number(params.get('page') ?? 1);
  const limit = 25;
  if (!Number.isSafeInteger(page) || page < 1 || page > 10000) {
    return Response.json({ success: false, message: 'Page must be an integer between 1 and 10000.' }, { status: 400 });
  }

  await dbConnect();
  const [records, total] = await Promise.all([
    AuditLog.find().select('user role action module entityId createdAt').sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * limit).limit(limit).lean(),
    AuditLog.countDocuments(),
  ]);
  const items = records.map((record) => ({
    id: String(record._id),
    staff: record.user,
    role: record.role,
    action: record.action,
    module: record.module,
    recordId: record.entityId ?? null,
    createdAt: record.createdAt,
  }));
  return Response.json({ success: true, items, pagination: paginationMeta(page, limit, total) });
}
