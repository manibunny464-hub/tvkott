import { requireAdmin } from '@/lib/admin/auth';
import { getMasterSettings, sanitizeSettingsPayload, invalidateMasterSettingsCache } from '@/lib/admin/data';
import dbConnect from '@/lib/db';
import AdminSetting from '@/models/AdminSetting';

export async function GET(request) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const settings = await getMasterSettings();
  return Response.json({ success: true, settings });
}

export async function PUT(request) {
  const { error } = await requireAdmin(request, ['super_admin']);
  if (error) return error;

  try {
    const payload = await request.json();
    const sanitized = sanitizeSettingsPayload(payload);
    await dbConnect();

    const settings = await AdminSetting.findOneAndUpdate(
      { key: 'master-app-settings' },
      { $set: sanitized },
      { upsert: true, returnDocument: 'after' }
    ).lean();

    invalidateMasterSettingsCache();

    return Response.json({ success: true, settings });
  } catch (error) {
    console.error('[admin/settings] Error:', error);
    return Response.json(
      { success: false, message: 'Failed to save settings' },
      { status: 500 }
    );
  }
}
