import {
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  ListPartsCommand,
} from '@aws-sdk/client-s3';
import { requireAdmin } from '@/lib/admin/auth';
import { getMasterSettings } from '@/lib/admin/data';
import s3 from '@/lib/s3';

export async function POST(request) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  try {
    const { key, uploadId, parts, abort, expectedParts } = await request.json();

    if (!key || !uploadId) {
      return Response.json(
        { success: false, message: 'key and uploadId are required' },
        { status: 400 }
      );
    }

    const trailer = typeof key === 'string' && key.startsWith('trailers/');
    if (trailer) {
      const { error } = await requireAdmin(request, 'trailers');
      if (error) return error;
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

    let completedParts = parts;
    if (trailer && Number.isInteger(expectedParts) && expectedParts >= 2 && expectedParts <= 100) {
      const result = await s3.send(new ListPartsCommand({ Bucket: bucketName, Key: key, UploadId: uploadId }));
      completedParts = result.Parts || [];
      if (completedParts.length !== expectedParts ||
          completedParts.some((part, index) => part.PartNumber !== index + 1 || !part.ETag)) {
        return Response.json({ success: false, message: 'Some trailer parts are missing. Retry the upload.' }, { status: 409 });
      }
    }
    // Complete path
    if (!completedParts || completedParts.length === 0) {
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
        Parts: completedParts.map((p) => ({
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
