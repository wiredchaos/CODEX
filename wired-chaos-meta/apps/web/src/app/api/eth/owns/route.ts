import { ownsErc721 } from "@wcmeta/evm";
import { env } from "@/lib/env";

export async function POST(req: Request) {
  const body = await req.json();
  const { contract, owner } = body ?? {};

  if (!contract || !owner) {
    return Response.json({ ok: false, error: "Missing contract or owner" }, { status: 400 });
  }

  const ok = await ownsErc721({
    chain: "ETH",
    rpcUrl: env.EVM_RPC_ETH,
    contract,
    owner
  });

  return Response.json({ ok: true, owns: ok });
}
