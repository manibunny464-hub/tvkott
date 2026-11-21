# TVK OTT Scope of Work

Product requirements delivery scope and acceptance criteria

Version 1.0 | 19 November 2026 | Prepared for the TVK OTT project stakeholders

TVK OTT will provide a full on demand entertainment service for movies, series, seasons, episodes and trailers. The service will support language aware discovery and playback, account and viewer profiles, subscriptions, protected streaming, personal libraries, and an operational administration system. Mobile, web and selected television platforms form the target product; platform releases will follow an agreed device matrix and delivery plan.

This scope defines the intended product behavior, implementation deliverables, external dependencies, testing evidence and approval gates. The 19 supplied mobile screen pages establish the visual and journey reference. They do not establish completed functionality or final prices. The requirements below resolve the difference between a promotional screen, a playable media asset and an account entitlement so that every client follows the same rules.

The product owner and delivery team will approve the decision register, platform matrix, detailed designs, acceptance thresholds, commercial schedule and change process before implementation is baselined. Requirements marked conditional require a documented product decision and provider or device validation. No commercial price, delivery date or unrestricted device support is committed by this document.

## 1 Product objectives and boundaries

The customer must be able to discover a title in a chosen content language, understand its availability and price, purchase access where required, and watch the correct media on an entitled device. Progress, saved titles and preferences must remain consistent within the selected viewer profile. Operators must be able to ingest, validate, publish, schedule, restrict, replace and withdraw content without manual database edits.

The baseline covers subscription video on demand, movies, episodic series, promotional trailers, administrative workflows, media processing, payments, accounts, profiles, operational observability and release verification. A short vertical trailer feed is an additional discovery experience. Full movies and long form episodes retain their original aspect ratio and support suitable landscape or television playback.

Three decisions are distinct throughout the implementation. Discoverability determines whether a profile sees a title. Playback authorization determines whether that account can play a specific asset now. Playback capabilities determine the permitted resolution, tracks, output protection and offline rights. A visible title may legitimately display a subscription requirement; a ready trailer does not make the full movie ready.

### Scope classifications

- Baseline means required for the agreed launch platforms and catalogue, subject to approved business values.
- Conditional means part of the target full OTT product but activated only after the stated device, licensing, vendor and commercial dependencies are approved.
- Expansion means a separately estimated extension unless formally added through change control.
- Not supplied means the 19 screen pages do not show a required flow; the design work remains in scope rather than being assumed complete.

Acceptance reference: all baseline requirements must have traceable designs, API contracts, tests and release evidence. Conditional requirements must be explicitly accepted into a release or recorded as deferred.

## 2 Platforms audiences and ownership

| Surface | Target scope | Release boundary |
|---|---|---|
| Android phone and tablet | Onboarding, discovery, player, account and billing integrations | Exact supported OS and hardware versions approved during discovery |
| iPhone and iPad | Equivalent supported journeys with native media and store handling | FairPlay and store entitlements validated on physical devices |
| Responsive web | Browse, search, account, checkout and supported protected playback | Supported browsers, DRM and maximum quality documented |
| Android or Google TV and Fire TV | Remote navigation, device approval, profiles and playback | Selected OS and model matrix; no assumption of every television |
| tvOS Samsung Tizen LG webOS | Target television expansion within full product | Each platform requires an explicit release commitment and device certification |
| Web administration | Catalogue, ingest, operations, payments and support | Restricted authenticated staff access |
| Backend and workers | Shared APIs, policy enforcement and processing | Separate development, staging and production environments |

Account owners control billing, security, registered devices and profile administration. Viewer profiles control personal discovery preferences, progress and saved titles. Guest access, if enabled, is limited by an approved catalogue and login policy. Staff roles include administrator, catalogue editor, media operator, finance operator, support agent and read only analyst.

The client supplies content and territorial rights, approved business policies, brand assets, payment and SMS merchant accounts, app store organizations and authorized decision makers. The delivery team supplies application code, infrastructure definitions, tests, integration configuration, operational documentation and handover within the agreed commercial engagement.

## 3 Screen reference and required design completion

The design source is TVK app screens (3).pdf, 19 mobile pages. Page references below identify supplied designs, not production behavior. Requirements in the body take precedence over inconsistent sample labels or values after stakeholder approval.

| Pages | Supplied reference | Scope interpretation |
|---|---|---|
| 1 | Splash | Startup, configuration and recoverable loading states |
| 2 and 3 | App language and content languages | Separate UI and media preferences; selection cardinality pending |
| 4 and 5 | Phone and OTP | Authentication, resend, edit number and guest policy |
| 6 and 8 | Home variants | Editorial rails, campaigns, progress and membership aware actions |
| 7 | Premium offer | Configurable trial, plan comparison and renewal disclosure |
| 9 and 12 | Explore and search | Categories, results, history, filters and empty states |
| 10 and 11 | Portrait player and episodes | Episode experience plus required long form and landscape designs |
| 13 and 16 | Account and edit details | Separate account identity from viewer profile settings |
| 14 | Payment success | TVK branding and verified order information |
| 15 | Trailer feed | Independent promotional assets and optional social interactions |
| 17 through 19 | Transactions subscription cancellation | Verified billing lifecycle and retained access until applicable expiry |

Required corrections include the Chirpii label on payment success, short movies wording where full OTT is intended, inconsistent Profile and Account navigation names, and prices that differ across purchase and membership screens. A paid INR 1 offer must not be called free. The selected plan must determine the displayed renewal amount and cycle.

Design delivery must add movie and series detail pages, landscape and TV players, audio and quality sheets, viewer profiles, downloads, devices, screen limit handling, language settings, payment failure and pending states, subscription recovery, search results, and empty, offline, error and accessibility states. Design signoff includes interaction prototypes, responsive behavior, remote focus states, asset specifications and approved copy.

## 4 Onboarding authentication and account security

AUTH 01. The client offers UI language and content language selection independently. Before authentication, preferences can be retained in the local guest session. After verified login the system persists them against the correct account or profile according to an approved conflict rule for returning users.

AUTH 02. Phone input is normalized with country code and validated against the supported launch countries. A real OTP provider sends messages. A success response must accurately reflect provider acceptance; delivery status and provider failure are distinguished. Production authentication must not depend on a universal default OTP.

AUTH 03. OTP challenges have a short validity period, hashed secret, maximum attempts, atomic cooldown, resend limits and abuse controls across phone, device, IP and provider cost. Verification checks expiry even while an expired database record remains. Only one successful consumption is permitted for each challenge. OTPs, full tokens and passwords are never written into normal logs.

AUTH 04. Existing accounts are reused and new accounts are created safely under concurrent requests. Suspended or deleted accounts cannot authenticate or renew access. User creation, session issuance and challenge consumption must be retry safe; failures must not produce duplicate accounts or an unusable login loop.

AUTH 05. Access credentials have bounded lifetimes. Refresh sessions support rotation, revocation, reuse detection, logout on one device and logout on all devices. Remote logout is enforced by subsequent authorization within documented bounds. Authentication alone does not grant paid playback.

AUTH 06. Guest skip behavior is explicit. The product owner defines public browsing and promotional playback. Saving, commenting, purchasing and restricted playback invoke login when required. The original intent is restored after login or purchase. A skipped OTP screen never creates an authenticated session.

Acceptance: demonstrate new and returning account journeys, wrong and expired OTP, concurrent retries, delivery failure, suspension, revoked credentials, recovery and guest conversion. Account phone changes require re verification and an audited recovery policy.

## 5 Viewer profiles parental controls and preferences

PRO 01. An account may contain the number of viewer profiles permitted by its plan. Each profile has a display name, avatar, UI locale, preferred audio languages, subtitle preference, autoplay choices and maturity policy. Profile allowances are separate from concurrent screen allowances.

PRO 02. Each profile has independent My List, watch progress, viewing history and recommendation signals. The server validates profile ownership on every profile scoped API. Switching profiles cannot reveal another account's data or reuse inappropriate cached rows.

PRO 03. Kids profiles restrict discoverability, direct detail access, playback and personal lists using approved maturity settings. A profile lock or parental PIN uses server verification and rate limits. Birth year alone is not a trusted authorization mechanism. Account owners manage restrictions through authenticated controls.

PRO 04. Account level settings cover identity, billing, devices, notifications and deletion. Personal profile editing does not silently change the account owner phone or payment identity. The final design distinguishes these screens.

PRO 05. Preference changes persist across the supported signed in devices. A language change invalidates relevant caches and reloads catalogue surfaces without deleting existing saved relationships or history. No results in the chosen language produces an honest empty state.

Acceptance: verify profile isolation, account ownership enforcement, Kids restrictions by direct API, PIN errors, preference persistence, maximum profile limits and data handling on profile deletion. Profile deletion and account deletion retention rules require client approval.

## 6 Catalogue language and availability policy

CAT 01. The catalogue contains movie and series titles, seasons, episodes, editions, promotional assets, localizations, people, artwork and rights. Stable identifiers remain valid when names or display order change. The system separates editorial publication state from technical media readiness.

CAT 02. Audio language, subtitle language, localized metadata and UI language are separate fields. Language identifiers use a consistent standard such as BCP 47. Display names do not act as database keys. Adding a language label to a title does not create playable audio.

CAT 03. Strict audio language discovery requires an approved ready picture edition and matching ready audio with valid timing, packaging and rights. A series qualifies only when it has at least one qualifying published episode. A season and episode count reflect the selected language, territory and profile policy.

Example: a series advertises Telugu, English and Hindi. Telugu episodes 1 to 8 and English episodes 1 to 4 are ready; Hindi is only a label. Telugu viewers can discover 8 eligible episodes, English viewers 4, and strict Hindi viewers must not see the series as available. English subtitles alone do not establish English audio availability.

CAT 04. All surfaces use one availability policy: Home, banners, explore, search, details, My List, progress, downloads and playback. Derived read models improve discovery speed, while playback rechecks authoritative current rights and entitlement. Reconciliation repairs missed events. Removing a language or title invalidates dependent views.

CAT 05. Publication, release dates, age restrictions, territorial windows, platforms and download rights apply consistently. Upcoming titles may appear in a separate Coming Soon area under planned language policy. They never enter playable lists solely because a trailer exists. Trailer availability is independent.

Acceptance: no metadata only language matches, no failed media treated as ready, correct episode counts and parent relationships, no cross language cache leaks, and direct playback denial after rights or readiness changes.

## 7 Home discovery search and artwork

DIS 01. Home supports configured hero banners, featured titles, Trending, Continue Watching, New Releases, genre rows and relevant editorial collections. Rows have ordering, schedule, platform, territory and language controls. Subscriber and guest calls to action reflect actual entitlement.

DIS 02. A banner points to an explicit title, asset, collection or approved internal action. The service validates destination availability and campaign dates. A playable action must not target deleted, unready or unavailable content. Campaigns and subscription offers must use server sourced product values.

DIS 03. Explore contains configured genres and category result lists. Search supports title and localized aliases and agreed cast, genre and keyword fields. Filters, sorting, suggestions, pagination, recent searches and clearing are specified. Transliteration and typo tolerance are conditional on the selected search implementation and supported languages.

DIS 04. Search indexes and recommendation candidates respect catalogue rights, language and maturity. Search results cannot override playback checks. Empty and unavailable states explain the outcome without silently returning a different language. Recommendations begin with editorial and behavior based rules; advanced machine learning is an expansion.

DIS 05. Artwork has image roles and aspect ratios for mobile, web and TV. Editors manage localized posters, backdrops, thumbnails and campaign assets. Responsive clients request appropriate sizes. Descriptive alternative text and accessible contrast form part of the design review.

Acceptance: validate sample catalogues across profile, country and language combinations; schedules, deep links and pagination; removal of unavailable campaigns; subscriber call to action changes; and search index recovery after catalogue updates.

## 8 Movie and series customer journeys

MOV 01. A movie detail page displays approved localized metadata, certification, runtime, release year, cast, genres, artwork, available audio and subtitles, trailers, related titles and relevant actions. Play, resume, subscribe, download and unavailable states depend on policy.

MOV 02. A movie is one playable feature asset, not an artificial list of episodes. Alternate cuts or censor edits are separate editions with independent timeline aligned tracks. The original picture aspect ratio is preserved. Preview or free sampling is separately configured.

SER 01. A series detail page presents synopsis, cast, artwork, certification, trailers and available seasons. Episode rows include stable identity, title, thumbnail, duration, synopsis, release status and eligible playback state. Specials and alternate order use an explicit ordering policy.

SER 02. Every episode has its own publication, language tracks, technical readiness, free access policy and rights. An inactive season excludes its episodes even if an individual episode is marked active. The server verifies series, season and episode relationships rather than trusting URL identifiers.

SER 03. Next episode and autoplay select only the next eligible episode in the approved order and chosen audio policy. An unpublished or missing language episode never silently falls back to another language. Whether a gap stops autoplay or skips ahead is a product decision displayed clearly.

SER 04. If the first episodes are free, that rule is configured by asset or series policy. Free sampling, trial access, unreleased content, subscription restrictions and language unavailability have different user states. Episode number alone is not an access control rule.

Acceptance: demonstrate a standalone movie, two seasons, partially dubbed episodes, a scheduled episode, a free sample, an alternate edition, an inactive parent, a related trailer and a next episode gap. All counts and actions must match the effective catalogue.

## 9 Player and protected playback

PLAY 01. Supported clients provide adaptive streaming, play and pause, seeking, permitted quality controls, audio and subtitle selection, elapsed and remaining time, fullscreen and recoverable errors. Long form playback supports landscape and television layouts. Portrait preview screens do not define the full movie player.

PLAY 02. The backend creates a playback session after checking account and device status, profile ownership, maturity, asset relationships, country and release rights, selected language, ready media, subscription and concurrent screen capacity. It returns scoped time limited delivery authorization and DRM configuration.

PLAY 03. Effective quality is the intersection of plan, ready renditions, rights and device or DRM capability. Auto quality adapts to network conditions within that ceiling. No client supplied premium flag, quality label or user agent alone grants an entitlement. Direct requests for disallowed high quality paths must be denied.

PLAY 04. Intro, recap and credits markers are managed per edition. Skip actions, next episode countdown and autoplay preferences work without creating extra playback slots. A timeline replacement requires reviewed progress and marker migration.

PLAY 05. Buffering, unsupported codec, license failure, offline network, expired session, subscription requirement, screen limit and language unavailable errors have actionable states. There is no unencrypted fallback after DRM failure. Existing credentials and licenses define bounded revocation; instantaneous removal from an offline device is not promised.

PLAY 06. Premium media uses the approved Widevine, FairPlay or PlayReady device integration. Keys remain in the selected key management and license system. Signed media URLs are delivery controls and do not replace DRM. Output protection and secure decoder requirements follow content rights. Watermarking is conditional and does not guarantee prevention of external camera recording.

Acceptance: physical device tests prove permitted playback, track switching, quality ceiling, direct path protection, entitlement changes, expiry, error recovery and long form aspect ratio behavior. Codec, DRM, 4K, HDR and audio support are documented per device.

## 10 Trailers social actions and notifications

TRL 01. Trailers and teasers are independent playable assets linked to a movie, series or season. They have their own language, duration, artwork, readiness, publication and rights. Their access policy may allow guests or non subscribers without granting the feature entitlement.

TRL 02. The supplied vertical feed supports ordered or ranked discovery, pagination, mute preference, playback only for the active visible card and navigation to the associated title. Swipe position and feed refresh behavior are specified. Long form feature assets never masquerade as trailer media.

TRL 03. Likes, comments and sharing are shown in the reference. Likes and shares are baseline social interactions subject to login and moderation rules. Comment posting, deletion, reports, spam limits, staff moderation and blocked content form a conditional release module until the client confirms comments are required. Static fabricated engagement counters are not a backend feature.

NOT 01. In app and push notifications cover approved release reminders, transactional subscription messages and account security events. Marketing communication requires the applicable preference policy. Personal recipient lists are not exposed in API responses.

NOT 02. Notifications and shared links resolve to an eligible destination, preserve login intent and handle withdrawn content. Delivery is asynchronous, retryable and deduplicated. A payment notification does not itself determine financial or entitlement state.

Acceptance: active feed playback only, correct trailer and title mapping, idempotent likes, authenticated social actions, report moderation where enabled, unavailable deep links, reminder deduplication and notification preferences.

## 11 My List progress history and personal state

LIB 01. My List stores a profile to title relationship with stable identifiers. Add and remove operations are idempotent. Duplicate saves do not create duplicate cards. Ineligible titles are hidden or marked unavailable under approved policy without deleting the saved relation merely because the user changes language.

LIB 02. Progress is stored by profile, playable asset and edition, with selected tracks, position, completion state and server evaluated event order. A legitimate backwards seek is accepted. Delayed stale events cannot overwrite newer progress; taking only the maximum time is insufficient.

LIB 03. Continue Watching returns eligible movies or episodes with truthful resume position and artwork. Completion and credits thresholds are configurable. Changing language cannot resume an unavailable audio track. Cross device resume uses the same profile and compatible edition.

LIB 04. Viewing history supports the approved visibility, retention and remove controls. Profile deletion or privacy requests follow retention and billing obligations. Historical analytical aggregates must not be confused with immediately visible personal history.

Acceptance: save toggles, language changes and restored eligibility; independent profile histories; backwards seek and out of order events; cross device resume; title withdrawal; edition replacement; and completion handling.

## 12 Subscription catalogue trial and entitlement rules

SUB 01. Plans are server managed products with immutable versions. They define price and currency, billing interval, device classes, maximum video resolution, concurrent streams, registered device and download allowances, profile count and optional HDR or premium audio. Purchased policy snapshots preserve the applicable customer contract.

SUB 02. The final plan matrix is a client decision. Sample monthly, quarterly and annual prices in the PDF are not approved commercial values. The final matrix must distinguish registered devices, simultaneously watching screens, download devices and viewer profiles. None of these counts implicitly determines another.

SUB 03. A trial or introductory offer explicitly states the amount charged now, duration, eligibility, selected follow on plan, renewal amount and interval, first charge date, cancellation rule and mandate requirements. An INR 1 paid trial is labeled introductory access rather than free access. The backend controls once per eligible account or other approved abuse resistant eligibility.

SUB 04. Membership states include pending, trial or introductory active, active, past due or grace, cancelled at period end, expired and revoked as applicable. Cancellation may disable renewal while retaining paid through access. The client approves grace periods, refunds, immediate termination and payment recovery behavior.

SUB 05. Upgrades, downgrades, prorations, price changes and reactivation have explicit effective timestamps and provider capabilities. Plan edits do not silently rewrite existing subscriptions. Existing download and playback treatment after a downgrade is defined and disclosed.

Acceptance: one authoritative plan version produces identical checkout, payment success, subscription, invoice and renewal information. Trial and cancellation dates, quality limits, device policy and pending or expired states are tested. Numeric plan limits remain pending until the client approves the comparison matrix.

## 13 Checkout payments renewal and financial records

BILL 01. The server creates the purchase intent and calculates trusted amount, currency, account, plan version, offer and tax fields. Payment provider and mobile app store adapters implement supported platform rules. Store organizations, merchant onboarding, mandate approvals and commercial contracts are client dependencies.

BILL 02. The backend validates provider signatures using the original request payload and approved secrets, records events durably and applies idempotent business updates. Duplicate deliveries and different events referring to one payment cannot grant access twice. Out of order failed, captured, refund and cancellation events cannot regress state incorrectly.

BILL 03. Payment confirmation updates order, payment, financial ledger, entitlement and outbox state using appropriate atomic database operations. No external payment call is held inside a database transaction. Frontend success is not proof of settled access. Pending confirmation has its own customer screen and reconciliation process.

BILL 04. Recurring renewals use provider mandates or store subscription mechanisms. Schedules reconcile unknown payments and provider membership state, recover missed webhooks and notify customers according to approved policy. Downtime cannot create duplicate charges or unexplained extra subscription periods.

BILL 05. Transaction history includes status, paid amount, currency, method summary, invoice or receipt reference and timestamps. Failed, pending, refunded and reversed transactions are distinct. Financial records preserve audit history. Customer facing invoices, tax details and retention require client finance approval.

BILL 06. Payment success and failure screens display the verified order, not sample text. If entitlement activation is delayed, the customer sees processing and recovery instructions. Cancellation disables renewal according to provider confirmation and displays retained access until the applicable date.

Acceptance: web checkout and agreed store journeys, signature tampering, duplicate and reordered callbacks, provider timeout, app termination after payment, renewal failure, refund, restoration and reconciliation. The system never stores raw payment card details unless explicitly supplied through a separately approved compliant architecture.

## 14 Devices simultaneous screens and television access

DEV 01. Devices have server assigned identity, platform information, session status, recent activity and revocation state. Account owners can inspect and revoke supported devices. Stable device handling avoids treating every app retry as a new registration. Privacy and reset behavior are documented.

DEV 02. Active playback uses account wide atomic leases with idempotent session creation, heartbeats and bounded expiry. An agreed heartbeat and timeout policy handles crashes and network loss. Two requests racing for the final permitted screen cannot both succeed. Pause and background behavior is explicitly defined.

DEV 03. Seeking, quality changes and normal audio selection within a valid session do not consume additional screens. Casting, if approved, uses an explicit sender and receiver transfer rule. Registering a TV does not bypass a phone only subscription.

TV 01. The television shows a short lived approval code or QR. The user signs into the official approval flow on another device and explicitly confirms the television. A separate secret device credential is used for polling. Codes expire, cannot be reused and are protected against guessing and approval binding attacks.

TV 02. TV applications provide directional remote focus, accessible selection, profile and PIN flows, catalogue navigation, playback controls, account exit and relevant error states. Remote controls and safe area behavior are validated on approved physical models. Television payment acquisition rules are specified per store and distribution approach.

TV 03. Device capability checks combine supported player, codec, DRM and output protection signals. A client supplied screen resolution or user agent alone is insufficient for premium entitlement. Redis failures require a documented lease recovery or refusal policy; counts cannot reset while old streams continue unrestricted.

Acceptance: screen quota races, crash expiry, repeated session requests, revocation, TV approval expiry and replay, phone only plan denial, casting where enabled and physical remote navigation on the approved platform matrix.

## 15 Downloads and offline viewing

OFF 01. Offline playback is a conditional full product module for approved native platforms, supported DRM and titles with download rights. A permanent publicly accessible MP4 is not the premium download design. Browser or TV download support is not assumed.

OFF 02. The customer chooses allowed quality and available audio or subtitles before download. The client supports queued, downloading, paused, retrying, completed, expired and removed states with storage and network feedback. Failed parts or supported package tasks resume without creating duplicate grants.

OFF 03. Download authorization verifies account, device, plan quota, asset version, country, rights, maturity and selected tracks. Encrypted media is associated with a device bound persistent license where supported. Server records track issuance, expiry, renewal, selected capabilities and revocation policy without exposing raw keys.

OFF 04. Offline access duration, validity after first play, renewal, subscription expiry, device removal, reinstall and rights expiration follow provider and approved business policy. A disconnected device cannot be revoked instantly; the previously issued license bounds exposure. This limitation is disclosed to the product owner.

OFF 05. Changing the content language affects library visibility under the approved policy without silently deleting downloaded files. Selected download tracks cannot be replaced with different language content. A profile may be blocked from an account download by maturity rules even when files remain on the device.

Acceptance: device quota, interrupted download, invalid license, copied files on another device, expiry offline, renewal online, subscription change, removal and reinstall, language change and supported platform storage behavior. Physical device DRM evidence is mandatory before enabling production downloads.

## 16 Administration content rights and support tools

ADM 01. Staff use role based access and administrative multifactor authentication. Roles cover account administration, catalogue editing, media operations, publishing, finance, support and analytics. Sensitive actions and production configuration changes are audited.

ADM 02. Catalogue forms manage titles, genres, people, credits, certifications, localizations, artwork, series hierarchy, alternate editions and trailers. Validation prevents duplicate ordering identifiers, invalid parent relationships and unsupported publication combinations. Operators preview effective catalogue state by language, territory, profile policy and device context.

ADM 03. Media dashboards show upload progress, source metadata, encoding stages, failed tracks, QC findings, retry history and package versions. Operators can cancel or retry permitted jobs, replace an asset through a new version and roll back to a previously approved version. No direct database patch is the normal publishing workflow.

ADM 04. Rights tools manage country, language, platform, access window, downloads and permitted media formats. Scheduled publishing, withdrawal and takedown invalidate availability and caches. A reconciliation task repairs missed scheduling events. Approval and publish permissions can be separated.

ADM 05. Editorial tools manage Home rails, banners, ranking order, campaign timing and targeting. Pricing and subscriber promotions reference real offer versions. Factual marketing claims and artwork usage require client approval.

ADM 06. Finance and support tools expose masked customer identity, subscription timeline, orders, reconciliation state, receipts, device sessions and relevant error correlation. Refund or entitlement override actions require permission, reason and audit. Support cannot access plaintext OTPs or DRM keys. Reports have authorized exports and date or status filters.

Acceptance: role denials, audited publication and refunds, scoped support access, hierarchy validation, preview correctness, scheduling and takedown recovery, safe retry and rollback, and no secret leakage in logs or exports.

## 17 Source ingest and resumable upload

UPL 01. Admin creates the target asset or edition before requesting an upload. The API checks staff permission, quota, expected size, media role and a private object key. It grants short lived scoped direct upload authorization so large movie files bypass application server request bodies.

UPL 02. Multipart or an approved resumable protocol handles parallel parts, retries, pause or resume and refreshed part authorization. The server retains upload identity, owner, source version, object key, expected checksum and byte size, part state and lifecycle. Upload authorization never permits arbitrary bucket writes.

UPL 03. Completion is verified using storage state, supported checksums and a media probe. Filename, Content Type, browser completion flags or an ETag treated universally as MD5 are not sufficient. Unsupported, corrupt or mismatched inputs are rejected or quarantined before processing.

UPL 04. Completed sources trigger durable idempotent jobs. Repeated completion requests and duplicated storage events do not create multiple logical jobs. Abandoned uploads and incomplete multipart data have cleanup policies. Source replacement creates a new version rather than overwriting production files.

UPL 05. Initial chunk size and concurrency are tuned to provider part limits, file sizes, uploader memory and measured upstream bandwidth. Upload progress, queue wait, encoding and publication are separately reported. No universal fixed upload time is guaranteed.

For planning, a decimal 10 GB source needs about 13.3 minutes at a sustained effective 100 Mbps before overhead. Faster protocols improve reliability and throughput utilization, not the user's physical upstream capacity. Acceleration services are benchmarked and costed before selection.

Acceptance: large interrupted upload, expired signed part URL, ownership attack, checksum mismatch, duplicate completion, abandoned cleanup, bulk queue pressure and recoverable source validation errors. Source format limits and maximum upload sizes are approved for the chosen vendor.

## 18 Transcoding packaging audio and subtitle processing

MED 01. The media pipeline tracks created, uploading, uploaded, validating, transcoding, packaging, QC, ready, failed and quarantined stages. Editorial draft, review, approval, scheduling and publication remain separate. A ready output does not automatically approve public release.

MED 02. Encoding produces an approved adaptive bitrate ladder suited to source and devices, with compatible codecs, aligned segment boundaries, audio variants and HLS or DASH packages. CMAF can be used where compatible with the target DRM and devices. Initial bitrate settings are benchmarked with representative content rather than treated as universal constants.

MED 03. A 1080p source is not relabeled genuine 4K through upscaling. 4K, HDR and premium surround require source fidelity, supported tooling, licensing where applicable, rights and device validation. SDR and broadly compatible playback fallbacks remain explicit output choices.

MED 04. Alternate dubbed audio can share a picture master only when timeline and edit are compatible. Different censor edits or duration require separate editions. Audio QC checks duration, synchronization, channel layout and relevant loudness or silence errors. Missing or failed audio does not count as a language ready state.

MED 05. Subtitle upload identifies edition, language, role, format and version. Supported SRT, WebVTT, TTML or IMSC inputs are validated for syntax, text encoding, timing, edition alignment and target device rendering. Normal subtitles, forced subtitles and SDH are distinct. Audio description is an audio role. Intentional overlapping cues must not be rejected merely because overlap exists.

MED 06. Original caption files are retained; playback text is packaged in supported formats. Subtitle corrections normally publish a new text or package version without unnecessary picture encoding. Automated transcription or translation is conditional and requires approved editorial quality control.

MED 07. Jobs have deterministic identities, retry policies, cost and concurrency caps, progress, dead letter handling and operator actions. Required outputs and QC gate publication. Old callbacks cannot overwrite newer source versions. New package publication is atomic with rollback retained.

Acceptance: corrupted input, failed rendition, subtitle correction, audio mismatch, wrong edition, delayed callback, duplicate callback, worker termination, codec compatibility and rollback of a published version.

## 19 Backend and infrastructure architecture

The control plane handles authentication, metadata, payment, entitlement and playback permission. The media plane delivers segments and tracks through object storage and CDN. Video binaries do not pass through MongoDB or ordinary application API instances.

The recommended initial software layout is a modular backend with independently deployable workers. Modules separate identity, profiles, catalogue and rights, media, subscriptions and payments, playback sessions, personal state, notifications and administration. API instances are stateless; long running tasks use durable queues. A monolithic deployment can preserve these boundaries without premature service proliferation.

### Proposed premium video reference

- Private S3 source archive and versioned output storage.
- Managed encoding such as MediaConvert, or an approved controlled worker service.
- Compatible multi DRM key and license provider.
- Private media CDN delivery such as CloudFront with origin access controls and scoped viewer authorization.
- MongoDB replica set, Redis cache and playback leases, durable queues and a search or availability read model.
- Central secrets management, infrastructure definitions, telemetry, alerting and separate environments.

Cloudflare is a configurable alternative, not one interchangeable component. R2 provides object storage, Stream provides managed video services, and Workers or CDN delivery provide other parts of the path. A Stream based option must prove the contracted resolutions, audio formats, DRM, device and offline requirements before replacing the premium reference. The choice is conditional on a technical capability trial and recurring cost estimate.

If media is processed in AWS and copied to R2, transfer charges, validation, propagation time and recovery are included in the design. R2 compatibility does not automatically make every AWS media integration use it as a direct output. Appropriate video delivery products and agreements are required; generic proxying is not a universal OTT entitlement.

All published media uses immutable versioned object paths. Source and output origins stay private. Authorization is checked before serving protected cached content, not only on cache misses. Short lived authorization covers every permitted media resource and must not accidentally expose disallowed qualities through a broad package path.

## 20 MongoDB schema and data integrity

| Domain | Main collections |
|---|---|
| Identity | accounts identities otp_challenges profiles devices refresh_sessions tv_device_codes |
| Catalogue | titles title_localizations people credits artworks seasons episodes playable_assets editions |
| Media | source_assets video_renditions audio_tracks text_tracks packages upload_sessions transcode_jobs qc_reports |
| Availability | rights_windows availability publication_events banners collections collection_items |
| Billing | plans plan_versions subscriptions entitlement_snapshots orders payments refunds invoices ledger_entries webhook_events |
| Customer state | playback_sessions download_licenses watch_progress my_list ratings notifications |
| Operations | outbox_events audit_logs support_cases |

Schema design uses stable references and bounded documents. Episodes, payment events, progress and raw watch events are not unbounded arrays inside accounts or titles. Media records store technical metadata and object keys; they do not store video binaries, permanent public URLs or raw DRM secrets. Amounts use integer minor units with currency. Dates are stored in UTC, with explicit release timezone policy where needed.

The delivery team supplies a data dictionary covering required fields, references, states, validation, retention and indexing. Unique constraints include normalized identity, series and season numbering, media version identity, provider event identity, provider payment identity, profile saved title and applicable business operation keys. Availability queries are indexed for agreed language, country, state and ordering patterns.

Financial and other critical multi document updates use short transactions on a supported replica set or sharded topology. External provider calls remain outside database transactions. Durable inbox and outbox patterns close the gap between state changes and queued work. Consumers tolerate repeated messages and recover incomplete work.

TTL indexes may clean expired challenges or device codes, but authorization explicitly checks expiry because physical deletion can be delayed. Production database connections use TLS where deployed, private or restricted networks, least privilege application credentials, pooling, bounded failures and tested backups. Standalone root access is not the production architecture baseline.

Acceptance: schema and index review, duplicate event races, referential checks, transaction rollback, outbox recovery, realistic query plans, expiry behavior, backup restoration and access isolation. Initial delivery does not require sharding unless measured load demonstrates a need.

## 21 API contracts security and operational safeguards

API 01. Versioned contracts cover authentication and refresh, TV approval, profiles, catalogue and details, search, playback sessions and heartbeat, progress, saved titles, downloads, plans and orders, payment callbacks, admin ingest and publication. The deliverables include OpenAPI documentation, request and response examples, pagination, error codes, idempotency behavior and authorization requirements.

API 02. All account and profile references have ownership checks. Admin endpoints require role permissions. Public or guest endpoints are explicitly identified. Language and region behavior is documented rather than inferred from optional client fields. Representative business errors include LANGUAGE_UNAVAILABLE, CONTENT_NOT_READY, SUBSCRIPTION_REQUIRED, SCREEN_LIMIT_REACHED and AUTH_SERVICE_UNAVAILABLE.

SEC 01. Secrets are supplied through environment or secret management, not source commits, frontend bundles, images or logs. Encryption in transit and at rest, scoped storage access, token rotation, administrative MFA and audit records form the baseline. Credential rotation and emergency revocation are documented.

SEC 02. Security testing includes cross account data access, profile ownership, privilege escalation, OTP abuse, webhook forgery and replay, signed media tampering, upload scope and size, malicious text or subtitle payloads and remote import SSRF. Rate and cost limits protect paid SMS and encoding operations.

SEC 03. Privacy scope covers approved consent and preference records, personal data access or deletion requests, retention schedules and masking in support tools. The client provides applicable legal and content licensing policies; technical implementation follows them. No unsupported claim of blanket legal compliance is made.

SEC 04. Release checks include dependency review, secret scanning, appropriate security assessment and remediation. DRM and signed delivery reduce unauthorized use but cannot guarantee prevention of every form of piracy or external recording.

Acceptance: documented contracts and authentication matrix; automated ownership and role tests; no secrets in delivered repositories; verified webhook and delivery authorization; and client approved privacy and incident runbooks.

## 22 Performance reliability analytics and recovery

NFR 01. Initial performance objectives are proposed targets subject to an approved load model: cached catalogue p95 below 300 ms, uncached metadata p95 below 700 ms and playback authorization p95 below 500 ms excluding external license or player startup. Playback startup below 3 seconds is evaluated only on a defined healthy network and device cohort. No blanket all ISP or all device speed guarantee is implied.

NFR 02. The client and delivery team define concurrent users, peak play starts, catalogue size, media ingest volume, request mix, territories and test duration. CDN delivery, API, database, license service and payment systems are load tested separately and together. Availability objectives, recovery point objective and recovery time objective require costed approval.

NFR 03. Caches use appropriate language, territory, profile or maturity and catalogue version dimensions. Personalized responses are never served from an unsafe shared cache. Pooling, query projections, availability read models, bounded timeouts, circuit breakers and asynchronous work control latency. Login does not perform unrelated media publication or financial maintenance.

NFR 04. Monitoring covers API latency and errors, DB connectivity and pool pressure, OTP provider acceptance, job backlog and failures, webhook processing, payment reconciliation, license errors, CDN hit rate and origin failure. Playback analytics measure start success, startup delay, buffering, fatal errors, quality and dropped frames by supported dimensions.

NFR 05. Audit and business events have correlation identifiers and redacted diagnostics. High volume player telemetry moves to an appropriate analytics pipeline rather than the hot account document. Product reports include engagement, catalogue availability, watch time and approved revenue metrics with documented definitions.

NFR 06. Backups, object retention, restore drills, rollback, rights takedown and provider outage procedures are delivered. Restore tests verify account and payment consistency and do not send real payments or messages from staging. New authorizations fail safely during uncertain entitlement or lease state; already authorized playback is bounded by existing credentials and license policy.

Acceptance: approved benchmark report, alert demonstrations, representative outage drills, restore evidence, deployment rollback and documented capacity or cost limits.

## 23 Delivery phases and dependencies

| Phase | Deliverables | Exit evidence |
|---|---|---|
| Discovery and scope baseline | Platform matrix, decisions, requirements, data and integration contracts | Product owner approval of scope and unresolved values |
| Experience design | Completed mobile web admin and committed TV journeys | Interactive prototype and accessible state review |
| Foundation | Environments, CI CD, identity, profiles, catalogue, schemas and roles | Automated contract and isolation tests |
| Media and playback | Ingest, encode, QC, tracks, private delivery, DRM and player | Reference movie and multi season playback on target devices |
| Commerce and customer state | Plans, checkout, renewal, sessions, progress, library and support | Payment sandbox reconciliation and concurrency tests |
| Platform completion | TV approval, device certification and accepted offline module | Physical device matrix evidence |
| Hardening and UAT | Performance security recovery and business acceptance | Signed test evidence and triaged issue register |
| Production and handover | Release configuration, runbooks, training and source delivery | Smoke tests, operational ownership and acceptance record |

An implementation schedule and staffing plan are produced after the baseline device list, vendor selection, detailed designs, catalogue samples and commercial decisions are approved. External approvals, DRM credentials, merchant onboarding, content delivery, store review and vendor outages are dependencies, not assumed zero duration tasks.

### Client responsibilities

Provide authorized source media, dubbed audio, captions, artwork and rights metadata; final prices and trial or cancellation policies; organization controlled hosting, domain, DRM, SMS, payment and store accounts; legal copy and data policies; representative test devices or an agreed device lab; timely design and UAT decisions.

### Delivery team responsibilities

Provide designs and implementation within the approved platform scope; infrastructure and code review; schema and API documentation; secure integration; testing and defect correction against the agreed acceptance criteria; deployment support, training and handover documentation. Production vendor costs and licensing are separately budgeted.

## 24 Deliverables handover and acceptance governance

The handover includes client and admin source repositories with agreed intellectual property and third party notices; build instructions and environment templates without secrets; infrastructure definitions and deployment pipelines; database schemas, indexes and approved migrations; API contracts and examples; media presets and job workflow documentation; entitlement and payment state diagrams; configuration and feature flags; security and operational runbooks; test reports, known limitations and device certification evidence; and staff training materials.

Documentation identifies who owns DNS, certificates, storage, payment reconciliation, content publication, takedowns, support escalation, backups and incident response. Production access is transferred through approved account invitations or secret management, not plaintext documents. Content inventory and import reconciliation are part of any approved migration scope.

UAT is performed on the release candidate in a production like environment using agreed movie, series, edition, language and subscription fixtures. Each requirement maps to test evidence. Proposed release gate: no unresolved blocker or critical defects; high severity defects fixed or formally accepted with a documented safe limitation; lower severity items assigned an owner and agreed disposition. Final severity definitions and UAT review period are contractual decisions.

Code complete, media uploaded and screenshots approved are not equivalent to release acceptance. An external provider limitation must be disclosed and accepted rather than silently bypassed. A release cannot advertise unsupported 4K, downloads, trial terms or device allowances.

Changes after baseline identify the requested behavior, affected surfaces, migration or operational impact, estimate and acceptance changes. The product owner authorizes scope changes through the agreed process. Warranty duration, support hours, service response commitments, costs and payment milestones belong in the commercial agreement and are not invented here.

## 25 Decision register and explicit exclusions

| Decision | Proposed baseline or required approval | Owner |
|---|---|---|
| D01 Launch platforms | Mobile and web plus explicitly selected TV releases | Product owner |
| D02 Content language selection | Support multiple selections technically; approve UX and audio priority | Product owner |
| D03 Guest behavior | Public browse and trailer policy; login for protected actions | Product owner |
| D04 Trial and plan values | Replace all conflicting sample prices with one versioned policy | Product and finance |
| D05 Free episodes or previews | Configure per content policy; do not assume first three universally | Product and content |
| D06 Device and screen limits | Approve independent limits and revocation behavior | Product owner |
| D07 Video provider and DRM | Validate premium reference or selected alternative on target devices | Technical and client owners |
| D08 4K HDR and premium audio | Conditional on media rights tooling cost and devices | Product and content |
| D09 Offline downloads | Approve platforms DRM validity quotas and rights | Product and content |
| D10 Comments and moderation | Conditional social module with explicit operating owner | Product and operations |
| D11 Region rights and maturity | Supply enforceable policy and launch territories | Content and legal |
| D12 UAT and service objectives | Approve device matrix load model RPO RTO severity and review period | Client and delivery leads |

Expansion items outside the baseline are live television, live sports or event production, ad sales and ad serving or SSAI, games, rentals or per title purchases, household detection and paid extra members, partner white labeling, advanced recommendation machine learning and unlimited custom analytics. They require separate specification and estimation unless added by approved change.

Content acquisition, dubbing production, certified translation, studio licensing, payment fees, taxes, infrastructure consumption, SMS charges, DRM licenses, app store fees, external legal advice and open ended operational staffing are client or third party costs unless a commercial agreement explicitly includes them. No bulk migration of existing production customers, billing mandates or credentials is assumed; an approved migration plan must define it.

All outstanding decisions must have a resolved value or an explicitly deferred release status before the corresponding implementation is accepted.

## 26 Acceptance test catalogue

The following test catalogue forms the initial acceptance baseline. Tests are requirements for implementation, not a claim of existing passing behavior. The delivery team will map each scenario to requirement identifiers and committed platforms, add integration specific cases, maintain fixtures and record expected versus actual results. Automated tests are supplemented by physical device playback and editorial media QC.

Test groups cover authentication, language availability, catalogue, uploads and encoding, captions, payments, devices, downloads, personal state and operational failures. These scenarios are expanded from the agreed TVK architecture and include the mobile screen gaps. Applicable conditional modules must be marked included or deferred rather than silently omitted.

| ID | Scenario | Acceptance result |
|---|---|---|
| A01 | New user, correct OTP | Account/session created once; valid token |
| A02 | Existing user, correct OTP | Existing profile/subscription retained |
| A03 | Wrong OTP | Rejected; atomic attempt increment |
| A04 | Five concurrent wrong attempts | Limit enforced without lost increments |
| A05 | OTP expired but TTL record exists | Rejected by expiry check |
| A06 | OTP verification replay | At most one successful challenge consumption |
| A07 | Concurrent OTP sends | Atomic cooldown/abuse limits |
| A08 | SMS provider timeout | Truthful retryable result; no false delivery claim |
| A09 | MongoDB outage | Bounded 503; no access granted |
| A10 | Suspended/deleted account | Login and token renewal denied |
| A11 | Refresh-token reuse | Compromised refresh family revoked under policy |
| A12 | Profile ID belongs to another account | Access denied |
| A13 | TV user code expires/replays | Approval denied |
| A14 | Attacker changes TV device-code binding | Approval/session denied |
| L01 | Hindi tag exists, no Hindi media | Hidden from strict Hindi catalogue |
| L02 | Hindi subtitles only | Not treated as Hindi audio |
| L03 | Audio variant exists, source missing | Not playable/eligible |
| L04 | Audio uploaded, encode/QC failed | Not playable/eligible |
| L05 | English ready for only episodes 1–4 | English season/details/counts show 1–4 |
| L06 | One eligible episode in season | Season visible with truthful count |
| L07 | Parent season inactive | Its episodes do not qualify series |
| L08 | Episode linked to another season/series | Relationship rejected |
| L09 | Draft/Scheduled/Inactive episode | Excluded until legitimately published |
| L10 | Change Telugu to English | All surfaces refresh; saved items retained |
| L11 | Selected language has zero titles | Empty state; no unrelated fallback |
| L12 | Different profiles choose different languages | Isolated catalogue/history/My List |
| L13 | Cached Telugu result requested by English profile | No cross-language cache leak |
| L14 | Metadata localization changes | Does not invent an audio track |
| L15 | Movie has incompatible alternate cut | Audio/text attached only to matching edition |
| L16 | Language/rights removed after search indexed | Playback denied; projections invalidated |
| C01 | Ready movie and active rights | Discoverable and playable for entitled user |
| C02 | Ready title, no subscription | Discoverable with paywall if product policy permits |
| C03 | Future release | No premature full-content playback |
| C04 | Coming Soon with ready trailer | Trailer policy allowed; main movie blocked |
| C05 | Rights expire during a session | Renewal/license decisions follow bounded expiry policy |
| C06 | Country/platform rights differ | Correct restrictions per request |
| C07 | Kids profile requests mature title by direct ID | Server blocks, not just UI |
| C08 | Banner links to deleted/unready asset | Not presented as playable |
| C09 | New package becomes ready | Atomic version switch; previous package survives rollback |
| C10 | Episode reordered or special added | Stable identity/progress; correct explicit ordering |
| U01 | 20 GB upload interrupted at 70% | Resume uploaded parts; no complete restart |
| U02 | Signed part URL expires | Safe renewal for same authorized upload |
| U03 | Unauthorized uploader guesses asset/upload ID | No sign/complete/read access |
| U04 | Declared size/checksum differs | Quarantine/reject before encode/publication |
| U05 | Duplicate complete request/storage event | One logical media job |
| U06 | Abandoned multipart upload | Lifecycle cleanup, no endless orphan cost |
| U07 | Source extension disguises unsupported media | Probe rejects; no unsafe processing |
| U08 | Encoder worker dies mid-job | Retry/resume policy; no fake READY |
| U09 | Replayed old encode success after new source | Old version cannot overwrite new version |
| U10 | Failed 4K output, valid 1080p output | Publish only according to required-output policy |
| U11 | 1080p master requested as 4K | No artificial genuine-4K capability claim |
| U12 | Dub audio duration/sync mismatch | QC fails or approved corrected offset, not silent corruption |
| U13 | Batch uploads exceed provider quota | Queue/backpressure, retriable status |
| U14 | New subtitle added after publication | Versioned text/package update without unnecessary video encode |
| S01 | SRT malformed/out-of-range cue | QC rejection with actionable report |
| S02 | Telugu/Tamil/German glyphs | Correct rendering across device matrix |
| S03 | Forced vs SDH vs normal subtitles | Independent labels/default selection |
| S04 | Subtitle from different cut | Rejected/mapped through explicit edition QC |
| S05 | Player seeks/audio switches | Caption sync retained |
| S06 | Subtitle preference unavailable | Clear behavior; no wrong-language track presented as requested |
| P01 | Checkout UI success, payment unconfirmed | No premature premium access |
| P02 | Forged webhook | Signature rejected |
| P03 | Same valid webhook delivered 10 times | One business/ledger effect |
| P04 | Different events reference same payment | No duplicate entitlement grant |
| P05 | Out-of-order paid/failed/cancel events | State does not regress incorrectly |
| P06 | Provider succeeds, response is lost | Reconcile recovers payment; no duplicate charge intent |
| P07 | Renewal fails | Grace/past-due rules applied once |
| P08 | Cancel at period end | Access continues until paid-through date |
| P09 | Upgrade/downgrade | Correct effective time, invoice and capability change |
| P10 | Refund/chargeback | Financial reversal and entitlement policy consistent |
| P11 | Invalid app-store receipt or replay | No entitlement grant |
| P12 | Store purchase restored | Correct account/provider mapping; no double subscription |
| P13 | Old plan changed by admin | Existing purchased contract follows version policy |
| P14 | Currency or amount tampered | Server-side order rejects mismatch |
| D01 | Plan allows 2 streams; 3rd starts | Third rejected or explicit eviction flow |
| D02 | Two requests race for final screen | Only one new lease succeeds |
| D03 | Retry same playback-session creation | Same lease, not duplicate quota usage |
| D04 | App crashes, no release request | Lease expires under bounded timeout |
| D05 | Seek/ABR/audio switch | No additional screen consumed |
| D06 | Phone-only plan requests TV playback | Denied based on trusted policy/device signals |
| D07 | User requests hidden 4K segment directly | Path/license authorization blocks it |
| D08 | Weak DRM/output protection on 4K title | Reduce capability or deny per rights |
| D09 | Cast transfers playback | Correct sender/receiver screen accounting |
| D10 | Redis lease store restarts | No quota reset permitting uncontrolled concurrency |
| D11 | Remote logout during playback | New authorization denied within documented revocation bounds |
| D12 | Profile switch on same account | Profile isolation; screen quota remains account-wide |
| O01 | Download-device quota exceeded | Clear refusal/device-management action |
| O02 | Offline license expires | Playback blocked/renewal requested according to DRM policy |
| O03 | Download files copied to another device | No valid device-bound license |
| O04 | Language changes after download | Visibility follows policy; files not silently deleted |
| O05 | Content rights expire while device offline | Existing bounded offline-license policy applies |
| O06 | App reinstalled/new device | Reauthorization/redownload policy; no portable raw key |
| R01 | Older progress arrives after newer progress | Stale event ignored |
| R02 | User intentionally seeks backwards | Accepted as new progress, not max-position-only |
| R03 | Next episode lacks selected language | No silent other-language autoplay |
| R04 | Saved title becomes temporarily unavailable | Hidden/unavailable state, relation preserved |
| R05 | Profile A watches title | Profile B progress/recommendations unchanged |
| F01 | Origin/storage unavailable | Bounded failures; existing cache behavior measured |
| F02 | DRM service unavailable | Clear failure; no unencrypted fallback |
| F03 | Public URL guesses private source/output key | Origin access denied |
| F04 | Expired/tampered CDN token on cache hit | Denied before media serving |
| F05 | Release scheduler event lost | Reconciliation repairs availability |
| F06 | Payment/media queue backlog | Alerts/backpressure; no HTTP request hanging on work |
| F07 | Peak premiere traffic | Load-test catalogue/auth/license/CDN separately |
| F08 | Backup restored to staging | Integrity checked; no accidental real billing/SMS |
| F09 | New deployment breaks playback contract | Compatibility/rollback tests retain active sessions |
| F10 | Logs capture headers or OTP/payment fields | Redaction test fails build/release |

## 27 Approval record and reference material

Scope approval requires the product owner and delivery lead to identify this document version, approved release platforms, resolved decision register, accepted conditional modules, commercial schedule and UAT ownership. The approval record should capture approver name or role, date, decision and referenced changes. Signature or electronic approval method follows the parties agreement.

References: TVK app screens (3).pdf, 19 mobile pages, supplied by the client; TVK OTT Backend Blueprint dated 18 November 2026; the TVK screen review and product requirements discussed with the client. Screen values and marketing copy are reference designs and must be replaced with approved production configuration.

Technical reference documentation to validate during vendor procurement includes AWS S3 multipart upload, MediaConvert captions and SPEKE, CloudFront private origin access, Cloudflare Stream and R2 capability documentation, MongoDB transaction topology, payment provider webhook contracts and the OAuth device authorization standard. Product selection does not imply unlimited provider functionality.

Primary reference links

- S3 multipart upload https://docs.aws.amazon.com/AmazonS3/latest/userguide/mpuoverview.html
- MediaConvert DRM https://docs.aws.amazon.com/mediaconvert/latest/ug/encryption-choosing-speke-version.html
- MediaConvert captions https://docs.aws.amazon.com/mediaconvert/latest/ug/sidecar-captions-support-tables-by-container-type.html
- CloudFront private origin https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html
- Cloudflare video https://developers.cloudflare.com/stream/
- Cloudflare object storage https://developers.cloudflare.com/r2/
- MongoDB transactions https://www.mongodb.com/docs/manual/core/transactions-production-consideration/
- Device authorization https://www.rfc-editor.org/rfc/rfc8628

This scope is ready for stakeholder review and decision completion. Implementation starts from the approved requirements and design baseline rather than treating every supplied mockup label as a final commercial or technical rule.
