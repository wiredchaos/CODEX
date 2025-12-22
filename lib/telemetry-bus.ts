// Global Telemetry Bus for WIRED CHAOS META
// Handles cross-patch event tracking and hemisphere scoring

export type TelemetryEventType =
  | "patch_access"
  | "realm_transition"
  | "firewall_check"
  | "bridge_request"
  | "session_start"
  | "session_end"
  | "error"
  | "game_start"
  | "game_end"
  | "signal_sent"
  | "signal_received"
  | "duel_won"
  | "duel_lost"
  | "realm_switch"
  | "layer_select"
  | "layer_switch"
  | "arcade_play"
  | "bridge_connect"
  | "echo_resonance"

export interface TelemetryEvent {
  id: string
  type: TelemetryEventType
  timestamp: number
  patchId?: string
  realm?: string
  userId?: string
  metadata?: Record<string, unknown>
}

export interface HemisphereScore {
  business: number
  akashic: number
  bridge: number
  total: number
}

// In-memory event buffer (would connect to Redis/Supabase in production)
const eventBuffer: TelemetryEvent[] = []
const MAX_BUFFER_SIZE = 1000

// Hemisphere scoring weights
const HEMISPHERE_WEIGHTS = {
  patch_access: 10,
  realm_transition: 25,
  firewall_check: 5,
  bridge_request: 50,
  session_start: 15,
  session_end: 0,
  error: -10,
  game_start: 20,
  game_end: 10,
  signal_sent: 15,
  signal_received: 15,
  duel_won: 100,
  duel_lost: -25,
  realm_switch: 30,
  layer_select: 20,
  layer_switch: 35,
  arcade_play: 25,
  bridge_connect: 75,
  echo_resonance: 50,
}

function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

export function emitTelemetry(
  type: TelemetryEventType,
  options: {
    patchId?: string
    realm?: string
    userId?: string
    metadata?: Record<string, unknown>
  } = {},
): TelemetryEvent {
  const event: TelemetryEvent = {
    id: generateEventId(),
    type,
    timestamp: Date.now(),
    ...options,
  }

  eventBuffer.push(event)

  // Maintain buffer size
  if (eventBuffer.length > MAX_BUFFER_SIZE) {
    eventBuffer.shift()
  }

  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.log(`[TELEMETRY] ${type}`, event)
  }

  return event
}

export function getRecentEvents(limit = 50): TelemetryEvent[] {
  return eventBuffer.slice(-limit).reverse()
}

export function getEventsByPatch(patchId: string): TelemetryEvent[] {
  return eventBuffer.filter((e) => e.patchId === patchId)
}

export function getEventsByRealm(realm: string): TelemetryEvent[] {
  return eventBuffer.filter((e) => e.realm === realm)
}

export function calculateHemisphereScore(): HemisphereScore {
  const scores: HemisphereScore = {
    business: 0,
    akashic: 0,
    bridge: 0,
    total: 0,
  }

  eventBuffer.forEach((event) => {
    const weight = HEMISPHERE_WEIGHTS[event.type] || 0
    if (event.realm && event.realm in scores) {
      scores[event.realm as keyof Omit<HemisphereScore, "total">] += weight
    }
    scores.total += weight
  })

  return scores
}

export function clearTelemetry(): void {
  eventBuffer.length = 0
}

// Session management
let sessionId: string | null = null

export function startSession(userId?: string): string {
  sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  emitTelemetry("session_start", { userId, metadata: { sessionId } })
  return sessionId
}

export function endSession(): void {
  if (sessionId) {
    emitTelemetry("session_end", { metadata: { sessionId } })
    sessionId = null
  }
}

export function getCurrentSessionId(): string | null {
  return sessionId
}
