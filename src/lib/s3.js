import { S3Client } from '@aws-sdk/client-s3';

if (!process.env.AWS_REGION) throw new Error('Missing env: AWS_REGION');
if (!process.env.AWS_ACCESS_KEY_ID) throw new Error('Missing env: AWS_ACCESS_KEY_ID');
if (!process.env.AWS_SECRET_ACCESS_KEY) throw new Error('Missing env: AWS_SECRET_ACCESS_KEY');

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export default s3;
