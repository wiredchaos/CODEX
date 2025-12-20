# dripONchain Thrift Store (Student Union District)

## Purpose
Blockchain thrift store and onboarding commerce zone inside the Student Union -> Mall pathway. All navigation stays inside the WCM graph and resolves via registry node `dripONchain` (zone `student_union`, storeKind `thrift_store`).

## Store Leasing
- Stall leasing unlocks listing capacity and branding; leases are entitlements, not investments.
- Lease tiers: FREE, STANDARD, PRO.
- Leasing rules:
  - Protected Trade / escrow enforced on all transactions.
  - Leases are attached to stalls and expire on schedule.
  - Lease benefits map directly to listing limits and Creator Codex priority.

## Listing Creation Pipeline
1) User uploads item images.
2) User selects template: `thrift_basic`, `streetwear`, `archive`, or `collector`.
3) Creator Codex processes images: normalized framing, clean backgrounds, card image, alt text, and descriptions.
4) System emits a Listing Draft (IP status defaults to UNKNOWN; layaway ON; shipping mode default HYBRID).
5) User confirms metadata: title, category, condition, price, layaway toggle, shipping vs in-person.

Entities: StoreLease, Stall, LeaseTier, ListingAsset, ListingDraft, Listing.

## Commerce + Fees
- Platform fee (bps) + optional render fee applied per listing.
- Fees logged to append-only ledger and included in escrow invoice.
- Seller payouts release only after escrow clears.

## Layaway + OTC (Safe by Default)
- Layaway includes deposit, installment schedule, grace + cancel windows, and ERC-404 Layaway Claim NFT.
- Protected Trade escrow is mandatory; invoice-based payments only.
- OTC mode: private listing links, QR for in-person mutual scan, panic cancel enabled.

## Wallet + Safety
- No raw address pasting; approval firewall + signature simulation + anti-drain rails enforced.
- Akashic Wallet: inventory, claims, progress.
- Business Wallet: escrow, payouts, receipts.

## Creator Codex Visuals
- All renders go through Creator Codex pipeline for framing, thumbnails, and accessibility alt text.
- Render fees are transparent and optional per listing.

## Navigation + Placement
- Student Union CTAs and Mall pathways route to `dripONchain` via Graph Router (WcmLink).
- Mall never exposes Akashic directly; IO pathways only.
