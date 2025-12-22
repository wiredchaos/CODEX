"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Stars, Html, PerspectiveCamera } from "@react-three/drei"
import { Suspense, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, Radio, ShieldAlert } from "lucide-react"
import { type PatchConfig, getRealmColor } from "@/lib/hub-config"
import { useHubConfig, useTelemetry, useSession } from "@/hooks/use-hub-state"
import { TelemetryPanel } from "@/components/telemetry-panel"
import { World3DTStatus } from "@/components/world-3dt-status"
import { PatchRegistryPanel } from "@/components/patch-registry-panel"
import { TimelinePanel } from "@/components/timeline-panel"

if (typeof window !== "undefined") {
  const resizeObserverErr = window.onerror
  window.onerror = (message, ...args) => {
    if (typeof message === "string" && message.includes("ResizeObserver loop")) {
      return true
    }
    if (resizeObserverErr) {
      return resizeObserverErr(message, ...args)
    }
    return false
  }
}

function PatchOrb({
  patch,
  onClick,
}: {
  patch: PatchConfig
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const realmColor = getRealmColor(patch.realm)

  return (
    <group position={patch.position}>
      <mesh
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={onClick}
        scale={hovered ? 1.2 : 1}
      >
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial
          color={realmColor}
          emissive={realmColor}
          emissiveIntensity={hovered ? 1.5 : 0.5}
          wireframe
        />
      </mesh>

      {hovered && (
        <Html center distanceFactor={10}>
          <div className="pointer-events-none bg-black/90 border border-cyan-500/50 px-3 py-2 rounded backdrop-blur-sm">
            <div className="text-xs font-mono text-cyan-400 whitespace-nowrap">{patch.id}</div>
            <div className="text-[10px] font-mono text-gray-500">{patch.realm.toUpperCase()}</div>
            {patch.status && (
              <div className={`text-[10px] font-mono ${patch.status === "online" ? "text-green-400" : "text-red-400"}`}>
                {patch.status.toUpperCase()}
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  )
}

function GalaxyScene({
  patches,
  onPatchSelect,
}: {
  patches: PatchConfig[]
  onPatchSelect: (patch: PatchConfig) => void
}) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 5, 15]} />
      <OrbitControls
        enableZoom={true}
        enablePan={true}
        minDistance={8}
        maxDistance={30}
        autoRotate
        autoRotateSpeed={0.3}
      />

      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#06b6d4" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#10b981" />
      <pointLight position={[0, 10, 0]} intensity={0.3} color="#d946ef" />

      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      {patches.map((patch) => (
        <PatchOrb key={patch.id} patch={patch} onClick={() => onPatchSelect(patch)} />
      ))}

      {/* Central Hub Indicator */}
      <mesh position={[0, 0, 0]}>
        <torusGeometry args={[2, 0.05, 16, 100]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.3} />
      </mesh>
    </>
  )
}

function ElevatorPanel({
  selectedPatch,
  onClose,
  onEnter,
}: {
  selectedPatch: PatchConfig | null
  onClose: () => void
  onEnter: (patch: PatchConfig) => void
}) {
  const { config } = useHubConfig()

  if (!selectedPatch) return null

  const realmConfig = config.realms[selectedPatch.realm]

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-300">
      <div className="w-full max-w-2xl mx-4 border border-cyan-500/30 bg-black/90 rounded-lg overflow-hidden">
        {/* Elevator Display */}
        <div className="border-b border-cyan-500/30 p-6 bg-gradient-to-r from-black via-cyan-950/10 to-black">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-xs font-mono text-cyan-400 mb-1">REALM.{selectedPatch.realm.toUpperCase()}</div>
              <h2 className="text-2xl font-mono font-bold text-white tracking-tight">{selectedPatch.id}</h2>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors font-mono text-sm">
              [ESC]
            </button>
          </div>

          <div className="text-sm font-mono text-gray-400">{selectedPatch.mount}</div>
        </div>

        {/* Firewall Status */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 p-4 border border-orange-500/30 rounded bg-orange-950/10">
            <ShieldAlert className="w-5 h-5 text-orange-400" />
            <div className="flex-1">
              <div className="text-xs font-mono text-orange-400 mb-1">FIREWALL STATUS</div>
              <div className="text-sm font-mono text-white">{realmConfig.firewall.toUpperCase()}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 border border-cyan-500/30 rounded bg-cyan-950/10">
            <Radio className="w-5 h-5 text-cyan-400" />
            <div className="flex-1">
              <div className="text-xs font-mono text-cyan-400 mb-1">GROUNDING</div>
              <div className="text-sm font-mono text-white">
                {"grounding" in realmConfig ? realmConfig.grounding : realmConfig.mode}
              </div>
            </div>
          </div>

          {/* Isolation Notice */}
          <div className="p-4 border border-gray-700 rounded bg-gray-950/50">
            <div className="text-xs font-mono text-gray-500 mb-2">ISOLATION PROTOCOL</div>
            <div className="text-xs font-mono text-gray-400 leading-relaxed">
              Patch is isolated. Cross-realm access requires explicit bridge authorization. Hub contains no business
              logic per governance rules.
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1 font-mono text-xs border-cyan-500/50 text-cyan-400 hover:bg-cyan-950/30 bg-transparent"
              onClick={() => onEnter(selectedPatch)}
            >
              ENTER PATCH
            </Button>
            <Button
              variant="outline"
              className="font-mono text-xs border-gray-700 text-gray-400 hover:bg-gray-900 bg-transparent"
              onClick={onClose}
            >
              CANCEL
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  useSession()
  const { config, patches } = useHubConfig()
  const { trackPatchAccess, trackFirewallCheck } = useTelemetry()

  const [selectedPatch, setSelectedPatch] = useState<PatchConfig | null>(null)
  const [showInfo, setShowInfo] = useState(true)
  const [showTelemetry, setShowTelemetry] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handlePatchSelect = (patch: PatchConfig) => {
    setSelectedPatch(patch)
    trackFirewallCheck(patch.id, patch.realm, true)
  }

  const handlePatchEnter = (patch: PatchConfig) => {
    trackPatchAccess(patch)
    window.open(patch.mount, "_blank")
    setSelectedPatch(null)
  }

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Header Terminal */}
      <div className="absolute top-0 left-0 right-0 z-10 border-b border-cyan-500/30 bg-black/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-mono text-cyan-400 mb-1">SYSTEM.ORCHESTRATOR</div>
              <h1 className="text-xl font-mono font-bold text-white tracking-tight">WIRED CHAOS META HUB</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-xs font-mono text-gray-500">
                <span className="text-green-400">ONLINE</span> • {patches.length} PATCHES
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTelemetry(!showTelemetry)}
                className="font-mono text-xs text-gray-400 hover:text-white"
              >
                {showTelemetry ? "[HIDE TELEM]" : "[TELEM]"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowInfo(!showInfo)}
                className="font-mono text-xs text-gray-400 hover:text-white"
              >
                {showInfo ? "[HIDE]" : "[INFO]"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Info Panel */}
      {showInfo && (
        <div className="absolute top-20 left-6 z-10 w-80 border border-cyan-500/30 bg-black/90 backdrop-blur-sm rounded p-4 animate-in slide-in-from-left duration-300">
          <div className="text-xs font-mono text-cyan-400 mb-3">NAVIGATION</div>
          <div className="text-xs font-mono text-gray-400 space-y-2 leading-relaxed">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              <span className="text-green-400">GREEN</span> = Business Realm
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
              <span className="text-cyan-400">CYAN</span> = Akashic Realm
            </div>
            <div className="pt-2 border-t border-gray-800">
              Click any orb to access patch elevator. Drag to rotate view.
            </div>
          </div>
        </div>
      )}

      <div className="absolute top-20 right-6 z-10 space-y-3 max-w-sm animate-in slide-in-from-right duration-300">
        <World3DTStatus />
        {showTelemetry && <TelemetryPanel />}
        <PatchRegistryPanel />
        <TimelinePanel />
      </div>

      {/* Trinity 3D Canvas */}
      {mounted && (
        <div className="absolute inset-0">
          <Canvas
            style={{ width: "100%", height: "100%" }}
            resize={{ scroll: false, debounce: { scroll: 50, resize: 50 } }}
          >
            <Suspense fallback={null}>
              <GalaxyScene patches={patches} onPatchSelect={handlePatchSelect} />
            </Suspense>
          </Canvas>
        </div>
      )}

      {/* Elevator Modal */}
      <ElevatorPanel selectedPatch={selectedPatch} onClose={() => setSelectedPatch(null)} onEnter={handlePatchEnter} />

      {/* Footer Status */}
      <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-cyan-500/30 bg-black/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="text-gray-500">
              MODE: {config.render_mode.toUpperCase()} | NAV: {config.navigation.toUpperCase()}
            </div>
            <div className="text-cyan-400">GOT VA • VIRTUAL ASSISTANCE SERVICES</div>
          </div>
        </div>
      </div>

      {/* Scroll Hint */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 animate-bounce">
        <div className="text-xs font-mono text-gray-600">INTERACT</div>
        <ChevronDown className="w-4 h-4 text-gray-700" />
      </div>
    </div>
  )
import IntakeProtocolPanel from "../components/IntakeProtocolPanel";

export default function HomePage() {
  return <IntakeProtocolPanel />;
}
