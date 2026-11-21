import { PutObjectCommand } from '@aws-sdk/client-s3';
import { cdnUrlForKey } from '@/lib/admin/media';
import { requireAdmin } from '@/lib/admin/auth';
import { requireAuth } from '@/lib/authMiddleware';
import s3 from '@/lib/s3';

const ALLOWED_EXTENSIONS = new Set([
  'jpg', 'jpeg', 'png', 'webp', 'gif', 'svg',
  'mp4', 'mkv', 'webm', 'mov',
  'vtt', 'srt',
  'mp3', 'aac', 'wav',
  'json', 'pdf'
]);

export async function POST(request) {
  try {
    const adminAuth = await requireAdmin(request);
    let isAuthorized = !adminAuth.error;
    if (!isAuthorized) {
      const userAuth = await requireAuth(request);
      isAuthorized = Boolean(userAuth?.success);
    }

    if (!isAuthorized) {
      return Response.json(
        { success: false, message: 'Authentication required to upload' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const folder = formData.get('folder') || 'uploads';

    if (!file || typeof file === 'string') {
      return Response.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return Response.json(
        { success: false, message: `File type .${ext} is not permitted` },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Max 30MB for standard POST buffer upload
    if (buffer.length > 30 * 1024 * 1024) {
      return Response.json(
        { success: false, message: 'File exceeds 30MB limit' },
        { status: 400 }
      );
    }

    const safeFolder = String(folder).replace(/[^a-zA-Z0-9_\-]/g, '') || 'uploads';
    const cleanFilename = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const key = `${safeFolder}/${Date.now()}-${cleanFilename}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: file.type || `application/octet-stream`,
      })
    );

    const url = cdnUrlForKey(key);

    return Response.json({ success: true, url, key });
  } catch (error) {
    console.error('[upload] Error:', error);
    return Response.json(
      { success: false, message: 'Upload failed' },
      { status: 500 }
    );
  }
}
