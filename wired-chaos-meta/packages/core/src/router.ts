import { Intent, Chain } from "./types";

export function routeIntent(intent: Intent): Chain {
  switch (intent) {
    case "MINT_CREDENTIAL_DOGE":
    case "VERIFY_CREDENTIAL_DOGE":
      return "DOGE";
    case "ETH_NFT_OWNERSHIP_CHECK":
      return "ETH"; // read-only
    case "EXECUTE_BASE_ACTION":
      return "BASE";
    case "XRPL_PAYMENT":
      return "XRP";
    case "LOG_RECEIPT":
      return "HBAR";
    case "SOL_PROOF":
      return "SOL";
    default:
      return "BASE";
  }
}
