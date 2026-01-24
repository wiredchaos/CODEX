import type { ComputeSubmission } from "../computeCell"

export const swarmScoreShader = `
struct Agent {
  position: vec2<f32>,
  velocity: vec2<f32>,
}

struct Weights {
  positionWeight: f32,
  velocityWeight: f32,
}

@group(0) @binding(0) var<storage, read> agents: array<Agent>;
@group(0) @binding(1) var<storage, read_write> scores: array<f32>;
@group(0) @binding(2) var<uniform> weights: Weights;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
  let index = id.x;
  if (index >= arrayLength(&agents)) {
    return;
  }

  let agent = agents[index];
  let positionScore = length(agent.position) * weights.positionWeight;
  let velocityScore = length(agent.velocity) * weights.velocityWeight;
  scores[index] = positionScore + velocityScore;
}
`

export function buildSwarmScoreSubmission(
  agents: Float32Array,
  agentCount: number,
  weights: { positionWeight: number; velocityWeight: number },
): ComputeSubmission {
  const uniformData = new Float32Array([weights.positionWeight, weights.velocityWeight])
  return {
    inputBuffers: [agents],
    outputByteLengths: [agentCount * Float32Array.BYTES_PER_ELEMENT],
    shader: swarmScoreShader,
    uniforms: uniformData,
    workgroupCount: [Math.ceil(agentCount / 64), 1, 1],
    label: "swarm-score",
  }
}
