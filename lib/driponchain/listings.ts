import { submitToCreatorCodex } from "./creatorCodexAdapter";
import { buildLayawayPlan, hydrateProtectedTradeInvoice } from "./layaway";
import { applyFeePolicy, prepareEscrowInvoice, recordLedgerEntry } from "./commerce";
import { assertProtectedTrade } from "./safety";
import { Listing, ListingAsset, ListingDraft, ListingTemplate } from "./types";

export function createListingDraft(params: {
  draftId: string;
  stallId: string;
  template: ListingTemplate;
  assets: ListingAsset[];
  shippingMode?: "SHIP" | "IN_PERSON" | "HYBRID";
}): ListingDraft {
  const codexJob = submitToCreatorCodex({ assets: params.assets, template: params.template, requestId: params.draftId });
  return {
    id: params.draftId,
    stallId: params.stallId,
    template: params.template,
    assets: codexJob.normalizedAssets,
    layawayEnabled: true,
    shippingMode: params.shippingMode ?? "HYBRID",
    ipStatus: "UNKNOWN",
    renderFeeApplied: true,
    status: "PENDING_REVIEW",
  };
}

export function finalizeListingFromDraft(params: {
  listingId: string;
  draft: ListingDraft;
  title: string;
  category: string;
  condition: string;
  price: number;
  renderFee?: number;
}): { listing: Listing; invoiceId: string; layawayId: string; safetyProfile: ReturnType<typeof assertProtectedTrade>["enforced"] } {
  const listing: Listing = {
    id: params.listingId,
    draftId: params.draft.id,
    stallId: params.draft.stallId,
    title: params.title,
    category: params.category,
    condition: params.condition,
    price: params.price,
    layawayEnabled: params.draft.layawayEnabled,
    shippingMode: params.draft.shippingMode ?? "HYBRID",
    escrowId: `escrow-${params.listingId}`,
    platformFeeBps: 300,
    renderFee: params.renderFee,
  };

  const layawayPlan = buildLayawayPlan({
    planId: `layaway-${params.listingId}`,
    listingId: listing.id,
    price: listing.price,
    depositRate: 0.25,
    installments: 3,
    cadenceDays: 14,
    graceWindowDays: 7,
    cancelWindowDays: 5,
    escrowId: listing.escrowId,
    claimNftId: `claim-${params.listingId}`,
  });

  const invoice = prepareEscrowInvoice(listing, { platformFeeBps: listing.platformFeeBps, renderFee: params.renderFee });
  const ledgerId = recordLedgerEntry({ listingId: listing.id, amount: invoice.platformFee, kind: "PLATFORM_FEE" });
  listing.ledgerEntryId = ledgerId;

  const protectedInvoice = hydrateProtectedTradeInvoice({
    invoiceId: invoice.id,
    listingId: listing.id,
    total: invoice.total,
    platformFee: invoice.platformFee,
    renderFee: invoice.renderFee,
    sellerPayout: invoice.sellerPayout,
    currency: invoice.currency,
  });

  const safety = assertProtectedTrade();

  applyFeePolicy(listing, { platformFeeBps: listing.platformFeeBps, renderFee: params.renderFee });

  return { listing, invoiceId: protectedInvoice.id, layawayId: layawayPlan.id, safetyProfile: safety.enforced };
}
