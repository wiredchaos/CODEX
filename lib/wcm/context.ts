import { cookies, headers } from "next/headers";
import { WCMode } from "./types";

type ContextResult = {
  wc_mode?: WCMode;
  universe?: string;
  refToken?: string;
};

export async function readWcmContextFromCookiesOrHeaders(): Promise<ContextResult> {
  // Fetch cookies and headers in parallel for better performance
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);

  const wc_mode =
    (cookieStore.get("wc_mode")?.value as WCMode | undefined) ||
    (headerStore.get("x-wc-mode") as WCMode | null) ||
    undefined;

  const universe =
    cookieStore.get("wc_universe")?.value || headerStore.get("x-wc-universe") || undefined;

  const refToken = cookieStore.get("wc_ref")?.value || headerStore.get("x-wc-ref") || undefined;

  return { wc_mode, universe, refToken };
}

export function serializeWcmContext({
  wc_mode,
  universe,
  refToken,
}: {
  wc_mode?: WCMode;
  universe?: string;
  refToken?: string;
}): string {
  const parts: string[] = [];
  if (wc_mode) parts.push(`wc_mode=${wc_mode}`);
  if (universe) parts.push(`wc_universe=${universe}`);
  if (refToken) parts.push(`wc_ref=${refToken}`);
  return parts.join("; ");
}

export function writeWcmContextCookies(
  context: { wc_mode?: WCMode; universe?: string; refToken?: string },
  options?: { path?: string }
): void {
  if (typeof document === "undefined") return;
  
  const path = options?.path || "/";
  const { wc_mode, universe, refToken } = context;
  
  if (wc_mode) document.cookie = `wc_mode=${wc_mode}; path=${path}`;
  if (universe) document.cookie = `wc_universe=${universe}; path=${path}`;
  if (refToken) document.cookie = `wc_ref=${refToken}; path=${path}`;
}
