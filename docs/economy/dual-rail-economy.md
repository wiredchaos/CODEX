# WIRED CHAOS Dual-Rail Economy

FIAT is ingress-only. All in-world spending uses WC Tokens. The token ledger is the source of truth for balances, entitlements, and disputes.

## FIAT ingress flow
1. Client calls `POST /api/checkout/create` with a token pack. Mobile deep-links to this web endpoint; no in-app purchases.
2. Server resolves the pack price and tokens (never trusting client amounts) and creates a `PaymentIntent` plus a `CheckoutSession` record. The response contains the hosted checkout URL.
3. Payment provider posts events to `POST /api/webhooks/payment-provider`. Signature verification gates processing.
4. On `succeeded`, the webhook performs an idempotent credit: creates a `CREDIT_FIAT_PURCHASE` ledger entry, increments the `TokenAccount` balance, and marks the `PaymentIntent` as `SUCCEEDED`.
5. On `failed` or `canceled`, only the statuses are updated. On `refunded`, the webhook writes a `DEBIT_REFUND_REVERSAL` entry and moves the `PaymentIntent` to `REFUNDED`.
6. Every FIAT transaction maps 1:1 to a ledger credit entry via the payment `eventId` stored as the ledger `reasonCode`.

## Token accounting model
- `TokenAccount` (one per user per token type) holds the current balance. Default token type is `WC_TOKEN`.
- `LedgerEntry` is append-only. Balances update only through paired transactions inside DB transactions to keep integrity.
- Ledger entry types: `CREDIT_FIAT_PURCHASE`, `DEBIT_SPEND`, `CREDIT_REWARD`, `DEBIT_REFUND_REVERSAL`, `CREDIT_ADJUSTMENT`, `DEBIT_ADJUSTMENT`, `HOLD`, `RELEASE`.
- Status values: `PENDING`, `SETTLED`, `FAILED`, `REVERSED`. Normal flows write `SETTLED`; refunds use `REVERSED`.
- Idempotency: `(provider, providerIntentId, eventId/idempotencyKey)` must be unique. Webhook checks for an existing ledger entry using `reasonCode`.

## Refund and dispute flow
1. Refund is issued at the FIAT layer with the provider.
2. Provider webhook sends `status=refunded` with the original `providerIntentId` and `eventId`.
3. Server marks the `PaymentIntent` as `REFUNDED` and writes a `DEBIT_REFUND_REVERSAL` entry (negative tokens) against the account inside a transaction.
4. Any downstream entitlement checks read from the ledger/balance; tokens removed here reflect the refund. Additional metadata can store dispute IDs for audits.

## Security rules
- Web checkout only; mobile links to the hosted checkout URL returned by `/api/checkout/create`.
- Webhook signature verification uses `WEBHOOK_SECRET` and HMAC; failure returns HTTP 401.
- Never trust client token or fiat amounts. Prices resolve from `config/tokenPacks.ts` or server-side conversion constants.
- All balance mutations are transactional (Prisma `$transaction`), producing append-only ledger rows.
- Unique constraints prevent double-crediting a provider intent. Ledger `reasonCode` uses the payment `eventId` for 1:1 auditability.
- Rate-limit spending endpoints at the edge (middleware or gateway); payloads are schema-validated (Zod).
- Identity, lore, and progression read balances only from the ledger; FIAT values never enter gameplay logic.

## Patch billing interface
Use `lib/economy/billing.ts` for all balance mutations:
- `creditTokens(userId, amount, reasonCode, metadata?)` — credits balances and writes `CREDIT_FIAT_PURCHASE` entries.
- `spendTokens(userId, amount, reasonCode, metadata?)` — debits balances with `DEBIT_SPEND` entries and checks sufficiency.
- `getBalance(userId)` — returns current balance and recent ledger entries.
- `createLedgerForRefund` — debits a reversed amount for refunds/disputes.

## API surface
- `POST /api/checkout/create` — start hosted checkout; returns checkout URL, `CheckoutSession` id, and `PaymentIntent` id.
- `POST /api/webhooks/payment-provider` — provider event ingress with signature verification and idempotent credits/debits.
- `POST /api/tokens/spend` — atomic spend with balance validation.
- `GET /api/tokens/balance` — read balance + recent ledger.

## Token store UI
`public/token-store.html` lists packs, launches checkout, shows balances, and exposes a dev-only spend form to validate ledger writes.

## Running locally
```bash
npm install
export DATABASE_URL="file:./dev.db"
npx prisma migrate dev --name init
npm run dev
```
Visit `http://localhost:3000/token-store.html` to exercise the dual-rail flows.
