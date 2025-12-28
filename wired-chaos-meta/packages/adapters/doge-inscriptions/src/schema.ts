import { z } from "zod";

// Minimal credential schema for inscriptions (small + verifiable).
export const CredentialType = z.enum(["SCHOOL_ID", "CERTIFICATE", "CREDENTIAL"]);

export const CredentialPayload = z.object({
  v: z.literal(1),
  type: CredentialType,
  subject: z.string(),        // user identifier (wallet address, or DID)
  issuer: z.string(),         // WIRED CHAOS issuer id
  program: z.string(),        // course / track id
  issuedAt: z.string(),       // ISO date
  nonce: z.string(),          // anti-replay
  sig: z.string().optional()  // optional issuer signature (off-chain signing)
});

export type CredentialPayload = z.infer<typeof CredentialPayload>;
