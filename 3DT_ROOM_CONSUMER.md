# 3DT Room Consumer contract

Every `-3DT` patch becomes a room inside the Portfolio Multiverse without custom wiring. Patches provide content + metadata; the shared runtime handles rendering and gating.

## Responsibilities
- **Patches:** deliver assets and descriptive metadata only; never ship custom render code.
- **Wired Chaos runtime:** mounts STUB_RUNTIME visuals, enforces locks, and routes navigation.
- **Registry:** `patch_registry.json` is the single source of truth; generated automatically via `scripts/portfolio_multiverse_registry.py`.

## Required registry fields
- `patch_id`: matches the `-3DT` artifact name.
- `display_name`: human-readable label.
- `room_type`: `portfolio|system|lore|runtime|vault`.
- `access_rules`: `soft` and `hard` condition arrays (`artifact:`, `nft:`, `flag:`, `puzzle:`).
- `trinity_level`: elevator depth index.
- `3d_scene_profile`: lighting/motion/particles/scale hints for the runtime.
- `route_slug`: URL-friendly slug.

## Unlock evaluation
- The runtime reads `user_state.json` and resolves locks at render time.
- Soft locks remain visible; hard locks collapse into hidden placeholders.
- Direct deep-links to locked rooms redirect back to `/lobby`.

## Extension points
- Attach real engines by replacing the `STUB_RUNTIME` markers in `portfolio_multiverse/runtime/portfolio_multiverse.js`.
- v0.app-compatible render mounts can bind to the `hero` container inside the room template.
- Additional access primitives can extend the `access_rules` object without altering per-room code.
