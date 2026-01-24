# WIRED CHAOS WebGPU Compute Cell

This module is the headless WebGPU compute primitive for WIRED CHAOS. It is **not** a renderer, does **not** require a canvas, and is meant to live beneath Legs as a callable compute engine.

## Integration stance

- **Brain** stays unaware of WebGPU.
- **Crab** can request high-throughput computations.
- **Legs** owns the compute capability and calls the cell.

## Compute cell API

`WebGPUComputeCell.submit` is the only primitive you need:

```
submit({
  inputBuffers,
  outputByteLengths,
  shader,
  uniforms,
  workgroupCount,
}) → { outputBuffers }
```

### Binding layout contract

Bindings are deterministic, so the shader stays predictable:

1. `@group(0) @binding(0..N-1)` → input storage buffers (read-only)
2. `@group(0) @binding(N..N+M-1)` → output storage buffers (read-write)
3. `@group(0) @binding(N+M)` → uniform buffer (optional)

If uniforms are omitted, the uniform binding is not created.

## Example: swarm scoring kernel

The included kernel scores agent state in parallel (non-visual). It treats each agent as four floats: `position.xy` + `velocity.xy`.

```
import { WebGPUComputeCell, buildSwarmScoreSubmission } from "src/lib/webgpu"

const cell = await WebGPUComputeCell.create()
const agents = new Float32Array(agentCount * 4)
const submission = buildSwarmScoreSubmission(agents, agentCount, {
  positionWeight: 1.2,
  velocityWeight: 0.4,
})

const { outputBuffers } = await cell.submit(submission)
const scores = new Float32Array(outputBuffers[0])
```

## Legs capability surface

Use the Legs wrapper to keep the Brain blind to WebGPU:

```
import { createWebGPUComputeCell } from "src/lib/legs"

const cell = await createWebGPUComputeCell()
```

## Operational notes

- Prefer batch submissions over frame-by-frame readbacks.
- Keep shader logic strictly numeric; do **not** embed agent logic in WGSL.
- Use the buffer helpers in `src/lib/webgpu/buffers.ts` for alignment and safe IO.
