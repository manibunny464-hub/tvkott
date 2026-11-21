import { requireAdmin, invalidateRoleCache } from '@/lib/admin/auth';
import dbConnect from '@/lib/db';
import Role from '@/models/Role';

export async function GET(request, { params }) {
  const { error } = await requireAdmin(request, 'roles');
  if (error) return error;

  try {
    const { id } = await params;
    await dbConnect();
    const role = await Role.findById(id).lean();
    if (!role) {
      return Response.json({ success: false, message: 'Role not found' }, { status: 404 });
    }
    return Response.json({ success: true, role });
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const { error } = await requireAdmin(request, 'roles');
  if (error) return error;

  try {
    const { id } = await params;
    const { name, description, permissions } = await request.json();

    if (!name) {
      return Response.json({ success: false, message: 'Role name is required' }, { status: 400 });
    }

    await dbConnect();
    const role = await Role.findById(id);
    if (!role) {
      return Response.json({ success: false, message: 'Role not found' }, { status: 404 });
    }

    if (role.name === 'super_admin') {
      return Response.json({ success: false, message: 'Cannot modify super_admin role' }, { status: 400 });
    }

    role.name = name;
    role.description = description;
    role.permissions = permissions || [];
    await role.save();

    invalidateRoleCache();

    return Response.json({ success: true, role });
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
    const role = await Role.findById(id);
    if (!role) {
      return Response.json({ success: false, message: 'Role not found' }, { status: 404 });
    }

    if (role.name === 'super_admin') {
      return Response.json({ success: false, message: 'Cannot delete super_admin role' }, { status: 400 });
    }

    await Role.findByIdAndDelete(id);

    invalidateRoleCache();

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
}
