import crypto from 'crypto';
import dbConnect from '@/lib/db';
import Otp from '@/models/Otp';
import { authErrorResponse } from '@/lib/authErrors';

export async function POST(request) {
  try {
    const body = await request.json();
    const phone = String(body?.phone ?? '').trim();

    if (!phone || !/^\d{10}$/.test(phone)) {
      return Response.json(
        { success: false, message: 'A valid 10-digit phone number is required' },
        { status: 400 }
      );
    }

    await dbConnect({ skipMaintenance: true });

    // Rate-limit: 1 OTP request every 45 seconds per phone number
    const recentOtp = await Otp.findOne({
      phone,
      createdAt: { $gt: new Date(Date.now() - 45 * 1000) },
    }).select('_id').lean();

    if (recentOtp) {
      return Response.json(
        { success: false, message: 'Please wait 45 seconds before requesting another OTP.' },
        { status: 429 }
      );
    }

    // Cryptographically secure random 4-digit code if no DEFAULT_OTP
    const otp = process.env.DEFAULT_OTP || String(crypto.randomInt(1000, 10000));
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.create({ phone, otp, expiresAt });

    // TODO: replace with real SMS provider

    return Response.json({ success: true, message: 'OTP sent' });
  } catch (error) {
    return authErrorResponse(error, 'send-otp');
  }
}
