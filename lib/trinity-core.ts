// TRINITY CORE - HUB OWNED INFRASTRUCTURE
// This module is the ONLY source of 3D infrastructure
// Patches MUST consume via TrinityProvider, never generate

import type { TrinityFloor, TimelineAccess } from "./trinity-mount"

// Trinity Core is hub-owned - patches cannot instantiate
export interface TrinityCore {
  readonly version: "1.0.0"
  readonly owner: "WIRED_CHAOS_HUB"
  readonly infrastructure: "read_only"
}

// Consumer contract for patches
export interface TrinityConsumer {
  patchId: string
  mount: string
  requestedFloor: TrinityFloor
  timelineAccess: TimelineAccess
  // Patches declare, hub provides
  declares: {
    no3DGeneration: true
    noGalaxyCreation: true
    trinityReadOnly: true
    timelineGovernor: "AKIRA_CODEX"
  }
}

// Hub exposes this to patches via context
export interface TrinityContext {
  core: TrinityCore
  currentFloor: TrinityFloor
  timelineAccess: TimelineAccess
  isTransitioning: boolean
  // Patches can request floor changes, hub validates
  requestFloorChange: (floor: TrinityFloor) => Promise<boolean>
  // Patches can read timeline, never write
  readTimeline: () => Promise<TimelineEntry[]>
}

export interface TimelineEntry {
  id: string
  timestamp: number
  event: string
  realm: "business" | "akashic" | "bridge"
  redacted: boolean
}

// Singleton Trinity Core instance - HUB ONLY
export const TRINITY_CORE: TrinityCore = Object.freeze({
  version: "1.0.0",
  owner: "WIRED_CHAOS_HUB",
  infrastructure: "read_only",
})

// Validate consumer declaration before granting access
export function validateConsumerDeclaration(consumer: TrinityConsumer): boolean {
  const { declares } = consumer

  // All declarations must be true
  return (
    declares.no3DGeneration === true &&
    declares.noGalaxyCreation === true &&
    declares.trinityReadOnly === true &&
    declares.timelineGovernor === "AKIRA_CODEX"
  )
}

// Consumer registration log
const registeredConsumers: Map<string, TrinityConsumer> = new Map()

export function registerConsumer(consumer: TrinityConsumer): boolean {
  if (!validateConsumerDeclaration(consumer)) {
    console.error(`[TRINITY] Consumer ${consumer.patchId} failed declaration validation`)
    return false
  }

  registeredConsumers.set(consumer.patchId, consumer)
  console.log(`[TRINITY] Consumer ${consumer.patchId} registered at ${consumer.mount}`)
  return true
}

export function isRegisteredConsumer(patchId: string): boolean {
  return registeredConsumers.has(patchId)
}

export function getRegisteredConsumers(): TrinityConsumer[] {
  return Array.from(registeredConsumers.values())
}
