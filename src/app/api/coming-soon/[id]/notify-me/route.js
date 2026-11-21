import { requireAuth } from '@/lib/authMiddleware';
import dbConnect from '@/lib/db';
import ComingSoon from '@/models/ComingSoon';

function authError(result) {
  return Response.json({ success: false, message: result.message }, { status: 401 });
}

export async function POST(request, { params }) {
  const auth = await requireAuth(request);
  if (!auth.success) return authError(auth);

  const { id } = await params;
  await dbConnect();
  const item = await ComingSoon.findOneAndUpdate(
    { _id: id, isDeleted: { $ne: true } },
    { $addToSet: { notifyUsers: { userId: auth.user.userId || auth.user.id } } },
    { returnDocument: 'after' }
  );

  if (!item) return Response.json({ success: false, message: 'Coming soon item not found' }, { status: 404 });
  return Response.json({ success: true, notifiedclicked: true });
}

export async function DELETE(request, { params }) {
  const auth = await requireAuth(request);
  if (!auth.success) return authError(auth);

  const { id } = await params;
  await dbConnect();
  await ComingSoon.findByIdAndUpdate(id, {
    $pull: { notifyUsers: { userId: auth.user.userId || auth.user.id } },
  });

  return Response.json({ success: true, notifiedclicked: false });
}
