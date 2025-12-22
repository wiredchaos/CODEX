import { PathDefinition, WorldId } from '../../types/pathEngine.js';

function buildCanonPath(
  world: WorldId,
  stages: Array<{
    id: string;
    title: string;
    description: string;
  }>,
  gating: { required?: string[]; blocked?: string[] }
): PathDefinition {
  const nodes: PathDefinition['nodes'] = {};

  stages.forEach((stage, index) => {
    const nextStage = stages[index + 1];
    nodes[stage.id] = {
      id: stage.id,
      title: stage.title,
      description: stage.description,
      world,
      next: nextStage ? [nextStage.id] : [],
      gate: index === 0
        ? undefined
        : {
            required: gating.required,
            blocked: gating.blocked,
            description: 'Patch-gated progression using the same rules as the NPC reference path.'
          },
      timeline: {
        metadata: { stage: stage.id, world }
      }
    };
  });

  return {
    world,
    start: stages[0]?.id ?? '',
    nodes
  };
}

export const pathDefinitions: Record<WorldId, PathDefinition> = {
  '3DT': buildCanonPath(
    '3DT',
    [
      { id: 'boot', title: 'NPC Boot', description: 'NPC wakes up inside the 3DT simulation.' },
      { id: 'sense', title: 'Sense World', description: 'Gather world context and player intent.' },
      { id: 'plan', title: 'Plan Response', description: 'Draft a safe, canon-aligned plan for the NPC.' },
      { id: 'act', title: 'Act', description: 'Perform the action using the agreed plan.' },
      { id: 'reflect', title: 'Reflect', description: 'Log observations and prepare for the next loop.' }
    ],
    {
      required: ['NPC_CANON_READY'],
      blocked: ['NPC_MAINTENANCE']
    }
  ),
  AKIRA_CODEX: buildCanonPath(
    'AKIRA_CODEX',
    [
      { id: 'ingest', title: 'Ingest Text', description: 'Load codex entry and prepare reading context.' },
      { id: 'interpret', title: 'Interpret', description: 'Summarize and align with canon reading paths.' },
      { id: 'canonize', title: 'Canonize', description: 'Validate canon and mark authoritative take.' },
      { id: 'broadcast', title: 'Broadcast', description: 'Share the canon interpretation with listeners.' },
      { id: 'archive', title: 'Archive', description: 'Record the interaction and store provenance.' }
    ],
    {
      required: ['CANON_PATCH_APPLIED'],
      blocked: ['READ_ONLY_MODE']
    }
  ),
  CREATOR_CODEX: buildCanonPath(
    'CREATOR_CODEX',
    [
      { id: 'draft', title: 'Draft', description: 'Initial creative draft aligned to creator goals.' },
      { id: 'refine', title: 'Refine', description: 'Iterate with feedback while respecting canon.' },
      { id: 'proof', title: 'Proof', description: 'Verify safety, ethics, and compliance.' },
      { id: 'publish', title: 'Publish', description: 'Release to the studio output stream.' },
      { id: 'followup', title: 'Follow-up', description: 'Gather reactions and prime the next draft.' }
    ],
    {
      required: ['CREATOR_CANON_READY'],
      blocked: ['CREATOR_HOLD']
    }
  )
};
