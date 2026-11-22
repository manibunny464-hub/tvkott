import { HeadObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import s3 from '@/lib/s3';

function safeName(name = 'file') {
  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 120);
}

export function cdnUrlForKey(key, bucket = process.env.S3_BUCKET_NAME) {
  if (!key) return '';
  const cdnUrl = process.env.CDN_URL || process.env.CLOUDFRONT_URL || '';
  if (cdnUrl) return `${cdnUrl.replace(/\/$/, '')}/${key}`;
  return `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

export async function uploadFormFile(file, folder) {
  if (!file || typeof file === 'string') return { url: '', key: '' };

  const buffer = Buffer.from(await file.arrayBuffer());
  const key = `${folder}/${Date.now()}-${safeName(file.name)}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type || 'application/octet-stream',
    })
  );

  return { key, url: cdnUrlForKey(key) };
}

export async function verifiedTrailerUrl(key, storage) {
  if (typeof key !== 'string' || !/^trailers\/[a-zA-Z0-9._-]+$/.test(key)) return null;
  const bucket = storage?.bucket || process.env.S3_BUCKET_NAME;
  if (!bucket) throw new Error('Trailer storage is not configured.');
  const result = await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
  if (!result.ContentLength || !['video/mp4', 'video/webm'].includes(result.ContentType)) return null;
  const cdn = storage?.cdnUrl || process.env.CDN_URL || process.env.CLOUDFRONT_URL;
  return cdn ? `${cdn.replace(/\/$/, '')}/${key}`
    : `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}
