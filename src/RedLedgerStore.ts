import type { Faction, RedLedgerEvents, RedLedgerState } from "@/types/redledger";

export type Vec3 = [number, number, number];

export type RedLedgerNode = {
  id: string;
  position: Vec3;
  factionId?: string;
  captured?: boolean;
  signal?: number; // 0..1
  volatility?: number; // 0..1
};

export type RedLedgerTopology = {
  // Kept intentionally loose — depends on relay implementation.
  [key: string]: unknown;
} | null;

export type RedLedgerStoreState = {
  worldVersion: string;
  globalSignal: number; // 0..100 (as used by dashboard)
  topology: RedLedgerTopology;
  factions: Faction[];
  nodes: RedLedgerNode[];
  events: RedLedgerEvents | null;
};

type Listener = () => void;

type Store = {
  getState: () => Readonly<RedLedgerStoreState>;
  setState: (partial: Partial<RedLedgerStoreState>) => void;
  subscribe: (listener: Listener) => () => void;
};

const initialState: RedLedgerStoreState = {
  worldVersion: "",
  globalSignal: 0,
  topology: null,
  factions: [],
  nodes: [],
  events: null,
};

function clamp01(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

function normalizeIncoming(partial: Partial<RedLedgerStoreState>): Partial<RedLedgerStoreState> {
  const next: Partial<RedLedgerStoreState> = { ...partial };

  if (typeof next.worldVersion !== "undefined" && next.worldVersion == null) {
    next.worldVersion = "";
  }

  if (typeof next.globalSignal !== "undefined") {
    const gs = Number(next.globalSignal);
    next.globalSignal = Number.isFinite(gs) ? gs : 0;
  }

  if (typeof next.nodes !== "undefined" && Array.isArray(next.nodes)) {
    next.nodes = next.nodes.map((n) => ({
      ...n,
      position: n.position ?? [0, 0, 0],
      signal: typeof n.signal === "number" ? clamp01(n.signal) : n.signal,
      volatility: typeof n.volatility === "number" ? clamp01(n.volatility) : n.volatility,
      captured: Boolean(n.captured),
    }));
  }

  return next;
}

const listeners = new Set<Listener>();
let state: RedLedgerStoreState = initialState;

export const RedLedgerStore: Store = {
  getState: () => state,
  setState: (partial) => {
    const nextPartial = normalizeIncoming(partial);
    state = { ...state, ...nextPartial };
    // IMPORTANT: does NOT trigger React re-renders automatically. Only subscribers get notified.
    listeners.forEach((l) => l());
  },
  subscribe: (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

// Convenience adapters for common relay payload shapes
export function applyRelaySnapshot(snapshot: {
  state?: RedLedgerState;
  events?: RedLedgerEvents;
  factions?: Faction[];
  topology?: RedLedgerTopology;
  nodes?: RedLedgerNode[];
}) {
  const next: Partial<RedLedgerStoreState> = {};

  if (snapshot.state) {
    next.worldVersion = snapshot.state.worldVersion ?? "";
    next.globalSignal = snapshot.state.globalSignal ?? 0;
  }

  if (snapshot.events) next.events = snapshot.events;
  if (snapshot.factions) next.factions = snapshot.factions;
  if (typeof snapshot.topology !== "undefined") next.topology = snapshot.topology;
  if (snapshot.nodes) next.nodes = snapshot.nodes;

  RedLedgerStore.setState(next);
}
