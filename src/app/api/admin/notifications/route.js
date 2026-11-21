import { requireAdmin } from '@/lib/admin/auth';
import { serialize } from '@/lib/admin/data';
import dbConnect from '@/lib/db';
import AdminNotification from '@/models/AdminNotification';
import { dispatchAdminNotification } from '@/lib/admin/notificationBroadcaster';

export async function GET(request) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  await dbConnect();
  const notifications = await AdminNotification.find({})
    .sort({ scheduledAt: -1, createdAt: -1 })
    .limit(100)
    .lean();

  return Response.json({ success: true, notifications: serialize(notifications) });
}

export async function POST(request) {
  const { error } = await requireAdmin(request, ['super_admin', 'editor']);
  if (error) return error;

  const body = await request.json();
  await dbConnect();

  const isSent = body.status === 'sent';
  const notification = await AdminNotification.create({
    title: body.title,
    message: body.message,
    audience: body.audience || 'all',
    status: body.status || 'scheduled',
    scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : new Date(),
    sentAt: isSent ? new Date() : null,
  });

  let deliveredCount = 0;
  if (isSent) {
    deliveredCount = await dispatchAdminNotification(notification);
  }

  return Response.json({
    success: true,
    notification: serialize(notification),
    notifiedCount: deliveredCount,
  });
}

export async function PUT(request) {
  const { error } = await requireAdmin(request, ['super_admin', 'editor']);
  if (error) return error;

  const body = await request.json();
  await dbConnect();

  const isSent = body.status === 'sent';
  const notification = await AdminNotification.findByIdAndUpdate(
    body.id,
    {
      $set: {
        title: body.title,
        message: body.message,
        audience: body.audience,
        status: body.status,
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : new Date(),
        sentAt: isSent ? new Date() : body.sentAt || null,
      },
    },
    { returnDocument: 'after', runValidators: true }
  );

  if (!notification) {
    return Response.json({ success: false, message: 'Notification not found' }, { status: 404 });
  }

  let deliveredCount = notification.deliveryCount || 0;
  if (isSent) {
    deliveredCount = await dispatchAdminNotification(notification);
  }

  return Response.json({
    success: true,
    notification: serialize(notification),
    notifiedCount: deliveredCount,
  });
}

export async function DELETE(request) {
  const { error } = await requireAdmin(request, ['super_admin']);
  if (error) return error;

  const { id } = await request.json();
  await dbConnect();
  await AdminNotification.findByIdAndDelete(id);
  return Response.json({ success: true });
}
