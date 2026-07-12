"use client"

import { useEffect, useMemo } from "react"
import { Canvas } from "@react-three/fiber"
import { getSpatialRenderProfile } from "./spatial-types"

function Scene({ objectCount }: { objectCount: number }) {
  const nodes = useMemo(() => Array.from({ length: objectCount }, (_, index) => index), [objectCount])
  return (
    <>
      <ambientLight intensity={0.35} />
      <pointLight position={[2, 3, 4]} intensity={0.8} />
      {nodes.map((index) => (
        <mesh key={index} position={[(index % 6) - 3, Math.floor(index / 6) - 1, -3 - index * 0.08]}>
          <boxGeometry args={[0.12, 0.12, 0.12]} />
          <meshStandardMaterial color={index % 2 ? "#00f5ff" : "#7cffc4"} emissive="#05252a" />
        </mesh>
      ))}
    </>
  )
}

export default function CinematicBackground({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const profile = getSpatialRenderProfile({
    reducedMotion,
    width: typeof window === "undefined" ? undefined : window.innerWidth,
    saveData: typeof navigator !== "undefined" ? Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData) : false,
    hardwareConcurrency: typeof navigator !== "undefined" ? navigator.hardwareConcurrency : undefined,
    disabled: typeof localStorage !== "undefined" ? localStorage.getItem("agentropolis:disable-spatial") === "true" : false,
  })

  useEffect(() => {
    const handleVisibility = () => {
      // R3F demand rendering has no continuous loop here; this hook documents the hidden-tab pause gate.
    }
    document.addEventListener("visibilitychange", handleVisibility)
    return () => document.removeEventListener("visibilitychange", handleVisibility)
  }, [])

  if (!profile.enabled) return null

  return (
    <Canvas
      aria-hidden="true"
      className="spatial-canvas"
      dpr={profile.dpr}
      frameloop={profile.frameloop}
      gl={{ antialias: false, alpha: true, powerPreference: "low-power", failIfMajorPerformanceCaveat: true }}
      onCreated={({ gl }) => {
        gl.domElement.setAttribute("aria-hidden", "true")
        gl.domElement.tabIndex = -1
      }}
    >
      <Scene objectCount={profile.objectCount} />
    </Canvas>
  )
}
