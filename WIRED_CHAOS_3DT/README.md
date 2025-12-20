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

## How a job becomes a render (execution spine)
- **Register intake → job:** Use the `Wired Chaos 3DT pipeline` workflow to register an intake folder. Each registration creates `JOBS/<job-id>/versions/vXXXX/` with **pending** metadata.
- **Execution workers:** Run `python scripts/wired_chaos_3dt_worker.py --watch --verbose` to watch `JOBS/`, claim pending jobs, and perform a deterministic **STUB_EXECUTION** placeholder render.
- **Status transitions:** Metadata and manifests move `pending → running → completed/failed` as the worker executes. Outputs stay non-destructive and versioned under each job; failures record the error with no GPU/render binding.
- **Consumer scope:** All projects ending in `-3DT` are treated as execution consumers; consumers only supply intake inputs, and Wired Chaos executes the pipeline.
