import { validateBannerFields } from '@/lib/admin/banner-fields';
import { requireAdmin } from '@/lib/admin/auth';
import { optionalObjectId, readBody, softDeletePatch, toBoolean } from '@/lib/admin/api';
import { uploadFormFile } from '@/lib/admin/media';
import dbConnect from '@/lib/db';
import Banner from '@/models/Banner';
import Content from '@/models/Content';

export async function GET(request, { params }) {
  const { error } = await requireAdmin(request);
  if (error) return error;
  const { id } = await params;
  if (!optionalObjectId(id)) return Response.json({ success: false, message: 'Invalid banner.' }, { status: 400 });
  await dbConnect();
  const banner = await Banner.findOne({ _id: id, isDeleted: { $ne: true } }).lean();
  return banner ? Response.json({ success: true, banner })
    : Response.json({ success: false, message: 'Banner not found.' }, { status: 404 });
}

export async function PUT(request, { params }) {
  const { error } = await requireAdmin(request, ['super_admin', 'editor']);
  if (error) return error;

  const { id } = await params;
  const { formData, data } = await readBody(request);
  await dbConnect();

  const image = formData?.get('image');
  const validation = await validateBannerFields(data, image);
  if (validation) return Response.json({ success: false, message: validation }, { status: 400 });
  let uploaded;
  try {
    uploaded = await uploadFormFile(image, 'banners');
  } catch {
    return Response.json({ success: false, message: 'Artwork upload failed. Check storage and retry.' }, { status: 502 });
  }
  let title = data.title;
  let subtitle = data.subtitle || '';
  if (data.linkedContentId) {
    const content = await Content.findById(data.linkedContentId).lean();
    if (content) {
      if (!title) title = content.title;
      if (!subtitle) subtitle = content.description || '';
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

  const banner = await Banner.findOneAndUpdate(
    { _id: id, isDeleted: { $ne: true } },
    { $set: updateObj },
    { returnDocument: 'after', runValidators: true }
  );

  return banner ? Response.json({ success: true, banner })
    : Response.json({ success: false, message: 'Banner not found.' }, { status: 404 });
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
