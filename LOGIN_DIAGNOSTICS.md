# Login reliability changes

Both send-OTP and verify-OTP need MongoDB. During investigation, a direct connection using local configuration failed with a MongoDB server-selection error; a sandboxed attempt also encountered an SRV DNS timeout. This confirms a connection problem from this machine, but does not establish the production deployment's exact cause.

Check the failing deployment's logs and verify its MONGODB_URI and JWT_SECRET configuration, Atlas cluster availability, database-user permissions, and network access rules for the deployment's egress. Do not paste credentials into logs or issue reports.

Changes:

- Login database connections skip unrelated coming-soon release maintenance.
- MongoDB server selection/connect waits are limited to 8 seconds, socket waits to 15 seconds; DNS resolution may have its own timeout. Cached failed connections can reconnect.
- OTP query indexes support the phone cooldown and latest unused OTP lookup. Ensure these indexes are created during deployment if automatic index creation is disabled.
- Session registration reads only device fields and updates only those fields instead of validating/saving an entire legacy user document.
- OTP is consumed atomically after session and signing preparation, so a database/session failure leaves it available for retry. Concurrent new-user duplicate creation is handled.
- Numeric phone/OTP JSON input is normalized. Database outages return retryable HTTP 503 instead of an undifferentiated HTTP 500. Missing JWT configuration also returns 503.
- OTP values and full database error objects are no longer printed by the login routes.

The existing SMS-provider TODO remains: send-OTP stores a code but does not call an SMS provider. These changes do not enable SMS delivery or repair an unreachable Atlas deployment. No successful live login or latency improvement is claimed without a reachable database and deployed end-to-end verification.

Regression tests: `node --experimental-vm-modules --test scripts/tests/test-login.mjs` (mocked DB/session dependencies; existing and new users, session/database outage, missing JWT, consumed OTP).

After replacing local MONGODB_URI with the manager-provided server, database connectivity succeeded (~395 ms). A local production build passed. The isolated live test (`node --env-file=.env.local scripts/tests/test-login-live.mjs`) successfully sent/verified OTP for a temporary new user (~1997 ms total) and then the same existing user (~544 ms total); test records were removed. These measurements cover this local server and database only. The hosted deployment still needs its environment variable updated and redeployed.
