import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Center, Text, Float } from '@react-three/drei';
import { useState, useRef } from 'react';
import * as THREE from 'three';

interface LiquidityNodeProps {
  position: [number, number, number];
  isCaptured: boolean;
  onCapture: () => void;
  index: number;
}

function LiquidityNode({ position, isCaptured, onCapture }: LiquidityNodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const handleClick = () => {
    if (!isCaptured) {
      onCapture();
    }
  };

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
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
          intensity={2}
          distance={5}
        />
      </mesh>
    </Float>
  );
}

function Scene() {
  const [capturedNodes, setCapturedNodes] = useState<Set<number>>(new Set());
  
  const nodes = [
    { position: [-4, 2, 0] as [number, number, number], id: 0 },
    { position: [-2, 1.5, 3] as [number, number, number], id: 1 },
    { position: [0, 2.5, -2] as [number, number, number], id: 2 },
    { position: [2, 1.8, 2] as [number, number, number], id: 3 },
    { position: [4, 2.2, -1] as [number, number, number], id: 4 },
  ];

  const handleCapture = (nodeId: number) => {
    setCapturedNodes((prev) => new Set([...prev, nodeId]));
  };

  const signalPercent = Math.round((capturedNodes.size / nodes.length) * 100);

  return (
    <>
      {/* Cyberpunk fog */}
      <fog attach="fog" args={['#0a0a0f', 5, 30]} />
      
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#00ffff" />
      <pointLight position={[-10, 5, -10]} intensity={0.3} color="#ff0044" />
      
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
          index={node.id}
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
        <div className="bg-black/80 border border-cyan-500/50 p-4 rounded-lg backdrop-blur-sm">
          <div className="font-mono text-2xl text-cyan-400 font-bold">
            SIGNAL: {signalPercent}%
          </div>
          <div className="text-xs text-gray-400 mt-1">
            NODES CAPTURED: {capturedNodes.size}/{nodes.length}
          </div>
        </div>
      </div>

      {/* Title overlay */}
      <div className="absolute top-4 right-4 pointer-events-none text-right">
        <h1 className="text-2xl font-bold text-red-500 tracking-widest">
          RED LEDGER
        </h1>
        <p className="text-sm text-cyan-400">FIELD ENGINE v1.0</p>
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

const FieldOps = () => {
  return (
    <div className="w-full h-screen bg-black overflow-hidden">
      <Canvas
        camera={{ position: [0, 5, 10], fov: 75 }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
      >
        <color attach="background" args={['#0a0a0f']} />
        <Scene />
      </Canvas>
    </div>
  );
};

export default FieldOps;
