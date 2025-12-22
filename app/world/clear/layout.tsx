import type { ReactNode } from "react"
import { TrinityProvider, CONSUMERS } from "@/components/trinity-provider"

export const metadata = {
  title: "CLEAR | WIRED CHAOS",
  description: "Credit Repair & Financial Clarity - Business Realm Portal",
}

export default function ClearLayout({ children }: { children: ReactNode }) {
  return <TrinityProvider consumer={CONSUMERS.CLEAR}>{children}</TrinityProvider>
}
