import mongoose from 'mongoose';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { requireAdmin } from '@/lib/admin/auth';
import { getMasterSettings } from '@/lib/admin/data';
import dbConnect from '@/lib/db';
import s3 from '@/lib/s3';
import Content from '@/models/Content';
import SeasonTrailer from '@/models/SeasonTrailer';

const headers = { 'Cache-Control': 'private, no-store' };
const notFound = () => Response.json({ success: false, message: 'Trailer preview unavailable.' }, { status: 404, headers });

export async function GET(request, { params }) {
  const { error } = await requireAdmin(request, 'trailers');
  if (error) return error;

  const { id } = await params;
  if (!mongoose.isObjectIdOrHexString(id)) return notFound();
  const language = new URL(request.url).searchParams.get('language');
  await dbConnect();

  let savedUrl;
  let key;
  if (language === null) {
    const trailer = await SeasonTrailer.findById(id).select('videoKey videoUrl').lean();
    ({ videoKey: key, videoUrl: savedUrl } = trailer || {});
  } else {
    const movie = await Content.findOne({ _id: id, type: 'movie', isDeleted: { $ne: true } })
      .select('+localizations +primaryLanguage trailerUrl').lean();
    const locale = movie?.localizations?.find(row => row.language === language);
    savedUrl = locale?.trailerUrl ?? (movie?.primaryLanguage === language ? movie?.trailerUrl : null);
  }
  if (!key && !savedUrl) return notFound();

  const { storage } = await getMasterSettings();
  const Bucket = storage?.bucket || process.env.S3_BUCKET_NAME;
  const bases = [
    `https://${Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com`,
    storage?.cdnUrl, process.env.CDN_URL, process.env.CLOUDFRONT_URL,
  ].filter(Boolean).map(base => base.replace(/\/$/, '') + '/');
  if (!key) {
    const base = bases.find(candidate => savedUrl.startsWith(candidate));
    if (base) key = savedUrl.slice(base.length).split('?')[0];
    else if (savedUrl.startsWith('trailers/')) key = savedUrl;
    else if (savedUrl.startsWith('https://')) return new Response(null, { status: 307, headers: { ...headers, Location: savedUrl } });
  }
  if (!Bucket || !/^trailers\/[a-zA-Z0-9._-]+$/.test(key || '')) return notFound();

  try {
    const url = await getSignedUrl(s3, new GetObjectCommand({ Bucket, Key: key }), { expiresIn: 3600 });
    return new Response(null, { status: 307, headers: { ...headers, Location: url } });
  } catch {
    return Response.json({ success: false, message: 'Could not sign trailer preview.' }, { status: 502, headers });
  }
}
