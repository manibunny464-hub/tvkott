import { randomUUID } from 'node:crypto';
import { CreateMultipartUploadCommand } from '@aws-sdk/client-s3';
import { requireAdmin } from '@/lib/admin/auth';
import { getMasterSettings } from '@/lib/admin/data';
import s3 from '@/lib/s3';

export async function POST(request) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  try {
    const { filename, contentType, folder = 'uploads' } = await request.json();

    if (!filename || !contentType) {
      return Response.json(
        { success: false, message: 'filename and contentType are required' },
        { status: 400 }
      );
    }

    if (folder === 'trailers') {
      const { error } = await requireAdmin(request, 'trailers');
      if (error) return error;
      if (!['video/mp4', 'video/webm'].includes(contentType)) {
        return Response.json({ success: false, message: 'Choose an MP4 or WebM trailer.' }, { status: 400 });
      }
    }
    const settings = await getMasterSettings();
    const bucketName = settings?.storage?.bucket || process.env.S3_BUCKET_NAME;

    if (!bucketName) {
      return Response.json(
        { success: false, message: 'S3 bucket is not configured' },
        { status: 500 }
      );
    }

    const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `${folder}/${folder === "trailers" ? randomUUID() : Date.now()}-${cleanFilename}`;

    const command = new CreateMultipartUploadCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: contentType,
    });

    const result = await s3.send(command);

    // Build public URL
    let publicUrl = '';
    if (settings?.storage?.cdnUrl) {
      publicUrl = `${settings.storage.cdnUrl}/${key}`;
    } else {
      const region = settings?.storage?.region || process.env.AWS_REGION || 'us-east-1';
      publicUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
    }

    return Response.json({
      success: true,
      uploadId: result.UploadId,
      key,
      bucket: bucketName,
      url: publicUrl,
    });
  } catch (err) {
    console.error('[multipart/initiate] Error:', err);
    return Response.json(
      { success: false, message: 'Failed to initiate multipart upload' },
      { status: 500 }
    );
  }
}
