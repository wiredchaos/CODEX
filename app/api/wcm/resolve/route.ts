import { NextRequest, NextResponse } from "next/server";
import { getNodeById, getNodeByRoute, getNextNodes, getRelatedNodes, registerWcmNodes } from "../../../../lib/wcm/registry";
import { WCMode } from "../../../../lib/wcm/types";
import { runLabyrinthStep } from "../../../../lib/labyrinth/engine";
import { PortalContext } from "../../../../lib/vault/routing";

export async function POST(req: NextRequest) {
  const payload = await req.json();
  const { currentRoute, nodeId, wc_mode, universe, intent, prompt, portalContext, contextToken, sessionQualified, isAdmin } =
    payload as {
      currentRoute?: string;
      nodeId?: string;
      wc_mode?: WCMode;
      universe?: string;
      intent?: "NEXT" | "RELATED" | "HUB";
      prompt?: string;
      portalContext?: PortalContext;
      contextToken?: string;
      sessionQualified?: boolean;
      isAdmin?: boolean;
    };

  const resolvedPortalContext: PortalContext = {
    contextToken: portalContext?.contextToken ?? contextToken,
    sessionQualified: portalContext?.sessionQualified ?? sessionQualified,
    isAdmin: portalContext?.isAdmin ?? isAdmin,
  };

  const allNodes = registerWcmNodes();
  const currentNode = nodeId ? getNodeById(nodeId) : currentRoute ? getNodeByRoute(currentRoute) : undefined;

  const hubNodes = allNodes.filter((node) => node.hubRole === "NEUTRAL");

  if (currentNode?.requiresLabyrinth || wc_mode === "AKASHIC") {
    const labyrinthResult = runLabyrinthStep({ nodeId: currentNode?.id ?? nodeId ?? "", wc_mode, universe, userPrompt: prompt });
    const nextNodes = labyrinthResult.allowedNextNodeIds
      .map((id) => getNodeById(id))
      .filter(Boolean);

    return NextResponse.json({
      currentNode,
      nextNodes,
      relatedNodes: [],
      hubNodes,
      resolutionTrace: {
        mode: "labyrinth",
        gateMessage: labyrinthResult.gateMessage,
        hints: labyrinthResult.requiredPromptHints,
      },
    });
  }

  const nextNodes = intent === "RELATED" ? [] : getNextNodes(currentNode?.id ?? nodeId ?? "", { wc_mode, universe, limit: 5, portalContext: resolvedPortalContext });
  const relatedNodes = getRelatedNodes(currentNode?.id ?? nodeId ?? "", { samePathwayOnly: true, limit: 5 });

  return NextResponse.json({
    currentNode,
    nextNodes,
    relatedNodes,
    hubNodes,
    resolutionTrace: { mode: "graph", portalContext: resolvedPortalContext },
  });
}
