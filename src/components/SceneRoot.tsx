import React, { memo, useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Grid, OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import { RedLedgerStore, type RedLedgerNode } from "@/RedLedgerStore";

const FALLBACK_NODES: RedLedgerNode[] = [
  { id: "node-0", position: [-4, 2, 0], signal: 0.25, volatility: 0.2 },
  { id: "node-1", position: [-2, 1.5, 3], signal: 0.35, volatility: 0.35 },
  { id: "node-2", position: [0, 2.5, -2], signal: 0.55, volatility: 0.3 },
  { id: "node-3", position: [2, 1.8, 2], signal: 0.4, volatility: 0.25 },
  { id: "node-4", position: [4, 2.2, -1], signal: 0.2, volatility: 0.15 },
];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function clamp01(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

type NodeVis = { signal: number; volatility: number };

function SceneRootImpl() {
  // Stable scene resources (created once)
  const sphereGeom = useMemo(() => new THREE.SphereGeometry(0.8, 32, 32), []);
  const matBase = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#ff0044",
        emissive: "#ff0044",
        emissiveIntensity: 1.1,
        roughness: 0.25,
        metalness: 0.35,
        toneMapped: false,
      }),
    []
  );

  const bgColor = useMemo(() => new THREE.Color("#070A14"), []);
  const fog = useMemo(() => new THREE.Fog("#070A14", 5, 30), []);

  // Sky tint endpoints (no per-frame allocations)
  const skyA = useMemo(() => new THREE.Color("#070A14"), []);
  const skyB = useMemo(() => new THREE.Color("#001824"), []);

  // Refs for imperative updates (required)
  const signalBarRef = useRef<THREE.Mesh | null>(null);
  const nodeMeshRefs = useRef<Record<string, THREE.Mesh | null>>({});
  const factionColorRefs = useRef<Record<string, THREE.Color>>({});

  // Additional internal refs for stable, per-node resources
  const nodeMaterialRefs = useRef<Record<string, THREE.MeshStandardMaterial>>({});
  const nodeBasePosRefs = useRef<Record<string, THREE.Vector3>>({});
  const nodeVisRefs = useRef<Record<string, NodeVis>>({});

  // Smooth visual values
  const signalVisRef = useRef(0);

  // Nodes are created once; subsequent updates are imperative.
  const initialNodes = useMemo(() => {
    const s = RedLedgerStore.getState();
    const nodes = s.nodes && s.nodes.length > 0 ? s.nodes : FALLBACK_NODES;
    return nodes.slice();
  }, []);

  // Subscribe to store updates (imperative mutations; no mesh recreation)
  useEffect(() => {
    const unsub = RedLedgerStore.subscribe(() => {
      const s = RedLedgerStore.getState();

      // Cache faction colors (stable objects)
      for (const f of s.factions || []) {
        if (!f?.id) continue;
        const c = factionColorRefs.current[f.id] ?? new THREE.Color("#ffffff");
        c.set(f.color ?? "#ffffff");
        factionColorRefs.current[f.id] = c;
      }

      // Update nodes (existence-guarded)
      for (const n of s.nodes || []) {
        const mesh = nodeMeshRefs.current[n.id];
        if (!mesh) continue;

        const mat = nodeMaterialRefs.current[n.id];
        if (!mat) continue;

        // Position base (stored as Vector3, mutated in-place)
        const base = nodeBasePosRefs.current[n.id] ?? new THREE.Vector3();
        const p = n.position ?? [0, 0, 0];
        base.set(p[0], p[1], p[2]);
        nodeBasePosRefs.current[n.id] = base;

        // Material color from faction or captured status
        const isCaptured = Boolean(n.captured);
        const factionColor = n.factionId ? factionColorRefs.current[n.factionId] : null;

        if (factionColor) {
          mat.color.copy(factionColor);
          mat.emissive.copy(factionColor);
        } else {
          const hex = isCaptured ? "#00ffff" : "#ff0044";
          mat.color.set(hex);
          mat.emissive.set(hex);
        }

        mat.emissiveIntensity = isCaptured ? 1.7 : 1.1;
        mat.needsUpdate = false;
      }
    });

    return () => unsub();
  }, []);

  // Dispose stable resources and per-node materials on unmount
  useEffect(() => {
    return () => {
      sphereGeom.dispose();
      matBase.dispose();
      Object.values(nodeMaterialRefs.current).forEach((m) => m.dispose());
    };
  }, [sphereGeom, matBase]);

  useFrame(({ clock, scene }, dt) => {
    const s = RedLedgerStore.getState();

    // Background + fog driven by global signal (imperative)
    const targetSignal01 = clamp01((s.globalSignal ?? 0) / 100);
    bgColor.copy(skyA).lerp(skyB, targetSignal01);
    fog.color.copy(bgColor);
    scene.background = bgColor;
    scene.fog = fog;

    // Smooth signal bar
    signalVisRef.current = lerp(signalVisRef.current, targetSignal01, 1 - Math.pow(0.001, dt));
    const bar = signalBarRef.current;
    if (bar) {
      const w = lerp(0.2, 6.0, signalVisRef.current);
      bar.scale.x = w;
      bar.position.x = -3 + w / 2;

      const m = bar.material as THREE.MeshStandardMaterial | undefined;
      if (m) {
        m.emissiveIntensity = lerp(0.6, 2.0, signalVisRef.current);
      }
    }

    // Nodes: smooth per-node signal/volatility; animate imperatively
    const nodes = (s.nodes && s.nodes.length > 0 ? s.nodes : FALLBACK_NODES) as RedLedgerNode[];
    for (const n of nodes) {
      const mesh = nodeMeshRefs.current[n.id];
      if (!mesh) continue;

      const base = nodeBasePosRefs.current[n.id];
      if (!base) continue;

      const vis = nodeVisRefs.current[n.id] ?? { signal: targetSignal01, volatility: 0 };
      const targetSig = clamp01(typeof n.signal === "number" ? n.signal : targetSignal01);
      const targetVol = clamp01(typeof n.volatility === "number" ? n.volatility : 0);

      vis.signal = lerp(vis.signal, targetSig, 1 - Math.pow(0.002, dt));
      vis.volatility = lerp(vis.volatility, targetVol, 1 - Math.pow(0.002, dt));
      nodeVisRefs.current[n.id] = vis;

      const isCaptured = Boolean(n.captured);

      const t = clock.getElapsedTime();
      const pulse = 0.5 + 0.5 * Math.sin(t * (1.2 + vis.volatility * 3) + n.id.length);

      const scaleTarget = isCaptured
        ? 1.15
        : lerp(0.95, 1.1, vis.signal) * lerp(0.98, 1.08, pulse);

      const sLerp = lerp(mesh.scale.x, scaleTarget, 1 - Math.pow(0.002, dt));
      mesh.scale.setScalar(sLerp);

      mesh.position.set(
        base.x,
        base.y + Math.sin(t * (0.9 + vis.volatility * 2) + pulse) * 0.25,
        base.z
      );
      mesh.rotation.y += dt * (0.25 + vis.volatility * 0.8);

      const mat = nodeMaterialRefs.current[n.id];
      if (!mat) continue;
      mat.emissiveIntensity = isCaptured
        ? 1.7
        : lerp(0.9, 1.6, vis.signal) * lerp(0.9, 1.1, pulse);
    }
  });

  return (
    <>
      {/* Lights */}
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.55} color="#00ffff" />
      <pointLight position={[-10, 5, -10]} intensity={0.35} color="#ff0044" />

      {/* Background stars */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      {/* Neon grid floor */}
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

      {/* 3D signal bar */}
      <group position={[-3, 4.7, -2]}>
        <mesh position={[3, 0, 0]}>
          <boxGeometry args={[6.2, 0.18, 0.18]} />
          <meshStandardMaterial color="#0b1220" emissive="#0b1220" emissiveIntensity={0.3} />
        </mesh>
        <mesh ref={signalBarRef} position={[0, 0, 0]}>
          <boxGeometry args={[1, 0.12, 0.12]} />
          <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={1.2} toneMapped={false} />
        </mesh>
      </group>

      {/* Nodes (created once; updated imperatively) */}
      {initialNodes.map((n) => (
        <mesh
          key={n.id}
          ref={(el) => {
            nodeMeshRefs.current[n.id] = el;
            if (!el) return;

            // Per-node stable material (avoid shared material mutation)
            if (!nodeMaterialRefs.current[n.id]) {
              const m = matBase.clone();
              el.material = m;
              nodeMaterialRefs.current[n.id] = m;
            }

            // Base position (stable Vector3)
            if (!nodeBasePosRefs.current[n.id]) {
              const p = n.position ?? [0, 0, 0];
              nodeBasePosRefs.current[n.id] = new THREE.Vector3(p[0], p[1], p[2]);
            }

            // Seed vis values
            if (!nodeVisRefs.current[n.id]) {
              nodeVisRefs.current[n.id] = {
                signal: clamp01(typeof n.signal === "number" ? n.signal : 0),
                volatility: clamp01(typeof n.volatility === "number" ? n.volatility : 0),
              };
            }
          }}
          position={n.position}
          onClick={() => {
            // Optional interaction hook: capture node in store (does not touch React tree)
            const s = RedLedgerStore.getState();
            const nodes = (s.nodes && s.nodes.length > 0 ? s.nodes : FALLBACK_NODES).map((x) =>
              x.id === n.id ? { ...x, captured: true } : x
            );
            RedLedgerStore.setState({ nodes });
          }}
        >
          <primitive object={sphereGeom} attach="geometry" />
          {/* material is set imperatively in ref callback */}
          <pointLight color="#ff0044" intensity={0.0} distance={5} />
        </mesh>
      ))}

      <OrbitControls
        enableZoom
        enablePan={false}
        minDistance={5}
        maxDistance={20}
        maxPolarAngle={Math.PI / 2 - 0.1}
      />
    </>
  );
}

export default memo(SceneRootImpl);
