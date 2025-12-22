// TRINITY FLOOR / TIMELINE MOUNT - GOVERNANCE MANIFEST
// Canonical declaration of all governance rules
// This file is READ-ONLY reference documentation

import type { TrinityFloor } from "./trinity-mount"

export const GOVERNANCE_MANIFEST = Object.freeze({
  version: "1.0.0",
  effectiveDate: "2025-01-01",
  governor: "WIRED_CHAOS_HUB",

  // Core declarations
  declarations: Object.freeze({
    NO_3D_GENERATION: {
      rule: "Patches MUST NOT generate 3D content",
      enforcement: "Build-time validation + runtime checks",
      violation: "PATCH_REJECTED",
    },
    NO_GALAXY_CREATION: {
      rule: "Patches MUST NOT create galaxy/stars/space environments",
      enforcement: "Import scanning + runtime checks",
      violation: "PATCH_REJECTED",
    },
    TRINITY_READ_ONLY: {
      rule: "Trinity infrastructure is read-only to patches",
      enforcement: "Frozen objects + accessor validation",
      violation: "ACCESS_DENIED",
    },
    TIMELINE_GOVERNED: {
      rule: "Timeline access governed by Akira Codex",
      enforcement: "TrinityProvider context validation",
      violation: "TIMELINE_BLOCKED",
    },
    CONSUMER_PATTERN: {
      rule: "Patches operate as consumers, not owners",
      enforcement: "Declaration validation at registration",
      violation: "REGISTRATION_DENIED",
    },
  }),

  floors: Object.freeze({
    FLOOR_ARCADE: {
      realm: "neutral",
      grounding: "allowed",
      timeline: "none",
    },
    FLOOR_BUSINESS: {
      realm: "business",
      grounding: "allowed",
      timeline: "none",
    },
    FLOOR_ECHO: {
      realm: "akashic",
      grounding: "denied_by_default",
      timeline: "read",
    },
    FLOOR_BRIDGE: {
      realm: "bridge",
      grounding: "denied",
      timeline: "read_redacted",
    },
  }) as Record<TrinityFloor, { realm: string; grounding: string; timeline: string }>,

  // Timeline rules
  timeline: Object.freeze({
    governor: "AKIRA_CODEX",
    patchAccess: "read_only",
    bridgeAccess: "read_redacted",
    writeAccess: "hub_only",
  }),

  // Required patch declarations
  requiredDeclarations: Object.freeze([
    "no3DGeneration",
    "noGalaxyCreation",
    "trinityReadOnly",
    "timelineGovernor",
    "consumerOnly",
  ]),
})

// Type export for validation
export type GovernanceDeclaration = keyof typeof GOVERNANCE_MANIFEST.declarations
