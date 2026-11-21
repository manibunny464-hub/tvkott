import { UploadPartCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { requireAdmin } from '@/lib/admin/auth';
import { getMasterSettings } from '@/lib/admin/data';
import s3 from '@/lib/s3';

export async function POST(request) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  try {
    const { key, uploadId, partNumber } = await request.json();

    if (!key || !uploadId || !partNumber) {
      return Response.json(
        { success: false, message: 'key, uploadId and partNumber are required' },
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

    const command = new UploadPartCommand({
      Bucket: bucketName,
      Key: key,
      UploadId: uploadId,
      PartNumber: partNumber,
    });

    // Generate a presigned URL for this part upload (valid 15 minutes)
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 900 });

    return Response.json({
      success: true,
      signedUrl,
      partNumber,
    });
  } catch (err) {
    console.error('[multipart/part-url] Error:', err);
    return Response.json(
      { success: false, message: 'Failed to generate part presigned URL' },
      { status: 500 }
    );
  }
}
