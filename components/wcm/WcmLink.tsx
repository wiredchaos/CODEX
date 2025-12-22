"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { WCMode } from "../../lib/wcm/types";

export type WcmLinkProps = {
  children: React.ReactNode;
  toNodeId?: string;
  toRoute?: string;
  intent?: "NEXT" | "RELATED";
  wc_mode?: WCMode;
  universe?: string;
  className?: string;
};

export function WcmLink({ children, toNodeId, toRoute, intent, wc_mode, universe, className }: WcmLinkProps) {
  const router = useRouter();
  const params = useSearchParams();

  const context = useMemo(() => {
    return {
      wc_mode: wc_mode || (params.get("wc_mode") as WCMode | null) || undefined,
      universe: universe || params.get("u") || undefined,
    };
  }, [params, wc_mode, universe]);

  const handleClick = useCallback(
    async (event: React.MouseEvent) => {
      if (!intent) return;
      event.preventDefault();

      const response = await fetch("/api/wcm/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nodeId: toNodeId,
          currentRoute: toRoute,
          wc_mode: context.wc_mode,
          universe: context.universe,
          intent,
        }),
      });

      const data = await response.json();
      const target = data?.nextNodes?.[0]?.route || data?.relatedNodes?.[0]?.route || toRoute;
      if (target) {
        const query = new URLSearchParams();
        if (context.wc_mode) query.set("wc_mode", context.wc_mode);
        if (context.universe) query.set("u", context.universe);
        const suffix = query.toString();
        router.push(suffix ? `${target}?${suffix}` : target);
      }
    },
    [context, intent, router, toNodeId, toRoute]
  );

  if (intent) {
    return (
      <a href={toRoute || "#"} onClick={handleClick} className={className}>
        {children}
      </a>
    );
  }

  const query = new URLSearchParams();
  if (context.wc_mode) query.set("wc_mode", context.wc_mode);
  if (context.universe) query.set("u", context.universe);
  const suffix = query.toString();

  const href = suffix ? `${toRoute ?? "#"}?${suffix}` : toRoute ?? "#";

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
