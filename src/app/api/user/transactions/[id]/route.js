import mongoose from 'mongoose';
import { requireAuth } from '@/lib/authMiddleware';
import Transaction from '@/models/Transaction';
import dbConnect from '@/lib/db';

export async function GET(request, { params }) {
  const { user, error } = await requireAuth(request);
  if (error) return error;
  if (!user.userId || user.adminId) return Response.json({ success: false }, { status: 403 });
  const { id } = await params;
  if (!mongoose.isObjectIdOrHexString(id)) return Response.json({ success: false, message: 'Invalid transaction ID.' }, { status: 400 });
  await dbConnect();
  const transaction = await Transaction.findOne({ _id: id, userId: user.userId })
    .select('amount currency status planId paidAt createdAt isRecurring refundedAmount').lean();
  if (!transaction) return Response.json({ success: false, message: 'Transaction not found.' }, { status: 404 });
  return Response.json({ success: true, transaction }, { headers: { 'Cache-Control': 'private, no-store' } });
}
