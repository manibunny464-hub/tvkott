import { requireAdmin, hashPassword } from '@/lib/admin/auth';
import dbConnect from '@/lib/db';
import AdminUser from '@/models/AdminUser';

export async function GET(request) {
  const { error } = await requireAdmin(request, 'roles');
  if (error) return error;

  try {
    await dbConnect();
    const admins = await AdminUser.find({}).select('-password').sort({ name: 1 }).lean();
    return Response.json({ success: true, admins });
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const { error } = await requireAdmin(request, 'roles');
  if (error) return error;

  try {
    const { name, email, password, role } = await request.json();
    if (!name || !email || !password || !role) {
      return Response.json({ success: false, message: 'All fields are required' }, { status: 400 });
    }

    await dbConnect();
    const existing = await AdminUser.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return Response.json({ success: false, message: 'Email already registered' }, { status: 409 });
    }

    const admin = await AdminUser.create({
      name,
      email: email.toLowerCase().trim(),
      password: hashPassword(password),
      role,
      isActive: true,
    });

    const adminObj = admin.toObject();
    delete adminObj.password;

    return Response.json({ success: true, admin: adminObj });
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}
