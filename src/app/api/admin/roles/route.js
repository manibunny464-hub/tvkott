import { requireAdmin, invalidateRoleCache } from '@/lib/admin/auth';
import dbConnect from '@/lib/db';
import Role from '@/models/Role';

export async function GET(request) {
  const { error } = await requireAdmin(request, 'roles');
  if (error) return error;

  try {
    await dbConnect();
    const roles = await Role.find({}).sort({ name: 1 }).lean();
    return Response.json({ success: true, roles });
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const { error } = await requireAdmin(request, 'roles');
  if (error) return error;

  try {
    const { name, description, permissions } = await request.json();
    if (!name) {
      return Response.json({ success: false, message: 'Role name is required' }, { status: 400 });
    }

    await dbConnect();
    const existing = await Role.findOne({ name });
    if (existing) {
      return Response.json({ success: false, message: 'Role already exists' }, { status: 409 });
    }

    const role = await Role.create({
      name,
      description,
      permissions: permissions || [],
    });

    invalidateRoleCache();

    return Response.json({ success: true, role });
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}
