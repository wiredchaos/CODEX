# Wired Chaos 3DT pipeline spine

This directory anchors the non-destructive execution spine for the Wired Chaos `-3DT` consumers. It establishes a single intake channel and job-based output layout without choosing renderers or hardware assumptions.

## Intake
- **Standard location:** `WIRED_CHAOS_3DT/INTAKE/`.
- **Ownership:** Wired Chaos runs the pipeline; `-3DT` consumers **only** drop inputs into an intake folder.
- **Job identity:** Each folder inside `INTAKE/` is treated as a **job**, not a project.

## Jobs and outputs
- **Job root:** `WIRED_CHAOS_3DT/JOBS/<job-id>/`.
- **Versions:** Each run produces `versions/vXXXX/` with placeholder artifacts; rendering is intentionally deferred.
- **Metadata:** Every version captures the consumer name, timestamp, and version tag for traceability.
- **Execution stance:** No rendering engine selection and no GPU assumptions are made here—this is orchestration only.

## How to trigger
Use the `Wired Chaos 3DT pipeline` workflow (manual dispatch) to register a job intake and emit the next placeholder version. The workflow updates manifests only; it does **not** perform rendering.
