export type WCMode = "BUSINESS" | "AKASHIC" | "GAME" | "EDUCATION";

export type UniverseId = string;

export type WcmNode = {
  id: string;
  title: string;
  description: string;
  route: string;
  wc_mode: WCMode;
  universe: UniverseId;
  tags: string[];
  pathways: string[];
  kind: "HUB" | "PORTAL" | "EXPERIENCE" | "SERVICE";
  requiresLabyrinth?: boolean;
  requiresTrinity?: boolean;
  hubRole?: "NEUTRAL" | "ANCHOR" | "SPECIAL";
};

export type PathwayEdge = {
  from: string;
  to: string;
  reason: string;
  wc_mode?: WCMode;
  universe?: UniverseId;
  weight?: number;
};
