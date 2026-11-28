import mongoose from 'mongoose';
import { requireAuth } from '@/lib/authMiddleware';
import { assertAuthRateLimit } from '@/lib/admin/auth';
import dbConnect from '@/lib/db';

export async function POST(request) {
  const { user, error } = await requireAuth(request);
  if (error) return error;
  if (!user.userId || user.adminId) return Response.json({ success: false }, { status: 403 });
  const limited = assertAuthRateLimit(request);
  if (limited) return limited;
  const data = await request.json().catch(() => null);
  const subject = typeof data?.subject === 'string' ? data.subject.trim() : '';
  const message = typeof data?.message === 'string' ? data.message.trim() : '';
  if (!subject || subject.length > 120 || !message || message.length > 2000) {
    return Response.json({ success: false, message: 'Enter a subject up to 120 characters and a message up to 2,000 characters.' }, { status: 400 });
  }
  await dbConnect();
  const result = await mongoose.connection.collection('supporttickets').insertOne({
    userId: new mongoose.Types.ObjectId(user.userId), subject, message, status: 'open', createdAt: new Date(),
  });
  return Response.json({ success: true, ticketId: String(result.insertedId), status: 'open' }, { status: 201 });
}
