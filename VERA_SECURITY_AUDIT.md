# VERA authentication and transfer security audit

This audit records the code paths inspected on the feature branch. It is not a penetration test or a claim of production security.

## Two separate application flows exist

### Shared web wallet (the Render service)
- Entry point: `src/app/App.jsx`
- Context: `src/context/AppContext.jsx`
- API client: `src/services/store.js`
- Backend: `server.mjs`
- Shared business logic: `src/services/engine.js`
- Web settings UI: `src/web/dashboardViews.jsx`

The web client stores a user ID in localStorage and sends it as `userId` in API arguments. The server currently passes those arguments directly into `runAction`. Therefore the server does not independently establish the caller's identity.

### Separate mobile-style prototype
- Entry point: `src/app/MobileApp.jsx`
- Transfer screens: `src/app/screens/Send.jsx`
- Settings/security screens: `src/app/screens/Settings.jsx`
- API client: `src/services/api.js`
- Auth context: `src/context/AuthContext.jsx`

This flow uses a local demo API and localStorage. Its existing Security screen displays demo PIN/password dialogs and a biometric toggle, but those controls do not verify credentials or enforce transfer authorization. It must not be mistaken for server-enforced security.

## Transfer-related server actions requiring a common authorization gate

At minimum:
- `transfer`
- `bankTransfer`
- `payBill`
- `buyAirtime`
- `buyData`
- `buyGiftCard`
- `deposit` (credit operation; should be separately restricted to demo/admin flows)
- `pocketAdd` and `pocketWithdraw` (balance-affecting savings operations)

The authorization decision must happen in the server before the engine mutates state. UI-only checks are not security controls.

## Implementation boundary

The first secure milestone should target the shared web wallet and its Render backend, because that is the shared-state application. The mobile-style prototype must either be migrated to the same authenticated API or clearly remain a separate local demo; adding a decorative PIN dialog to it would not meet the requirement.

Before implementing and releasing the milestone, resolve:
1. Server-verified session lifecycle and identity binding.
2. Password hashing and safe migration of existing demo users.
3. Server-side PIN setup, verification, throttling and one-time transaction authorization.
4. A single enforced gate for every balance-changing action.
5. Regression coverage for existing account state and transfers.

Passkeys/WebAuthn are a separate follow-up phase after the session and PIN foundations are complete.
