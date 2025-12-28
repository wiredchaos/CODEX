import { routeIntent, Intent } from "@wcmeta/core";

export async function POST(req: Request) {
  const body = await req.json();
  const intent = Intent.parse(body?.intent);
  const chain = routeIntent(intent);
  return Response.json({ ok: true, intent, chain });
}
