import { Canvas } from "@react-three/fiber";
import { useEffect, useMemo, useSyncExternalStore, useState } from "react";
import SceneRoot from "@/components/SceneRoot";
import { applyRelaySnapshot, RedLedgerStore, type RedLedgerNode } from "@/RedLedgerStore";
import { ConfigPanel } from "@/components/ConfigPanel";
import { useRedLedgerConfig } from "@/hooks/useRedLedgerConfig";
import { Badge } from "@/components/ui/badge";
import { fetchJson } from "@/lib/fetchJson";

const DEFAULT_NODES: RedLedgerNode[] = [
  { id: "node-0", position: [-4, 2, 0], signal: 0.25, volatility: 0.2 },
  { id: "node-1", position: [-2, 1.5, 3], signal: 0.35, volatility: 0.35 },
  { id: "node-2", position: [0, 2.5, -2], signal: 0.55, volatility: 0.3 },
  { id: "node-3", position: [2, 1.8, 2], signal: 0.4, volatility: 0.25 },
  { id: "node-4", position: [4, 2.2, -1], signal: 0.2, volatility: 0.15 },
];

function useRedLedgerSnapshot() {
  return useSyncExternalStore(
    RedLedgerStore.subscribe,
    () => RedLedgerStore.getState(),
    () => RedLedgerStore.getState()
  );
}

export default function FieldOps() {
  const { config, isValid } = useRedLedgerConfig();
  const snap = useRedLedgerSnapshot();
  const [connected, setConnected] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Prefer user-configured relay, but allow env-based configuration for deployments.
  const relayBaseUrl = (config.relayBaseUrl || import.meta.env.VITE_RELAY_URL || "").trim();
  const appId = (config.appId || import.meta.env.VITE_RELAY_APP_ID || "").trim();
  const canSync = (isValid || Boolean(import.meta.env.VITE_RELAY_URL)) && relayBaseUrl !== "" && appId !== "";

  // Seed nodes once (store does not cause React re-renders unless subscribed).
  useEffect(() => {
    const s = RedLedgerStore.getState();
    if (!s.nodes || s.nodes.length === 0) {
      RedLedgerStore.setState({ nodes: DEFAULT_NODES });
    }
  }, []);

  // Relay Sync Layer: SSE => store.setState (no Canvas props)
  useEffect(() => {
    setConnected(false);
    setSyncError(null);

    if (!canSync) return;

    const baseUrl = relayBaseUrl.replace(/\/$/, "");

    let alive = true;
    let es: EventSource | null = null;

    const fetchInitial = async () => {
      try {
        const [state, events, factions] = await Promise.all([
          fetchJson<any>(`${baseUrl}/api/redledger/state?appId=${encodeURIComponent(appId)}`),
          fetchJson<any>(`${baseUrl}/api/redledger/events?appId=${encodeURIComponent(appId)}`),
          fetchJson<any>(`${baseUrl}/api/redledger/factions?appId=${encodeURIComponent(appId)}`),
        ]);

        if (!alive) return;
        applyRelaySnapshot({ state, events, factions });
      } catch (e) {
        if (!alive) return;
        setSyncError(e instanceof Error ? e.message : "Failed to sync");
      }
    };

    fetchInitial();

    try {
      es = new EventSource(`${baseUrl}/api/redledger/stream?appId=${encodeURIComponent(appId)}`);
      es.onopen = () => {
        if (!alive) return;
        setConnected(true);
      };

      es.onmessage = (event) => {
        if (!alive) return;
        try {
          const update = JSON.parse(event.data);
          applyRelaySnapshot(update);
        } catch (e) {
          // Ignore malformed frames; keep scene alive.
          console.error("Failed to parse SSE message", e);
        }
      };

      es.onerror = () => {
        if (!alive) return;
        setConnected(false);
        setSyncError("SSE connection error");
        es?.close();
        es = null;
      };
    } catch (e) {
      setConnected(false);
      setSyncError(e instanceof Error ? e.message : "SSE init failed");
    }

    return () => {
      alive = false;
      es?.close();
    };
  }, [appId, canSync, relayBaseUrl]);

  // Memoize Canvas subtree so React HUD re-renders do not touch the R3F tree.
  const canvasLayer = useMemo(
    () => (
      <Canvas camera={{ position: [0, 5, 10], fov: 75 }} dpr={[1, 2]} performance={{ min: 0.5 }}>
        <SceneRoot />
      </Canvas>
    ),
    []
  );

  const nodesCaptured = (snap.nodes || []).filter((n) => n.captured).length;

  return (
    <div className="w-full h-screen bg-black overflow-hidden relative">
      {/* Canvas must NEVER be conditionally rendered */}
      {canvasLayer}

      {/* HUD Overlay (React-driven, separate subscription, does not affect Canvas tree) */}
      <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-3 pointer-events-none">
        <div className="pointer-events-auto">
          <ConfigPanel />
        </div>

        <div className="flex-1" />

        <div className="pointer-events-none text-right space-y-1">
          <div className="flex items-center justify-end gap-2">
            <Badge
              variant="outline"
              className="border-cyan-500/40 bg-black/40 text-cyan-200 font-mono"
            >
              {connected ? "LIVE" : canSync ? "OFFLINE" : "CONFIG"}
            </Badge>
            {snap.worldVersion ? (
              <Badge variant="outline" className="border-white/10 bg-black/40 text-white/80 font-mono">
                v{snap.worldVersion}
              </Badge>
            ) : null}
          </div>
          {syncError ? <div className="text-xs text-red-300 max-w-sm">API ERROR: {syncError}</div> : null}
        </div>
      </div>

      <div className="absolute top-20 left-4 pointer-events-none">
        <div className="bg-black/80 border border-cyan-500/50 p-4 rounded-2xl backdrop-blur-sm space-y-2">
          <div className="font-mono text-2xl text-cyan-300 font-bold tracking-wide">
            SIGNAL: {Math.round(snap.globalSignal || 0)}
          </div>
          <div className="text-xs text-white/70">NODES CAPTURED: {nodesCaptured}/{(snap.nodes || []).length}</div>
          <div className="text-xs text-white/60">FACTIONS: {(snap.factions || []).length}</div>
          <div className="text-[11px] text-white/50 max-w-xs">
            {canSync ? `Relay: ${relayBaseUrl}` : "Open settings to connect to a relay."}
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
        <p className="text-white/60 text-sm font-mono">CLICK NODES TO CAPTURE • DRAG TO ROTATE</p>
      </div>
    </div>
  );
}