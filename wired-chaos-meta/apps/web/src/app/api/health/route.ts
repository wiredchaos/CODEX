export async function GET() {
  return Response.json({ ok: true, name: "wired-chaos-meta", ts: new Date().toISOString() });
}
