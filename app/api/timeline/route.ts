import { NextResponse } from "next/server"
import { getTimelineEvents, recordTimelineEvent } from "@/lib/timeline"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const limitParam = url.searchParams.get("limit")
  const limit = limitParam ? Math.min(Number(limitParam), 50) : 20
  const events = getTimelineEvents(Number.isFinite(limit) ? limit : 20)
  return NextResponse.json({ events })
}

export async function POST(request: Request) {
  const body = await request.json()
  const { eventType, summary, worldId, patchId } = body || {}

  if (!eventType || !summary) {
    return NextResponse.json({ error: "eventType and summary are required" }, { status: 400 })
  }

  const entry = recordTimelineEvent({
    eventType: String(eventType),
    summary: String(summary),
    worldId: worldId ? String(worldId) : undefined,
    patchId: patchId ? String(patchId) : undefined,
    severity: "ok",
  })

  return NextResponse.json({ event: entry }, { status: 201 })
}
