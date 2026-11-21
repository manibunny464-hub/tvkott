import { requireAdmin } from '@/lib/admin/auth';
import dbConnect from '@/lib/db';
import ComingSoon from '@/models/ComingSoon';

export async function GET(request, { params }) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const { id } = await params;
  await dbConnect();
  const item = await ComingSoon.findOne({ _id: id, isDeleted: { $ne: true } })
    .populate('notifyUsers.userId', 'name phone email avatarUrl')
    .lean();

  if (!item) return Response.json({ success: false, message: 'Coming soon item not found' }, { status: 404 });
  return Response.json({ success: true, notifyUsers: item.notifyUsers || [] });
}
