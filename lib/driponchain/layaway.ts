import { EscrowInvoice, LayawayPlan } from "./types";

export function buildLayawayPlan(params: {
  planId: string;
  listingId: string;
  price: number;
  depositRate: number;
  installments: number;
  cadenceDays: number;
  graceWindowDays: number;
  cancelWindowDays: number;
  escrowId: string;
  claimNftId?: string;
}): LayawayPlan {
  const deposit = Math.max(0, params.price * params.depositRate);
  return {
    id: params.planId,
    listingId: params.listingId,
    deposit,
    installments: params.installments,
    cadenceDays: params.cadenceDays,
    graceWindowDays: params.graceWindowDays,
    cancelWindowDays: params.cancelWindowDays,
    escrowId: params.escrowId,
    claimNftId: params.claimNftId,
  };
}

export function hydrateProtectedTradeInvoice(params: {
  invoiceId: string;
  listingId: string;
  total: number;
  platformFee: number;
  renderFee?: number;
  sellerPayout: number;
  currency: string;
}): EscrowInvoice {
  return {
    id: params.invoiceId,
    listingId: params.listingId,
    total: params.total,
    platformFee: params.platformFee,
    renderFee: params.renderFee,
    sellerPayout: params.sellerPayout,
    currency: params.currency,
    enforcedSafety: {
      invoiceOnly: true,
      approvalFirewall: true,
      signatureSimulation: true,
      antiDrain: true,
    },
  };
}

export function buildOtcChannel(params: { listingId: string; qrCodeUrl: string; privateLink: string }) {
  return {
    listingId: params.listingId,
    qrCodeUrl: params.qrCodeUrl,
    privateLink: params.privateLink,
    mutualScanRequired: true,
    panicCancelAvailable: true,
  };
}
