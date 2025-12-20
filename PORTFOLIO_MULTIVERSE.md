# Portfolio Multiverse (WOW-first)

The Portfolio Multiverse makes every `-3DT` patch auto-appear as a navigable 3D room. Room creation is registry-driven and deterministic—no manual wiring—and all rendering is STUB_RUNTIME compliant until engines are bound.

## Flow
1. Registry generation: `python scripts/portfolio_multiverse_registry.py --write` scans repository root for `-3DT` artifacts and writes `patch_registry.json`.
2. User state: `user_state.json` tracks artifacts/NFTs/flags/puzzles used to unlock rooms at runtime.
3. Runtime boot: open `portfolio_multiverse/index.html` (any static host) to immediately enter the galaxy lobby with depth, parallax, particles, and motion.
4. Navigation: `/lobby` shows the galaxy map, `/rooms/<patch_id>` deep-links into any room (soft-lock aware), `/elevator` renders Trinity levels.

## Zero manual wiring
- New `-3DT` drops auto-register via `patch_registry.json` generation.
- Rooms assemble themselves from the registry fields; no per-room code lives inside patches.
- Wired Chaos executes the runtime; CODEX owns the structural registry.

## Immediate immersion
- Canvas starfield + parallax layers render on first paint; there is never a flat page before depth/motion.
- Ambient particles and motion persist across lobby, rooms, and elevator views.
- Audio hooks are stubbed; integrate future engines in `portfolio_multiverse/runtime/portfolio_multiverse.js` (see `audio` object).

## Locking semantics
- `access_rules.soft` → visible but inaccessible; rendered with amber accents.
- `access_rules.hard` → hidden; represented as ghost nodes/tiles.
- Unlock conditions evaluated live from `user_state.json` without page reload.

## 3DT runtime integration
- All rooms consume the shared STUB_RUNTIME layer; rendering is mocked but deterministic.
- No rendering logic lives inside patch content; patches contribute metadata + assets only.
- Integration points for v0.app are commented in the runtime script for future engine binding.
