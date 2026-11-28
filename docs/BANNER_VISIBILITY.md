# Banner visibility

All three app endpoints use the same policy: `/api/banners`, `/api/home/banner`, and `data.banners` in `/api/home`.

- The request must resolve to a user's saved content-language preferences. Only active Language records count. App UI language and query parameters such as `language=Telugu` do not replace saved preferences.
- Missing/invalid authentication, missing preferences, or no matching active language produces an empty banner list. The standalone endpoints keep the existing `{ success: true, data: [] }` response contract.
- The banner must be active, not deleted, have an image, and link to existing active, non-deleted content. Unlinked promotional banners cannot prove a language match and remain hidden.
- The linked content's `language` must match at least one selected language. Legacy `languages` is used only when `language` is empty. Matching ignores letter case and surrounding spaces.
- Future scheduled content is hidden. Coming-soon content requires a reached release date.
- Series additionally need an active, non-deleted season belonging to that series, with an active, non-deleted `Published` episode in that season. The episode must have a selected language variant and must not have a future release/air date. Episodes without language variants are hidden until their language data is supplied.
- Movies and shorts do not need seasons or episodes.
- The actual linked content type controls eligibility and the returned type, even if the banner's stored type is stale.
- Ineligible records are removed before selecting the first ten banners by descending order, then newest creation date.
- There is no featured-content fallback. Turning off a banner cannot make its content reappear through fallback. The existing admin featured-content workflow can still create an active Banner record.

Examples: a Telugu-only user sees a Telugu series banner only when its Telugu episode is published in an active season. A Hindi-only series, draft-only series, disabled banner, deleted content, or unlinked image stays hidden. A user with no saved language selection sees no banners.

Previously, empty preferences removed language restrictions, unlinked banners bypassed language checks, linked content was not checked for active/deleted state, any non-Draft episode could qualify a series, and fallback could display content after its banner was disabled. The duplicated endpoint implementations also disagreed about series eligibility.

Regression check: `node --test scripts/tests/test-banner-visibility.mjs`.
