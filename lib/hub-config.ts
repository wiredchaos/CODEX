// WIRED CHAOS META HUB Configuration Store
// This file defines the system configuration and types for the dual-realm architecture

export type RealmType = "business" | "akashic" | "bridge" | "hybrid"
export type GameLayer = "arcade" | "business" | "echo" | "bridge"

export type FirewallLevel = "hard" | "soft" | "none"

export interface RealmConfig {
  firewall: FirewallLevel
  grounding?: "allowed" | "denied_by_default"
  mode?: "read_only_redacted" | "read_write"
}

export interface PatchConfig {
  id: string
  realm: RealmType
  mount: string
  position: [number, number, number]
  status?: "online" | "offline" | "maintenance"
  lastPing?: number
}

export interface GameLayerConfig {
  id: GameLayer
  realm: RealmType
  label: string
  description: string
  color: string
  enabled: boolean
}

export interface HubRules {
  no_patch_is_hub: boolean
  hub_has_no_business_logic: boolean
  patches_are_isolated: boolean
  cross_realm_access: "explicit_bridge_only" | "open" | "deny_all"
}

export interface HubConfig {
  system: string
  type: "HUB"
  role: string
  render_mode: "trinity_3d" | "2d" | "terminal"
  navigation: "elevator" | "portal" | "linear"
  default_space: "galaxy" | "grid" | "list"
  rules: HubRules
  realms: Record<RealmType, RealmConfig>
  patches: PatchConfig[]
}

export const HUB_CONFIG: HubConfig = {
  system: "WIRED_CHAOS",
  type: "HUB",
  role: "galaxy_orchestrator",
  render_mode: "trinity_3d",
  navigation: "elevator",
  default_space: "galaxy",
  rules: {
    no_patch_is_hub: true,
    hub_has_no_business_logic: true,
    patches_are_isolated: true,
    cross_realm_access: "explicit_bridge_only",
  },
  realms: {
    business: { firewall: "hard", grounding: "allowed" },
    akashic: { firewall: "hard", grounding: "denied_by_default" },
    bridge: { firewall: "hard", mode: "read_only_redacted" },
    hybrid: { firewall: "hard", grounding: "allowed", mode: "read_write" },
  },
  patches: [
    { id: "WCM_CORE", realm: "business", mount: "/world/hub", position: [3, 1, -2], status: "online" },
    { id: "AKIRA_CODEX", realm: "akashic", mount: "/world/akira", position: [-4, 2, -3], status: "online" },
    { id: "NPC", realm: "akashic", mount: "/world/npc", position: [-2, -3, 1], status: "online" },
    { id: "CHAOSIS", realm: "business", mount: "/world/chaosis", position: [5, -2, 2], status: "online" },
    { id: "CBE", realm: "business", mount: "/world/cbe", position: [2, 3, -1], status: "online" },
    { id: "CLEAR", realm: "business", mount: "/world/clear", position: [-3, 1, 3], status: "online" },
    { id: "33_3_FM", realm: "akashic", mount: "/world/33-3-fm", position: [-5, -1, -2], status: "online" },
    { id: "FEN_589", realm: "akashic", mount: "/world/fen-589", position: [1, -4, -3], status: "online" },
    { id: "789_STUDIOS", realm: "business", mount: "/world/789", position: [4, 2, 3], status: "online" },
    { id: "Neteru_Apinaya", realm: "akashic", mount: "/world/neteru", position: [-1, 4, 1], status: "online" },
    { id: "NEURA_TAX", realm: "business", mount: "/world/neura-tax", position: [3, -3, -4], status: "online" },
    { id: "BUSINESS_SUITE", realm: "business", mount: "/world/business", position: [-4, 3, 2], status: "online" },
    { id: "SIGNAL_DUEL", realm: "hybrid", mount: "/world/signal-duel", position: [0, 5, 0], status: "online" },
  ],
}

export const GAME_LAYERS: Record<GameLayer, GameLayerConfig> = {
  arcade: {
    id: "arcade",
    realm: "bridge", // neutral ground
    label: "ARCADE",
    description: "Pure mechanics, no realm affiliation",
    color: "#a855f7", // Purple
    enabled: true,
  },
  business: {
    id: "business",
    realm: "business",
    label: "BUSINESS",
    description: "Grounded market metaphors",
    color: "#10b981", // Green
    enabled: true,
  },
  echo: {
    id: "echo",
    realm: "akashic",
    label: "ECHO",
    description: "Akashic ethereal resonance",
    color: "#06b6d4", // Cyan
    enabled: true,
  },
  bridge: {
    id: "bridge",
    realm: "bridge",
    label: "BRIDGE",
    description: "Cross-realm multiplayer arena",
    color: "#f59e0b", // Amber
    enabled: true,
  },
}

// Utility functions for realm filtering
export function getPatchesByRealm(realm: RealmType): PatchConfig[] {
  return HUB_CONFIG.patches.filter((p) => p.realm === realm)
}

export function getRealmColor(realm: RealmType): string {
  switch (realm) {
    case "business":
      return "#10b981" // Green
    case "akashic":
      return "#06b6d4" // Cyan
    case "bridge":
      return "#f59e0b" // Amber
    case "hybrid":
      return "#d946ef" // Magenta - blend of business/akashic
    default:
      return "#6b7280" // Gray
  }
}

export function validateCrossRealmAccess(source: RealmType, target: RealmType): boolean {
  if (source === target) return true
  if (HUB_CONFIG.rules.cross_realm_access === "deny_all") return false
  if (HUB_CONFIG.rules.cross_realm_access === "open") return true
  // explicit_bridge_only - must go through bridge realm
  return source === "bridge" || target === "bridge"
}

export function getLayerColor(layer: GameLayer): string {
  return GAME_LAYERS[layer]?.color || "#6b7280"
}

export function getLayerRealm(layer: GameLayer): RealmType {
  return GAME_LAYERS[layer]?.realm || "bridge"
}
