import { cookies, headers } from "next/headers";
import { WCMode } from "./types";

type ContextResult = {
  wc_mode?: WCMode;
  universe?: string;
  refToken?: string;
};

export async function readWcmContextFromCookiesOrHeaders(): Promise<ContextResult> {
  const decode = (value?: string | null) => {
    if (!value) return undefined;
    try {
      return decodeURIComponent(value);
    } catch {
      return value || undefined;
    }
  };

  const cookieStore = await cookies();
  const headerStore = await headers();

  const wc_mode =
    (decode(cookieStore.get("wc_mode")?.value) as WCMode | undefined) ||
    (decode(headerStore.get("x-wc-mode")) as WCMode | null) ||
    undefined;

  const universe =
    decode(cookieStore.get("wc_universe")?.value) || decode(headerStore.get("x-wc-universe"));

  const refToken = decode(cookieStore.get("wc_ref")?.value) || decode(headerStore.get("x-wc-ref"));

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
  const parts = [];
  if (wc_mode) parts.push(`wc_mode=${wc_mode}`);
  if (universe) parts.push(`wc_universe=${universe}`);
  if (refToken) parts.push(`wc_ref=${refToken}`);
  return parts.join("; ");
}

export function writeWcmContextCookies(
  context: { wc_mode?: WCMode; universe?: string; refToken?: string },
  options?: { path?: string }
) {
  if (typeof document === "undefined") return;
  const path = options?.path || "/";
  const { wc_mode, universe, refToken } = context;
  if (wc_mode) document.cookie = `wc_mode=${encodeURIComponent(wc_mode)}; path=${path}`;
  if (universe) document.cookie = `wc_universe=${encodeURIComponent(universe)}; path=${path}`;
  if (refToken) document.cookie = `wc_ref=${encodeURIComponent(refToken)}; path=${path}`;
}
