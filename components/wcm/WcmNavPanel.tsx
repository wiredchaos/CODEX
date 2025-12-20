"use client";

import { useEffect, useMemo, useState } from "react";
import { WcmNode } from "../../lib/wcm/types";
import { useSearchParams } from "next/navigation";
import { WcmLink } from "./WcmLink";

export function WcmNavPanel({ currentRoute, nodeId }: { currentRoute?: string; nodeId?: string }) {
  const params = useSearchParams();
  const wc_mode = params.get("wc_mode") || undefined;
  const universe = params.get("u") || undefined;
  const [nextNodes, setNextNodes] = useState<WcmNode[]>([]);
  const [relatedNodes, setRelatedNodes] = useState<WcmNode[]>([]);
  const [hubNodes, setHubNodes] = useState<WcmNode[]>([]);

  const payload = useMemo(
    () => ({ currentRoute, nodeId, wc_mode, universe }),
    [currentRoute, nodeId, wc_mode, universe]
  );

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/wcm/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setNextNodes(data.nextNodes ?? []);
      setRelatedNodes(data.relatedNodes ?? []);
      setHubNodes(data.hubNodes ?? []);
    }
    load();
  }, [payload]);

  if (!nextNodes.length && !relatedNodes.length && !hubNodes.length) return null;

  return (
    <div className="wcm-nav-panel">
      {nextNodes.length > 0 && (
        <section>
          <h3>Next</h3>
          <ul>
            {nextNodes.map((node) => (
              <li key={node.id}>
                <WcmLink toRoute={node.route}>{node.title}</WcmLink>
              </li>
            ))}
          </ul>
        </section>
      )}
      {relatedNodes.length > 0 && (
        <section>
          <h3>Related Pathways</h3>
          <ul>
            {relatedNodes.map((node) => (
              <li key={node.id}>
                <WcmLink toRoute={node.route}>{node.title}</WcmLink>
              </li>
            ))}
          </ul>
        </section>
      )}
      {hubNodes.length > 0 && (
        <section>
          <h3>Hubs</h3>
          <ul>
            {hubNodes.map((node) => (
              <li key={node.id}>
                <WcmLink toRoute={node.route}>{node.title}</WcmLink>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
