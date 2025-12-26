import type { ReactNode } from "react"
import { TrinityProvider } from "@/components/trinity-provider"
import { CONSUMERS } from "@/lib/trinity-consumers"

export const metadata = {
  title: "CLEAR | WIRED CHAOS",
  description: "Credit Repair & Financial Clarity - Business Realm Portal",
}

export default function ClearLayout({ children }: { children: ReactNode }) {
  return <TrinityProvider consumer={CONSUMERS.CLEAR}>{children}</TrinityProvider>
}
