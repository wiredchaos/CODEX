# Trinity Elevator Routing Rules

These rules describe how Trinity rooms link, unlock, and respect gating across the WIRED CHAOS multiverse. They are UI-agnostic and assume the PATCH registry is the single source of truth.

## Link Resolution
- `PATCH_REGISTRY.links` enumerates valid outbound routes from a room. Frontends should only present or traverse links listed in the registry.
- Hubs may have fan-out links; timelines can list patches or other hubs to express allowed progression.
- Routes are directional as listed. Bidirectional travel must be explicitly declared on both sides.

## Timeline Skipping
- Skipping a timeline segment is permitted only when the registry gate `allow_skip_if` is satisfied.
- Skip rules must be deterministic strings resolved by the WIRED CHAOS runtime (e.g., `artifact:<id>`, `manual-override:<role>`).
- If no skip rule is met, traversal must follow registry order or stay on the current node.

## Locked Room Behavior
- **Locked + visible:** Room is listed but cannot be entered until gates are satisfied.
- **Locked + invisible:** Room is hidden until any gate dependency changes state (artifact, NFT, clue, or override) and visibility is recalculated.
- Visibility must be recalculated by the runtime after each state change (artifact acquisition, NFT verification, clue resolution, or override).

## Gate Priority
When evaluating access, apply the highest satisfied condition first:
1. Artifact possession
2. NFT verification
3. Clue resolution
4. Manual override

A higher-priority satisfied condition unlocks traversal regardless of lower-priority states. If multiple conditions are unsatisfied, traversal remains blocked until the next priority threshold is met.
