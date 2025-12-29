import { CredentialPayload, CredentialType } from "@wcmeta/doge-inscriptions";
import { newNonce, buildInscriptionContent } from "@wcmeta/doge-inscriptions";
import { canAccess } from "@wcmeta/core";

export async function POST(req: Request) {
  const body = await req.json();
  const { tier = "FREE", type, subject, program, issuer = "WIRED_CHAOS", issuedAt } = body ?? {};

  // FREE users can mint, but they pay the network fee. We simply generate the payload.
  const access = canAccess(tier, "MINT_CREDENTIAL_DOGE");
  if (!access.ok) return Response.json({ ok: false, error: access.reason }, { status: 403 });

  const payload = CredentialPayload.parse({
    v: 1,
    type: CredentialType.parse(type),
    subject: String(subject),
    issuer: String(issuer),
    program: String(program),
    issuedAt: issuedAt ? String(issuedAt) : new Date().toISOString(),
    nonce: newNonce()
  });

  const content = buildInscriptionContent(payload);

  // Production: hand this to your DOGE mint worker (doginals CLI wrapper) to broadcast.
  return Response.json({
    ok: true,
    note: "User pays network mint fee. This endpoint prepares inscription content.",
    payload,
    contentBase64: content.toString("base64"),
    contentUtf8: content.toString("utf8")
  });
}
