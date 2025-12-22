export type LeaseTier = "FREE" | "STANDARD" | "PRO";

export type Stall = {
  id: string;
  label: string;
  capacity: number;
  tier: LeaseTier;
  brandingAllowed: boolean;
  leasedTo?: string;
  leaseExpiresAt?: string;
};

export type StoreLease = {
  id: string;
  userId: string;
  stallId: string;
  tier: LeaseTier;
  status: "PENDING" | "ACTIVE" | "EXPIRED";
  startsAt: string;
  endsAt?: string;
  grantedAt?: string;
  entitlements: string[];
};

export type ListingTemplate = "thrift_basic" | "streetwear" | "archive" | "collector";

export type ListingAsset = {
  id: string;
  sourceUrl: string;
  processedUrl?: string;
  thumbnailUrl?: string;
  alt: string;
  description?: string;
  creatorCodexJobId?: string;
};

export type ListingDraft = {
  id: string;
  stallId: string;
  template: ListingTemplate;
  assets: ListingAsset[];
  title?: string;
  category?: string;
  condition?: string;
  price?: number;
  layawayEnabled: boolean;
  shippingMode?: "SHIP" | "IN_PERSON" | "HYBRID";
  ipStatus: "UNKNOWN" | "VERIFIED" | "IMPLIED" | "NO-IP/RESTRICTED";
  renderFeeApplied?: boolean;
  status: "PENDING_REVIEW" | "READY" | "PUBLISHED";
};

export type Listing = {
  id: string;
  draftId: string;
  stallId: string;
  title: string;
  category: string;
  condition: string;
  price: number;
  layawayEnabled: boolean;
  shippingMode: "SHIP" | "IN_PERSON" | "HYBRID";
  escrowId: string;
  platformFeeBps: number;
  renderFee?: number;
  ledgerEntryId?: string;
};

export type FeePolicy = {
  platformFeeBps: number;
  renderFee?: number;
};

export type LayawayPlan = {
  id: string;
  listingId: string;
  deposit: number;
  installments: number;
  cadenceDays: number;
  graceWindowDays: number;
  cancelWindowDays: number;
  escrowId: string;
  claimNftId?: string;
};

export type EscrowInvoice = {
  id: string;
  listingId: string;
  total: number;
  platformFee: number;
  renderFee?: number;
  sellerPayout: number;
  currency: string;
  enforcedSafety: {
    invoiceOnly: boolean;
    approvalFirewall: boolean;
    signatureSimulation: boolean;
    antiDrain: boolean;
  };
};
