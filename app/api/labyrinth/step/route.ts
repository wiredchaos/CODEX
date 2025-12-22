import { NextRequest, NextResponse } from "next/server";
import { runLabyrinthStep } from "../../../../lib/labyrinth/engine";
import { getNodeById } from "../../../../lib/wcm/registry";
import { WCMode } from "../../../../lib/wcm/types";

export async function POST(req: NextRequest) {
  const payload = await req.json();
  const { nodeId, wc_mode, universe, prompt } = payload as {
    nodeId: string;
    wc_mode?: WCMode;
    universe?: string;
    prompt?: string;
  };

  const node = getNodeById(nodeId);
  const stepResult = runLabyrinthStep({ nodeId, wc_mode, universe, userPrompt: prompt });

  const nextNodes = stepResult.allowedNextNodeIds
    .map((id) => getNodeById(id))
    .filter(Boolean);

  return NextResponse.json({
    ok: stepResult.allowedNextNodeIds.length > 0,
    gateMessage: stepResult.gateMessage,
    nextNodes,
    hints: stepResult.requiredPromptHints,
    node,
  });
}
