import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import mongoose from 'mongoose';
import { requireAdmin } from '@/lib/admin/auth';
import { getMasterSettings, normalizeVideo } from '@/lib/admin/data';
import { syncContentFlags } from '@/lib/admin/content-flags';
import { cdnUrlForKey } from '@/lib/admin/media';
import { initialTranscodingFields } from '@/lib/admin/transcoding';
import dbConnect from '@/lib/db';
import s3 from '@/lib/s3';
import Content from '@/models/Content';
import Genre from '@/models/Genre';

const PART_SIZE = 10 * 1024 * 1024;

function safeName(name = 'video.mp4') {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 120);
}

async function resolveCategoryName(category) {
  const value = String(category || '').trim();
  if (!value) return 'General';

  if (mongoose.Types.ObjectId.isValid(value)) {
    const genreById = await Genre.findById(value).lean();
    if (genreById?.name) return genreById.name;
  }

  const genre = await Genre.findOne({
    $or: [{ slug: value }, { name: value }],
  }).lean();

  return genre?.name || value || 'General';
}

async function createVideoFromUpload(body, key, uploadId) {
  await dbConnect();
  const metadata = body.metadata || {};
  const title = String(metadata.title || body.fileName || 'Untitled video').trim();
  const category = await resolveCategoryName(metadata.category || 'General');
  const tags = Array.isArray(metadata.tags)
    ? metadata.tags
    : String(metadata.tags || '')
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);

  const rawVideoUrl = body.key ? cdnUrlForKey(body.key) : '';

  const content = await Content.create({
    title,
    description: metadata.description || '',
    type: metadata.type || 'movie',
    genres: [category],
    tags,
    thumbnailUrl: metadata.thumbnailUrl || '',
    pricing: metadata.pricing || 'free',
    scheduledPublishAt: metadata.scheduledPublishAt || null,
    isActive: true,
    isTrending: Boolean(metadata.isTrending),
    isBlockbuster: Boolean(metadata.isBlockbuster),
    isFeatured: Boolean(metadata.isFeatured),
    videoSource: {
      key,
      bucket: process.env.S3_BUCKET_NAME,
      size: body.fileSize || 0,
      contentType: body.contentType || 'video/mp4',
      uploadId,
    },
    ...initialTranscodingFields(rawVideoUrl),
  });

  await syncContentFlags(content, {
    isTrending: Boolean(metadata.isTrending),
    isBlockbuster: Boolean(metadata.isBlockbuster),
    isFeatured: Boolean(metadata.isFeatured),
  });

  return normalizeVideo(content.toObject());
}

export async function POST(request) {
  const { error } = await requireAdmin(request, ['super_admin', 'editor']);
  if (error) return error;

  try {
    const body = await request.json();
    const action = body.action || 'initiate';
    const settings = await getMasterSettings();
    const bucket = settings.storage?.bucket || process.env.S3_BUCKET_NAME;

    if (!bucket) {
      return Response.json(
        { success: false, message: 'S3 bucket is not configured' },
        { status: 400 }
      );
    }

    if (action === 'initiate') {
      if (!String(body.contentType || '').startsWith('video/')) {
        return Response.json(
          { success: false, message: 'Only video uploads are allowed' },
          { status: 400 }
        );
      }

      const key = `${settings.storage?.rawPrefix || 'raw-videos'}/${new Date()
        .toISOString()
        .slice(0, 10)}/${Date.now()}-${safeName(body.fileName)}`;

      const command = new CreateMultipartUploadCommand({
        Bucket: bucket,
        Key: key,
        ContentType: body.contentType || 'video/mp4',
        Metadata: {
          source: 'tvk-admin',
        },
      });
      const upload = await s3.send(command);

      return Response.json({
        success: true,
        key,
        uploadId: upload.UploadId,
        bucket,
        partSize: PART_SIZE,
      });
    }

    if (action === 'sign-part') {
      const command = new UploadPartCommand({
        Bucket: bucket,
        Key: body.key,
        UploadId: body.uploadId,
        PartNumber: Number(body.partNumber),
      });
      const url = await getSignedUrl(s3, command, { expiresIn: 60 * 15 });
      return Response.json({ success: true, url });
    }

    if (action === 'complete') {
      const parts = [...(body.parts || [])]
        .sort((a, b) => a.PartNumber - b.PartNumber)
        .map((part) => ({
          ETag: part.ETag,
          PartNumber: Number(part.PartNumber),
        }));

      await s3.send(
        new CompleteMultipartUploadCommand({
          Bucket: bucket,
          Key: body.key,
          UploadId: body.uploadId,
          MultipartUpload: { Parts: parts },
        })
      );

      const video = await createVideoFromUpload(body, body.key, body.uploadId);
      return Response.json({ success: true, video });
    }

    if (action === 'create-content') {
      const video = await createVideoFromUpload(body, body.key || '', body.uploadId || '');
      return Response.json({ success: true, video });
    }

    if (action === 'abort') {
      await s3.send(
        new AbortMultipartUploadCommand({
          Bucket: bucket,
          Key: body.key,
          UploadId: body.uploadId,
        })
      );
      return Response.json({ success: true });
    }

    return Response.json(
      { success: false, message: 'Unknown upload action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[admin/videos/upload] Error:', error);
    return Response.json(
      { success: false, message: error.message || 'Upload pipeline failed' },
      { status: 500 }
    );
  }
}
