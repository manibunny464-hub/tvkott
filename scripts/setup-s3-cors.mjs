#!/usr/bin/env node

import { S3Client, PutBucketCorsCommand } from '@aws-sdk/client-s3';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env.local
const envPath = resolve(process.cwd(), '.env.local');
try {
  const envContent = readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach((line) => {
    const [key, ...valueParts] = line.split('=');
    if (key && !process.env[key]) {
      process.env[key] = valueParts.join('=');
    }
  });
} catch (e) {
  console.warn('⚠️  .env.local not found, using existing environment variables');
}

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const bucketName = process.env.S3_BUCKET_NAME;

if (!bucketName) {
  console.error('❌ S3_BUCKET_NAME not configured in .env.local');
  process.exit(1);
}

const corsConfiguration = {
  CORSRules: [
    {
      AllowedHeaders: ['*'],
      AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
      AllowedOrigins: ['*'],
      ExposeHeaders: [
        'ETag',
        'x-amz-version-id',
      ],
      MaxAgeSeconds: 3000,
    },
  ],
};

async function setupCors() {
  try {
    console.log(`📋 Configuring CORS for S3 bucket: ${bucketName}`);
    
    await s3.send(
      new PutBucketCorsCommand({
        Bucket: bucketName,
        CORSConfiguration: corsConfiguration,
      })
    );
    
    console.log('✅ S3 CORS configuration updated successfully!');
    console.log('📝 CORS Rules:');
    console.log(JSON.stringify(corsConfiguration, null, 2));
  } catch (error) {
    console.error('❌ Error configuring S3 CORS:', error.message);
    if (error.code === 'NoSuchBucket') {
      console.error(`   Bucket "${bucketName}" does not exist`);
    } else if (error.code === 'AccessDenied') {
      console.error('   Your AWS credentials do not have permission to configure CORS');
    }
    process.exit(1);
  }
}

setupCors();
