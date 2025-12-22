import { LeaseTier, Stall, StoreLease } from "./types";

export const LEASE_TIER_BENEFITS: Record<LeaseTier, string[]> = {
  FREE: ["1 listing active", "basic branding"],
  STANDARD: ["5 listings active", "custom stall skin", "priority Creator Codex renders"],
  PRO: ["unlimited listings", "premium branding", "priority support"],
};

export function issueStoreLease(params: {
  leaseId: string;
  userId: string;
  stall: Stall;
  tier: LeaseTier;
  startsAt: string;
  endsAt?: string;
}): StoreLease {
  return {
    id: params.leaseId,
    userId: params.userId,
    stallId: params.stall.id,
    tier: params.tier,
    status: "ACTIVE",
    startsAt: params.startsAt,
    endsAt: params.endsAt,
    grantedAt: new Date().toISOString(),
    entitlements: LEASE_TIER_BENEFITS[params.tier],
  };
}

export function attachLeaseToStall(stall: Stall, lease: StoreLease): Stall {
  return {
    ...stall,
    leasedTo: lease.userId,
    leaseExpiresAt: lease.endsAt,
  };
}

export function validateLeaseTierRequest(tier: LeaseTier, stall: Stall): { ok: boolean; message?: string } {
  if (tier === "PRO" && stall.tier !== "PRO") {
    return { ok: false, message: "Requested tier exceeds stall allowance" };
  }
  if (tier === "STANDARD" && stall.tier === "FREE") {
    return { ok: false, message: "Requested tier exceeds stall allowance" };
  }
  return { ok: true };
}
