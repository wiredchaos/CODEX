import { NextResponse } from "next/server"
import { HUB_CONFIG } from "@/lib/hub-config"
import { getAllPatches, getComplianceState, initializeRegistry, type PatchComplianceState } from "@/lib/patch-registry"

export async function GET() {
  initializeRegistry()
  const registry = getAllPatches()

  const patches = HUB_CONFIG.patches.map((patch) => {
    const manifest = registry.find((entry) => entry.id === patch.id)
    const compliance: PatchComplianceState = getComplianceState(manifest)

    return {
      id: patch.id,
      mount: patch.mount,
      realm: patch.realm,
      status: patch.status,
      manifest,
      compliance,
    }
  })

  const compliance = patches.reduce(
    (acc, patch) => {
      acc[patch.compliance] += 1
      return acc
    },
    { ok: 0, warn: 0, fail: 0 },
  )

  return NextResponse.json({ patches, compliance })
}
