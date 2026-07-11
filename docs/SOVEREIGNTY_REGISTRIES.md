# Sovereignty Registries

Registry data is isolated under `registry/sovereignty/`:
- `models/`
- `providers/`
- `hardware/`
- `rights/`
- `jurisdictions/`

Strict schemas are tracked under `schemas/sovereignty/`, and runtime validation enforces required IDs, no unknown fields, status/capability/operation enums, unique IDs, reference integrity, review-date freshness, and URL format checks. Validation output includes counts for models, providers, hardware, rights, and jurisdictions.

Unsupported or speculative values must be `unknown` or `not_verified`; mock adapters and records must state `mock`, `not_verified`, or `development_only`.
