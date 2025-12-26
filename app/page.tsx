import nextDynamic from "next/dynamic"

// Prevent server-side evaluation of WebGL / R3F modules.
const GalaxyHubClient = nextDynamic(() => import("./_components/GalaxyHubClient"), { ssr: false })

export const dynamic = "force-dynamic"

export default function Page() {
  return <GalaxyHubClient />
}
