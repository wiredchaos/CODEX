import { Canvas } from "@react-three/fiber";
import { useEffect, useMemo, useSyncExternalStore, useState } from "react";
import SceneRoot from "@/components/SceneRoot";
import { applyRelaySnapshot, RedLedgerStore, type RedLedgerNode } from "@/RedLedgerStore";
import { Badge } from "@/components/ui/badge";
import { fetchJson } from "@/lib/fetchJson";
import { getAppId, getRelayBase, isRelayConfigured, relayUrl } from "@/core/relay";
import { RelayDiagnostics, RelayNotConfiguredBanner } from "@/components/RelayDiagnostics";

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
  const snap = useRedLedgerSnapshot();
  const [connected, setConnected] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const relayReady = isRelayConfigured();

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

    if (!relayReady) return;

    let baseUrl = "";
    let appId = "";
    try {
      baseUrl = getRelayBase();
      appId = getAppId();
    } catch (e) {
      setSyncError(e instanceof Error ? e.message : "Relay not configured");
      return;
    }

    let alive = true;
    let es: EventSource | null = null;

    const fetchInitial = async () => {
      try {
        const q = `?appId=${encodeURIComponent(appId)}`;
        const [state, events, factions] = await Promise.all([
          fetchJson<any>(relayUrl(`/api/redledger/state${q}`)),
          fetchJson<any>(relayUrl(`/api/redledger/events${q}`)),
          fetchJson<any>(relayUrl(`/api/redledger/factions${q}`)),
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
      es = new EventSource(relayUrl(`/api/redledger/stream?appId=${encodeURIComponent(appId)}`));
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
  }, [relayReady]);

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

      {/* Runtime diagnostics + status */}
      <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-3 pointer-events-none">
        <div className="pointer-events-none max-w-[520px]">
          <RelayNotConfiguredBanner className="shadow-[0_0_0_1px_rgba(0,0,0,0.4)]" />
        </div>

        <div className="flex-1" />

        <div className="pointer-events-none text-right space-y-2">
          <div className="flex items-center justify-end gap-2">
            <Badge
              variant="outline"
              className={`border-white/10 bg-black/40 font-mono ${
                connected ? "text-emerald-200" : relayReady ? "text-amber-200" : "text-white/60"
              }`}
            >
              {connected ? "LIVE" : relayReady ? "OFFLINE" : "DISABLED"}
            </Badge>
            {snap.worldVersion ? (
              <Badge variant="outline" className="border-white/10 bg-black/40 text-white/80 font-mono">
                v{snap.worldVersion}
              </Badge>
            ) : null}
          </div>

          <RelayDiagnostics />

          {syncError ? <div className="text-xs text-red-300 max-w-sm">API ERROR: {syncError}</div> : null}
        </div>
      </div>

      <div className="absolute top-24 left-4 pointer-events-none">
        <div className="bg-black/80 border border-cyan-500/40 p-4 rounded-2xl backdrop-blur-sm space-y-2">
          <div className="font-mono text-2xl text-cyan-200 font-bold tracking-wide">
            SIGNAL: {Math.round(snap.globalSignal || 0)}
          </div>
          <div className="text-xs text-white/70">NODES CAPTURED: {nodesCaptured}/{(snap.nodes || []).length}</div>
          <div className="text-xs text-white/60">FACTIONS: {(snap.factions || []).length}</div>
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
        <p className="text-white/60 text-sm font-mono">CLICK NODES TO CAPTURE • DRAG TO ROTATE</p>
      </div>
    </div>
  );
}