import { PortalSide } from "../vault/routing";

export type WCMode = "BUSINESS" | "AKASHIC" | "GAME" | "EDUCATION";

export type UniverseId = string;

export type WcmNode = {
  id: string;
  title: string;
  description: string;
  route: string;
  wc_mode: WCMode;
  universe: UniverseId;
  zone?: string;
  tags: string[];
  pathways: string[];
  kind: "HUB" | "PORTAL" | "EXPERIENCE" | "SERVICE";
  storeKind?: string;
  requiresLabyrinth?: boolean;
  requiresTrinity?: boolean;
  hubRole?: "NEUTRAL" | "ANCHOR" | "SPECIAL";
  vaultSide?: PortalSide;
  requiresPortalContext?: boolean;
};

export type PathwayEdge = {
  from: string;
  to: string;
  reason: string;
  wc_mode?: WCMode;
  universe?: UniverseId;
  weight?: number;
  portalType?: "IO_TO_AKASHIC" | "AKASHIC_TO_IO" | "ANY_TO_RUG";
};
