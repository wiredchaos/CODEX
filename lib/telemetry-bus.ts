// Global Telemetry Bus for WIRED CHAOS META
// Background-only service module: MUST NOT trigger navigation or unmount UI.
// Handles cross-patch event tracking and hemisphere scoring.

// Keep known event types for autocomplete, but allow arbitrary string literals
// (many patches emit custom event names).
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
  | (string & {})

export interface TelemetryEvent {
  id: string
  type: TelemetryEventType
  timestamp: number
  patchId?: string
  realm?: string
  userId?: string
  // Optional extra dimensions used by patches/governance layers.
  hemisphere?: "left" | "right"
  floor?: string
  reason?: string
  metadata?: Record<string, unknown>
}

export interface HemisphereScore {
  business: number
  akashic: number
  bridge: number
  total: number
  balance: number
}

export type TelemetryEventOptions = Omit<TelemetryEvent, "id" | "timestamp" | "type">
export type TelemetryEventInput =
  | (Partial<Pick<TelemetryEvent, "id" | "timestamp">> & { type: TelemetryEventType } & TelemetryEventOptions)
  | (Record<string, unknown> & { type: TelemetryEventType })

// In-memory event buffer (would connect to Redis/Supabase in production)
const eventBuffer: TelemetryEvent[] = []
const MAX_BUFFER_SIZE = 1000

// Async dispatch queue (prevents telemetry from blocking render paths)
const pendingQueue: TelemetryEvent[] = []
let flushScheduled = false

type TelemetryListener = (event: TelemetryEvent) => void
const listeners = new Set<TelemetryListener>()

export function subscribeTelemetry(listener: TelemetryListener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function scheduleFlush() {
  if (flushScheduled) return
  flushScheduled = true

  const flush = () => {
    flushScheduled = false
    if (pendingQueue.length === 0) return

    // Move pending -> buffer
    while (pendingQueue.length) {
      const evt = pendingQueue.shift()!
      eventBuffer.push(evt)
      if (eventBuffer.length > MAX_BUFFER_SIZE) eventBuffer.shift()
      listeners.forEach((l) => {
        try {
          l(evt)
        } catch {
          // telemetry listeners must never be able to take down UI/rendering
        }
      })
    }
  }

  // Prefer microtask so it runs after current call stack, without yielding a full frame.
  if (typeof queueMicrotask === "function") queueMicrotask(flush)
  else Promise.resolve().then(flush)
}

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

export function emitTelemetry(type: TelemetryEventType, options?: TelemetryEventOptions): TelemetryEvent
export function emitTelemetry(event: TelemetryEventInput): TelemetryEvent
export function emitTelemetry(
  arg1: TelemetryEventType | TelemetryEventInput,
  arg2: TelemetryEventOptions = {},
): TelemetryEvent {
  const now = Date.now()

  const event: TelemetryEvent =
    typeof arg1 === "string"
      ? {
          id: generateEventId(),
          type: arg1,
          timestamp: now,
          ...arg2,
        }
      : {
          ...(arg1 as Record<string, unknown>),
          id: typeof arg1.id === "string" ? arg1.id : generateEventId(),
          type: String(arg1.type) as TelemetryEventType,
          timestamp: typeof arg1.timestamp === "number" ? arg1.timestamp : now,
        }

  // Queue asynchronously so telemetry cannot block UI or render loops.
  pendingQueue.push(event)
  scheduleFlush()

  // Log to console in development (async-safe)
  if (process.env.NODE_ENV === "development") {
    try {
      console.log(`[TELEMETRY] ${String(event.type)}`, event)
    } catch {
      // ignore
    }
  }

  return event
}

export function getRecentEvents(limit = 50): TelemetryEvent[] {
  // Include pending events so consumers see telemetry immediately,
  // even though dispatch is async.
  const snapshot = eventBuffer.concat(pendingQueue)
  return snapshot.slice(-limit).reverse()
}

export function getEventsByPatch(patchId: string): TelemetryEvent[] {
  return eventBuffer.concat(pendingQueue).filter((e) => e.patchId === patchId)
}

export function getEventsByRealm(realm: string): TelemetryEvent[] {
  return eventBuffer.concat(pendingQueue).filter((e) => e.realm === realm)
}

export function calculateHemisphereScore(): HemisphereScore {
  const scores: HemisphereScore = {
    business: 0,
    akashic: 0,
    bridge: 0,
    total: 0,
    balance: 0,
  }

  const snapshot = eventBuffer.concat(pendingQueue)
  snapshot.forEach((event) => {
    const weight = HEMISPHERE_WEIGHTS[event.type] || 0
    if (event.realm && (event.realm === "business" || event.realm === "akashic" || event.realm === "bridge")) {
      scores[event.realm as keyof Pick<HemisphereScore, "business" | "akashic" | "bridge">] += weight
    }
    scores.total += weight
  })

  // Simple balance metric: normalized business-vs-akashic delta.
  const denom = Math.max(1, Math.abs(scores.total))
  scores.balance = (scores.business - scores.akashic) / denom

  return scores
}

export function clearTelemetry(): void {
  eventBuffer.length = 0
  pendingQueue.length = 0
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
