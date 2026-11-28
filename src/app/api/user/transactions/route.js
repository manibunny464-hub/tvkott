import { requireAuth } from '@/lib/authMiddleware';
import Transaction from '@/models/Transaction';
import dbConnect from '@/lib/db';

export async function GET(request) {
  const { user, error } = await requireAuth(request);
  if (error) return error;
  if (!user.userId || user.adminId) return Response.json({ success: false }, { status: 403 });
  const params = new URL(request.url).searchParams;
  const page = Math.min(10000, Math.max(1, parseInt(params.get('page'), 10) || 1));
  const limit = Math.min(50, Math.max(1, parseInt(params.get('limit'), 10) || 20));
  await dbConnect();
  const filter = { userId: user.userId };
  const [transactions, total] = await Promise.all([
    Transaction.find(filter).select('amount currency status planId paidAt createdAt isRecurring refundedAmount')
      .sort({ createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Transaction.countDocuments(filter),
  ]);
  return Response.json({ success: true, transactions, pagination: { page, limit, total, pages: Math.ceil(total / limit) } },
    { headers: { 'Cache-Control': 'private, no-store' } });
}
