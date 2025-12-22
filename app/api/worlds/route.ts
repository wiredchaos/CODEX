import { NextResponse } from "next/server"
import { listWorlds } from "@/lib/worlds"
import { getComplianceSummary, initializeRegistry } from "@/lib/patch-registry"

export async function GET() {
  initializeRegistry()
  const worlds = listWorlds()
  const compliance = getComplianceSummary()

  return NextResponse.json({
    worlds,
    compliance,
    total: worlds.length,
    worldType: "3DT",
  })
}
