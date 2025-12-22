"use client"

import { useTelemetry } from "@/hooks/use-hub-state"
import { Activity, Zap, Shield, Radio } from "lucide-react"

export function TelemetryPanel() {
  const { events, hemisphereScore } = useTelemetry()

  return (
    <div className="w-72 border border-cyan-500/30 bg-black/90 backdrop-blur-sm rounded p-4 space-y-4">
      {/* Hemisphere Scores */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono text-cyan-400">HEMISPHERE SCORE</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 border border-green-500/30 rounded bg-green-950/20">
            <div className="text-lg font-mono font-bold text-green-400">{hemisphereScore.business}</div>
            <div className="text-[10px] font-mono text-green-500/70">BUSINESS</div>
          </div>
          <div className="text-center p-2 border border-cyan-500/30 rounded bg-cyan-950/20">
            <div className="text-lg font-mono font-bold text-cyan-400">{hemisphereScore.akashic}</div>
            <div className="text-[10px] font-mono text-cyan-500/70">AKASHIC</div>
          </div>
          <div className="text-center p-2 border border-amber-500/30 rounded bg-amber-950/20">
            <div className="text-lg font-mono font-bold text-amber-400">{hemisphereScore.bridge}</div>
            <div className="text-[10px] font-mono text-amber-500/70">BRIDGE</div>
          </div>
        </div>
        <div className="mt-2 text-center">
          <span className="text-xs font-mono text-gray-500">TOTAL: </span>
          <span className="text-xs font-mono text-white">{hemisphereScore.total}</span>
        </div>
      </div>

      {/* Event Feed */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono text-cyan-400">TELEMETRY FEED</span>
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {events.length === 0 ? (
            <div className="text-xs font-mono text-gray-600 text-center py-4">NO EVENTS YET</div>
          ) : (
            events.slice(0, 8).map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-2 p-2 border border-gray-800 rounded bg-gray-950/50 text-xs"
              >
                <EventIcon type={event.type} />
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-gray-300 truncate">{event.type.replace("_", " ").toUpperCase()}</div>
                  {event.patchId && <div className="font-mono text-gray-600 truncate">{event.patchId}</div>}
                </div>
                <div className="text-[10px] font-mono text-gray-700">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function EventIcon({ type }: { type: string }) {
  switch (type) {
    case "patch_access":
      return <Radio className="w-3 h-3 text-cyan-400 shrink-0" />
    case "firewall_check":
      return <Shield className="w-3 h-3 text-orange-400 shrink-0" />
    case "realm_transition":
      return <Zap className="w-3 h-3 text-green-400 shrink-0" />
    default:
      return <Activity className="w-3 h-3 text-gray-400 shrink-0" />
  }
}
