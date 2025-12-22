"use client";

import { useEffect, useMemo, useState } from "react";
import { WCMode } from "./types";
import { writeWcmContextCookies } from "./context";

export function useWcmContext(initial?: { wc_mode?: WCMode; universe?: string }) {
  const [wcMode, setWcMode] = useState<WCMode | undefined>(initial?.wc_mode);
  const [universe, setUniverse] = useState<string | undefined>(initial?.universe);

  useEffect(() => {
    writeWcmContextCookies({ wc_mode: wcMode, universe });
  }, [wcMode, universe]);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (wcMode) params.set("wc_mode", wcMode);
    if (universe) params.set("u", universe);
    return params.toString();
  }, [wcMode, universe]);

  return {
    wcMode,
    universe,
    setWcMode,
    setUniverse,
    queryString: query ? `?${query}` : "",
  };
}
