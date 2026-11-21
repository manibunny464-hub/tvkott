# Chirpii Mini OTT — Complete Technical & Functional Architecture Document

---

## 1. Project Overview & System Architecture

**Chirpii** is an end-to-end Over-The-Top (OTT) Video Streaming platform engineered for micro-dramas, mini-series, movies, trailers, and shorts. The architecture is built with high scalability, low-latency streaming, granular multi-language support, automated multi-resolution video transcoding, single-device secure authentication, Razorpay subscription billing, and an Enterprise Admin Panel.

### 1.1 High-Level Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                CLIENT APPLICATIONS                                |
|  - Mobile App (Android / iOS / Flutter / React Native)                            |
|  - Web Watch Application (Next.js Responsive Web Player)                          |
+----------------------------------------+------------------------------------------+
                                         |
                                         | RESTful JSON APIs (Bearer JWT / Cookies)
                                         v
+-----------------------------------------------------------------------------------+
|                             NEXT.JS BACKEND SERVER                                |
|  - App Router API Routes (/api/auth, /api/home, /api/episodes, /api/subscription) |
|  - Enterprise Admin Panel (/admin, Series, Seasons, Episodes, Revenue, RBAC)      |
|  - Authentication Middleware & Single-Device Enforcement                          |
|  - HLS Manifest & Dynamic Playlist Generator                                      |
+-----------+-----------------+-------------------+-------------------+-------------+
            |                 |                   |                   |
            v                 v                   v                   v
     +------------+    +--------------+    +--------------+    +--------------+
     |  MongoDB   |    |    AWS S3    |    |   Razorpay   |    | Firebase FCM |
     |  Atlas DB  |    | & CloudFront |    | Payment Gate |    | Push Engine  |
     +------------+    +-------+------+    +--------------+    +--------------+
```

---

## 2. Technology Stack & Infrastructure

| Layer | Technologies & Libraries | Purpose |
| :--- | :--- | :--- |
| **Framework & Engine** | Next.js 16 (App Router), React 19, Node.js | Core web server, dynamic API endpoints, server-side rendering, and client admin interface. |
| **Database & ODM** | MongoDB Atlas, Mongoose 9 | Primary document database storing catalog, hierarchical series/seasons/episodes, users, transactions, and audit logs. |
| **Styling & Animation** | Tailwind CSS v4, Framer Motion, Lucide Icons, Radix UI | Modern dark/light glassmorphic UI, fluid drawer animations, interactive dialogs and icons. |
| **Video Player & Streaming**| HLS.js, Custom HLS Video Player with Bitrate Switching | Adaptive bitrate streaming, multi-quality renditions (360p, 480p, 720p, 1080p), custom video controls. |
| **Object Storage & CDN** | AWS S3 (@aws-sdk/client-s3, presigner), AWS CloudFront | Direct multi-quality video ingestion, multipart uploads, CloudFront CDN asset streaming, poster/banner storage. |
| **Payments & Monetization** | Razorpay Node.js SDK, Webhooks | Subscription order creation, signature verification, coupon discounting, plan stacking, auto-renewal, and admin refunds. |
| **Push Notifications** | Firebase Admin SDK (FCM) / Multicast | Rich push alerts for new episodes, coming soon titles, subscription expirations, promotional announcements. |
| **Security & Auditing** | JSON Web Tokens (JWT), Crypto SHA-256, Timed Rate Limiter | Single-device login lock (`currentDeviceId`), admin RBAC, brute-force protection, full change-tracking audit logs. |

---

## 3. Database Schema & Data Models (All 34 Models)

The database schema is organized into 5 interconnected functional domains:

```
+-----------------------------------------------------------------------------------------+
|                                    DATABASE DOMAINS                                     |
+--------------------+---------------------+--------------------+-------------------------+
|  1. CONTENT CORE   |  2. USERS & ACCESS  |  3. MONETIZATION   |  4. ENGAGEMENT & ADMIN  |
|  - Content         |  - User             |  - Subscription    |  - Banner, Trailer      |
|  - Season          |  - Device           |  - SubscriptionPlan|  - ComingSoon           |
|  - Episode         |  - Otp              |  - PlanBenefit     |  - Blockbuster/Trending |
|  - Language        |  - SearchHistory    |  - Transaction     |  - Notification         |
|  - Genre, Artist   |  - Download         |  - Coupon          |  - AdminUser, Role, Log |
+--------------------+---------------------+--------------------+-------------------------+
```

### 3.1 Content & Catalog Models
1. **`Content`**: The core media entity representing Series, Movies, or Shorts.
   - *Fields*: `title`, `slug`, `type` (`series` | `movie` | `short`), `description`, `language` (array), `genres` (array), `releaseYear`, `ageRating`, `pricing` (`free` | `premium`), `freeEpisodeCount`, `thumbnailUrl`, `posterUrl`, `bannerUrl`, `trailerUrl`, `cast` (actors, directors, writers), `isFeatured`, `isTrending`, `isBlockbuster`, `isComingSoon`, `color` (hex theme).
2. **`Season`**: Represents a season belonging to a Series (`seriesId`).
   - *Fields*: `seriesId`, `seasonNumber`, `title`, `description`, `poster`, `cast`, `isActive`, `isDeleted`.
3. **`Episode`**: Individual episode belonging to a Series and Season.
   - *Fields*: `seriesId`, `seasonId`, `episodeNumber`, `title`, `description`, `duration`, `thumbnailUrl`, `isFree`, `isDownloadable`, `status` (`Draft` | `Scheduled` | `Published` | `Inactive`), `releaseDate`, `languages` (Array of language variants containing `language`, `subtitleFile`, `audioFile`, and `videoFiles` per quality).
4. **`Language`**: Supported app and content languages (`englishName`, `nativeName`, `code`, `icon`, `isDefault`, `displayOrder`).
5. **`Genre`**: Categories (`name`, `slug`, `description`, `imageUrl`, `color`, `isFeatured`, `displayOrder`).
6. **`Artist`**: Cast & Crew database (`name`, `role`, `profileImage`, `bio`, `filmography`, `birthDate`).

### 3.2 User & Device Models
7. **`User`**: Mobile customer entity.
   - *Fields*: `phone`, `email`, `name`, `gender`, `yearOfBirth`, `avatarUrl`, `status` (`active` | `suspended`), `appLanguage`, `contentLanguages` (references to `Language`), `isPremium`, `premiumExpiry`, `currentDeviceId` (single-device login enforcement), `watchHistory` (`contentId`, `episodeId`, `watchedSeconds`, `totalSeconds`, `progress`), `myList` (bookmarks).
8. **`Device`**: Registered user devices (`userId`, `deviceId`, `deviceModel`, `osVersion`, `fcmToken`, `isPushActive`, `lastActiveAt`).
9. **`Otp`**: One-Time-Password records for phone authentication (`phone`, `otp`, `expiresAt`, `isUsed`).
10. **`Download`**: Offline download licenses (`userId`, `contentId`, `episodeId`, `downloadQuality`, `expiresAt`).
11. **`SearchHistory` & `TrendingSearch`**: Tracks user searches and global trending query counts.

### 3.3 Monetization & Subscription Models
12. **`SubscriptionPlan`**: Plans configured by admin.
    - *Fields*: `name`, `duration` (in days, e.g. 30, 90, 365), `price`, `originalPrice`, `label`, `tagline`, `iconFeatures`, `benefits` (references to `PlanBenefit`), `isTrial`, `trialPrice`, `autoRenew`, `isActive`, `displayOrder`.
13. **`PlanBenefit`**: Reusable plan perks (`name`, `icon`, `description`).
14. **`Subscription`**: Active/historic user subscription record (`userId`, `planId`, `startDate`, `endDate`, `nextRenewalDate`, `status` [`active`, `expired`, `cancelled`, `paused`], `paymentMethod`, `razorpaySubscriptionId`).
15. **`Transaction`**: Financial audit log (`userId`, `planId`, `subscriptionId`, `razorpayOrderId`, `razorpayPaymentId`, `amount`, `currency`, `couponCode`, `discountPercent`, `status` [`pending`, `success`, `failed`, `refunded`], `refundId`, `paidAt`).
16. **`Coupon`**: Promo codes (`code`, `type` [`percentage`, `flat`], `value`, `maxUses`, `usedCount`, `expiresAt`, `applicablePlans`, `isActive`).

### 3.4 Engagement, Admin & System Models
17. **`Banner`**: Hero carousel banners (`title`, `subtitle`, `imageUrl`, `linkedContentId`, `linkedContentType`, `order`, `isActive`).
18. **`Trailer` & `SeasonTrailer`**: Dedicated trailer & short-form video streaming with like counters.
19. **`ComingSoon`**: Titles in pre-release with a `notifyUsers` registration array.
20. **`BlockbusterItem` & `TrendingItem`**: Curated priority ranking lists.
21. **`Notification` & `AdminNotification`**: In-app user notifications and admin broadcast logs.
22. **`AdminUser`, `Role`, `Permission`, `AuditLog`**: Multi-role admin access control, permission nodes, and full diff-logging of administrative edits.
23. **`AdminSetting`**: Master platform configuration (branding, colors, S3 credentials, transcoding presets, payment gateway keys, SMTP email).
24. **`CmsPage` & `SupportTicket`**: Dynamic static pages (Terms, Privacy, Help) and user support tickets.

---

## 4. Mobile Client Internal Functionalities & API Reference

### 4.1 Authentication & Session Management
- **Phone OTP Flow**:
  - `POST /api/auth/send-otp`: Generates a 4-digit OTP valid for 5 minutes (fallback default `1234` in development).
  - `POST /api/auth/verify-otp`: Validates OTP, creates new user record if first-time user, assigns `currentDeviceId`, and returns a signed 30-day JWT.
- **Single-Device Security Enforcement**:
  - The JWT payload contains `userId`, `phone`, and `deviceId`.
  - On every authenticated API request (`src/lib/authMiddleware.js`), the middleware checks if the JWT's `deviceId` matches the user's `currentDeviceId` in MongoDB.
  - If a user logs into a new device, the previous device is immediately invalidated and receives HTTP 401 with `code: 'DEVICE_LOGOUT'`.

### 4.2 Dynamic Home Feed Engine (`GET /api/home`)
The `/api/home` route is an aggregated high-performance endpoint that parallelizes requests using `Promise.allSettled`:
1. **Hero Banners**: Active banners filtered by user language preferences and verified against existing episodes.
2. **Trending Content**: Ranked titles sorted by `trendingPriority`.
3. **Blockbusters**: Highlighted premium/popular releases.
4. **Series Feed**: Active series with published episodes.
5. **Continue Watching**: Real-time resume progress filtered to shows where `0 < progress < 100%`, mapped with season & episode numbers.
6. **For You**: Personalized recommendation algorithm factoring in watched IDs and language preferences.
7. **Genres Carousel**: Active categories with tailored UI accent colors.

### 4.3 Catalog, Hierarchy & Explore
- `GET /api/mobile/explore`: Full hierarchical series tree with populated seasons, published episodes, resolved S3/CloudFront CDN URLs, and multi-language video streams.
- `GET /api/content/[contentId]`: Retrieves series metadata, cast & crew, genres, and pricing info.
- `GET /api/content/[contentId]/seasons`: Lists all active seasons for a series.
- `GET /api/content/[contentId]/seasons/[seasonId]/episodes`: Lists episodes for a season.
- `GET /api/series/by-slug/[slug]`: Public slug-based lookup for deep linking.

### 4.4 Video Streaming & Adaptive Bitrate Engine
- `GET /api/episodes/[episodeId]/stream`:
  - Validates user subscription: If the episode has `isFree: false`, verifies that `user.isPremium === true` and `user.premiumExpiry > now`. Standard users without an active subscription receive HTTP 403 with `{ requiresUpgrade: true }`.
  - Returns `streamType` (`hls` or `direct`), master `manifestUrl`, and available rendition tracks (`360p`, `480p`, `720p`, `1080p`).
- `GET /api/episodes/[episodeId]/manifest`: Dynamic HLS M3U8 manifest streamer serving multi-quality variants.
- `GET /api/episodes/[episodeId]/adjacent`: Returns previous and next episodes for seamless continuous autoplay.
- `POST /api/user/watch-progress`: Updates user playback position (`watchedSeconds`, `totalSeconds`, `progress%`), keeping continue-watching in sync across devices.

### 4.5 Subscription, Payments & Stacking Architecture
- `GET /api/subscription/plans`: Fetches active plans, durations, original/discounted prices, and populated `PlanBenefit` icons.
- `POST /api/subscription/validate-coupon`: Validates coupon code expiration, maximum usage, and plan applicability.
- `POST /api/subscription/create-order`: Calculates final price after coupon discount, creates an official Razorpay Order in INR paise, and logs a `pending` `Transaction` record.
- `POST /api/subscription/verify-payment`:
  - Verifies Razorpay HMAC SHA-256 signature (`order_id + '|' + payment_id`).
  - **Plan Stacking Engine**: If the user already has an active subscription of the same plan, the new duration is appended to `activeSub.endDate`. If a different plan is purchased, it queues starting from the expiry of the existing plan.
  - Updates `Transaction` status to `success`, records `paidAt` and `paymentMethod`, and sets `user.isPremium = true`.
- `GET /api/subscription/my-subscription`: Returns current active plan details, validity end date, and auto-renew toggle.
- `POST /api/subscription/cancel`: Cancels future recurring auto-renewals while retaining access until `endDate`.

### 4.6 User Personalization & Utilities
- `GET /api/user/me`: Full user profile, premium status, active language settings.
- `POST /api/user/content-languages`: Updates preferred viewing languages.
- `POST /api/user/app-language`: Switches mobile UI locale.
- `POST /api/user/my-list/toggle`: Adds/removes content from user bookmarks.
- `POST /api/user/device-token`: Registers device model and FCM token for push notifications.
- `GET /api/search?q=...`: Full-text multi-index search querying `title`, `description`, `cast`, `tags`, and `genres`.
- `POST /api/coming-soon/[id]/notify-me`: Subscribes user for automatic push notification when the title premieres.

---

## 5. Admin Panel Architecture & Functional Capabilities

The Admin Panel is located under `/admin` and provides a comprehensive, secure command center for operations, content ingestion, monetization, and system management.

```
+-----------------------------------------------------------------------------------------+
|                                    ADMIN PANEL MODULES                                  |
+----------------------+----------------------+---------------------+---------------------+
| 1. CATALOG & EPISODES| 2. USER & SUBSCRIBER | 3. FINANCIALS       | 4. PLATFORM CONTROL |
| - Series & Seasons   | - User Directory     | - Plan Management   | - Master Settings   |
| - Episode Uploader   | - Active Subscribers | - Coupon Engine     | - RBAC & Sub-Admins |
| - Multi-Language S3  | - Manual Adjustments | - Revenue Analytics | - Push Broadcaster  |
| - Banners & Trailers | - Device Monitoring  | - Razorpay Refunds  | - Audit Logs & CMS  |
+----------------------+----------------------+---------------------+---------------------+
```

### 5.1 Authentication, RBAC & Security
- **Super Admin & Environment Fallback**: Configured via `ADMIN_EMAIL` and `ADMIN_PASSWORD`.
- **Sub-Admin Management (`/admin/roles`)**: Allows creating staff accounts with custom assigned roles (`super_admin`, `content_manager`, `finance_manager`, `support_lead`).
- **Granular Permissions Matrix**:
  - `content`, `series`, `seasons`, `episodes`, `trailers`, `banners`, `artists`, `users`, `plans`, `revenue`, `analytics`, `notifications`, `cms`, `roles`, `settings`.
- **Brute-Force Rate Limiting**: Enforces a maximum of 8 login attempts per minute per IP address.
- **Audit Logging (`/admin/settings`)**: Automatically records every creation, modification, or deletion action with user ID, role, affected module, entity ID, previous data, new data, and IP address.

### 5.2 Catalog Management & Video Ingestion
- **Series Manager (`/admin/series`)**: Add/edit shows with metadata, genres, custom hex accent color for client theming, age rating, cast & crew with photo linking, and pricing configuration (`free` vs `premium`).
- **Season Manager (`/admin/seasons`)**: Numbered seasons, custom posters, and season-level cast.
- **Episode Manager & Uploader (`/admin/episodes`, `/admin/bulk-episodes`)**:
  - Direct S3 multipart upload with 10MB chunking and live upload speed/ETA tracking.
  - Multi-language variant configuration (Telugu, Hindi, Tamil, Kannada, Malayalam, English, etc.) with dedicated audio and subtitle file attachments.
  - Multi-resolution direct upload (HD, SD, 1080p, 720p, 480p, 360p) with immediate publishing.
  - `isFree` toggle to configure sample episodes for free tier viewers.
- **Administrative Watch Page (`/admin/watch/[contentId]`)**: Built-in video player with stream debugging and quality switching.

### 5.3 Curation, Banners, Artists & Trailers
- **Banner Manager (`/admin/banners`)**: Reorderable hero banners with direct image uploads and linked content routing.
- **Featured & Blockbuster Curation (`/admin/featured`, `/admin/blockbusters`)**: Manual priority drag-and-drop ranking.
- **Coming Soon Manager (`/admin/coming-soon-admin`)**: Pre-release scheduling with a one-click broadcast trigger to notify all users who clicked "Notify Me".
- **Artist Database (`/admin/artists`)**: Cast & crew profile directory with role assignments, biographies, and S3 image uploads.
- **Trailer Manager (`/admin/trailers-admin`)**: Manage vertical short videos and promotional trailers with like counts.

### 5.4 Users, Subscribers & Support
- **User Directory (`/admin/users`)**: Search and view all registered mobile users, registered devices, language settings, and watch history.
- **Subscriber Management (`/admin/subscribers`)**:
  - View all active subscribers and expiration dates.
  - **Manual Subscription Actions**: Extend subscription by custom days, upgrade/downgrade plan, or cancel subscription.
- **CMS & Legal Pages (`/admin/cms`)**: Live editor for Terms of Service, Privacy Policy, Help & FAQ, and About Us.

### 5.5 Financials, Revenue Analytics & Transactions
- **Subscription Plan Builder (`/admin/plans`)**: Configure pricing, duration (in days), promotional labels, feature bullet points, and link reusable `PlanBenefit` tags.
- **Coupon Manager (`/admin/plans`)**: Create percentage or fixed-amount discount coupons with expiration dates, maximum redemption limits, and plan restrictions.
- **Transaction Ledger (`/admin/transactions`)**: Searchable list of all Razorpay payments with customer phone numbers, payment IDs, and order statuses.
- **Instant Razorpay Refunds**: Trigger direct automated refunds to customer payment sources from the transaction drawer.
- **Financial Analytics (`/admin/revenue`, `/admin/analytics`)**:
  - Visual charts for Daily / Weekly / Monthly Revenue.
  - Average Revenue Per User (ARPU), Monthly Recurring Revenue (MRR), and Churn Rate metrics.
  - Plan distribution breakdown (Pie charts).

### 5.6 Push Notification Center (`/admin/notifications`)
- **Audience Segmentation**: Broadcast to All Users, Active Subscribers, Free Users, or individual user IDs.
- **Rich Payload Support**: Title, body, banner image URL, and deep-link routing (e.g. `series_detail`, `episode_player`, `subscription_page`).
- **Delivery Feedback**: Real-time display of successful and failed FCM delivery counts.

---

## 6. Direct Video Ingestion & Delivery Architecture (Manual Upload)

```
Admin Direct S3 Video Upload (Presigned Multipart S3 API)
                      |
                      v
        AWS S3 Bucket (chirpii-dev)
        (Multi-Quality & Multi-Language Assets)
                      |
                      v
       CloudFront CDN Distribution
                      |
                      v
    Instant Episode Publishing (Status: 'Published' / 'Live')
```

### 6.1 Upload Workflow Steps
1. **Direct Ingestion**: Admin uploads multi-quality video files (1080p, 720p, 480p, 360p) and multi-language audio/subtitle tracks directly to AWS S3 using presigned multipart uploads.
2. **Instant Availability**: Video files are immediately linked to the episode in MongoDB with status `Published` and `live`.
3. **Low-Latency CDN Streaming**: Clients stream directly from AWS CloudFront / S3 without waiting for asynchronous background transcoding queues.

---

## 7. Environment Variables & Operational Reference

```ini
# Database Connection
MONGODB_URI=mongodb://localhost:27017/chirpi

# Authentication & Security
JWT_SECRET=chirpii_jwt_super_secret_key_production
DEFAULT_OTP=1234
SMS_API_KEY=your_sms_provider_api_key

# AWS S3 Storage & CloudFront CDN
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=WI39...
S3_BUCKET_NAME=chirpii-dev
CDN_URL=https://d123456abcdef8.cloudfront.net

# Razorpay Payment Gateway
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...

# Super Admin Account
ADMIN_EMAIL=admin@chiripii.com
ADMIN_PASSWORD=REPLACE_WITH_ENVIRONMENT_VALUE
ADMIN_NAME=Super Admin
ADMIN_ROLE=super_admin

# Firebase Cloud Messaging (Push Notifications)
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

---

## 8. Summary of API Endpoints Matrix

| Category | Endpoint | Method | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `/api/auth/send-otp` | `POST` | Generate and send 4-digit verification code. |
| **Auth** | `/api/auth/verify-otp` | `POST` | Validate OTP, lock session to device, issue JWT. |
| **Home** | `/api/home` | `GET` | Aggregated feed (Banners, Trending, Series, Continue Watching). |
| **Catalog** | `/api/mobile/explore` | `GET` | Hierarchical series, season & episode catalog. |
| **Streaming**| `/api/episodes/[id]/stream` | `GET` | Check subscription, return stream URL & quality tracks. |
| **Streaming**| `/api/episodes/[id]/manifest`| `GET` | Dynamic adaptive HLS M3U8 playlist. |
| **Billing** | `/api/subscription/plans` | `GET` | Active subscription plans & benefit perks. |
| **Billing** | `/api/subscription/create-order` | `POST` | Create discounted Razorpay order. |
| **Billing** | `/api/subscription/verify-payment` | `POST` | Verify signature, stack subscription, activate premium. |
| **User** | `/api/user/watch-progress` | `POST` | Sync playback timestamp & completion percentage. |
| **User** | `/api/user/my-list/toggle` | `POST` | Bookmark/unbookmark titles. |
| **Downloads** | `/api/user/downloads` | `GET/POST` | Sync downloaded videos list across devices, save download record. |
| **Downloads** | `/api/user/downloads/[episodeId]` | `DELETE/GET` | Remove download record on episode deletion, check single episode download status. |
| **Push** | `/api/user/device-token` | `POST` | Register FCM token for targeted notifications. |
| **Admin** | `/api/admin/dashboard` | `GET` | Platform stats (revenue, user growth, active subscriptions). |
| **Admin** | `/api/admin/series` | `GET/POST` | Series creation and catalog management. |
| **Admin** | `/api/admin/transactions/[id]/refund` | `POST` | Process instant refund via Razorpay. |
| **Cron** | `/api/cron/reconcile-payments` | `GET/POST` | Reconcile stuck pending payments against Razorpay & activate subscriptions. |
| **Cron** | `/api/cron/sync-subscriptions` | `GET` | Expire past subscriptions, send 3-day/1-day alerts, and reconcile transactions. |

---

## 9. Dynamic Subscription Features & Payment Reconciliation Cron

### 9.1 Dynamic Plan Entitlements Schema
Subscription plans support configurable feature entitlements without hardcoding:
- **`adsFree` (Boolean)**: Toggle ad-free playback vs supported ads.
- **`premiumContentAccess` (Boolean)**: Gate access to non-free content.
- **`offlineDownloads` (Boolean)**: Authorize offline download capability.
- **`videoQuality` (Enum: `480p`, `720p`, `1080p`, `4K`)**: Maximum permitted resolution. Higher qualities are filtered out of streams and HLS playlists.
- **`simultaneousDevices` (Number: 1 - 10)**: Maximum concurrent active device sessions.
- **`monthlyDownloadLimit` (Number, 0 = unlimited)**: Monthly download quota enforcement.

### 9.2 Grandfathering & Snapshot Policy
- On payment confirmation, `Subscription.featuresSnapshot` and `Subscription.planVersion` are permanently recorded on the subscription record.
- Plan edits in the admin panel increment the plan's `version` in `SubscriptionPlan`.
- Previously active subscribers retain their purchased `featuresSnapshot` until their subscription expires or is upgraded, preventing unexpected mid-cycle changes.

### 9.3 Payment Reconciliation Cron Job
- **Problem**: When users pay via UPI / Cards on mobile, network drops or app restarts can cause payments to be captured on Razorpay while remaining `pending` in the platform database.
- **Solution**:
  - Automated cron checks pending transactions older than 3 minutes (up to 48 hours).
  - Fetches order status from Razorpay: if `paid` and payment is `captured`, it immediately activates the subscription, stores the feature snapshot, enables user premium access, and sends a push notification.
  - Automatically marks transactions as `failed` if Razorpay marks the order as expired.
  - Tracks `reconcileAttempts`, `lastReconciledAt`, and `reconcileNotes`.
- **Execution Channels**:
  - API Route: `GET/POST /api/cron/reconcile-payments` (protected by `CRON_SECRET`).
  - Integrated Sync Route: `GET /api/cron/sync-subscriptions`.
  - Standalone CLI / Scheduled Task: `npm run cron:payments` or `node --env-file=.env.local scripts/cron/reconcile-payments.mjs`.

### 9.4 Verification & Testing
- Automated test suite: `npm run test:subscriptions`
- Tests cover feature validation, quality hierarchy enforcement, grandfathering snapshots, multi-device eviction, download limits, and webhook security.
