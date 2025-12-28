import { parseCredential } from "@wcmeta/doge-inscriptions";

export async function POST(req: Request) {
  const body = await req.json();
  const { contentBase64, contentUtf8 } = body ?? {};

  if (!contentBase64 && !contentUtf8) {
    return Response.json({ ok: false, error: "contentBase64 or contentUtf8 is required" }, { status: 400 });
  }

  const utf8 = contentUtf8 ?? Buffer.from(String(contentBase64), "base64").toString("utf8");
  const credential = parseCredential(utf8);

  return Response.json({ ok: true, credential });
}
