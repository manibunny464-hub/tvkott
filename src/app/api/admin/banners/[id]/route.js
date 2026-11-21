import { requireAdmin } from '@/lib/admin/auth';
import { optionalObjectId, readBody, softDeletePatch, toBoolean } from '@/lib/admin/api';
import { uploadFormFile } from '@/lib/admin/media';
import dbConnect from '@/lib/db';
import Banner from '@/models/Banner';
import Content from '@/models/Content';

export async function PUT(request, { params }) {
  const { error } = await requireAdmin(request, ['super_admin', 'editor']);
  if (error) return error;

  const { id } = await params;
  const { formData, data } = await readBody(request);
  const uploaded = await uploadFormFile(formData?.get('image'), 'banners');

  await dbConnect();

  let title = data.title;
  let subtitle = data.subtitle || '';
  if (data.linkedContentId) {
    const content = await Content.findById(data.linkedContentId).lean();
    if (content) {
      if (!title) title = content.title;
      if (!subtitle) subtitle = content.description || '';
      // Also update isFeatured flag on the referenced series
      await Content.findByIdAndUpdate(content._id, { $set: { isFeatured: true } });
    }
  }

  const updateObj = {
    title: title || 'Untitled Banner',
    subtitle: subtitle || '',
    linkedContentId: optionalObjectId(data.linkedContentId),
    linkedContentType: data.linkedContentType || 'series',
    order: Number(data.order || 0),
    isActive: toBoolean(data.isActive, true),
  };

  const imageVal = uploaded.url || data.imageUrl;
  if (imageVal !== undefined) {
    updateObj.imageUrl = imageVal;
  }

  const banner = await Banner.findByIdAndUpdate(
    id,
    { $set: updateObj },
    { returnDocument: 'after', runValidators: true }
  );

  return Response.json({ success: true, banner });
}

export async function DELETE(request, { params }) {
  const { error } = await requireAdmin(request, ['super_admin']);
  if (error) return error;

  const { id } = await params;
  await dbConnect();

  const banner = await Banner.findById(id).lean();
  if (banner && banner.linkedContentId) {
    // Turn off isFeatured on the referenced content
    await Content.findByIdAndUpdate(banner.linkedContentId, { $set: { isFeatured: false } });
  }

  await Banner.findByIdAndUpdate(id, { $set: softDeletePatch() });
  return Response.json({ success: true });
}
