import { Canvas } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import { useRedLedgerControl } from '@/hooks/useRedLedgerControl';
import SceneRoot, { SceneBridgeProvider, type SceneBridge, type SceneFlags } from '@/components/SceneRoot';

const NODES = [
  { position: [-4, 2, 0] as const, id: 'node-0' },
  { position: [-2, 1.5, 3] as const, id: 'node-1' },
  { position: [0, 2.5, -2] as const, id: 'node-2' },
  { position: [2, 1.8, 2] as const, id: 'node-3' },
  { position: [4, 2.2, -1] as const, id: 'node-4' },
];

function createBridge(): SceneBridge {
  const listeners = new Set<() => void>();
  return {
    flags: { skyTint: '#000000', volatility: 0, spawnRate: 1 },
    captured: new Set<string>(),
    onCapture: () => {},
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    notify: () => listeners.forEach((l) => l()),
  };
}

const FieldOps = () => {
  const { flags, captureNode, isLoading, error } = useRedLedgerControl();

  // React UI state (kept outside Canvas)
  const [capturedNodes, setCapturedNodes] = useState<Set<string>>(() => new Set());

  // Stable bridge that isolates R3F from frequent provider re-renders.
  const bridgeRef = useRef<SceneBridge | null>(null);
  if (!bridgeRef.current) bridgeRef.current = createBridge();

  // Never allow undefined into the scene.
  const safeFlags: SceneFlags = useMemo(
    () => ({
      skyTint: (flags?.skyTint ?? '#000000') ?? '#000000',
      volatility: (flags?.volatility ?? 0) ?? 0,
      spawnRate: (flags?.spawnRateMultiplier ?? 1) ?? 1,
    }),
    [flags?.skyTint, flags?.volatility, flags?.spawnRateMultiplier]
  );

  const handleCapture = async (nodeId: string) => {
    try {
      await captureNode(nodeId);
      setCapturedNodes((prev) => new Set([...prev, nodeId]));
    } catch (err) {
      console.error('Failed to capture node:', err);
    }
  };

  // Push updates into the bridge via refs (no prop-driven remounting).
  useEffect(() => {
    const bridge = bridgeRef.current!;
    bridge.flags = safeFlags;
    bridge.notify();
  }, [safeFlags]);

  useEffect(() => {
    const bridge = bridgeRef.current!;
    bridge.captured = capturedNodes;
    bridge.onCapture = handleCapture;
    bridge.notify();
  }, [capturedNodes]);

  const signalPercent = Math.round((capturedNodes.size / NODES.length) * 100);

  return (
    <div className="w-full h-screen bg-black overflow-hidden relative">
      {/* Canvas must never be conditionally rendered and must remain mounted */}
      <SceneBridgeProvider bridgeRef={bridgeRef as MutableRefObject<SceneBridge>}>
        <Canvas camera={{ position: [0, 5, 10], fov: 75 }} dpr={[1, 2]} performance={{ min: 0.5 }}>
          <SceneRoot />
        </Canvas>
      </SceneBridgeProvider>

      {/* HUD Overlay (outside Canvas) */}
      <div className="absolute top-4 left-4 pointer-events-none">
        <div className="bg-black/80 border border-cyan-500/50 p-4 rounded-lg backdrop-blur-sm space-y-2">
          <div className="font-mono text-2xl text-cyan-400 font-bold">SIGNAL: {signalPercent}%</div>
          <div className="text-xs text-gray-400">NODES CAPTURED: {capturedNodes.size}/{NODES.length}</div>
          <div className="text-xs text-gray-400">VOLATILITY: {safeFlags.volatility.toFixed(2)}</div>
          <div className="text-xs text-gray-400">SPAWN RATE: {safeFlags.spawnRate.toFixed(2)}x</div>
        </div>
      </div>

      {/* Connection status (outside Canvas) */}
      <div className="absolute top-4 right-4 pointer-events-none text-right space-y-1">
        <h1 className="text-2xl font-bold text-red-500 tracking-widest">RED LEDGER</h1>
        <p className="text-sm text-cyan-400">FIELD ENGINE v1.0</p>
        {error && <div className="text-xs text-red-500 mt-2">API ERROR: {error}</div>}
        {isLoading && <div className="text-xs text-yellow-400">SYNCING...</div>}
      </div>

      {/* Instructions (outside Canvas) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
        <p className="text-gray-400 text-sm font-mono">CLICK NODES TO CAPTURE • DRAG TO ROTATE</p>
      </div>
    </div>
  );
};

export default FieldOps;