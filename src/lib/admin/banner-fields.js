import Content from '@/models/Content';
import { optionalObjectId } from '@/lib/admin/api';

export async function validateBannerFields(data, image) {
  const order = Number(data.order ?? 0);
  if (!Number.isSafeInteger(order) || order < 0) return 'Choose a non-negative display priority.';
  if (image && (typeof image === 'string' || !['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(image.type) ||
    !image.size || image.size > 10 * 1024 * 1024)) return 'Choose a JPEG, PNG, WebP, or AVIF image under 10 MB.';
  if (!data.linkedContentId) return null;
  if (!optionalObjectId(data.linkedContentId) || !['movie', 'series', 'short'].includes(data.linkedContentType) ||
    !await Content.exists({ _id: data.linkedContentId, type: data.linkedContentType, isDeleted: { $ne: true } })) {
    return 'Choose an existing title of the selected content type.';
  }
  return null;
}
