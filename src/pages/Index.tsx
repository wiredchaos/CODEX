import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Float, Stars } from '@react-three/drei';
import { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useRedLedgerControl } from '@/hooks/useRedLedgerControl';
import { RelayDiagnostics, RelayNotConfiguredBanner } from '@/components/RelayDiagnostics';

interface LiquidityNodeProps {
  position: [number, number, number];
  isCaptured: boolean;
  onCapture: () => void;
  volatility: number;
  spawnRateMultiplier: number;
  uniqueId: string;
}

function LiquidityNode({ 
  position, 
  isCaptured, 
  onCapture,
  volatility,
  spawnRateMultiplier,
  uniqueId 
}: LiquidityNodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const handleClick = () => {
    if (!isCaptured) {
      onCapture();
    }
  };

  const floatSpeed = 2 * spawnRateMultiplier;
  const particleIntensity = 2 * volatility;

  return (
    <Float 
      speed={floatSpeed} 
      rotationIntensity={0.5} 
      floatIntensity={1}
    >
      <mesh
        ref={meshRef}
        position={position}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.2 : 1}
      >
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial
          color={isCaptured ? '#00ffff' : '#ff0044'}
          emissive={isCaptured ? '#00ffff' : '#ff0044'}
          emissiveIntensity={isCaptured ? 1.5 : 1}
          toneMapped={false}
        />
        <pointLight
          color={isCaptured ? '#00ffff' : '#ff0044'}
          intensity={particleIntensity}
          distance={5}
        />
      </mesh>
    </Float>
  );
}

interface SceneProps {
  skyTint: string;
  volatility: number;
  spawnRateMultiplier: number;
  capturedNodes: Set<string>;
  onCapture: (nodeId: string) => void;
}

function Scene({ skyTint, volatility, spawnRateMultiplier, capturedNodes, onCapture }: SceneProps) {
  const nodes = [
    { position: [-4, 2, 0] as [number, number, number], id: 'node-0' },
    { position: [-2, 1.5, 3] as [number, number, number], id: 'node-1' },
    { position: [0, 2.5, -2] as [number, number, number], id: 'node-2' },
    { position: [2, 1.8, 2] as [number, number, number], id: 'node-3' },
    { position: [4, 2.2, -1] as [number, number, number], id: 'node-4' },
  ];

  return (
    <>
      <color attach="background" args={[skyTint]} />
      <fog attach="fog" args={[skyTint, 5, 30]} />

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

      {nodes.map((node) => (
        <LiquidityNode
          key={node.id}
          position={node.position}
          isCaptured={capturedNodes.has(node.id)}
          onCapture={() => onCapture(node.id)}
          volatility={volatility}
          spawnRateMultiplier={spawnRateMultiplier}
          uniqueId={node.id}
        />
      ))}

      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minDistance={5}
        maxDistance={20}
        maxPolarAngle={Math.PI / 2 - 0.1}
        autoRotate={!capturedNodes.size}
        autoRotateSpeed={0.5}
      />
    </>
  );
}

const Index = () => {
  // Always call the hook (Rules of Hooks). The hook itself hard-disables when relay env is missing.
  const { flags, captureNode, isLoading, error } = useRedLedgerControl();

  const [capturedNodes, setCapturedNodes] = useState<Set<string>>(new Set());
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setIsInitialized(true);
    }
  }, [isLoading]);

  const nodes = [
    { position: [-4, 2, 0] as [number, number, number], id: 'node-0' },
    { position: [-2, 1.5, 3] as [number, number, number], id: 'node-1' },
    { position: [0, 2.5, -2] as [number, number, number], id: 'node-2' },
    { position: [2, 1.8, 2] as [number, number, number], id: 'node-3' },
    { position: [4, 2.2, -1] as [number, number, number], id: 'node-4' },
  ];

  const handleCapture = async (nodeId: string) => {
    try {
      await captureNode(nodeId);
      setCapturedNodes((prev) => new Set([...prev, nodeId]));
    } catch (err) {
      console.error('Failed to capture node:', err);
    }
  };

  const signalPercent = Math.round((capturedNodes.size / nodes.length) * 100);

  const safeFlags = {
    skyTint: flags?.skyTint || '#0a0a0f',
    volatility: flags?.volatility ?? 1,
    spawnRateMultiplier: flags?.spawnRateMultiplier ?? 1,
  };

  return (
    <div className="w-full h-screen bg-black overflow-hidden relative">
      {isInitialized && (
        <Canvas camera={{ position: [0, 5, 10], fov: 75 }} dpr={[1, 2]} performance={{ min: 0.5 }}>
          <Scene
            skyTint={safeFlags.skyTint}
            volatility={safeFlags.volatility}
            spawnRateMultiplier={safeFlags.spawnRateMultiplier}
            capturedNodes={capturedNodes}
            onCapture={handleCapture}
          />
        </Canvas>
      )}

      <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-3 pointer-events-none">
        <div className="pointer-events-none max-w-[520px]">
          <RelayNotConfiguredBanner className="shadow-[0_0_0_1px_rgba(0,0,0,0.4)]" />
        </div>
        <div className="flex-1" />
        <div className="pointer-events-none text-right space-y-2">
          <RelayDiagnostics />
          {error && <div className="text-xs text-red-300">API ERROR: {error}</div>}
          {isLoading && <div className="text-xs text-amber-200">SYNCING...</div>}
        </div>
      </div>

      <div className="absolute top-20 left-4 pointer-events-none">
        <div className="bg-black/80 border border-cyan-500/50 p-4 rounded-lg backdrop-blur-sm space-y-2">
          <div className="font-mono text-2xl text-cyan-400 font-bold">
            SIGNAL: {signalPercent}%
          </div>
          <div className="text-xs text-gray-400">NODES CAPTURED: {capturedNodes.size}/{nodes.length}</div>
          <div className="text-xs text-gray-400">VOLATILITY: {safeFlags.volatility.toFixed(2)}</div>
          <div className="text-xs text-gray-400">SPAWN RATE: {safeFlags.spawnRateMultiplier.toFixed(2)}x</div>
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
        <p className="text-gray-400 text-sm font-mono">CLICK NODES TO CAPTURE • DRAG TO ROTATE</p>
      </div>
    </div>
  );
};

export default Index;