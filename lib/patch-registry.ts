// PATCH REGISTRY - DECLARATIVE MOUNT CONTRACT
// All patches MUST register here to access Trinity infrastructure
// Enforces Trinity Floor / Timeline Mount governance

import { registerConsumer, type TrinityConsumer } from "./trinity-core"
import { type TrinityFloor, type TimelineAccess, SIGNAL_DUEL_MOUNT, CLEAR_MOUNT } from "./trinity-mount"
import { emitTelemetry } from "./telemetry-bus"

// Patch types per governance rules
export type PatchType = "game" | "service" | "dashboard" | "portal" | "tool" | "archive"
export type PatchRealm = "business" | "akashic" | "hybrid" | "bridge"
export type PatchLayer = "arcade" | "business" | "echo" | "bridge"

// Declarative patch manifest
export interface PatchManifest {
  id: string
  mount: string
  type: PatchType
  realm: PatchRealm
  layers?: PatchLayer[]
  source?: "v0_project_chat" | "external" | "core"
  status: "registered" | "pending" | "rejected"

  // REQUIRED: Trinity governance declarations
  governance: {
    no3DGeneration: true
    noGalaxyCreation: true
    trinityReadOnly: true
    timelineGovernor: "AKIRA_CODEX"
    consumerOnly: true
  }

  assignedFloor: TrinityFloor

  // Timeline access level
  timelineAccess: TimelineAccess
}

// Master patch registry
const PATCH_REGISTRY: Map<string, PatchManifest> = new Map()

export type PatchComplianceState = "ok" | "warn" | "fail"

function assignFloor(realm: PatchRealm, layers?: PatchLayer[]): TrinityFloor {
  if (realm === "bridge" || layers?.includes("bridge")) return "FLOOR_BRIDGE"
  if (realm === "akashic" || layers?.includes("echo")) return "FLOOR_ECHO"
  if (realm === "business" || layers?.includes("business")) return "FLOOR_BUSINESS"
  return "FLOOR_ARCADE"
}

// Timeline access rules
function assignTimelineAccess(realm: PatchRealm): TimelineAccess {
  if (realm === "bridge") return "redacted"
  if (realm === "akashic") return "granted"
  return "pending"
}

// Register a patch with governance validation
export function registerPatch(
  manifest: Omit<PatchManifest, "status" | "assignedFloor" | "timelineAccess">,
): PatchManifest | null {
  // Validate governance declarations
  const { governance } = manifest

  if (
    governance.no3DGeneration !== true ||
    governance.noGalaxyCreation !== true ||
    governance.trinityReadOnly !== true ||
    governance.timelineGovernor !== "AKIRA_CODEX" ||
    governance.consumerOnly !== true
  ) {
    console.error(`[REGISTRY] Patch ${manifest.id} failed governance validation`)
    emitTelemetry({
      type: "PATCH_REJECTED",
      patchId: manifest.id,
      reason: "GOVERNANCE_VIOLATION",
      realm: manifest.realm,
      hemisphere: manifest.realm === "akashic" ? "right" : "left",
    })
    return null
  }

  // Assign floor and timeline access
  const assignedFloor = assignFloor(manifest.realm, manifest.layers)
  const timelineAccess = assignTimelineAccess(manifest.realm)

  const fullManifest: PatchManifest = {
    ...manifest,
    status: "registered",
    assignedFloor,
    timelineAccess,
  }

  // Register with Trinity Core
  const consumer: TrinityConsumer = {
    patchId: manifest.id,
    mount: manifest.mount,
    requestedFloor: assignedFloor,
    timelineAccess: {
      level: timelineAccess === "pending" ? "none" : "read",
      governor: "AKIRA_CODEX",
      redacted: timelineAccess === "redacted",
    },
    declares: {
      no3DGeneration: true,
      noGalaxyCreation: true,
      trinityReadOnly: true,
      timelineGovernor: "AKIRA_CODEX",
    },
  }

  if (!registerConsumer(consumer)) {
    return null
  }

  PATCH_REGISTRY.set(manifest.id, fullManifest)

  emitTelemetry({
    type: "PATCH_REGISTERED",
    patchId: manifest.id,
    floor: assignedFloor,
    realm: manifest.realm,
    hemisphere: manifest.realm === "akashic" ? "right" : "left",
  })

  return fullManifest
}

// Get patch manifest
export function getPatch(id: string): PatchManifest | undefined {
  return PATCH_REGISTRY.get(id)
}

// Get all registered patches
export function getAllPatches(): PatchManifest[] {
  return Array.from(PATCH_REGISTRY.values())
}

export function getComplianceState(manifest?: PatchManifest): PatchComplianceState {
  if (!manifest) return "warn"
  if (manifest.timelineAccess === "denied") return "fail"
  if (manifest.timelineAccess === "pending") return "warn"
  return "ok"
}

export function getComplianceSummary(): { ok: number; warn: number; fail: number } {
  const summary = { ok: 0, warn: 0, fail: 0 }
  getAllPatches().forEach((manifest) => {
    const state = getComplianceState(manifest)
    summary[state] += 1
  })

  return summary
}

export function canAccessFloor(patchId: string, floor: TrinityFloor): boolean {
  const patch = PATCH_REGISTRY.get(patchId)
  if (!patch) return false

  // Patches can only access their assigned floor or lower
  const floorOrder: TrinityFloor[] = ["FLOOR_ARCADE", "FLOOR_BUSINESS", "FLOOR_ECHO", "FLOOR_BRIDGE"]
  const assignedIndex = floorOrder.indexOf(patch.assignedFloor)
  const requestedIndex = floorOrder.indexOf(floor)

  return requestedIndex <= assignedIndex
}

// Pre-register known patches from hub config
export function initializeRegistry() {
  // SIGNAL_DUEL - 4-layer game (uses existing mount declaration)
  registerPatch({
    id: SIGNAL_DUEL_MOUNT.patchId,
    mount: SIGNAL_DUEL_MOUNT.mount,
    type: SIGNAL_DUEL_MOUNT.type,
    realm: "hybrid",
    layers: SIGNAL_DUEL_MOUNT.layers,
    source: SIGNAL_DUEL_MOUNT.source,
    governance: {
      no3DGeneration: true,
      noGalaxyCreation: true,
      trinityReadOnly: true,
      timelineGovernor: "AKIRA_CODEX",
      consumerOnly: true,
    },
  })

  registerPatch({
    id: CLEAR_MOUNT.patchId,
    mount: CLEAR_MOUNT.mount,
    type: CLEAR_MOUNT.type,
    realm: "business",
    layers: CLEAR_MOUNT.layers,
    source: CLEAR_MOUNT.source,
    governance: {
      no3DGeneration: true,
      noGalaxyCreation: true,
      trinityReadOnly: true,
      timelineGovernor: "AKIRA_CODEX",
      consumerOnly: true,
    },
  })
}
