import { requireAdmin } from '@/lib/admin/auth';
import { sendComingSoonPush } from '@/lib/admin/notifications';
import dbConnect from '@/lib/db';
import ComingSoon from '@/models/ComingSoon';

export async function POST(request, { params }) {
  const { error } = await requireAdmin(request, ['super_admin', 'editor']);
  if (error) return error;

  const { id } = await params;
  await dbConnect();
  const item = await ComingSoon.findOne({ _id: id, isDeleted: { $ne: true } });
  if (!item) return Response.json({ success: false, message: 'Coming soon item not found' }, { status: 404 });

  const userIds = item.notifyUsers.map((entry) => String(entry.userId));
  const result = await sendComingSoonPush({
    title: `${item.title} is live`,
    body: item.description || 'Your notified title is now available.',
    imageUrl: item.posterUrl,
    userIds,
  });

  item.isActive = false;
  item.lastNotifiedAt = new Date();
  await item.save();

  return Response.json({ success: true, notification: result, notifiedUsers: userIds.length });
}
