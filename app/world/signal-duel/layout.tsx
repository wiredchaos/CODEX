import { TrinityProvider } from "@/components/trinity-provider"
import { CONSUMERS } from "@/lib/trinity-consumers"
import type { ReactNode } from "react"

// SIGNAL_DUEL wraps its content in TrinityProvider
// This enforces consumer-only pattern at the layout level

export default function SignalDuelLayout({ children }: { children: ReactNode }) {
  return <TrinityProvider consumer={CONSUMERS.SIGNAL_DUEL}>{children}</TrinityProvider>
}
