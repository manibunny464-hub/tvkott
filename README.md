# TVK OTT

TVK OTT is a Next.js application with a content administration panel and mobile catalog APIs. It uses MongoDB for catalog and account data, and Amazon S3 for artwork, trailers, and video files.

## Admin workflows

- **Movies and Series** have dedicated library, preview, and edit pages. Admins can save localized titles, descriptions, posters, and banners independently.
- **Video Assets** supports manual uploads by language and quality. The Movie Studio includes resumable uploads, playback previews, subtitles, and per-language publishing and availability.
- **Trailers and Banners** can be managed separately. Trailers are organized by movie language or series season and language. Home banners can link to movies or series and have a configurable display order.
- **Catalog operations** include Cast & Crew, curated More Like This selections, staff permissions, and audit history.

## Run locally

1. Install Node.js 20.9 or newer and have a development MongoDB instance available.
2. Install dependencies and copy the environment template.

   ```powershell
   npm ci
   Copy-Item .env.example .env.local
   ```

3. Set `MONGODB_URI` to a development database and generate a unique `JWT_SECRET`. Add S3 settings if you need to test media uploads.
4. Run `npm run dev` and open the [app](http://localhost:3000) or [Admin Login](http://localhost:3000/admin/login).

An existing admin signs in using the account stored in MongoDB. To sign in as `admin`, set `ADMIN_USERNAME_EMAIL` to the existing admin’s email. The alias uses the account’s existing password and defaults to `ADMIN_EMAIL` or `admin@tvk.local`. To bootstrap a new development database, set `ADMIN_EMAIL` and `ADMIN_PASSWORD` before the first sign-in. The first successful sign-in creates the account. You can remove the bootstrap variables afterward.

## Deployment configuration

| Variables | Purpose |
| --- | --- |
| `MONGODB_URI`, `JWT_SECRET` | Database connection and login sessions |
| `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME` | Artwork and video storage |
| `NEXT_PUBLIC_PLAY_STORE_URL`, `NEXT_PUBLIC_SUPPORT_EMAIL` | Optional landing and app-sharing settings |

Set secrets directly in the deployment environment. [.env.example](.env.example) contains the configuration template. Keep `.env.local` out of Git. A hosted deployment needs a MongoDB endpoint it can reach. Use a separate staging database and an approved S3 test location for upload and playback checks.

If you are upgrading an existing database with the legacy season-trailer index, run [the index migration](scripts/migrate-season-trailer-index.mjs) against that database before saving multiple trailer languages for a season.

## Verification

```powershell
npm run build
node scripts/tests/test-banner-visibility.mjs
```

With the local app and MongoDB running, use `node --env-file=.env.local scripts/tests/test-catalog-access.mjs` to verify draft visibility, playback access, and trailer permissions.

The [scope of work](docs/TVK_OTT_Scope_of_Work.md) and [backend blueprint](docs/TVK_OTT_Backend_Blueprint.md) describe the broader project requirements.
