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

## Determinism and authority
- Scene construction is 100% registry-driven; `/rooms/<patch_id>` only renders entries present in `patch_registry.json`.
- Attract layers (galaxy view) are cosmetic and disposable; they never author state or bypass access rules.
- Elevator and room routing respect sealed/open states directly from registry + `user_state.json`—no ad hoc overrides.

## Interfaces locked for TourNavigator v2
- `patch_registry.json` schema is fixed (patch_id, display_name, room_type, access_rules, trinity_level, 3d_scene_profile, route_slug).
- Room3D onReady contract remains STUB_RUNTIME-only; engines may mount into `.pmv-room` without altering registry semantics.
- Trinity Elevator mount API is stable: `/elevator` renders immediately with no pre-scene blanks and reads straight from the registry.

## Locking semantics
- `access_rules.soft` → visible but inaccessible; rendered with amber accents.
- `access_rules.hard` → hidden; represented as ghost nodes/tiles.
- Unlock conditions evaluated live from `user_state.json` without page reload.

## 3DT runtime integration
- All rooms consume the shared STUB_RUNTIME layer; rendering is mocked but deterministic.
- No rendering logic lives inside patch content; patches contribute metadata + assets only.
- Integration points for v0.app are commented in the runtime script for future engine binding.
