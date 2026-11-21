import {
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
} from '@aws-sdk/client-s3';
import { requireAdmin } from '@/lib/admin/auth';
import { getMasterSettings } from '@/lib/admin/data';
import s3 from '@/lib/s3';

export async function POST(request) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  try {
    const { key, uploadId, parts, abort } = await request.json();

    if (!key || !uploadId) {
      return Response.json(
        { success: false, message: 'key and uploadId are required' },
        { status: 400 }
      );
    }

    const settings = await getMasterSettings();
    const bucketName = settings?.storage?.bucket || process.env.S3_BUCKET_NAME;

    if (!bucketName) {
      return Response.json(
        { success: false, message: 'S3 bucket is not configured' },
        { status: 500 }
      );
    }

    // Abort/cancel path
    if (abort) {
      const abortCommand = new AbortMultipartUploadCommand({
        Bucket: bucketName,
        Key: key,
        UploadId: uploadId,
      });
      await s3.send(abortCommand);
      return Response.json({ success: true, aborted: true });
    }

    // Complete path
    if (!parts || parts.length === 0) {
      return Response.json(
        { success: false, message: 'parts array is required for completion' },
        { status: 400 }
      );
    }

    const command = new CompleteMultipartUploadCommand({
      Bucket: bucketName,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts.map((p) => ({
          PartNumber: p.PartNumber,
          ETag: p.ETag,
        })),
      },
    });

    await s3.send(command);

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
      key,
      url: publicUrl,
    });
  } catch (err) {
    console.error('[multipart/complete] Error:', err);
    return Response.json(
      { success: false, message: 'Failed to complete multipart upload' },
      { status: 500 }
    );
  }
}
