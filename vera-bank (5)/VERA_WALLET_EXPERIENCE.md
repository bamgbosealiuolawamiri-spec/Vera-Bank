# VERA Digital Wallet Experience

## Product direction
VERA is currently a simulated wallet prototype. This feature direction takes inspiration from the convenience of digital-wallet products such as PayPal, without copying their branding or implying that VERA is a licensed financial institution.

## First release: simulated experience only
- A clear wallet overview showing the demo balance and currency.
- A transaction activity list with clear demo labels.
- A recipient lookup flow using supported VERA demo account identifiers.
- A confirmation and receipt screen for simulated transfers.
- Privacy-first recipient display: show only the minimum identifying details needed to confirm the intended demo recipient.
- Clear unavailable-state messaging if the shared VERA service cannot be reached.
- A visible notice that balances and transfers are simulated and have no cash value.

## Explicitly out of scope
- Real deposits, withdrawals, card funding, bank linking, merchant checkout, remittances, cash-out, or real-money transfers.
- Collection or storage of bank/card credentials.
- Claims that VERA is a bank, regulated payment provider, or offers PayPal-equivalent protections.

Real-money functionality would require appropriate regulated payment partners, legal review, security and fraud controls, and an approved integration. It must not be represented as active in this prototype.

## Engineering principles
- The server remains authoritative for demo balances and transaction records.
- Never trust client-submitted balances or transaction outcomes.
- Keep transfer operations atomic and idempotent, and reject insufficient demo balances.
- Do not expose passwords, authentication tokens, or full account details in UI or logs.
- Keep the existing account and transaction data intact.
- Test with separate demo accounts before any deployment.

## Acceptance checks
1. The wallet clearly identifies itself as a simulation.
2. The overview loads from the shared backend, not a browser-only fallback on Render.
3. Recipient lookup shows a confirmation step before a simulated transfer.
4. A successful demo transfer updates both demo accounts and creates matching history entries.
5. An unavailable backend produces an honest error; it never pretends a transfer succeeded.
6. No real payment credentials or real-money rails are introduced.
