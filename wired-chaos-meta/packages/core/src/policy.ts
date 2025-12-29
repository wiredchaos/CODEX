import { Tier, Intent } from "./types";

export function canAccess(tier: Tier, intent: Intent): { ok: boolean; reason?: string } {
  // System law:
  // - FREE users can use core system without subscription
  // - FREE users may still pay network minting fees if they choose to mint
  // - Restricted content / tokengates are not accessible for FREE
  const restricted: Intent[] = [
    "EXECUTE_BASE_ACTION", // example: advanced automation action
    "XRPL_PAYMENT",        // example: could be gated
    "SOL_PROOF"            // example: live event perks
  ];

  if (tier === "FREE" && restricted.includes(intent)) {
    return { ok: false, reason: "Restricted to paid or tokengated tiers." };
  }
  return { ok: true };
}
