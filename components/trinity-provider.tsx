"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import {
  TRINITY_CORE,
  validateConsumerDeclaration,
  registerConsumer,
  type TrinityConsumer,
  type TrinityContext,
  type TimelineEntry,
} from "@/lib/trinity-core"
import {
  type TrinityFloor,
  type TimelineAccess,
  canTransitionFloor,
  getFloorConfig,
  SIGNAL_DUEL_MOUNT,
  CLEAR_MOUNT, // Import CLEAR_MOUNT
} from "@/lib/trinity-mount"
import { initializeRegistry } from "@/lib/patch-registry"
import { emitTelemetry } from "@/lib/telemetry-bus"

const TrinityCtx = createContext<TrinityContext | null>(null)

interface TrinityProviderProps {
  children: ReactNode
  consumer: TrinityConsumer
}

let registryInitialized = false
function ensureRegistry() {
  if (!registryInitialized) {
    initializeRegistry()
    registryInitialized = true
  }
}

export function TrinityProvider({ children, consumer }: TrinityProviderProps) {
  const [currentFloor, setCurrentFloor] = useState<TrinityFloor>(consumer.requestedFloor)
  const [timelineAccess, setTimelineAccess] = useState<TimelineAccess>("pending")
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isValid, setIsValid] = useState(false)

  useEffect(() => {
    ensureRegistry()

    const valid = validateConsumerDeclaration(consumer)
    setIsValid(valid)

    if (valid) {
      registerConsumer(consumer)
      setTimelineAccess("granted")

      emitTelemetry({
        type: "TRINITY_CONSUMER_REGISTERED",
        patchId: consumer.patchId,
        realm: "bridge",
        hemisphere: "left",
        metadata: {
          mount: consumer.mount,
          floor: consumer.requestedFloor,
          declarations: consumer.declares,
        },
      })
    } else {
      setTimelineAccess("denied")

      emitTelemetry({
        type: "TRINITY_CONSUMER_REJECTED",
        patchId: consumer.patchId,
        realm: "bridge",
        hemisphere: "left",
        metadata: {
          reason: "declaration_validation_failed",
        },
      })
    }
  }, [consumer])

  const requestFloorChange = useCallback(
    async (targetFloor: TrinityFloor): Promise<boolean> => {
      if (!isValid || isTransitioning) return false

      const canTransition = canTransitionFloor(currentFloor, targetFloor, timelineAccess)

      if (!canTransition) {
        emitTelemetry({
          type: "TRINITY_FLOOR_DENIED",
          patchId: consumer.patchId,
          realm: "bridge",
          hemisphere: "left",
          metadata: { from: currentFloor, to: targetFloor },
        })
        return false
      }

      setIsTransitioning(true)

      emitTelemetry({
        type: "TRINITY_FLOOR_TRANSITION",
        patchId: consumer.patchId,
        realm: "bridge",
        hemisphere: "left",
        metadata: { from: currentFloor, to: targetFloor },
      })

      await new Promise((resolve) => setTimeout(resolve, 500))

      setCurrentFloor(targetFloor)
      setIsTransitioning(false)

      return true
    },
    [isValid, isTransitioning, currentFloor, timelineAccess, consumer.patchId],
  )

  const readTimeline = useCallback(async (): Promise<TimelineEntry[]> => {
    if (timelineAccess !== "granted") {
      return []
    }

    const floorConfig = getFloorConfig(currentFloor)
    const isAkashicFloor = floorConfig.realm === "akashic"

    return [
      {
        id: "entry_001",
        timestamp: Date.now() - 3600000,
        event: "patch_mount",
        realm: "business",
        redacted: false,
      },
      {
        id: "entry_002",
        timestamp: Date.now() - 1800000,
        event: "realm_transition",
        realm: "akashic",
        redacted: !isAkashicFloor,
      },
      {
        id: "entry_003",
        timestamp: Date.now(),
        event: "timeline_access",
        realm: "bridge",
        redacted: false,
      },
    ]
  }, [timelineAccess, currentFloor])

  if (!isValid) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="border border-red-500/50 bg-red-950/20 rounded-lg p-6 max-w-md">
          <div className="text-red-400 font-mono text-sm mb-2">TRINITY ACCESS DENIED</div>
          <div className="text-gray-400 font-mono text-xs">
            Consumer {consumer.patchId} failed declaration validation. All patches must declare: no3DGeneration,
            noGalaxyCreation, trinityReadOnly, timelineGovernor.
          </div>
        </div>
      </div>
    )
  }

  const context: TrinityContext = {
    core: TRINITY_CORE,
    currentFloor,
    timelineAccess,
    isTransitioning,
    requestFloorChange,
    readTimeline,
  }

  return <TrinityCtx.Provider value={context}>{children}</TrinityCtx.Provider>
}

export function useTrinity(): TrinityContext {
  const context = useContext(TrinityCtx)

  if (!context) {
    throw new Error(
      "useTrinity must be used within TrinityProvider. " +
        "Patches must be wrapped with TrinityProvider and pass valid consumer declaration.",
    )
  }

  return context
}

export const CONSUMERS = {
  SIGNAL_DUEL: {
    patchId: SIGNAL_DUEL_MOUNT.patchId,
    mount: SIGNAL_DUEL_MOUNT.mount,
    requestedFloor: SIGNAL_DUEL_MOUNT.trinityFloor,
    timelineAccess: {
      level: "read" as const,
      governor: "AKIRA_CODEX" as const,
      redacted: false,
    },
    declares: {
      no3DGeneration: true,
      noGalaxyCreation: true,
      trinityReadOnly: true,
      timelineGovernor: "AKIRA_CODEX",
    },
  } satisfies TrinityConsumer,

  CLEAR: {
    patchId: CLEAR_MOUNT.patchId,
    mount: CLEAR_MOUNT.mount,
    requestedFloor: CLEAR_MOUNT.trinityFloor,
    timelineAccess: {
      level: "read" as const,
      governor: "AKIRA_CODEX" as const,
      redacted: false,
    },
    declares: {
      no3DGeneration: true,
      noGalaxyCreation: true,
      trinityReadOnly: true,
      timelineGovernor: "AKIRA_CODEX",
    },
  } satisfies TrinityConsumer,
} as const
