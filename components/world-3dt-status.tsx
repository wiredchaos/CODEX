"use client"

import useSWR from "swr"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Activity, CheckCircle2, TriangleAlert, XCircle } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

type Compliance = { ok: number; warn: number; fail: number }
type TimelineEvent = {
  id: string
  eventType: string
  summary: string
  worldId?: string
  patchId?: string
  timestamp: number
  severity?: "ok" | "warn" | "fail"
}

type WorldResponse = {
  worlds: { id: string; realm: string; status?: string }[]
  compliance: Compliance
  total: number
  worldType: string
}

type TimelineResponse = { events: TimelineEvent[] }
type PatchResponse = { compliance: Compliance }

function CompliancePill({ label, value, tone }: { label: string; value: number; tone: "ok" | "warn" | "fail" }) {
  const colorMap = {
    ok: "bg-emerald-950/50 border-emerald-500/40 text-emerald-300",
    warn: "bg-amber-950/50 border-amber-500/40 text-amber-300",
    fail: "bg-red-950/50 border-red-500/40 text-red-300",
  }

  const iconMap = {
    ok: <CheckCircle2 className="h-3 w-3" />,
    warn: <TriangleAlert className="h-3 w-3" />,
    fail: <XCircle className="h-3 w-3" />,
  }

  return (
    <div className={`flex items-center gap-2 rounded border px-2 py-1 text-[11px] font-mono ${colorMap[tone]}`}>
      {iconMap[tone]}
      <span>{label}</span>
      <span className="text-xs text-gray-400">{value}</span>
    </div>
  )
}

export function World3DTStatus() {
  const { data: worldData } = useSWR<WorldResponse>("/api/worlds", fetcher, { refreshInterval: 10000 })
  const { data: patchData } = useSWR<PatchResponse>("/api/patches", fetcher, { refreshInterval: 15000 })
  const { data: timelineData } = useSWR<TimelineResponse>("/api/timeline?limit=5", fetcher, {
    refreshInterval: 7000,
  })

  const compliance = patchData?.compliance ?? worldData?.compliance ?? { ok: 0, warn: 0, fail: 0 }
  const events = timelineData?.events ?? []

  return (
    <Card className="border border-cyan-500/30 bg-black/80 backdrop-blur-md shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-cyan-500/60 text-cyan-300 bg-cyan-950/30 font-mono">
              3DT
            </Badge>
            <CardTitle className="text-sm font-mono text-white">WORLD STATUS</CardTitle>
          </div>
          <div className="text-[11px] font-mono text-gray-500">
            {worldData?.total ?? "--"} surfaces • {worldData?.worldType ?? "3DT"}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <CompliancePill label="OK" value={compliance.ok} tone="ok" />
          <CompliancePill label="WARN" value={compliance.warn} tone="warn" />
          <CompliancePill label="FAIL" value={compliance.fail} tone="fail" />
        </div>

        <Separator className="bg-cyan-500/20" />

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
            <Activity className="h-4 w-4" />
            <span>LATEST TIMELINE</span>
          </div>
          {events.length === 0 ? (
            <div className="text-[11px] font-mono text-gray-600">No timeline events yet.</div>
          ) : (
            <div className="space-y-2">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="border border-gray-800 rounded px-3 py-2 bg-gray-950/60 flex items-start justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-[11px] font-mono text-gray-300 truncate">{event.summary}</div>
                    <div className="text-[10px] font-mono text-gray-500">
                      {event.eventType.toUpperCase()} {event.worldId ? `• ${event.worldId}` : ""}
                    </div>
                  </div>
                  <div className="text-[10px] font-mono text-gray-700 whitespace-nowrap">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
