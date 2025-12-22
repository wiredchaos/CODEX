import { getNextNodes, getNodeById, registerWcmNodes } from "../wcm/registry";
import { WCMode } from "../wcm/types";
import { PortalContext } from "../vault/routing";

type EngineInput = {
  nodeId: string;
  wc_mode?: WCMode;
  universe?: string;
  userPrompt?: string;
  portalContext?: PortalContext;
};

type EngineOutput = {
  allowedNextNodeIds: string[];
  gateMessage: string;
  requiredPromptHints: string[];
};

const INTENT_TOKENS = ["learn", "build", "verify", "trace", "unlock", "enter", "continue"];
const MIN_WORD_COUNT = 5;

function promptIsSufficient(prompt?: string, tags: string[] = []): { ok: boolean; hints: string[] } {
  const hints: string[] = [];
  if (!prompt || prompt.trim().length === 0) {
    hints.push("Provide a prompt with your intent and a pathway keyword.");
    return { ok: false, hints };
  }

  const words = prompt.trim().split(/\s+/);
  if (words.length < MIN_WORD_COUNT) {
    hints.push(`Use at least ${MIN_WORD_COUNT} words to describe what you want.`);
  }

  const hasIntent = INTENT_TOKENS.some((token) => prompt.toLowerCase().includes(token));
  if (!hasIntent) {
    hints.push(`Include an intent token such as: ${INTENT_TOKENS.join(", ")}.`);
  }

  const hasTag = tags.some((tag) => prompt.toLowerCase().includes(tag.toLowerCase()));
  if (!hasTag && tags.length > 0) {
    hints.push(`Reference one of these pathways: ${tags.join(", ")}.`);
  }

  return { ok: hints.length === 0, hints };
}

export function runLabyrinthStep(input: EngineInput): EngineOutput {
  const node = getNodeById(input.nodeId);
  const fallback: EngineOutput = {
    allowedNextNodeIds: [],
    gateMessage: "Node not found or no routes available.",
    requiredPromptHints: ["Verify the node id and try again."],
  };

  if (!node) return fallback;

  const promptCheck = promptIsSufficient(input.userPrompt, node.tags);
  if (!promptCheck.ok) {
    return {
      allowedNextNodeIds: [],
      gateMessage: "Prompt does not meet labyrinth requirements.",
      requiredPromptHints: promptCheck.hints,
    };
  }

  const nextNodes = getNextNodes(node.id, {
    wc_mode: input.wc_mode,
    universe: input.universe,
    limit: 5,
    portalContext: input.portalContext,
  });

  const allowedNextNodeIds = nextNodes.slice(0, 5).map((n) => n.id);

  return {
    allowedNextNodeIds,
    gateMessage: allowedNextNodeIds.length ? "Advance permitted." : "No connected nodes available.",
    requiredPromptHints: promptCheck.hints,
  };
}

export function getLabyrinthEntryNodeId(): string | undefined {
  return registerWcmNodes().find((node) => node.requiresLabyrinth)?.id;
}
