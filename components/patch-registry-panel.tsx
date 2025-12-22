"use client"

import useSWR from "swr"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { getRealmColor } from "@/lib/hub-config"
import { Shield, Globe2, Router, TriangleAlert, CheckCircle2, XCircle } from "lucide-react"

type Patch = {
  id: string
  mount: string
  realm: string
  status?: string
  compliance: "ok" | "warn" | "fail"
  manifest?: {
    timelineAccess: string
    assignedFloor: string
    type: string
  }
}

type PatchResponse = {
  patches: Patch[]
  compliance: { ok: number; warn: number; fail: number }
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const complianceIcons = {
  ok: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
  warn: <TriangleAlert className="h-4 w-4 text-amber-400" />,
  fail: <XCircle className="h-4 w-4 text-red-400" />,
}

export function PatchRegistryPanel() {
  const { data } = useSWR<PatchResponse>("/api/patches", fetcher, { refreshInterval: 10000 })
  const patches = data?.patches ?? []

  return (
    <Card className="border border-cyan-500/30 bg-black/85 backdrop-blur-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-cyan-400" />
            <CardTitle className="text-sm font-mono text-white">PATCH REGISTRY</CardTitle>
          </div>
          <div className="flex gap-2 text-[11px] font-mono text-gray-500">
            <span className="text-emerald-400">OK {data?.compliance.ok ?? 0}</span>
            <span className="text-amber-400">WARN {data?.compliance.warn ?? 0}</span>
            <span className="text-red-400">FAIL {data?.compliance.fail ?? 0}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Separator className="bg-cyan-500/10 mb-3" />
        <ScrollArea className="h-64 pr-2">
          <div className="space-y-3">
            {patches.map((patch) => (
              <div key={patch.id} className="border border-gray-800 rounded p-3 bg-gray-950/60">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="font-mono text-[11px]"
                      style={{ borderColor: getRealmColor(patch.realm), color: getRealmColor(patch.realm) }}
                    >
                      {patch.realm.toUpperCase()}
                    </Badge>
                    <div className="font-mono text-sm text-white">{patch.id}</div>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
                    {complianceIcons[patch.compliance]}
                    <span className="uppercase">{patch.compliance}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-mono text-gray-500 mt-2">
                  <Globe2 className="h-3 w-3" />
                  <span>{patch.mount}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-mono text-gray-500 mt-1">
                  <Router className="h-3 w-3" />
                  <span>
                    {patch.manifest?.assignedFloor ?? "UNASSIGNED"} • TIMELINE {patch.manifest?.timelineAccess?.toUpperCase() ?? "PENDING"}
                  </span>
                </div>
              </div>
            ))}
            {patches.length === 0 && (
              <div className="text-[11px] font-mono text-gray-600 text-center py-6">No patches registered.</div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
