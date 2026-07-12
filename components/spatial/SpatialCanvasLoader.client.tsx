"use client"

import dynamic from "next/dynamic"

const SpatialCanvas = dynamic(() => import("./SpatialCanvas.client"), {
  ssr: false,
  loading: () => null,
})

export default function SpatialCanvasLoader() {
  return <SpatialCanvas />
}
