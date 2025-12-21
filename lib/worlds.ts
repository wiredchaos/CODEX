import { HUB_CONFIG, type PatchConfig } from "@/lib/hub-config"
import { getAllPatches, initializeRegistry } from "@/lib/patch-registry"

export type WorldStatus = PatchConfig & {
  worldType: "3DT"
  compliance: "ok" | "warn" | "fail"
}

export function listWorlds(): WorldStatus[] {
  initializeRegistry()
  const registry = getAllPatches()

  return HUB_CONFIG.patches.map((patch) => {
    const manifest = registry.find((entry) => entry.id === patch.id)
    const compliance: "ok" | "warn" | "fail" = manifest
      ? manifest.timelineAccess === "granted"
        ? "ok"
        : manifest.timelineAccess === "pending"
          ? "warn"
          : "fail"
      : "warn"

    return { ...patch, worldType: "3DT", compliance }
  })
}
