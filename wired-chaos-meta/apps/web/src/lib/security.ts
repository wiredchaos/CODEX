import crypto from "node:crypto";

export function signMessage(secret: string, message: string): string {
  return crypto.createHmac("sha256", secret).update(message).digest("hex");
}
