import { requireAdmin } from '@/lib/admin/auth';
import { serialize } from '@/lib/admin/data';
import dbConnect from '@/lib/db';
import Coupon from '@/models/Coupon';
import Transaction from '@/models/Transaction';

export async function GET(request) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  await dbConnect();
  const [coupons, transactions] = await Promise.all([
    Coupon.find({}).sort({ createdAt: -1 }).lean(),
    Transaction.find({ status: 'success', couponCode: { $exists: true, $ne: '' } }).lean(),
  ]);

  const impactMap = new Map();
  for (const tx of transactions) {
    if (!tx.couponCode) continue;
    const code = tx.couponCode.toUpperCase();
    const pct = tx.discountPercent || 0;
    const saved = pct > 0 && pct < 100 ? Math.round((tx.amount * pct) / (100 - pct)) : 0;
    impactMap.set(code, (impactMap.get(code) || 0) + saved);
  }

  const formattedCoupons = serialize(coupons).map((c) => ({
    ...c,
    revenueImpact: impactMap.get(c.code.toUpperCase()) || 0,
  }));

  return Response.json({ success: true, coupons: formattedCoupons });
}

export async function POST(request) {
  const { error } = await requireAdmin(request, ['super_admin']);
  if (error) return error;

  const body = await request.json();
  await dbConnect();

  const coupon = await Coupon.create({
    code: String(body.code || '').toUpperCase().trim(),
    type: body.type === 'percentage' ? 'percentage' : 'flat',
    value: Number(body.value || 0),
    applicablePlans: Array.isArray(body.applicablePlans) ? body.applicablePlans : [],
    isActive: body.isActive ?? true,
    expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
    maxUses: body.maxUses ? Number(body.maxUses) : null,
  });

  return Response.json({ success: true, coupon: serialize(coupon) });
}

export async function PUT(request) {
  const { error } = await requireAdmin(request, ['super_admin']);
  if (error) return error;

  const body = await request.json();
  await dbConnect();

  const coupon = await Coupon.findByIdAndUpdate(
    body.id,
    {
      $set: {
        code: String(body.code || '').toUpperCase().trim(),
        type: body.type === 'percentage' ? 'percentage' : 'flat',
        value: Number(body.value || 0),
        applicablePlans: Array.isArray(body.applicablePlans) ? body.applicablePlans : [],
        isActive: body.isActive ?? true,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        maxUses: body.maxUses ? Number(body.maxUses) : null,
      },
    },
    { returnDocument: 'after', runValidators: true }
  ).lean();

  return Response.json({ success: true, coupon: serialize(coupon) });
}

export async function DELETE(request) {
  const { error } = await requireAdmin(request, ['super_admin']);
  if (error) return error;

  const { id } = await request.json();
  await dbConnect();
  await Coupon.findByIdAndDelete(id);
  return Response.json({ success: true });
}
