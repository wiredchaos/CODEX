// TRINITY FLOOR / TIMELINE MOUNT SYSTEM
// Patches are consumers, not owners of Trinity infrastructure
// Timeline access governed by Akira Codex

import type { RealmType, GameLayer } from "./hub-config"

export type TrinityFloor =
  | "FLOOR_ARCADE" // Neutral gameplay floor
  | "FLOOR_BUSINESS" // Grounded business realm floor
  | "FLOOR_ECHO" // Akashic resonance floor
  | "FLOOR_BRIDGE" // Cross-realm convergence floor

export type TimelineAccess = "granted" | "pending" | "denied" | "redacted"

export interface TrinityMountDeclaration {
  patchId: string
  mount: string
  type: "game" | "tool" | "portal" | "archive"
  status: "existing" | "pending" | "deprecated"
  source: "v0_project_chat" | "external" | "core"
  layers: GameLayer[]
  // Trinity binding - READ ONLY
  trinityFloor: TrinityFloor
  trinityReadOnly: true
  // Timeline binding - Akira Codex governed
  timelineAccess: TimelineAccess
  timelineGovernor: "AKIRA_CODEX"
}

export interface TrinityFloorConfig {
  id: TrinityFloor
  realm: RealmType
  color: string
  elevation: number // Z-position in Trinity space
  accessible: boolean
}

export const TRINITY_FLOORS: Record<TrinityFloor, TrinityFloorConfig> = {
  FLOOR_ARCADE: {
    id: "FLOOR_ARCADE",
    realm: "bridge",
    color: "#a855f7",
    elevation: 0,
    accessible: true,
  },
  FLOOR_BUSINESS: {
    id: "FLOOR_BUSINESS",
    realm: "business",
    color: "#10b981",
    elevation: 1,
    accessible: true,
  },
  FLOOR_ECHO: {
    id: "FLOOR_ECHO",
    realm: "akashic",
    color: "#06b6d4",
    elevation: 2,
    accessible: true,
  },
  FLOOR_BRIDGE: {
    id: "FLOOR_BRIDGE",
    realm: "bridge",
    color: "#f59e0b",
    elevation: 3,
    accessible: true,
  },
}

// SIGNAL_DUEL Mount Declaration
export const SIGNAL_DUEL_MOUNT: TrinityMountDeclaration = {
  patchId: "SIGNAL_DUEL",
  mount: "/world/signal-duel",
  type: "game",
  status: "existing",
  source: "v0_project_chat",
  layers: ["arcade", "business", "echo", "bridge"],
  trinityFloor: "FLOOR_ARCADE", // Default floor
  trinityReadOnly: true,
  timelineAccess: "granted",
  timelineGovernor: "AKIRA_CODEX",
}

// CLEAR Mount Declaration - Business realm lobby
export const CLEAR_MOUNT: TrinityMountDeclaration = {
  patchId: "CLEAR",
  mount: "/world/clear",
  type: "portal",
  status: "existing",
  source: "v0_project_chat",
  layers: ["business"], // Business realm only
  trinityFloor: "FLOOR_BUSINESS",
  trinityReadOnly: true,
  timelineAccess: "granted",
  timelineGovernor: "AKIRA_CODEX",
}

// Get Trinity Floor for a given layer
export function getTrinityFloorForLayer(layer: GameLayer): TrinityFloor {
  switch (layer) {
    case "arcade":
      return "FLOOR_ARCADE"
    case "business":
      return "FLOOR_BUSINESS"
    case "echo":
      return "FLOOR_ECHO"
    case "bridge":
      return "FLOOR_BRIDGE"
  }
}

// Validate timeline access (governed by Akira Codex)
export function validateTimelineAccess(patchId: string, requestedAccess: "read" | "write"): TimelineAccess {
  // Timeline is read-only for all patches
  if (requestedAccess === "write") return "denied"

  // Check if patch has granted access
  if (patchId === "SIGNAL_DUEL") {
    return SIGNAL_DUEL_MOUNT.timelineAccess
  }

  if (patchId === "CLEAR") {
    return CLEAR_MOUNT.timelineAccess
  }

  return "pending"
}

// Get floor configuration
export function getFloorConfig(floor: TrinityFloor): TrinityFloorConfig {
  return TRINITY_FLOORS[floor]
}

// Check if layer transition is allowed
export function canTransitionFloor(from: TrinityFloor, to: TrinityFloor, timelineAccess: TimelineAccess): boolean {
  if (timelineAccess !== "granted") return false

  const fromConfig = TRINITY_FLOORS[from]
  const toConfig = TRINITY_FLOORS[to]

  // Can only move one floor at a time (elevator metaphor)
  const elevationDiff = Math.abs(fromConfig.elevation - toConfig.elevation)
  return elevationDiff <= 1 && toConfig.accessible
}
