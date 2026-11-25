import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import AdminUser from '@/models/AdminUser';
import Role from '@/models/Role';
import {
  assertAuthRateLimit,
  createAdminToken,
  getAdminCookieOptions,
  getConfiguredAdmin,
  resetAuthRateLimit,
  comparePassword,
  hashPassword,
  writeAuditLog,
} from '@/lib/admin/auth';
import { ADMIN_COOKIE_NAME } from '@/lib/admin/defaults';

export async function POST(request) {
  const limited = assertAuthRateLimit(request);
  if (limited) return limited;

  try {
    const { email, password } = (await request.json().catch(() => null)) ?? {};

    if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    await dbConnect({ skipMaintenance: true });
    const cleanEmail = email.toLowerCase().trim();

    // 1. Check if user exists in database
    let admin = await AdminUser.findOne({ email: cleanEmail });

    if (admin) {
      // Check account locking
      if (admin.lockedUntil && admin.lockedUntil > new Date()) {
        const remainingMinutes = Math.ceil((admin.lockedUntil - new Date()) / 60000);
        return NextResponse.json(
          { success: false, message: `Account is locked. Try again in ${remainingMinutes} minutes.` },
          { status: 423 }
        );
      }

      // Verify password
      const isOk = comparePassword(password, admin.password);
      if (!isOk) {
        admin.failedLoginAttempts += 1;
        if (admin.failedLoginAttempts >= 5) {
          admin.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // lock for 15 minutes
        }
        await admin.save();

        return NextResponse.json(
          { success: false, message: 'Invalid admin credentials' },
          { status: 401 }
        );
      }

      // Reset failed attempts
      if (admin.failedLoginAttempts > 0 || admin.lockedUntil) {
        admin.failedLoginAttempts = 0;
        admin.lockedUntil = undefined;
        await admin.save();
      }
    } else {
      // 2. Fall back to environment credentials
      const envAdmin = getConfiguredAdmin();
      if (!envAdmin) {
        return NextResponse.json(
          { success: false, message: 'Admin user not found' },
          { status: 401 }
        );
      }

      const emailOk = cleanEmail === envAdmin.email;
      const passwordOk = password === envAdmin.password;

      if (!emailOk || !passwordOk) {
        return NextResponse.json(
          { success: false, message: 'Invalid admin credentials' },
          { status: 401 }
        );
      }

      // Seed this super admin and a super_admin role into the database for DB continuity
      let superRole = await Role.findOne({ name: 'super_admin' });
      if (!superRole) {
        superRole = await Role.create({
          name: 'super_admin',
          description: 'Full system access',
          permissions: ['*'],
        });
      }

      admin = await AdminUser.create({
        name: envAdmin.name,
        email: envAdmin.email,
        password: hashPassword(envAdmin.password),
        role: 'super_admin',
        isActive: true,
      });
    }

    if (!admin.isActive) {
      return NextResponse.json(
        { success: false, message: 'Account is deactivated' },
        { status: 403 }
      );
    }

    resetAuthRateLimit(request);
    const token = createAdminToken(admin);

    // Write audit log for login
    await writeAuditLog({
      user: admin.email,
      role: admin.role,
      action: 'Login',
      module: 'auth',
      request,
    });

    const response = NextResponse.json({
      success: true,
      admin: {
        id: admin._id.toString(),
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });

    response.cookies.set(ADMIN_COOKIE_NAME, token, getAdminCookieOptions());
    return response;
  } catch (error) {
    console.error('[admin/auth/login] Error:', error);
    if (error.name === 'MongooseServerSelectionError' || error.name === 'MongoNetworkError') {
      return NextResponse.json(
        { success: false, message: 'The login database is unavailable. Please try again shortly.' },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { success: false, message: 'Login failed' },
      { status: 500 }
    );
  }
}
