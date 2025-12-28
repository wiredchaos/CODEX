import { CredentialPayload } from "./schema";

export function parseCredential(contentUtf8: string): CredentialPayload {
  const obj = JSON.parse(contentUtf8);
  return CredentialPayload.parse(obj);
}
