import { createHash } from "node:crypto";

export function dedupeKey(input: { orgId: string; category: string; fingerprint: string }): string {
  return createHash("sha256")
    .update(input.orgId)
    .update("|")
    .update(input.category)
    .update("|")
    .update(input.fingerprint)
    .digest("hex");
}

export function alertFingerprint(input: {
  orgId: string;
  type: string;
  dedupeKey?: string | null;
  stableJson: unknown;
}): string {
  const h = createHash("sha256");
  h.update(input.orgId);
  h.update("|");
  h.update(input.type);
  h.update("|");
  h.update(input.dedupeKey ?? "");
  h.update("|");
  h.update(JSON.stringify(input.stableJson));
  return h.digest("hex");
}

