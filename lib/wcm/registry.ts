import { PathwayEdge, WcmNode, WCMode } from "./types";

const DEFAULT_UNIVERSE = "core";

export function registerWcmNodes(): WcmNode[] {
  return [
    {
      id: "student-union-hub",
      title: "Student Union",
      description: "Neutral onboarding hub that routes to every multiverse entry point.",
      route: "/student-union",
      wc_mode: "BUSINESS",
      universe: DEFAULT_UNIVERSE,
      tags: ["hub", "neutral", "onboarding"],
      pathways: ["common"],
      kind: "HUB",
      hubRole: "NEUTRAL",
    },
    {
      id: "npc-prompt-command",
      title: "NPC Prompt Command",
      description: "Neutral prompt surface that can route anywhere through graph resolution.",
      route: "/npc-prompt-command",
      wc_mode: "BUSINESS",
      universe: DEFAULT_UNIVERSE,
      tags: ["prompt", "assistant", "neutral"],
      pathways: ["common"],
      kind: "SERVICE",
      hubRole: "NEUTRAL",
    },
    {
      id: "mall-entry",
      title: "WCM Mall",
      description: "Mall experience entry node with Trinity viewing surface when available.",
      route: "/mall",
      wc_mode: "BUSINESS",
      universe: DEFAULT_UNIVERSE,
      tags: ["retail", "navigation", "neutral"],
      pathways: ["commerce", "common"],
      kind: "EXPERIENCE",
      requiresTrinity: true,
    },
    {
      id: "university-entry",
      title: "WCM University",
      description: "University experience entry node with Trinity viewing surface when available.",
      route: "/university",
      wc_mode: "EDUCATION",
      universe: DEFAULT_UNIVERSE,
      tags: ["learning", "navigation", "neutral"],
      pathways: ["academia", "common"],
      kind: "EXPERIENCE",
      requiresTrinity: true,
    },
    {
      id: "fen-akashic-entry",
      title: "FEN Akashic Labyrinth Entry",
      description: "Entry point to the Akashic labyrinth requiring prompt-based progression.",
      route: "/fen/labyrinth",
      wc_mode: "AKASHIC",
      universe: DEFAULT_UNIVERSE,
      tags: ["labyrinth", "prompt", "fen"],
      pathways: ["akashic", "common"],
      kind: "PORTAL",
      requiresLabyrinth: true,
    },
  ];
}

export function registerWcmEdges(): PathwayEdge[] {
  return [
    {
      from: "student-union-hub",
      to: "mall-entry",
      reason: "onboarding -> commerce",
      wc_mode: "BUSINESS",
      weight: 1,
    },
    {
      from: "student-union-hub",
      to: "university-entry",
      reason: "onboarding -> education",
      wc_mode: "EDUCATION",
      weight: 1,
    },
    {
      from: "student-union-hub",
      to: "fen-akashic-entry",
      reason: "onboarding -> akashic",
      wc_mode: "AKASHIC",
      weight: 1,
    },
    {
      from: "npc-prompt-command",
      to: "student-union-hub",
      reason: "neutral return",
      weight: 1,
    },
    {
      from: "mall-entry",
      to: "university-entry",
      reason: "commerce-adjacent learning pathway",
      weight: 0.5,
    },
    {
      from: "mall-entry",
      to: "npc-prompt-command",
      reason: "request guidance",
      weight: 0.5,
    },
    {
      from: "university-entry",
      to: "npc-prompt-command",
      reason: "ask for support",
      weight: 0.5,
    },
  ];
}

export function getNodeByRoute(route: string): WcmNode | undefined {
  return registerWcmNodes().find((node) => node.route === route);
}

export function getNodeById(id: string): WcmNode | undefined {
  return registerWcmNodes().find((node) => node.id === id);
}

export function getRelatedNodes(
  nodeId: string,
  options?: { samePathwayOnly?: boolean; limit?: number }
): WcmNode[] {
  const nodes = registerWcmNodes();
  const current = nodes.find((node) => node.id === nodeId);
  if (!current) return [];

  const related = nodes.filter((candidate) => {
    if (candidate.id === current.id) return false;
    if (!options?.samePathwayOnly) return true;
    return candidate.pathways.some((tag) => current.pathways.includes(tag));
  });

  return related.slice(0, options?.limit ?? related.length);
}

export function getNextNodes(
  nodeId: string,
  options?: { wc_mode?: WCMode; universe?: string; limit?: number }
): WcmNode[] {
  const edges = registerWcmEdges();
  const nodes = registerWcmNodes();
  const filteredEdges = edges.filter((edge) => {
    if (edge.from !== nodeId) return false;
    if (options?.wc_mode && edge.wc_mode && edge.wc_mode !== options.wc_mode) return false;
    if (options?.universe && edge.universe && edge.universe !== options.universe) return false;
    return true;
  });

  const sorted = filteredEdges.sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0));
  const nextNodes = sorted
    .map((edge) => nodes.find((node) => node.id === edge.to))
    .filter(Boolean) as WcmNode[];

  return nextNodes.slice(0, options?.limit ?? nextNodes.length);
}
