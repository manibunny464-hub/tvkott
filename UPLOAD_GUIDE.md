# Video Upload Guide

## Fixed Issues
- ✅ S3 CORS configuration now properly exposes `ETag` header required for multipart uploads
- ✅ Video uploads now use fast multipart upload mechanism (10MB chunks)
- ✅ All video qualities (360p, 480p, 720p, 1080p) are automatically transcoded after upload

## Fast Upload Features

### Multipart Upload Process
The system uses AWS S3 multipart uploads for optimal performance:
- **Part Size**: 10MB chunks (configurable in `/src/app/api/admin/videos/upload/route.js`)
- **Parallel Processing**: Each part is uploaded sequentially but optimized
- **Live Speed Tracking**: Shows real-time upload speed and ETA
- **Automatic Transcoding**: All 4 video qualities are processed after upload completes

### Upload Workflow
1. **Initiate**: Backend creates multipart upload session on S3
2. **Upload Parts**: Frontend uploads 10MB chunks with signed URLs
3. **Collect ETags**: Each part's ETag is captured for integrity
4. **Complete**: Backend finalizes upload and triggers transcoding
5. **Process**: Video is transcoded to 360p, 480p, 720p, and 1080p

## Setup S3 CORS (Already Done)

If you need to reconfigure CORS in the future:

```bash
npm run setup:s3
```

This script configures:
- ✅ Exposed headers: `ETag`, `x-amz-version-id`
- ✅ Allowed methods: GET, PUT, POST, DELETE, HEAD
- ✅ Allowed origins: * (all origins)
- ✅ Max age: 3000 seconds

## Uploading Videos

### Via Admin Dashboard
1. Click **"Upload Video"** button
2. Drag & drop or select a video file
3. Fill in metadata (title, description, category, pricing, tags, thumbnail, publish date)
4. Click **"Start multipart upload"**
5. Monitor progress:
   - 📤 Uploading: Real-time upload speed and ETA
   - ⚙️ Processing / Transcoding: Backend processing 4 quality versions
   - 🖼️ Generating Thumbnails: Creating preview images
   - ✅ Published / Live: Video ready for viewers

### Video Quality Renditions
After upload, the system automatically creates:
- **360p**: Mobile/low bandwidth (queue → processing → ready)
- **480p**: Tablet quality (queue → processing → ready)
- **720p**: Standard HD (queue → processing → ready)
- **1080p**: Full HD (queue → processing → ready)

## Troubleshooting

### "Upload failed. Retry after checking S3 bucket CORS"
**Solution**: Run `npm run setup:s3` to reconfigure S3 CORS settings

### Upload timeout
- Check your internet connection speed
- Consider uploading smaller files first to test
- Increase timeout values if needed in the API

### Video not transcoding
- Check MongoDB connection
- Verify AWS Lambda/transcoding service is configured
- Review server logs for transcoding errors

## Performance Tips
- Compress videos before upload (e.g., using HandBrake)
- Upload during off-peak hours for faster processing
- Ensure stable internet connection (10MB chunks require reliable connection)
- Use 1080p source for best transcoding results

## Configuration

### Adjusting Part Size
Edit `/src/app/api/admin/videos/upload/route.js`:
```javascript
const PART_SIZE = 10 * 1024 * 1024; // Change this value (in bytes)
```

### Storage Bucket Settings
Edit `/src/lib/admin/defaults.js` to change:
- S3 bucket name
- Video storage prefix path
- Transoding queue settings
