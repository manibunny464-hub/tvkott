import { S3Client } from '@aws-sdk/client-s3';

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env: ${name}`);
  return value;
}

const s3 = new S3Client({
  region: async () => requiredEnv('AWS_REGION'),
  credentials: async () => ({
    accessKeyId: requiredEnv('AWS_ACCESS_KEY_ID'),
    secretAccessKey: requiredEnv('AWS_SECRET_ACCESS_KEY'),
  }),
});

export default s3;
