# Trinity Elevator navigation model

The Trinity Elevator provides vertical traversal between timelines (levels) with horizontal branching across rooms on each level.

## States
- **Unlocked:** user meets all requirements; room tiles are interactive.
- **Soft-locked:** requirements partially met; tiles remain visible but inactive.
- **Hard-locked:** requirements not met; tiles collapse into ghost placeholders and stars are hidden in the lobby.

## Rendering behavior
- Each level column draws from `patch_registry.json` grouped by `trinity_level`.
- Locked floors remain visually represented; horizontal branches remain deterministic and ordered.
- Elevator state reacts to `user_state.json` without page reload, enabling mid-session unlocks.

## URLs
- `/elevator` renders the stacked levels with branching rooms.
- `/rooms/<patch_id>` deep-links to a room tile; hard-locked rooms redirect to `/lobby`.
- `/lobby` remains the default landing view and galaxy map.

## Integration with Wired Chaos execution
- Elevator navigation is generated from the same registry used by the 3DT pipeline; no additional per-room wiring is needed.
- Execution ownership remains Wired Chaos; structural ownership remains CODEX.
- Rendering stays STUB_RUNTIME compliant—no GPU assumptions, ready for future engines to mount.
