import type { TrinityConsumer } from "@/lib/trinity-core"
import { SIGNAL_DUEL_MOUNT, CLEAR_MOUNT } from "@/lib/trinity-mount"

// Server-safe consumer declarations.
// IMPORTANT: Do not import these from a client component module.
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

