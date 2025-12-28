import { Receipt } from "@wcmeta/core";

export async function POST(req: Request) {
  const body = await req.json();
  const receipt = Receipt.parse(body);
  // In production, persist receipt to your datastore or Hedera leg.
  return Response.json({ ok: true, receipt });
}
