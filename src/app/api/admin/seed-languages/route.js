import fs from 'fs';
import path from 'path';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import s3 from '@/lib/s3';
import dbConnect from '@/lib/db';
import Language from '@/models/Language';

const LANGUAGES = [
  { code: 'hi', englishName: 'Hindi',     nativeName: 'हिन्दी',   file: 'hindi.jpeg',     order: 1 },
  { code: 'te', englishName: 'Telugu',    nativeName: 'తెలుగు',   file: 'telugu.jpeg',    order: 2 },
  { code: 'ta', englishName: 'Tamil',     nativeName: 'தமிழ்',    file: 'tamil.jpeg',     order: 3 },
  { code: 'ml', englishName: 'Malayalam', nativeName: 'മലയാളം', file: 'malayalam.jpeg', order: 4 },
];

export async function POST() {
  try {
    await dbConnect();

    const results = [];

    for (const lang of LANGUAGES) {
      const filePath = path.join(process.cwd(), 'public', 'language_image', lang.file);
      const buffer = fs.readFileSync(filePath);
      const key = `languages/${lang.file}`;

      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: key,
          Body: buffer,
          ContentType: 'image/jpeg',
        })
      );

      const imageUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

      const language = await Language.findOneAndUpdate(
        { code: lang.code },
        {
          code: lang.code,
          englishName: lang.englishName,
          nativeName: lang.nativeName,
          imageUrl,
          order: lang.order,
          isActive: true,
        },
        { upsert: true, returnDocument: 'after' }
      );

      results.push({ code: lang.code, imageUrl, id: language._id });
    }

    return Response.json({ success: true, seeded: results });
  } catch (error) {
    console.error('[seed-languages] Error:', error);
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
