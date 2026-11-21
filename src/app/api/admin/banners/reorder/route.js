import { requireAdmin } from '@/lib/admin/auth';
import dbConnect from '@/lib/db';
import Banner from '@/models/Banner';

export async function PUT(request) {
  const { error } = await requireAdmin(request, ['super_admin', 'editor']);
  if (error) return error;

  const body = await request.json();
  await dbConnect();

  await Promise.all(
    (body.items || body.banners || []).map((item, index) =>
      Banner.findByIdAndUpdate(item.id || item._id, {
        $set: { order: Number(item.order ?? item.position ?? index + 1) },
      })
    )
  );

  const banners = await Banner.find({ isDeleted: { $ne: true } }).sort({ order: -1 }).lean();
  return Response.json({ success: true, banners });
}
