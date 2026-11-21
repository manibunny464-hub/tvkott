# TVK OTT starter

This repository starts from the Chirpi application snapshot with its current landing page, API collection corrections and OTP login reliability work. It is not the completed TVK full OTT implementation.

The source snapshot was imported without the original credential-bearing history. Local environment files are excluded. Configure organization-owned development credentials; do not connect this starter to a production Chirpi database or merchant account.

Use TVK_OTT_Scope_of_Work.md and TVK_OTT_Backend_Blueprint.md as the target scope. The app screen PDF is a separate design reference. Audit reusable modules before implementing the TVK phases. Legacy branding, existing debug UI/logs, payment assumptions and language behavior still require the planned redesign and production hardening.

Inherited embedded Razorpay fallback credentials were removed during import. Payment integrations require explicit environment configuration and verification. No production payment, SMS, DRM or transcoding integration is certified by this import.

Install locked dependencies, configure a separate development environment, then run lint, tests and a production build. Do not label inherited test fixtures or placeholder integrations as production-ready functionality.
