import { z } from "zod";

const Env = z.object({
  WC_META_JWT_SECRET: z.string().min(16),
  WC_META_DOMAIN: z.string(),

  EVM_RPC_BASE: z.string().url(),
  EVM_RPC_ETH: z.string().url(),

  DOGE_NETWORK: z.enum(["mainnet", "testnet"]).default("mainnet"),
  DOGE_RPC_URL: z.string().optional(),
  DOGE_RPC_USER: z.string().optional(),
  DOGE_RPC_PASS: z.string().optional(),
  DOGE_MINT_WIF: z.string().optional()
});

export const env = Env.parse(process.env);
