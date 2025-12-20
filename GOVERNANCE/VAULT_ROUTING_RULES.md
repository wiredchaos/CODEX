# Chaos Vault Routing Rules (Canonical)

The Chaos Vault operates as a dual-expression system with IO and Akashic sides enforced by portal law. These rules are deterministic, UI-agnostic, and must be applied by registries, portal resolvers, and asset ingest pipelines.

## 1. Asset Classification Pipeline
Every asset entering the Chaos Vault must traverse this stack before display.

### Step 1 — IP Status (exactly one)
- VERIFIED
- IMPLIED (creator-asserted)
- UNKNOWN
- NO-IP / RESTRICTED

No status means no entry.

### Step 2 — Attachments
Record whether the asset includes:
- RWA attached (legal or physical anchor)
- Wallet provenance verified (BlockchainTrapper.eth / Phantom indexed)
- Signal-only metadata (for 33.3FM adjacency)

### Step 3 — Routing Decision (auto, no human override)
| IP Status          | RWA Attached | Route Result               |
| ------------------ | ------------ | -------------------------- |
| VERIFIED           | Yes / No     | CHAOS VAULT — IO           |
| IMPLIED            | Yes / No     | CHAOS VAULT — IO (flagged) |
| UNKNOWN            | Yes          | CHAOS VAULT — Akashic      |
| UNKNOWN            | No           | RUG VAULT                  |
| NO-IP / RESTRICTED | Any          | RUG VAULT                  |

## 2. Chaos Vault — IO Side Rules
- Visibility: Public
- Tone: Institutional
- Function: Display · Index · Provenance
- Allowed asset types: DIGITAL ART, VIDEO, AVATAR / PFP, RWA, UTILITY / ACCESS, ARCHIVAL DISPLAY
- Enforcement: No remix tools, no mint UI, no speculative language, no lore overlays, clean metadata only
- Display behavior: Assets shown as **objects**, provenance-focused context, never link to Akashic

## 3. Chaos Vault — Akashic Side Rules
- Visibility: Restricted
- Tone: Post-collapse archive
- Function: Memory · Lore · Continuum
- Allowed asset types: UNKNOWN IP, LEGACY artifacts, SYMBOLIC / NARRATIVE pieces, SIGNAL ERA remnants, Vault 33 / 589 materials
- Enforcement: No pricing, no buy/sell affordances, no outbound commercial links, discovery via portal only
- Descriptor: 
  ```
  CHAOS VAULT
  Post-Apocalyptic
  ```
- Display behavior: Assets are fragments, metadata may be incomplete, non-linear sequencing permitted

## 4. Rug Vault — Quarantine Law
- Visibility: Hidden, admin only
- Auto-routing triggers: UNKNOWN IP without RWA, NO-IP / RESTRICTED, legal ambiguity, incomplete provenance
- Rules: No public visibility, remix, monetization, broadcast, or Mall access
- Release requires IP upgrade, RWA attachment, or explicit admin elevation

## 5. Portal Behavior (Permissioned Transitions)
- Portals are enforced transitions, not links.
- IO → Akashic: requires context token **and** session qualification; never auto-suggested
- Akashic → IO: not allowed (one-way discovery only)
- Any → Rug Vault: admin only and invisible elsewhere

## 6. Mall / Student Union Interaction
- Mall never exposes Akashic directly; Mall cards route to Chaos Vault IO only
- Akashic discovery happens after IO via portal conditions

## 7. 33.3FM Dogechain Interface Rule
- Receives signal metadata only; no asset custody, vault logic, or IP evaluation
- Chaos Vault may emit signal echoes to 33.3FM; 33.3FM never emits assets back

## 8. Enforcement Surface
- The registry declares vault sides and portal constraints
- Portal resolvers enforce transitions and context-token checks
- Asset ingest pipelines must run the classification table before routing
- UI must not bypass these rules
