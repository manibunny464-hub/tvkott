# TVK OTT client API handoff

Import [TVK_OTT_Mobile_API.postman_collection.json](./TVK_OTT_Mobile_API.postman_collection.json). Set `baseUrl` to the approved test deployment origin without a trailing slash. Use a viewer token returned by OTP verification as `accessToken`. Keep tokens in a private environment. Each collection item uses one request shape for its operation. Query parameters disabled in Postman are optional. Server responses retain their existing compatibility fields where applicable.

## Android, iOS and TV

Android and iOS can use the same catalog, account and playback APIs. TV can reuse configuration, genres, Home, title detail, search, watchlist and entitled playback. TV integration needs player and codec testing on target devices. OTP sign-in can only be reused if the TV app supports entering the phone and OTP. QR/device-code pairing now has code creation, mobile approval, polling, session listing and revocation. The TV app and the mobile approval screen still need to implement this flow. Simultaneous streams across TV and mobile require a separate playback-session policy. Treat TV billing and offline playback as separate requirements.

## Frontend handoff comparison

The proposed collection describes a different URL hierarchy and several unimplemented features. Use the paths in the accompanying collection for current integration. Do not assume the frontend handoff URLs are deployed.

| Proposed area | Current implementation | Gap |
| --- | --- | --- |
| App config, preferences, OTP, logout | Mobile config, content-language read/write, app-language update, OTP send/verify, logout | Rotating refresh tokens are supported for OTP sessions. The profile and language settings use separate endpoints. |
| Profile and phone changes | Profile read and update | Phone change request and verification are missing. |
| Catalog Home, genres, titles, seasons, episodes, related | Same operations under Home, Content, Genres and Search routes. Related content is embedded in title/season responses. | No general section-ID filter or cursor contract. Search and list are separate. Series episode requests require the parent content ID as well as the season ID. |
| Playback sessions and heartbeat | Episode manifests, series resume and signed movie language/quality sources in title detail | No session create/heartbeat/end API. Concurrent streams still need a dedicated playback-session contract. TV sign-in and revocation are covered separately. |
| Watch progress and history | Watch history read/save/delete and Continue Watching | Current save is a POST with title/episode IDs and elapsed seconds. No video-ID PUT or completed/cursor filter. |
| Offline licenses | Episode download registration, read and removal | Download record creation does not issue a signed download URL, persistent license or offline DRM. Movie download is not covered. |
| Watchlist | My-list read, add and remove | Existing method and pagination shape differ from the proposed API. |
| Trailer feed, likes and comments | Season trailer feed and signed stream. Movie trailers can be present in movie playback details. Per-user likes and moderated comments work for both trailer types. | The feed still lists season trailers. Movie trailers come from title details. |
| Plans, checkout, verify and cancel | Subscription plans, current subscription, checkout order, signature verification and cancellation | Viewer transaction list and detail are supported. A separate billing order lookup is missing. Validate both one-time and recurring payment flows in provider sandbox. |
| Notifications | Viewer notifications, mark read and delete, including bulk operations | Existing page and type filters replace the proposed cursor and category contract. |
| Devices and support | Push token register/unregister; public Help, Privacy and About content | TV session list/revoke and support ticket creation are supported. Mobile device session management and support agent workflow remain open. |
| Webhooks | Razorpay-specific webhook route | Provider-to-server only. Excluded from the client collection. |

## Security and rollout

1. Verify entitlement, publication, language and parent-title checks consistently across every playback and download route before rollout. Legacy HD/SD stream paths remain outside the recommended client collection.
2. Use the authenticated viewer identity for progress, downloads, device registration and watchlist mutations. Use Bearer auth and keep JWTs out of query strings. Production OTP creation ignores the development OTP override.
3. Freeze one canonical response shape with the frontend team before removing legacy aliases. For a future offline API, choose one field such as `downloadUrl` and define its expiry, license and renewal semantics. The current download-record response has no such field.
4. Test published Movie and Series fixtures across Android, iOS and TV, including entitlement failures, language selection, quality switching, subtitles, URL expiry and network failures. Verify Razorpay callbacks and billing in its test environment. Do not treat route coverage as end-to-end readiness.

Coming Soon controls are removed from Movie and Series admin workflows. Legacy public Coming Soon reads return an empty list for older clients. Legacy writes are disabled. Existing MongoDB schedule fields remain so previously scheduled titles do not become public unintentionally.

## TV Settings and acceptance tests

Open `/admin/tv-settings` directly as a super admin. Its sidebar entry is hidden. TV is disabled by default. The page controls enablement, pairing code lifetime (2–15 minutes) and session lifetime (1–30 days).

| Scenario | Expected result |
| --- | --- |
| Signed-out or staff account opens TV Settings | Sign-in required or page unavailable. Settings API denies access. |
| TV disabled | Config says disabled. New pairing requests fail. Existing TV tokens fail on authenticated routes. |
| Settings out of bounds | Settings API returns 400. The saved settings remain in effect. |
| Pairing start, pending poll, mobile approval, TV poll | With a TV-enabled subscription, TV receives one viewer token and can read entitled catalog and playback. |
| Wrong TV secret, expired code or replay | API rejects the request without issuing a token. |
| Two claim requests for one approved code | At most one request receives a token. |
| TV token attempts approval | Approval is rejected. |
| Viewer revokes a TV session or TV logs out | Later requests with that TV token fail. Another user's session cannot be revoked. |
| Playback eligibility | A TV viewer gets only the title, language and quality they are entitled to. Verify codecs, captions, seek and URL expiry on target TVs. |

TV pairing and catalog access require staging testing before enabling TV in production. Provider payments, S3 playback and device tests were not exercised.
The [TV pairing integration test](../scripts/tests/test-tv-pairing.mjs) requires a local Next.js instance and the dedicated local MongoDB database `tvk_ott_tv_test`. Start the app and run the script with the same `MONGODB_URI` and `JWT_SECRET`. Set `TVK_TEST_BASE_URL` when using a port other than 3012. The script refuses hosted database URIs.

## Session and trailer integration

- Keep the same installation `deviceId` for OTP and FCM registration. When a distinct login exceeds the plan quota, all previous devices are signed out. TV pairing uses the same quota and requires TV access in the subscription entitlements.
- Handle HTTP 401 with `DEVICE_LOGOUT` by clearing credentials and returning to sign-in. Recheck session on app resume. Active video may continue until the issued media URL expires.
- OTP verification returns `refreshToken`. Send `supportsTokenRefresh: true` with OTP verification to opt into short-lived access tokens. POST it with `userId` to `/api/auth/refresh` and atomically replace the two returned tokens in secure storage. Serialize refresh requests to avoid reusing a rotated token.
- Trailer engagement uses the season trailer ID or the movie ID plus its exact stored localization `language`. Load engagement before rendering actions. Render comment text as plain text. The API omits hidden like counts.
- Set the backend Firebase service account JSON in `FIREBASE_SERVICE_ACCOUNT_KEY`. Configure Android/iOS Firebase and iOS APNs in the client, then register the token on login and token rotation. TV push is outside the initial delivery scope.
- Test one-device OTP replacement, same-device sign-in, three slots plus one overflow, TV-enabled and TV-denied plans, revoked refresh, hidden counts, duplicate likes, comment moderation, and delivery only to active phones.
