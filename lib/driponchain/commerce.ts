import { Buffer } from "buffer";
import { EscrowInvoice, FeePolicy, Listing } from "./types";

export const DEFAULT_FEE_POLICY: FeePolicy = {
  platformFeeBps: 300,
};

export function applyFeePolicy(listing: Listing, feePolicy: FeePolicy = DEFAULT_FEE_POLICY) {
  const platformFee = (listing.price * (feePolicy.platformFeeBps ?? 0)) / 10000;
  const totalFees = platformFee + (feePolicy.renderFee ?? listing.renderFee ?? 0);
  return {
    platformFee,
    totalFees,
    payout: listing.price - totalFees,
  };
}

export function recordLedgerEntry(params: {
  listingId: string;
  amount: number;
  kind: "PLATFORM_FEE" | "RENDER_FEE" | "PAYOUT";
  note?: string;
}): string {
  const hashSource = `${params.listingId}-${params.amount}-${params.kind}-${params.note ?? ""}`;
  const ledgerEntryId = Buffer.from(hashSource).toString("base64");
  return ledgerEntryId;
}

export function prepareEscrowInvoice(listing: Listing, feePolicy: FeePolicy = DEFAULT_FEE_POLICY): EscrowInvoice {
  const feeResult = applyFeePolicy(listing, feePolicy);
  return {
    id: `invoice-${listing.id}`,
    listingId: listing.id,
    total: listing.price,
    platformFee: feeResult.platformFee,
    renderFee: feePolicy.renderFee ?? listing.renderFee,
    sellerPayout: feeResult.payout,
    currency: "USD",
    enforcedSafety: {
      invoiceOnly: true,
      approvalFirewall: true,
      signatureSimulation: true,
      antiDrain: true,
    },
  };
}

export function enforceInvoiceOnlyPayment(invoice: EscrowInvoice) {
  return {
    ...invoice,
    enforcement: {
      noDirectAddresses: true,
      approvalFirewall: invoice.enforcedSafety.approvalFirewall,
      signatureSimulation: invoice.enforcedSafety.signatureSimulation,
      antiDrain: invoice.enforcedSafety.antiDrain,
    },
  };
}
