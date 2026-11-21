import { requireAdmin, hashPassword } from '@/lib/admin/auth';
import dbConnect from '@/lib/db';
import AdminUser from '@/models/AdminUser';

export async function GET(request, { params }) {
  const { error } = await requireAdmin(request, 'roles');
  if (error) return error;

  try {
    const { id } = await params;
    await dbConnect();
    const admin = await AdminUser.findById(id).select('-password').lean();
    if (!admin) {
      return Response.json({ success: false, message: 'Sub-admin not found' }, { status: 404 });
    }
    return Response.json({ success: true, admin });
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const { error } = await requireAdmin(request, 'roles');
  if (error) return error;

  try {
    const { id } = await params;
    const { name, email, password, role, isActive } = await request.json();

    if (!name || !email || !role) {
      return Response.json({ success: false, message: 'Name, email, and role are required' }, { status: 400 });
    }

    await dbConnect();
    const admin = await AdminUser.findById(id);
    if (!admin) {
      return Response.json({ success: false, message: 'Sub-admin not found' }, { status: 404 });
    }

    // Protect super admin setup (env email match)
    if (admin.email === process.env.ADMIN_EMAIL?.toLowerCase() && role !== 'super_admin') {
      return Response.json({ success: false, message: 'Cannot demote super admin' }, { status: 400 });
    }

    admin.name = name;
    admin.email = email.toLowerCase().trim();
    admin.role = role;
    if (isActive !== undefined) {
      admin.isActive = Boolean(isActive);
    }
    if (password) {
      admin.password = hashPassword(password);
    }
    await admin.save();

    const adminObj = admin.toObject();
    delete adminObj.password;

    return Response.json({ success: true, admin: adminObj });
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { error } = await requireAdmin(request, 'roles');
  if (error) return error;

  try {
    const { id } = await params;
    await dbConnect();
    const admin = await AdminUser.findById(id);
    if (!admin) {
      return Response.json({ success: false, message: 'Sub-admin not found' }, { status: 404 });
    }

    if (admin.email === process.env.ADMIN_EMAIL?.toLowerCase()) {
      return Response.json({ success: false, message: 'Cannot delete primary super admin' }, { status: 400 });
    }

    await AdminUser.findByIdAndDelete(id);
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}
