export type IpStatus = "VERIFIED" | "IMPLIED" | "UNKNOWN" | "NO_IP_RESTRICTED";

export type VaultRoute = "CHAOS_VAULT_IO" | "CHAOS_VAULT_AKASHIC" | "RUG_VAULT";

export type AttachmentReview = {
  rwaAttached: boolean;
  walletProvenanceVerified?: boolean;
  signalOnlyMetadata?: boolean;
};

export type AssetRoutingDecision = {
  route: VaultRoute;
  flagged?: boolean;
  reasons: string[];
};

export type PortalSide = "IO" | "AKASHIC" | "RUG" | "NEUTRAL";

export type PortalContext = {
  contextToken?: string | null;
  sessionQualified?: boolean;
  isAdmin?: boolean;
};

export function classifyChaosVaultRoute(
  ipStatus: IpStatus,
  attachments: AttachmentReview
): AssetRoutingDecision {
  const reasons: string[] = [];
  let route: VaultRoute;
  let flagged = false;

  switch (ipStatus) {
    case "VERIFIED":
      route = "CHAOS_VAULT_IO";
      reasons.push("verified IP");
      break;
    case "IMPLIED":
      route = "CHAOS_VAULT_IO";
      flagged = true;
      reasons.push("implied IP (flagged)");
      break;
    case "UNKNOWN":
      if (attachments.rwaAttached) {
        route = "CHAOS_VAULT_AKASHIC";
        reasons.push("unknown IP with RWA anchor");
      } else {
        route = "RUG_VAULT";
        reasons.push("unknown IP without RWA");
      }
      break;
    case "NO_IP_RESTRICTED":
    default:
      route = "RUG_VAULT";
      reasons.push("no IP or restricted asset");
  }

  if (attachments.walletProvenanceVerified) {
    reasons.push("wallet provenance verified");
  }
  if (attachments.signalOnlyMetadata) {
    reasons.push("signal-only metadata noted (33.3FM echo only)");
  }

  return { route, flagged, reasons };
}

export function evaluatePortalTransition(
  fromSide: PortalSide,
  toSide: PortalSide,
  context: PortalContext = {}
): { allowed: boolean; reason: string } {
  if (toSide === "RUG") {
    const allowed = Boolean(context.isAdmin);
    return {
      allowed,
      reason: allowed ? "admin override to rug vault" : "rug vault is admin only",
    };
  }

  if (fromSide === "AKASHIC" && toSide === "IO") {
    return { allowed: false, reason: "akashic to IO transitions are disallowed" };
  }

  if (fromSide === "IO" && toSide === "AKASHIC") {
    const allowed = Boolean(context.contextToken) && Boolean(context.sessionQualified);
    return {
      allowed,
      reason: allowed
        ? "context token and session qualification satisfied"
        : "IO to Akashic requires context token and session qualification",
    };
  }

  return { allowed: true, reason: "neutral or same-side transition" };
}
