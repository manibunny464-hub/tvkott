# Vercel Environment Setup Guide

## Quick Fix for 401 Errors on Vercel

Your application needs environment variables set on Vercel for authentication to work. Follow these steps:

### Option 1: Vercel Dashboard (Easiest)

1. Go to: https://vercel.com/dashboard
2. Click your `chiripi_mini_ott` project
3. Go to **Settings** → **Environment Variables**
4. Add all variables from `.env.example`:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | `REPLACE_WITH_ENVIRONMENT_VALUE` |
| `JWT_SECRET` | `REPLACE_WITH_ENVIRONMENT_VALUE` |
| `AWS_REGION` | `ap-south-1` |
| `AWS_ACCESS_KEY_ID` | `REPLACE_WITH_ENVIRONMENT_VALUE` |
| `AWS_SECRET_ACCESS_KEY` | `REPLACE_WITH_ENVIRONMENT_VALUE` |
| `S3_BUCKET_NAME` | `chirpii-dev` |
| `DEFAULT_OTP` | `1234` |

5. Click **Save** for each variable
6. Go to **Deployments** → click latest deployment → **Redeploy**
7. Wait for deployment to complete (~2-3 minutes)
8. Test: `POST http://chiripi-mini-ott.vercel.app/api/auth/logout` with Bearer token

### Option 2: Vercel CLI

```powershell
# Install Vercel CLI if you don't have it
npm i -g vercel

# Login to Vercel
vercel login

# Navigate to your project
cd d:\chiripi_mini_ott

# Pull environment variables
vercel env pull

# This creates .env.local locally. Now redeploy:
vercel --prod
```

### Option 3: Using vercel.json (Automated)

Create a `vercel.json` file in your root with environment variables:

```json
{
  "env": {
    "MONGODB_URI": "@mongodb_uri",
    "JWT_SECRET": "@jwt_secret",
    "AWS_REGION": "@aws_region",
    "AWS_ACCESS_KEY_ID": "@aws_access_key_id",
    "AWS_SECRET_ACCESS_KEY": "@aws_secret_access_key",
    "S3_BUCKET_NAME": "@s3_bucket_name",
    "DEFAULT_OTP": "@default_otp"
  }
}
```

Then add secrets in Vercel dashboard using the `@` prefix.

## Verify It's Working

After redeploying with environment variables set:

1. Get a valid Bearer token from `/api/auth/verify-otp`
2. Make a POST request:

```bash
curl -X POST http://chiripi-mini-ott.vercel.app/api/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected response:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

If you still get 401, check:
- ✅ JWT_SECRET is set in Vercel
- ✅ Vercel deployment is complete (check Deployments tab)
- ✅ Bearer token is valid and not expired
- ✅ Token format: `Authorization: Bearer eyJhbGciOi...`

## Troubleshooting

**Error: "Authorization token required"**
- Token is missing or malformed
- Check header is exactly: `Authorization: Bearer {token}`

**Error: "Invalid or expired token"**
- Token has expired
- JWT_SECRET doesn't match (need to set on Vercel)
- Token was generated on different environment

**Still 401?**
- Clear Vercel cache: Go to Settings → Git → Disconnect and reconnect
- Force redeploy: Delete deployment and push new commit
- Check logs: Vercel Dashboard → Deployment → Logs

---

**Don't commit sensitive keys!** `.env.local` is in `.gitignore` for a reason.
