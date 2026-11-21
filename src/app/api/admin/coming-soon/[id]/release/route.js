import { requireAdmin } from '@/lib/admin/auth';
import dbConnect from '@/lib/db';
import ComingSoon from '@/models/ComingSoon';
import { dispatchComingSoonReleaseNotification } from '@/lib/notifications/comingSoonBroadcaster';

export async function POST(request, { params }) {
  const { error } = await requireAdmin(request, ['super_admin', 'editor']);
  if (error) return error;

  const { id } = await params;
  let body = {};
  try {
    body = await request.json();
  } catch {
    // Body is optional
  }

  await dbConnect();

  const item = await ComingSoon.findById(id);
  if (!item || item.isDeleted) {
    return Response.json({ success: false, message: 'Coming soon item not found' }, { status: 404 });
  }

  // Optionally link to content if linkedContentId passed in body
  if (body.linkedContentId) {
    item.linkedContentId = body.linkedContentId;
    await item.save();
  }

  // Trigger release notification dispatch
  const result = await dispatchComingSoonReleaseNotification(id, {
    title: body.title,
    message: body.message,
  });

  return Response.json({
    success: true,
    message: `Release notifications sent to ${result.notifiedCount} registered users`,
    result,
  });
}
