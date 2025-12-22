import { evaluatePortalTransition, PortalContext } from "../vault/routing";
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
      zone: "student_union",
      tags: ["hub", "neutral", "onboarding"],
      pathways: ["common"],
      kind: "HUB",
      hubRole: "NEUTRAL",
      vaultSide: "NEUTRAL",
    },
    {
      id: "npc-prompt-command",
      title: "NPC Prompt Command",
      description: "Neutral prompt surface that can route anywhere through graph resolution.",
      route: "/npc-prompt-command",
      wc_mode: "BUSINESS",
      universe: DEFAULT_UNIVERSE,
      zone: "student_union",
      tags: ["prompt", "assistant", "neutral"],
      pathways: ["common"],
      kind: "SERVICE",
      hubRole: "NEUTRAL",
      vaultSide: "NEUTRAL",
    },
    {
      id: "mall-entry",
      title: "WCM Mall",
      description: "Mall experience entry node with Trinity viewing surface when available.",
      route: "/mall",
      wc_mode: "BUSINESS",
      universe: DEFAULT_UNIVERSE,
      zone: "mall",
      tags: ["retail", "navigation", "neutral"],
      pathways: ["commerce", "common"],
      kind: "EXPERIENCE",
      requiresTrinity: true,
      vaultSide: "IO",
    },
    {
      id: "university-entry",
      title: "WCM University",
      description: "University experience entry node with Trinity viewing surface when available.",
      route: "/university",
      wc_mode: "EDUCATION",
      universe: DEFAULT_UNIVERSE,
      zone: "university",
      tags: ["learning", "navigation", "neutral"],
      pathways: ["academia", "common"],
      kind: "EXPERIENCE",
      requiresTrinity: true,
      vaultSide: "IO",
    },
    {
      id: "chaos-vault-io",
      title: "Chaos Vault — IO",
      description: "Institutional Chaos Vault surface for verified or implied IP artifacts.",
      route: "/chaos-vault/io",
      wc_mode: "BUSINESS",
      universe: DEFAULT_UNIVERSE,
      zone: "vault",
      tags: ["vault", "io", "provenance"],
      pathways: ["chaos-vault", "commerce", "common"],
      kind: "EXPERIENCE",
      vaultSide: "IO",
    },
    {
      id: "chaos-vault-akashic",
      title: "Chaos Vault — Akashic",
      description: "Restricted Akashic archive surface for unknown IP artifacts with RWA anchors.",
      route: "/chaos-vault/akashic",
      wc_mode: "AKASHIC",
      universe: DEFAULT_UNIVERSE,
      zone: "vault",
      tags: ["vault", "akashic", "archive"],
      pathways: ["chaos-vault", "akashic"],
      kind: "EXPERIENCE",
      vaultSide: "AKASHIC",
      requiresPortalContext: true,
    },
    {
      id: "fen-akashic-entry",
      title: "FEN Akashic Labyrinth Entry",
      description: "Entry point to the Akashic labyrinth requiring prompt-based progression.",
      route: "/fen/labyrinth",
      wc_mode: "AKASHIC",
      universe: DEFAULT_UNIVERSE,
      zone: "akashic",
      tags: ["labyrinth", "prompt", "fen"],
      pathways: ["akashic", "common"],
      kind: "PORTAL",
      requiresLabyrinth: true,
      vaultSide: "AKASHIC",
    },
    {
      id: "dripONchain",
      title: "dripONchain Thrift Store",
      description: "Blockchain thrift store with leased stalls, Creator Codex visuals, and protected trades.",
      route: "/driponchain",
      wc_mode: "BUSINESS",
      universe: DEFAULT_UNIVERSE,
      zone: "student_union",
      tags: ["commerce", "thrift", "onboarding"],
      pathways: ["commerce", "student-union", "mall"],
      kind: "EXPERIENCE",
      storeKind: "thrift_store",
      vaultSide: "IO",
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
      to: "chaos-vault-io",
      reason: "neutral hub to vault (IO)",
      wc_mode: "BUSINESS",
      weight: 1,
    },
    {
      from: "student-union-hub",
      to: "dripONchain",
      reason: "student union -> dripONchain leasing district",
      wc_mode: "BUSINESS",
      weight: 0.9,
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
      to: "chaos-vault-io",
      reason: "commerce artifacts route to IO vault",
      weight: 0.9,
    },
    {
      from: "mall-entry",
      to: "university-entry",
      reason: "commerce-adjacent learning pathway",
      weight: 0.5,
    },
    {
      from: "mall-entry",
      to: "dripONchain",
      reason: "mall -> dripONchain district",
      weight: 0.95,
    },
    {
      from: "mall-entry",
      to: "npc-prompt-command",
      reason: "request guidance",
      weight: 0.5,
    },
    {
      from: "university-entry",
      to: "chaos-vault-io",
      reason: "research artifacts route to IO vault",
      weight: 0.7,
    },
    {
      from: "university-entry",
      to: "npc-prompt-command",
      reason: "ask for support",
      weight: 0.5,
    },
    {
      from: "chaos-vault-io",
      to: "chaos-vault-akashic",
      reason: "portal to akashic archive",
      portalType: "IO_TO_AKASHIC",
      weight: 0.2,
    },
    {
      from: "dripONchain",
      to: "chaos-vault-io",
      reason: "thrift listings route to IO vault provenance",
      weight: 0.8,
    },
    {
      from: "dripONchain",
      to: "npc-prompt-command",
      reason: "request neutral assistance",
      weight: 0.6,
    },
    {
      from: "dripONchain",
      to: "student-union-hub",
      reason: "return to student union hub",
      weight: 0.7,
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
  options?: { wc_mode?: WCMode; universe?: string; limit?: number; portalContext?: PortalContext }
): WcmNode[] {
  const edges = registerWcmEdges();
  const nodes = registerWcmNodes();
  const current = nodes.find((node) => node.id === nodeId);

  const filteredEdges = edges.filter((edge) => {
    if (edge.from !== nodeId) return false;
    if (options?.wc_mode && edge.wc_mode && edge.wc_mode !== options.wc_mode) return false;
    if (options?.universe && edge.universe && edge.universe !== options.universe) return false;
    if (edge.portalType) {
      const nextNode = nodes.find((node) => node.id === edge.to);
      const portalCheck = evaluatePortalTransition(
        current?.vaultSide ?? "NEUTRAL",
        nextNode?.vaultSide ?? "NEUTRAL",
        options?.portalContext
      );
      if (!portalCheck.allowed) return false;
    }
    const nextNode = nodes.find((node) => node.id === edge.to);
    if (nextNode?.requiresPortalContext) {
      const portalCheck = evaluatePortalTransition(
        current?.vaultSide ?? "NEUTRAL",
        nextNode.vaultSide ?? "NEUTRAL",
        options?.portalContext
      );
      if (!portalCheck.allowed) return false;
    }
    return true;
  });

  const sorted = filteredEdges.sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0));
  const nextNodes = sorted
    .map((edge) => nodes.find((node) => node.id === edge.to))
    .filter(Boolean) as WcmNode[];

  return nextNodes.slice(0, options?.limit ?? nextNodes.length);
}
