import { requireAuth } from '@/lib/authMiddleware';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(request) {
  const auth = await requireAuth(request);
  
  if (!auth.success) {
    return Response.json(
      { success: false, message: auth.message },
      { status: 401 }
    );
  }

  if (auth.user.userId) {
    await dbConnect();
    await User.findByIdAndUpdate(auth.user.userId, { $unset: { currentDeviceId: 1 } });
  }

  // JWT is stateless — client must discard the token on their side
  return Response.json(
    { success: true, message: 'Logged out successfully' },
    { status: 200 }
  );
}
