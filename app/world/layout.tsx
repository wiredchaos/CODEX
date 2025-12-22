import type { ReactNode } from "react"

import { World3DTStatus } from "@/components/world-3dt-status"
import { PatchRegistryPanel } from "@/components/patch-registry-panel"
import { TimelinePanel } from "@/components/timeline-panel"

export default function WorldLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-black text-white">
      <div className="absolute top-4 left-4 z-30 w-[280px] space-y-3">
        <World3DTStatus />
      </div>
      <div className="absolute top-4 right-4 z-30 w-[320px] space-y-3">
        <PatchRegistryPanel />
        <TimelinePanel />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  )
}
