import React, { createContext, useContext, useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Grid, Stars, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

export type SceneFlags = {
  skyTint: string;
  volatility: number;
  spawnRate: number;
};

export type SceneBridge = {
  flags: SceneFlags;
  captured: Set<string>;
  onCapture: (nodeId: string) => void;
  subscribe: (listener: () => void) => () => void;
  notify: () => void;
};

function createSceneBridge(): SceneBridge {
  const listeners = new Set<() => void>();

  return {
    flags: {
      skyTint: "#000000",
      volatility: 0,
      spawnRate: 1,
    },
    captured: new Set<string>(),
    onCapture: () => {},
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    notify: () => {
      listeners.forEach((l) => l());
    },
  };
}

const SceneBridgeContext = createContext<React.MutableRefObject<SceneBridge> | null>(null);

export function SceneBridgeProvider({
  bridgeRef,
  children,
}: {
  bridgeRef: React.MutableRefObject<SceneBridge>;
  children: React.ReactNode;
}) {
  return <SceneBridgeContext.Provider value={bridgeRef}>{children}</SceneBridgeContext.Provider>;
}

function useSceneBridgeRef() {
  const ctx = useContext(SceneBridgeContext);

  // Safe fallback for dev/preview usage.
  const fallbackRef = useRef<SceneBridge | null>(null);
  if (!fallbackRef.current) fallbackRef.current = createSceneBridge();

  return ctx ?? ({ current: fallbackRef.current } as React.MutableRefObject<SceneBridge>);
}

const NODES = [
  { position: [-4, 2, 0] as const, id: "node-0" },
  { position: [-2, 1.5, 3] as const, id: "node-1" },
  { position: [0, 2.5, -2] as const, id: "node-2" },
  { position: [2, 1.8, 2] as const, id: "node-3" },
  { position: [4, 2.2, -1] as const, id: "node-4" },
];

type NodeDef = (typeof NODES)[number];

type RuntimeState = {
  flags: SceneFlags;
  captured: Set<string>;
  onCapture: (nodeId: string) => void;
};

function normalizeFlags(flags: Partial<SceneFlags> | null | undefined): SceneFlags {
  const skyTint = flags?.skyTint ?? "#000000";
  const volatility = flags?.volatility ?? 0;
  const spawnRate = flags?.spawnRate ?? 1;
  return { skyTint, volatility, spawnRate };
}

function LiquidityNode({
  def,
  sphereGeom,
  matFree,
  matCaptured,
  runtimeRef,
  seed,
}: {
  def: NodeDef;
  sphereGeom: THREE.SphereGeometry;
  matFree: THREE.MeshStandardMaterial;
  matCaptured: THREE.MeshStandardMaterial;
  runtimeRef: React.MutableRefObject<RuntimeState>;
  seed: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const hoveredRef = useRef(false);
  const lastCapturedRef = useRef<boolean | null>(null);

  const base = def.position;

  useFrame(({ clock }, dt) => {
    const mesh = meshRef.current;
    const light = lightRef.current;
    if (!mesh || !light) return;

    const { flags, captured } = runtimeRef.current;

    const t = clock.getElapsedTime();
    const spawn = flags.spawnRate;

    // Hover scale without React state.
    const targetScale = hoveredRef.current ? 1.2 : 1;
    const s = mesh.scale.x + (targetScale - mesh.scale.x) * Math.min(1, dt * 10);
    mesh.scale.setScalar(s);

    // Gentle float animation (spawn rate = speed).
    mesh.position.set(
      base[0],
      base[1] + Math.sin(t * (0.9 * spawn) + seed) * 0.35,
      base[2]
    );
    mesh.rotation.y += dt * 0.35 * spawn;

    const isCaptured = captured.has(def.id);
    if (lastCapturedRef.current !== isCaptured) {
      lastCapturedRef.current = isCaptured;
      mesh.material = isCaptured ? matCaptured : matFree;
      light.color.set(isCaptured ? "#00ffff" : "#ff0044");
    }

    // Volatility drives glow intensity.
    light.intensity = 2 * flags.volatility;
  });

  return (
    <group>
      <mesh
        ref={meshRef}
        onClick={() => {
          const { captured, onCapture } = runtimeRef.current;
          if (captured.has(def.id)) return;
          onCapture(def.id);
        }}
        onPointerOver={() => {
          hoveredRef.current = true;
        }}
        onPointerOut={() => {
          hoveredRef.current = false;
        }}
      >
        <primitive object={sphereGeom} attach="geometry" />
        <primitive object={matFree} attach="material" />
        <pointLight ref={lightRef} color="#ff0044" intensity={0} distance={5} />
      </mesh>
    </group>
  );
}

export default function SceneRoot() {
  const bridgeRef = useSceneBridgeRef();

  // Runtime state lives in refs (no React-driven scene churn).
  const runtimeRef = useRef<RuntimeState>({
    flags: normalizeFlags(bridgeRef.current.flags),
    captured: bridgeRef.current.captured,
    onCapture: bridgeRef.current.onCapture,
  });

  const nodes = useMemo(() => NODES, []);

  // Shared geometry/material (memoized + disposed on unmount).
  const sphereGeom = useMemo(() => new THREE.SphereGeometry(0.8, 32, 32), []);
  const matFree = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#ff0044",
        emissive: "#ff0044",
        emissiveIntensity: 1,
        toneMapped: false,
      }),
    []
  );
  const matCaptured = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#00ffff",
        emissive: "#00ffff",
        emissiveIntensity: 1.5,
        toneMapped: false,
      }),
    []
  );

  useEffect(() => {
    return () => {
      sphereGeom.dispose();
      matFree.dispose();
      matCaptured.dispose();
    };
  }, [sphereGeom, matFree, matCaptured]);

  // Scene environment objects (stable instances).
  const bgColor = useMemo(() => new THREE.Color("#000000"), []);
  const fog = useMemo(() => new THREE.Fog("#000000", 5, 30), []);

  const { scene } = useThree();

  useEffect(() => {
    scene.background = bgColor;
    scene.fog = fog;
    return () => {
      // Cleanup: prevent stale references if Canvas ever unmounts.
      if (scene.background === bgColor) scene.background = null;
      if (scene.fog === fog) scene.fog = null;
    };
  }, [scene, bgColor, fog]);

  // Subscribe once: bridge updates mutate refs only.
  useEffect(() => {
    const bridge = bridgeRef.current;

    const sync = () => {
      const b = bridgeRef.current;
      runtimeRef.current.flags = normalizeFlags(b.flags);
      runtimeRef.current.captured = b.captured;
      runtimeRef.current.onCapture = b.onCapture;
    };

    sync();
    return bridge.subscribe(sync);
  }, [bridgeRef]);

  // Apply background/fog tint from runtime state.
  useFrame(() => {
    const tint = runtimeRef.current.flags.skyTint;
    bgColor.set(tint);
    fog.color.set(tint);
  });

  const controlsRef = useRef<any>(null);
  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    controls.autoRotate = runtimeRef.current.captured.size === 0;
    controls.autoRotateSpeed = 0.5;
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#00ffff" />
      <pointLight position={[-10, 5, -10]} intensity={0.3} color="#ff0044" />

      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      <Grid
        args={[40, 40]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#ff0044"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#00ffff"
        fadeDistance={30}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid
      />

      {nodes.map((def, idx) => (
        <LiquidityNode
          key={def.id}
          def={def}
          sphereGeom={sphereGeom}
          matFree={matFree}
          matCaptured={matCaptured}
          runtimeRef={runtimeRef}
          seed={idx * 1.7}
        />
      ))}

      <OrbitControls
        ref={controlsRef}
        enableZoom
        enablePan={false}
        minDistance={5}
        maxDistance={20}
        maxPolarAngle={Math.PI / 2 - 0.1}
      />
    </>
  );
}
