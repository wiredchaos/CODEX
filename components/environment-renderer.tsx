"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useTrinity } from "./trinity-provider"
import { emitTelemetry } from "@/lib/telemetry-bus"
import type { TrinityFloor } from "@/lib/trinity-mount"

// Environment kinds supported by Trinity Core
export type EnvironmentKind = "lobby" | "arena" | "archive" | "portal" | "void"

// Hotspot definition - supplied by core
export interface Hotspot {
  id: string
  label: string
  position: { x: number; y: number } // percentage-based
  action: "navigate" | "interact" | "info" | "portal"
  target?: string
  locked?: boolean
  akiraGated?: boolean
}

// HUD element definition - supplied by core
export interface HUDElement {
  id: string
  type: "status" | "nav" | "info" | "action"
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center"
  content: React.ReactNode
}

interface EnvironmentRendererProps {
  patchId: string
  kind: EnvironmentKind
  hotspots?: Hotspot[]
  hudElements?: HUDElement[]
  videoFallbackSrc?: string
  onHotspotClick?: (hotspot: Hotspot) => void
}

// Environment configurations by kind - CORE SUPPLIED
const ENVIRONMENT_CONFIGS: Record<
  EnvironmentKind,
  {
    label: string
    ambientColor: string
    floorGlow: string
    description: string
  }
> = {
  lobby: {
    label: "LOBBY",
    ambientColor: "rgba(16, 185, 129, 0.1)", // business green
    floorGlow: "#10b981",
    description: "Primary entry point and navigation hub",
  },
  arena: {
    label: "ARENA",
    ambientColor: "rgba(245, 158, 11, 0.1)", // bridge amber
    floorGlow: "#f59e0b",
    description: "Competitive interaction space",
  },
  archive: {
    label: "ARCHIVE",
    ambientColor: "rgba(6, 182, 212, 0.1)", // akashic cyan
    floorGlow: "#06b6d4",
    description: "Historical record access point",
  },
  portal: {
    label: "PORTAL",
    ambientColor: "rgba(217, 70, 239, 0.1)", // hybrid magenta
    floorGlow: "#d946ef",
    description: "Cross-realm transition gate",
  },
  void: {
    label: "VOID",
    ambientColor: "rgba(107, 114, 128, 0.05)",
    floorGlow: "#374151",
    description: "Null space - awaiting initialization",
  },
}

// Default hotspots for lobby kind - CORE SUPPLIED
const DEFAULT_LOBBY_HOTSPOTS: Hotspot[] = [
  { id: "nav-hub", label: "Return to Hub", position: { x: 10, y: 90 }, action: "navigate", target: "/" },
  { id: "info-status", label: "System Status", position: { x: 90, y: 10 }, action: "info" },
  {
    id: "portal-akira",
    label: "Akira Codex",
    position: { x: 50, y: 20 },
    action: "portal",
    target: "/world/akira",
    akiraGated: true,
  },
]

export function EnvironmentRenderer({
  patchId,
  kind,
  hotspots,
  hudElements,
  videoFallbackSrc,
  onHotspotClick,
}: EnvironmentRendererProps) {
  const trinity = useTrinity()
  const [mounted, setMounted] = useState(false)
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null)
  const [use3D, setUse3D] = useState(true)

  const config = ENVIRONMENT_CONFIGS[kind]
  const effectiveHotspots = hotspots || (kind === "lobby" ? DEFAULT_LOBBY_HOTSPOTS : [])

  useEffect(() => {
    setMounted(true)

    // Check for 3D capability (WebGL)
    try {
      const canvas = document.createElement("canvas")
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
      setUse3D(!!gl)
    } catch {
      setUse3D(false)
    }

    emitTelemetry({
      type: "ENVIRONMENT_MOUNT",
      patchId,
      realm: "business",
      hemisphere: "left",
      metadata: { kind, floor: trinity.currentFloor },
    })
  }, [patchId, kind, trinity.currentFloor])

  const handleHotspotClick = useCallback(
    (hotspot: Hotspot) => {
      if (hotspot.locked) {
        emitTelemetry({
          type: "HOTSPOT_LOCKED",
          patchId,
          realm: "business",
          hemisphere: "left",
          metadata: { hotspotId: hotspot.id },
        })
        return
      }

      if (hotspot.akiraGated && trinity.timelineAccess !== "granted") {
        emitTelemetry({
          type: "HOTSPOT_AKIRA_DENIED",
          patchId,
          realm: "business",
          hemisphere: "left",
          metadata: { hotspotId: hotspot.id },
        })
        return
      }

      emitTelemetry({
        type: "HOTSPOT_ACTIVATED",
        patchId,
        realm: "business",
        hemisphere: "left",
        metadata: { hotspotId: hotspot.id, action: hotspot.action },
      })

      onHotspotClick?.(hotspot)
    },
    [patchId, trinity.timelineAccess, onHotspotClick],
  )

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-emerald-400 font-mono text-sm animate-pulse">MOUNTING TRINITY ENVIRONMENT...</div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* CINEMATIC ENVIRONMENT LAYER - Video Fallback or CSS 3D Simulation */}
      {use3D ? (
        <CinematicEnvironment kind={kind} config={config} />
      ) : videoFallbackSrc ? (
        <video
          src={videoFallbackSrc}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
      ) : (
        <StaticEnvironment kind={kind} config={config} />
      )}

      {/* CORE-SUPPLIED HUD */}
      <HUDOverlay
        patchId={patchId}
        kind={kind}
        config={config}
        currentFloor={trinity.currentFloor}
        timelineAccess={trinity.timelineAccess}
        customElements={hudElements}
      />

      {/* CORE-SUPPLIED HOTSPOTS */}
      <HotspotsLayer
        hotspots={effectiveHotspots}
        activeHotspot={activeHotspot}
        onHover={setActiveHotspot}
        onClick={handleHotspotClick}
        timelineAccess={trinity.timelineAccess}
      />

      {/* TRANSITION OVERLAY */}
      {trinity.isTransitioning && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="text-white font-mono text-sm animate-pulse">FLOOR TRANSITION IN PROGRESS...</div>
        </div>
      )}
    </div>
  )
}

// CSS-based cinematic environment (no R3F - consumer pattern)
function CinematicEnvironment({
  kind,
  config,
}: {
  kind: EnvironmentKind
  config: (typeof ENVIRONMENT_CONFIGS)[EnvironmentKind]
}) {
  return (
    <div className="absolute inset-0">
      {/* Ambient glow background */}
      <div
        className="absolute inset-0 transition-colors duration-1000"
        style={{ backgroundColor: config.ambientColor }}
      />

      {/* Grid floor simulation */}
      <div className="absolute inset-0 perspective-[1000px]">
        <div
          className="absolute bottom-0 left-0 right-0 h-[60%] origin-bottom"
          style={{
            transform: "rotateX(70deg)",
            background: `
              linear-gradient(90deg, ${config.floorGlow}20 1px, transparent 1px),
              linear-gradient(${config.floorGlow}20 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Horizon glow */}
      <div
        className="absolute left-0 right-0 h-32 top-[40%]"
        style={{
          background: `linear-gradient(to bottom, transparent, ${config.floorGlow}30, transparent)`,
        }}
      />

      {/* Particle simulation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full animate-pulse"
            style={{
              backgroundColor: config.floorGlow,
              opacity: 0.3 + Math.random() * 0.4,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Environment label */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
        <div className="text-6xl font-bold tracking-widest opacity-10" style={{ color: config.floorGlow }}>
          {config.label}
        </div>
        <div className="text-sm font-mono text-gray-600 mt-2">{config.description}</div>
      </div>
    </div>
  )
}

// Static fallback for no WebGL
function StaticEnvironment({
  kind,
  config,
}: {
  kind: EnvironmentKind
  config: (typeof ENVIRONMENT_CONFIGS)[EnvironmentKind]
}) {
  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: config.ambientColor }}>
      <div className="text-center">
        <div className="text-4xl font-bold tracking-widest opacity-20" style={{ color: config.floorGlow }}>
          {config.label}
        </div>
        <div className="text-xs font-mono text-gray-600 mt-2">[STATIC RENDER MODE]</div>
      </div>
    </div>
  )
}

// HUD Overlay component
function HUDOverlay({
  patchId,
  kind,
  config,
  currentFloor,
  timelineAccess,
  customElements,
}: {
  patchId: string
  kind: EnvironmentKind
  config: (typeof ENVIRONMENT_CONFIGS)[EnvironmentKind]
  currentFloor: TrinityFloor
  timelineAccess: string
  customElements?: HUDElement[]
}) {
  return (
    <>
      {/* Top-left: Patch ID + Kind */}
      <div className="absolute top-4 left-4 z-40">
        <div className="border border-gray-800 bg-black/80 backdrop-blur-sm rounded px-3 py-2">
          <div className="text-xs font-mono text-gray-500">PATCH</div>
          <div className="text-sm font-mono text-white">{patchId}</div>
          <div className="text-xs font-mono mt-1" style={{ color: config.floorGlow }}>
            {kind.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Top-right: Floor + Access */}
      <div className="absolute top-4 right-4 z-40">
        <div className="border border-gray-800 bg-black/80 backdrop-blur-sm rounded px-3 py-2 text-right">
          <div className="text-xs font-mono text-gray-500">TRINITY FLOOR</div>
          <div className="text-sm font-mono text-cyan-400">{currentFloor}</div>
          <div className="text-xs font-mono mt-1">
            <span className="text-gray-500">TIMELINE: </span>
            <span
              className={
                timelineAccess === "granted"
                  ? "text-emerald-400"
                  : timelineAccess === "denied"
                    ? "text-red-400"
                    : "text-yellow-400"
              }
            >
              {timelineAccess.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom-left: Consumer status */}
      <div className="absolute bottom-4 left-4 z-40">
        <div className="border border-gray-800 bg-black/80 backdrop-blur-sm rounded px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono text-gray-400">TRINITY CONSUMER</span>
          </div>
          <div className="text-xs font-mono text-gray-600 mt-1">READ-ONLY INFRASTRUCTURE</div>
        </div>
      </div>

      {/* Custom HUD elements */}
      {customElements?.map((element) => (
        <div
          key={element.id}
          className={`absolute z-40 ${
            element.position === "top-left"
              ? "top-4 left-4"
              : element.position === "top-right"
                ? "top-4 right-4"
                : element.position === "bottom-left"
                  ? "bottom-4 left-4"
                  : element.position === "bottom-right"
                    ? "bottom-4 right-4"
                    : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          }`}
        >
          {element.content}
        </div>
      ))}
    </>
  )
}

// Hotspots Layer
function HotspotsLayer({
  hotspots,
  activeHotspot,
  onHover,
  onClick,
  timelineAccess,
}: {
  hotspots: Hotspot[]
  activeHotspot: string | null
  onHover: (id: string | null) => void
  onClick: (hotspot: Hotspot) => void
  timelineAccess: string
}) {
  return (
    <div className="absolute inset-0 z-30 pointer-events-none">
      {hotspots.map((hotspot) => {
        const isLocked = hotspot.locked || (hotspot.akiraGated && timelineAccess !== "granted")
        const isActive = activeHotspot === hotspot.id

        return (
          <button
            key={hotspot.id}
            className={`
              absolute pointer-events-auto
              transition-all duration-300
              ${isLocked ? "cursor-not-allowed" : "cursor-pointer"}
            `}
            style={{
              left: `${hotspot.position.x}%`,
              top: `${hotspot.position.y}%`,
              transform: "translate(-50%, -50%)",
            }}
            onMouseEnter={() => onHover(hotspot.id)}
            onMouseLeave={() => onHover(null)}
            onClick={() => onClick(hotspot)}
          >
            {/* Hotspot marker */}
            <div
              className={`
              relative w-8 h-8 rounded-full border-2
              flex items-center justify-center
              transition-all duration-300
              ${
                isLocked
                  ? "border-red-500/50 bg-red-950/30"
                  : isActive
                    ? "border-cyan-400 bg-cyan-950/50 scale-125"
                    : "border-emerald-500/50 bg-emerald-950/30 hover:scale-110"
              }
            `}
            >
              <div
                className={`
                w-2 h-2 rounded-full
                ${isLocked ? "bg-red-400" : "bg-emerald-400"}
                ${!isLocked && "animate-pulse"}
              `}
              />

              {/* Pulse ring */}
              {!isLocked && <div className="absolute inset-0 rounded-full border border-emerald-500/30 animate-ping" />}
            </div>

            {/* Label tooltip */}
            {isActive && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap">
                <div
                  className={`
                  px-2 py-1 rounded text-xs font-mono
                  ${
                    isLocked
                      ? "bg-red-950/80 text-red-400 border border-red-500/30"
                      : "bg-black/80 text-white border border-gray-700"
                  }
                `}
                >
                  {hotspot.label}
                  {hotspot.akiraGated && <span className="ml-1 text-amber-400">[AKIRA]</span>}
                  {hotspot.locked && <span className="ml-1 text-red-400">[LOCKED]</span>}
                </div>
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
