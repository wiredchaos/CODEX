"use client"

import { useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Activity, Send } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

type TimelineEvent = {
  id: string
  eventType: string
  summary: string
  worldId?: string
  patchId?: string
  timestamp: number
}

type TimelineResponse = { events: TimelineEvent[] }

type WorldResponse = {
  worlds: { id: string; realm: string }[]
}

type PatchResponse = {
  patches: { id: string; realm: string }[]
}

export function TimelinePanel() {
  const { data, mutate } = useSWR<TimelineResponse>("/api/timeline?limit=20", fetcher, { refreshInterval: 8000 })
  const { data: worlds } = useSWR<WorldResponse>("/api/worlds", fetcher)
  const { data: patches } = useSWR<PatchResponse>("/api/patches", fetcher)

  const [eventType, setEventType] = useState("timeline")
  const [summary, setSummary] = useState("")
  const [worldId, setWorldId] = useState("")
  const [patchId, setPatchId] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = async () => {
    if (!summary.trim()) return
    setIsSubmitting(true)
    await fetch("/api/timeline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventType, summary, worldId: worldId || undefined, patchId: patchId || undefined }),
    })
    setSummary("")
    setIsSubmitting(false)
    mutate()
  }

  return (
    <Card className="border border-cyan-500/30 bg-black/85 backdrop-blur-md">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-cyan-400" />
          <CardTitle className="text-sm font-mono text-white">MULTIVERSE TIMELINE</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs font-mono">
          <div>
            <Label className="text-[11px] text-gray-400">Event Type</Label>
            <Select value={eventType} onValueChange={setEventType}>
              <SelectTrigger className="mt-1 bg-gray-950/70 border-gray-800 text-gray-200">
                <SelectValue placeholder="type" />
              </SelectTrigger>
              <SelectContent className="bg-black text-gray-200 border-cyan-500/30">
                <SelectItem value="timeline">TIMELINE</SelectItem>
                <SelectItem value="firewall">FIREWALL</SelectItem>
                <SelectItem value="patch">PATCH</SelectItem>
                <SelectItem value="bridge">BRIDGE</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[11px] text-gray-400">World</Label>
            <Select value={worldId} onValueChange={setWorldId}>
              <SelectTrigger className="mt-1 bg-gray-950/70 border-gray-800 text-gray-200">
                <SelectValue placeholder="optional" />
              </SelectTrigger>
              <SelectContent className="bg-black text-gray-200 border-cyan-500/30">
                {(worlds?.worlds ?? []).map((world) => (
                  <SelectItem key={world.id} value={world.id}>
                    {world.id} ({world.realm})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-[11px] text-gray-400">Patch</Label>
            <Select value={patchId} onValueChange={setPatchId}>
              <SelectTrigger className="mt-1 bg-gray-950/70 border-gray-800 text-gray-200">
                <SelectValue placeholder="optional" />
              </SelectTrigger>
              <SelectContent className="bg-black text-gray-200 border-cyan-500/30">
                {(patches?.patches ?? []).map((patch) => (
                  <SelectItem key={patch.id} value={patch.id}>
                    {patch.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-[11px] text-gray-400">Summary</Label>
          <Textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Describe the event"
            className="bg-gray-950/70 border-gray-800 text-gray-100"
            rows={3}
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            className="font-mono text-xs border-cyan-500/60 text-cyan-300"
            onClick={submit}
            disabled={isSubmitting || !summary.trim()}
          >
            <Send className="h-3 w-3 mr-2" /> Report Event
          </Button>
          <div className="text-[10px] font-mono text-gray-600">Posts to /api/timeline</div>
        </div>

        <ScrollArea className="h-56 pr-2 border border-cyan-500/10 rounded">
          <div className="space-y-2 p-2">
            {(data?.events ?? []).map((event) => (
              <div key={event.id} className="border border-gray-800 rounded px-3 py-2 bg-gray-950/70">
                <div className="flex items-center justify-between text-[11px] font-mono text-gray-300">
                  <span className="text-cyan-300">{event.eventType.toUpperCase()}</span>
                  <span className="text-gray-500">{new Date(event.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="text-[11px] font-mono text-white mt-1">{event.summary}</div>
                <div className="text-[10px] font-mono text-gray-500 mt-1">
                  {event.worldId ? `World: ${event.worldId}` : "World: --"} • {event.patchId ? `Patch: ${event.patchId}` : "Patch: --"}
                </div>
              </div>
            ))}
            {(data?.events ?? []).length === 0 && (
              <div className="text-[11px] font-mono text-gray-600 text-center py-4">No timeline events recorded.</div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
