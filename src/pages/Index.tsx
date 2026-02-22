import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Float, Stars } from '@react-three/drei';
import { useState, useRef } from 'react';
import * as THREE from 'three';
import { useRedLedgerControl } from '@/hooks/useRedLedgerControl';

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

function Scene() {
  const { flags, captureNode, isLoading, error } = useRedLedgerControl();
  const [capturedNodes, setCapturedNodes] = useState<Set<string>>(new Set());
  
  const nodes = [
    { position: [-4, 2, 0] as [number, number, number], id: 'node-0' },
    { position: [-2, 1.5, 3] as [number, number, number], id: 'node-1' },
    { position: [0, 2.5, -2] as [number, number, number], id: 'node-2' },
    { position: [2, 1.8, 2] as [number, number, number], id: 'node-3' },
    { position: [4, 2.2, -1] as [number, number, number], id: 'node-4' },
  ];

  const handleCapture = async (uniqueId: string) => {
    try {
      await captureNode(uniqueId);
      setCapturedNodes((prev) => new Set([...prev, uniqueId]));
    } catch (err) {
      console.error('Failed to capture node:', err);
    }
  };

  const signalPercent = Math.round((capturedNodes.size / nodes.length) * 100);

  // Convert hex color to RGB for Three.js color
  const skyTint = flags.skyTint || '#0a0a0f';

  return (
    <>
      {/* Dynamic sky color from API */}
      <color attach="background" args={[skyTint]} />
      
      {/* Cyberpunk fog - matches sky tint */}
      <fog attach="fog" args={[skyTint, 5, 30]} />
      
      {/* Ambient lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#00ffff" />
      <pointLight position={[-10, 5, -10]} intensity={0.3} color="#ff0044" />
      
      {/* Particle stars - intensity controlled by volatility */}
      <Stars 
        radius={100} 
        depth={50} 
        count={5000} 
        factor={4} 
        saturation={0} 
        fade 
        speed={1}
      />
      
      {/* Neon infinite grid floor */}
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
      
      {/* Liquidity Nodes */}
      {nodes.map((node) => (
        <LiquidityNode
          key={node.id}
          position={node.position}
          isCaptured={capturedNodes.has(node.id)}
          onCapture={() => handleCapture(node.id)}
          volatility={flags.volatility}
          spawnRateMultiplier={flags.spawnRateMultiplier}
          uniqueId={node.id}
        />
      ))}

      {/* Orbit controls for camera */}
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minDistance={5}
        maxDistance={20}
        maxPolarAngle={Math.PI / 2 - 0.1}
        autoRotate={!capturedNodes.size}
        autoRotateSpeed={0.5}
      />

      {/* HUD Overlay */}
      <div className="absolute top-4 left-4 pointer-events-none">
        <div className="bg-black/80 border border-cyan-500/50 p-4 rounded-lg backdrop-blur-sm space-y-2">
          <div className="font-mono text-2xl text-cyan-400 font-bold">
            SIGNAL: {signalPercent}%
          </div>
          <div className="text-xs text-gray-400">
            NODES CAPTURED: {capturedNodes.size}/{nodes.length}
          </div>
          <div className="text-xs text-gray-400">
            VOLATILITY: {flags.volatility.toFixed(2)}
          </div>
          <div className="text-xs text-gray-400">
            SPAWN RATE: {flags.spawnRateMultiplier.toFixed(2)}x
          </div>
        </div>
      </div>

      {/* Connection status */}
      <div className="absolute top-4 right-4 pointer-events-none text-right space-y-1">
        <h1 className="text-2xl font-bold text-red-500 tracking-widest">
          RED LEDGER
        </h1>
        <p className="text-sm text-cyan-400">FIELD ENGINE v1.0</p>
        {error && (
          <div className="text-xs text-red-500 mt-2">
            API ERROR: {error}
          </div>
        )}
        {isLoading && (
          <div className="text-xs text-yellow-400">
            SYNCING...
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
        <p className="text-gray-400 text-sm font-mono">
          CLICK NODES TO CAPTURE • DRAG TO ROTATE
        </p>
      </div>
    </>
  );
}

const Index = () => {
  return (
    <div className="w-full h-screen bg-black overflow-hidden">
      <Canvas
        camera={{ position: [0, 5, 10], fov: 75 }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
      >
        <Scene />
      </Canvas>
    </div>
  );
};

export default Index;
