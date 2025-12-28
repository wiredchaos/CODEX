import crypto from "node:crypto";
import { CredentialPayload } from "./schema";

/**
 * Production note:
 * Dogecoin inscription minting generally requires building/signing a Dogecoin tx
 * that carries the inscription content and broadcasting via Dogecoin RPC.
 *
 * Here we produce the content bytes and return an object that a "doginals" CLI
 * wrapper can use to construct and broadcast the transaction.
 *
 * This keeps the adapter chain-agnostic and lets you swap mint engines.
 */
export function buildInscriptionContent(payload: CredentialPayload): Buffer {
  const json = JSON.stringify(payload);
  // keep payload lean; inscriptions are permanent
  return Buffer.from(json, "utf8");
}

export function newNonce(): string {
  return crypto.randomBytes(16).toString("hex");
}
