export interface RedLedgerState {
  worldVersion: string;
  globalSignal: number;
  timestamp: number;
}

export interface Faction {
  id: string;
  name: string;
  color: string;
  influence: number;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  factionId?: string;
  startTime: number;
  endTime: number;
  type: string;
}

export interface RedLedgerEvents {
  active: Event[];
  upcoming: Event[];
}
