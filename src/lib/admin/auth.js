import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/db';
import AdminUser from '@/models/AdminUser';
import Role from '@/models/Role';
import AuditLog from '@/models/AuditLog';
import { ADMIN_COOKIE_NAME } from '@/lib/admin/defaults';
import { signToken, verifyToken } from '@/lib/jwt';

const loginAttempts = new Map();

export function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export function comparePassword(password, hash) {
  const inputHash = hashPassword(password);
  return crypto.timingSafeEqual(Buffer.from(inputHash), Buffer.from(hash));
}

function getClientKey(request) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'local'
  );
}

export function assertAuthRateLimit(request) {
  const key = getClientKey(request);
  const now = Date.now();
  const current = loginAttempts.get(key) || { count: 0, resetAt: now + 60_000 };

  if (current.resetAt < now) {
    loginAttempts.set(key, { count: 1, resetAt: now + 60_000 });
    return null;
  }

  if (current.count >= 8) {
    return NextResponse.json(
      { success: false, message: 'Too many login attempts. Try again shortly.' },
      { status: 429 }
    );
  }

  loginAttempts.set(key, { ...current, count: current.count + 1 });
  return null;
}

export function resetAuthRateLimit(request) {
  loginAttempts.delete(getClientKey(request));
}

export function getConfiguredAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) return null;

  return {
    id: 'env-super-admin',
    email: email.toLowerCase(),
    password, // Raw password from env
    name: process.env.ADMIN_NAME || 'Chirpii Admin',
    role: process.env.ADMIN_ROLE || 'super_admin',
  };
}

export function createAdminToken(admin) {
  return signToken(
    {
      type: 'admin',
      adminId: admin.id || admin._id?.toString(),
      email: admin.email,
      name: admin.name,
      role: admin.role,
    },
    { expiresIn: '8h' }
  );
}

export function getAdminCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8,
  };
}

export function verifyAdminToken(token) {
  if (!token) return null;
  const decoded = verifyToken(token);
  if (!decoded || decoded.type !== 'admin') return null;

  return {
    id: decoded.adminId,
    email: decoded.email,
    name: decoded.name,
    role: decoded.role,
  };
}

export function getAdminFromRequest(request) {
  const cookieToken = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const authHeader = request.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  return verifyAdminToken(cookieToken || bearerToken);
}

const roleCache = new Map();
const ROLE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function invalidateRoleCache() {
  roleCache.clear();
}

export async function getRolePermissions(roleName) {
  if (!roleName) return [];
  if (roleName === 'super_admin') {
    return [
      '*',
      'dashboard', 'series', 'movies', 'seasons', 'episodes', 'bulk-episodes',
      'trailers', 'trailers-admin', 'banners', 'content', 'users', 'subscribers',
      'plans', 'categories', 'languages', 'analytics', 'revenue', 'transactions',
      'notifications', 'settings', 'master-app-settings', 'cms', 'artists', 'roles',
      'featured', 'trending', 'blockbusters', 'videos', 'bulk-upload', 'coming-soon'
    ];
  }

  const cached = roleCache.get(roleName);
  if (cached && Date.now() < cached.expiry) {
    return cached.perms;
  }

  try {
    await dbConnect();
    const roleDoc = await Role.findOne({ name: roleName }).lean();
    let perms = roleDoc ? roleDoc.permissions || [] : [];
    if (perms.includes('content')) {
      const contentSubPerms = ['series', 'seasons', 'episodes', 'bulk-episodes', 'trailers', 'banners', 'trailers-admin'];
      perms = Array.from(new Set([...perms, ...contentSubPerms]));
    }
    roleCache.set(roleName, { perms, expiry: Date.now() + ROLE_CACHE_TTL });
    return perms;
  } catch (err) {
    return [];
  }
}

export async function hasPermission(admin, requiredPermission) {
  if (!admin) return false;
  if (admin.role === 'super_admin') return true;

  if (Array.isArray(requiredPermission)) {
    if (requiredPermission.includes(admin.role)) return true;
    for (const perm of requiredPermission) {
      if (await hasPermission(admin, perm)) return true;
    }
    return false;
  }

  if (admin.role === requiredPermission) return true;

  const perms = await getRolePermissions(admin.role);
  if (perms.includes('*') || perms.includes(requiredPermission)) return true;

  const contentSubPerms = ['series', 'seasons', 'episodes', 'bulk-episodes', 'trailers', 'banners', 'trailers-admin'];
  if (perms.includes('content') && contentSubPerms.includes(requiredPermission)) {
    return true;
  }

  return false;
}

export async function requireAdmin(request, requiredPermission = null) {
  const admin = getAdminFromRequest(request);

  if (!admin) {
    return {
      error: NextResponse.json(
        { success: false, message: 'Admin authentication required' },
        { status: 401 }
      ),
    };
  }

  if (requiredPermission) {
    const allowed = await hasPermission(admin, requiredPermission);
    if (!allowed) {
      return {
        error: NextResponse.json(
          { success: false, message: `You do not have permission (${requiredPermission}) for this action` },
          { status: 403 }
        ),
      };
    }
  }

  return { admin };
}

export async function getAdminFromCookies() {
  const cookieStore = await cookies();
  return verifyAdminToken(cookieStore.get(ADMIN_COOKIE_NAME)?.value);
}

export async function requireAdminPage() {
  const admin = await getAdminFromCookies();
  if (!admin) redirect('/admin/login');
  
  try {
    admin.permissions = await getRolePermissions(admin.role);
  } catch (err) {
    admin.permissions = [];
  }
  return admin;
}

export async function redirectIfAdmin() {
  const admin = await getAdminFromCookies();
  if (admin) redirect('/admin');
}

export async function writeAuditLog({ user, role, action, module, entityId = null, oldData = null, newData = null, request = null }) {
  try {
    await dbConnect();
    let ipAddress = 'unknown';
    let device = 'unknown';
    if (request) {
      ipAddress = getClientKey(request);
      device = request.headers.get('user-agent') || 'unknown';
    }
    await AuditLog.create({
      user,
      role,
      action,
      module,
      entityId: entityId ? String(entityId) : undefined,
      oldData,
      newData,
      ipAddress,
      device,
    });
  } catch (error) {
    console.error('[writeAuditLog] Failed to write audit log:', error);
  }
}
