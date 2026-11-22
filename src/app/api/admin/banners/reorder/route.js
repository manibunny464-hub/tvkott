import { requireAdmin } from '@/lib/admin/auth';
import dbConnect from '@/lib/db';
import Banner from '@/models/Banner';

export async function PUT(request) {
  const { error } = await requireAdmin(request, ['super_admin', 'editor']);
  if (error) return error;

  const body = await request.json();
  await dbConnect();

  if (body.id !== undefined) {
    if (!/^[a-f0-9]{24}$/i.test(body.id) || ![-1, 1].includes(body.direction)) {
      return Response.json({ success: false, message: 'Choose a banner and a direction.' }, { status: 400 });
    }
    const banners = await Banner.find({ isDeleted: { $ne: true } }).select('order').sort({ order: -1, createdAt: -1, _id: 1 }).lean();
    const index = banners.findIndex((banner) => String(banner._id) === body.id);
    const target = index + body.direction;
    if (index < 0 || target < 0 || target >= banners.length) {
      return Response.json({ success: false, message: 'Banner order changed. Reload and try again.' }, { status: 409 });
    }
    [banners[index], banners[target]] = [banners[target], banners[index]];
    await Banner.bulkWrite(banners.flatMap((banner, position) => {
      const order = banners.length - position;
      return banner.order === order ? [] : [{ updateOne: {
        filter: { _id: banner._id, isDeleted: { $ne: true } }, update: { $set: { order } },
      } }];
    }));
    return Response.json({ success: true });
  }

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
