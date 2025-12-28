import { canAccess, routeIntent, Intent, Tier } from "@wcmeta/core";

export function checkAccess(tier: Tier, intent: Intent) {
  const access = canAccess(tier, intent);
  const chain = routeIntent(intent);
  return { ...access, chain };
}
