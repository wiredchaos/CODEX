import { z } from "zod";

export const Tier = z.enum(["FREE", "PRO", "TOKEN_GATED"]);
export type Tier = z.infer<typeof Tier>;

export const Chain = z.enum(["DOGE", "BASE", "ETH", "XRP", "HBAR", "SOL"]);
export type Chain = z.infer<typeof Chain>;

export const Intent = z.enum([
  "READ_IDENTITY",
  "MINT_CREDENTIAL_DOGE",
  "VERIFY_CREDENTIAL_DOGE",
  "ETH_NFT_OWNERSHIP_CHECK",
  "EXECUTE_BASE_ACTION",
  "LOG_RECEIPT",
  "XRPL_PAYMENT",
  "SOL_PROOF"
]);
export type Intent = z.infer<typeof Intent>;

export const Receipt = z.object({
  id: z.string(),
  ts: z.string(),
  intent: Intent,
  chain: Chain.optional(),
  actor: z.string().optional(),
  summary: z.string(),
  meta: z.record(z.any()).optional()
});
export type Receipt = z.infer<typeof Receipt>;
