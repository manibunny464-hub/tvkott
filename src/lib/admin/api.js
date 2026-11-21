import mongoose from 'mongoose';

export function parsePagination(request, fallbackLimit = 20) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(Number(searchParams.get('page') || 1), 1);
  const limit = Math.min(Math.max(Number(searchParams.get('limit') || fallbackLimit), 1), 100);
  const skip = (page - 1) * limit;
  return { searchParams, page, limit, skip };
}

export function paginationMeta(page, limit, total) {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export function softDeletePatch() {
  return { isDeleted: true, isActive: false, deletedAt: new Date() };
}

export function activeQuery(extra = {}) {
  return { isDeleted: { $ne: true }, ...extra };
}

export function optionalObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value) ? value : undefined;
}

export function toArray(value) {
  if (Array.isArray(value)) return value;
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function toBoolean(value, fallback = false) {
  if (typeof value === 'boolean') return value;
  if (value === undefined || value === null || value === '') return fallback;
  return ['true', '1', 'yes', 'on'].includes(String(value).toLowerCase());
}

export async function readBody(request) {
  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    return {
      type: 'form',
      formData,
      data: Object.fromEntries(
        [...formData.entries()].filter(([, value]) => typeof value === 'string')
      ),
    };
  }

  const data = await request.json().catch(() => ({}));
  return { type: 'json', formData: null, data };
}
