import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
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

    const settings = await getMasterSettings();
    const bucketName = settings?.storage?.bucket || process.env.S3_BUCKET_NAME;

    if (!bucketName) {
      return Response.json(
        { success: false, message: 'S3 bucket is not configured in master settings or env' },
        { status: 500 }
      );
    }

    const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `${folder}/${Date.now()}-${cleanFilename}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: contentType,
    });

    // Generate url valid for 15 minutes
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 900 });

    // Build public URL / CDN URL
    let publicUrl = '';
    if (settings?.storage?.cdnUrl) {
      publicUrl = `${settings.storage.cdnUrl}/${key}`;
    } else {
      const region = settings?.storage?.region || process.env.AWS_REGION || 'us-east-1';
      publicUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
    }

    return Response.json({
      success: true,
      uploadUrl,
      key,
      url: publicUrl,
    });
  } catch (err) {
    console.error('[presigned] Error generating S3 presigned URL:', err);
    return Response.json(
      { success: false, message: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}
