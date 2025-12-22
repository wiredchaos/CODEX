import { ListingAsset, ListingTemplate } from "./types";

type CreatorCodexJob = {
  jobId: string;
  normalizedAssets: ListingAsset[];
  altText: string[];
  description: string;
};

export function submitToCreatorCodex(params: {
  assets: ListingAsset[];
  template: ListingTemplate;
  requestId: string;
}): CreatorCodexJob {
  const normalizedAssets = params.assets.map((asset, index) => ({
    ...asset,
    processedUrl: asset.processedUrl ?? `${asset.sourceUrl}?normalized=true`,
    thumbnailUrl: asset.thumbnailUrl ?? `${asset.sourceUrl}?thumb=true`,
    creatorCodexJobId: params.requestId,
    alt: asset.alt || `dripONchain asset ${index + 1}`,
  }));

  return {
    jobId: params.requestId,
    normalizedAssets,
    altText: normalizedAssets.map((asset) => asset.alt),
    description: `Creator Codex render for template ${params.template}`,
  };
}
