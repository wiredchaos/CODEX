import { createPublicClient, http, getAddress } from "viem";
import { mainnet, base } from "viem/chains";

// ERC-721 balanceOf(address)
const erc721Abi = [{
  "type": "function",
  "name": "balanceOf",
  "stateMutability": "view",
  "inputs": [{ "name": "owner", "type": "address" }],
  "outputs": [{ "name": "balance", "type": "uint256" }]
}] as const;

export async function ownsErc721(opts: {
  chain: "ETH" | "BASE";
  rpcUrl: string;
  contract: string;
  owner: string;
}): Promise<boolean> {
  const chain = opts.chain === "ETH" ? mainnet : base;
  const client = createPublicClient({ chain, transport: http(opts.rpcUrl) });

  const bal = await client.readContract({
    address: getAddress(opts.contract),
    abi: erc721Abi,
    functionName: "balanceOf",
    args: [getAddress(opts.owner)]
  });

  return bal > 0n;
}
