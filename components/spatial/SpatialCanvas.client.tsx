"use client"

import { Component, type ErrorInfo, type ReactNode, useEffect, useState } from "react"
import CinematicBackground from "./CinematicBackground.client"

class SpatialCanvasBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: Error, _info: ErrorInfo) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Spatial canvas disabled after initialization failure.", { name: error.name })
    }
  }

  render() {
    if (this.state.failed) return null
    return this.props.children
  }
}

function webglAvailable() {
  try {
    const canvas = document.createElement("canvas")
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"))
  } catch {
    return false
  }
}

export default function SpatialCanvas() {
  const [canRender, setCanRender] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)")
    const updateMotion = () => setReducedMotion(motion.matches)
    updateMotion()
    motion.addEventListener("change", updateMotion)
    setCanRender(webglAvailable())
    return () => motion.removeEventListener("change", updateMotion)
  }, [])

  if (!canRender) return null

  return (
    <SpatialCanvasBoundary>
      <div className="spatial-canvas-layer" aria-hidden="true">
        <CinematicBackground reducedMotion={reducedMotion} />
      </div>
    </SpatialCanvasBoundary>
  )
}
