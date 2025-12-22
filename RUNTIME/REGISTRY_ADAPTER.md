# Registry Adapter Contract

This contract defines how `REGISTRY/PATCH_REGISTRY.json` is consumed by WIRED CHAOS runtime services and 3DT frontends while allowing the data source to be swapped without refactors.

## Purpose
- **WIRED CHAOS runtime:** Loads the registry to enforce gates, route traversal, and synchronize status defaults across timelines.
- **3DT frontends:** Render room state and available routes based on the same authoritative registry without embedding business logic.

## Required Fields
Each registry entry **must** include:
- `id` (string, kebab-case, globally unique)
- `name` (string)
- `type` (`"PATCH" | "TIMELINE" | "HUB"`)
- `consumer_3dt` (boolean)
- `description` (string)
- `artifacts` (array of strings; empty allowed)
- `timelines` (array of timeline ids the entry belongs to; empty for timeline entries)
- `gates` (object)
  - `requires_nft` (string|null)
  - `requires_artifact` (string|null)
  - `requires_clue` (string|null)
  - `allow_skip_if` (array of rule strings)
- `links` (array of ids this entry can route to)
- `status_defaults` (object)
  - `locked` (boolean)
  - `visible` (boolean)

## Optional / Interpreted Fields
- Empty arrays or `null` values are valid and indicate no requirement for that field.
- Runtime may extend entries with computed state (e.g., `resolved_locked`) but must not mutate the persisted registry schema.

## Adapter Responsibilities
- Validate schema on load and reject entries missing required fields.
- Normalize IDs and links to ensure referential integrity across patches, timelines, and hubs.
- Expose a stable access layer (e.g., `getNode(id)`, `listLinks(id)`, `canSkip(id, state)`) that frontends and services can call without knowing storage details.
- Preserve read-only behavior for consumers: mutation APIs must be runtime-internal and may not be surfaced to frontends.

## Forward-Compatibility Guarantees
- New fields will be additive; existing fields retain type and meaning.
- Unknown fields must be ignored by consumers but preserved through load/save cycles.
- Versioning is controlled by CODEX. Runtimes and UIs must tolerate new optional fields without code changes by relying on the required field contract above.
