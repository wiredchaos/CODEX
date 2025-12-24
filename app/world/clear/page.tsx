"use client"

export const dynamic = "force-dynamic"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { EnvironmentRenderer, type Hotspot, type HUDElement } from "@/components/environment-renderer"
import { emitTelemetry } from "@/lib/telemetry-bus"

// CLEAR-specific hotspots - overlays on core-supplied defaults
const CLEAR_HOTSPOTS: Hotspot[] = [
  {
    id: "nav-hub",
    label: "Return to Galaxy Hub",
    position: { x: 8, y: 92 },
    action: "navigate",
    target: "/",
  },
  {
    id: "clear-dashboard",
    label: "Credit Dashboard",
    position: { x: 50, y: 50 },
    action: "interact",
  },
  {
    id: "clear-reports",
    label: "Credit Reports",
    position: { x: 30, y: 40 },
    action: "interact",
  },
  {
    id: "clear-disputes",
    label: "Dispute Center",
    position: { x: 70, y: 40 },
    action: "interact",
  },
  {
    id: "portal-business",
    label: "Business Suite",
    position: { x: 85, y: 70 },
    action: "portal",
    target: "/world/business",
  },
  {
    id: "portal-neura-tax",
    label: "Neura Tax",
    position: { x: 15, y: 70 },
    action: "portal",
    target: "/world/neura-tax",
  },
]

export default function ClearPage() {
  const router = useRouter()

  const handleHotspotClick = useCallback(
    (hotspot: Hotspot) => {
      emitTelemetry({
        type: "CLEAR_HOTSPOT_CLICK",
        patchId: "CLEAR",
        realm: "business",
        hemisphere: "left",
        metadata: { hotspotId: hotspot.id, action: hotspot.action },
      })

      if (hotspot.action === "navigate" || hotspot.action === "portal") {
        if (hotspot.target) {
          router.push(hotspot.target)
        }
      }

      if (hotspot.action === "interact") {
        // Business logic handled by patch - firewalled from hub
        console.log(`[CLEAR] Interaction: ${hotspot.id}`)
      }
    },
    [router],
  )

  // Custom HUD elements for CLEAR patch
  const clearHUD: HUDElement[] = [
    {
      id: "clear-branding",
      type: "info",
      position: "bottom-right",
      content: (
        <div className="border border-emerald-500/30 bg-black/80 backdrop-blur-sm rounded px-3 py-2">
          <div className="text-emerald-400 font-mono text-lg font-bold tracking-wider">CLEAR</div>
          <div className="text-gray-500 font-mono text-xs">CREDIT CLARITY SYSTEM</div>
          <div className="text-emerald-500/50 font-mono text-xs mt-1">BUSINESS REALM</div>
        </div>
      ),
    },
  ]

  return (
    <EnvironmentRenderer
      patchId="CLEAR"
      kind="lobby"
      hotspots={CLEAR_HOTSPOTS}
      hudElements={clearHUD}
      onHotspotClick={handleHotspotClick}
    />
  )
}
