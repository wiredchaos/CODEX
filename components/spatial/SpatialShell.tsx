import type { ReactNode } from "react"
import SpatialCanvasLoader from "./SpatialCanvasLoader.client"

export default function SpatialShell({ children }: { children: ReactNode }) {
  return (
    <div className="spatial-shell">
      <SpatialCanvasLoader />
      <div className="spatial-content">{children}</div>
    </div>
  )
}
