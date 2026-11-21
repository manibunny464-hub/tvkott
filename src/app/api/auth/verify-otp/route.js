import dbConnect from '@/lib/db';
import { signToken } from '@/lib/jwt';
import Otp from '@/models/Otp';
import User from '@/models/User';
import { authErrorResponse } from '@/lib/authErrors';
import { randomUUID } from 'crypto';

export async function POST(request) {
  try {
    const body = await request.json();
    const phone = String(body?.phone ?? '').trim();
    const otp = String(body?.otp ?? '').trim();
    const deviceId = typeof body?.deviceId === 'string' ? body.deviceId.trim() : '';

    if (!process.env.JWT_SECRET) {
      return Response.json({ success: false, code: 'AUTH_CONFIGURATION_ERROR',
        message: 'Login service is not configured' }, { status: 503 });
    }

    if (!phone || !/^\d{10}$/.test(phone)) {
      return Response.json(
        { success: false, message: 'A valid 10-digit phone number is required' },
        { status: 400 }
      );
    }

    if (!otp || !/^\d{4}$/.test(otp)) {
      return Response.json(
        { success: false, message: 'A valid 4-digit OTP is required' },
        { status: 400 }
      );
    }

    await dbConnect({ skipMaintenance: true });

    // Look for active unexpired OTP record for this phone
    const activeOtp = await Otp.findOne({
      phone,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    }).sort({ expiresAt: -1 });

    if (!activeOtp) {
      return Response.json(
        { success: false, message: 'Invalid or expired OTP' },
        { status: 400 }
      );
    }

    // Check maximum failed attempts
    if ((activeOtp.attempts || 0) >= 5) {
      activeOtp.isUsed = true;
      await activeOtp.save();
      return Response.json(
        { success: false, message: 'Too many incorrect attempts. Please request a new OTP.' },
        { status: 429 }
      );
    }

    // Verify OTP value
    if (activeOtp.otp !== String(otp)) {
      activeOtp.attempts = (activeOtp.attempts || 0) + 1;
      if (activeOtp.attempts >= 5) {
        activeOtp.isUsed = true;
      }
      await activeOtp.save();
      return Response.json(
        { success: false, message: 'Invalid OTP' },
        { status: 400 }
      );
    }

    let user = await User.findOne({ phone }).select('_id phone name contentLanguages');
    let isNewUser = false;

    if (!user) {
      try {
        user = await User.create({ phone });
        isNewUser = true;
      } catch (error) {
        if (error.code !== 11000) throw error;
        user = await User.findOne({ phone }).select('_id phone name contentLanguages');
        if (!user) throw error;
      }
    }

    // Register active device session safely
    const finalDeviceId = deviceId || randomUUID();
    const { enforceDeviceSession } = await import('@/lib/subscription/entitlementService');
    const session = await enforceDeviceSession(user._id, finalDeviceId, request.headers.get('user-agent') || 'Mobile Device', 10);
    if (!session.success) {
      return Response.json({ success: false, message: 'Unable to register login session. Please retry.' }, { status: 503 });
    }

    const token = signToken(
      { userId: user._id.toString(), phone: user.phone, deviceId: finalDeviceId },
      { expiresIn: '30d' }
    );

    const hasSelectedLanguages = Array.isArray(user.contentLanguages) && user.contentLanguages.length > 0;

    // Consume only after token/session preparation succeeds; concurrent replays lose atomically.
    const consumed = await Otp.updateOne({
      _id: activeOtp._id, isUsed: false, attempts: { $not: { $gte: 5 } }, expiresAt: { $gt: new Date() },
    }, { $set: { isUsed: true } });
    if (consumed.modifiedCount !== 1) {
      return Response.json({ success: false, message: 'Invalid or expired OTP' }, { status: 400 });
    }

    return Response.json({
      success: true,
      token,
      isNewUser,
      hasSelectedLanguages,
      user: {
        id: user._id.toString(),
        phone: user.phone,
        name: user.name ?? null,
      },
    });
  } catch (error) {
    return authErrorResponse(error, 'verify-otp');
  }
}
