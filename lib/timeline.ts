export type TimelineEvent = {
  id: string
  eventType: string
  summary: string
  worldId?: string
  patchId?: string
  timestamp: number
  severity?: "ok" | "warn" | "fail"
}

const MAX_EVENTS = 200
const timelineEvents: TimelineEvent[] = [
  {
    id: "seed-01",
    eventType: "boot",
    summary: "Trinity 3DT core booted",
    worldId: "HUB",
    timestamp: Date.now() - 1000 * 60 * 30,
    severity: "ok",
  },
  {
    id: "seed-02",
    eventType: "patch_registered",
    summary: "SIGNAL_DUEL registered with Trinity floor",
    worldId: "SIGNAL_DUEL",
    patchId: "SIGNAL_DUEL",
    timestamp: Date.now() - 1000 * 60 * 25,
    severity: "ok",
  },
  {
    id: "seed-03",
    eventType: "firewall",
    summary: "Business realm firewall check passed",
    worldId: "CLEAR",
    patchId: "CLEAR",
    timestamp: Date.now() - 1000 * 60 * 18,
    severity: "warn",
  },
]

function clampEvents() {
  if (timelineEvents.length > MAX_EVENTS) {
    timelineEvents.splice(0, timelineEvents.length - MAX_EVENTS)
  }
}

export function recordTimelineEvent(event: Omit<TimelineEvent, "id" | "timestamp"> & { id?: string; timestamp?: number }): TimelineEvent {
  const entry: TimelineEvent = {
    id: event.id ?? `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: event.timestamp ?? Date.now(),
    ...event,
  }
  timelineEvents.push(entry)
  clampEvents()
  return entry
}

export function getTimelineEvents(limit = 20): TimelineEvent[] {
  return timelineEvents.slice(-limit).reverse()
}
