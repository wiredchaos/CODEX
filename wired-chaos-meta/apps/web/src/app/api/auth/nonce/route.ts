import crypto from "node:crypto";

export async function GET() {
  const nonce = crypto.randomBytes(16).toString("hex");
  return Response.json({ ok: true, nonce });
}
