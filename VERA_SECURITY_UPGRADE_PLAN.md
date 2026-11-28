# VERA security upgrade — implementation plan

> Scope: simulated VERA prototype only. This plan does not make VERA a real bank or production-ready financial service.

## Current blockers found in the existing backend

- The API currently trusts a `userId` supplied by the browser; that value is not proof of identity.
- Login compares plaintext passwords stored in the shared state file.
- The transfer engine can be called without a second authentication factor.
- The mobile prototype's security controls are currently presentation-only; PIN and biometric toggles do not enforce authentication.
- A frontend PIN modal alone would be bypassable by calling the API directly.

## Required implementation order

### Phase 1 — establish real server-side sessions
- Authenticate login and registration on the server.
- Issue an unpredictable session credential in a Secure, HttpOnly, SameSite cookie.
- Resolve the signed-in user from the server-side session on every protected request; never trust a browser-supplied user ID.
- Add logout and session expiry/revocation.
- Add CSRF protections appropriate to cookie-authenticated state-changing requests.
- Migrate existing plaintext passwords to salted password hashes without breaking existing demo accounts; never return password or hash fields to the client.

### Phase 2 — mandatory transaction PIN
- Add PIN setup and change flows that require current account authentication.
- Store only a salted, slow password hash of the PIN (never the PIN itself).
- Verify the PIN on the server for each money-moving demo action.
- Bind a short-lived, single-use authorization to the authenticated user and exact transaction details (recipient, amount, and action); invalidate it if any detail changes.
- Apply server-side attempt throttling and temporary cooldowns.
- Ensure all transfer/payment routes enforce the same authorization layer, not just the visible Send Money screen.

### Phase 3 — device biometrics / passkeys
- Use WebAuthn/passkeys where supported by the device and browser.
- Verify challenges and signatures on the server over HTTPS.
- Store public-key credential data only; the device/platform authenticator retains the private key and handles Face ID/fingerprint verification.
- Do not collect, store, or attempt to read face or fingerprint images/templates.
- Keep PIN as the fallback when passkeys are unavailable or the user has not enrolled a device.

## Acceptance tests before release

- Unauthenticated requests cannot read another user's data or perform any mutation.
- Changing a client-supplied `userId` cannot change which account is accessed.
- A transfer cannot execute without a valid server-verified authorization.
- Authorization cannot be reused, replayed, or applied to a different recipient or amount.
- Incorrect PIN attempts are throttled; PINs and credentials never appear in logs or API responses.
- Logout revokes the session; expired/revoked sessions are rejected.
- Existing demo accounts and data survive migration.
- Passkey enrollment and verification work on supported browsers; unsupported devices retain the PIN flow.
- Build, automated tests, and manual web/mobile regression tests pass.

## Release rule

Work stays on `feature/secure-transfer-auth` until reviewed and tested. Do not merge to `main` or deploy without explicit user approval.