"use client";

import { useEffect, useState } from "react";
import { WcmLink } from "../../components/wcm/WcmLink";
import { WcmNavPanel } from "../../components/wcm/WcmNavPanel";
import { useSearchParams } from "next/navigation";

export default function NpcPromptCommandPage() {
  const params = useSearchParams();
  const [prompt, setPrompt] = useState("");
  const [nextNodes, setNextNodes] = useState<any[]>([]);
  const [relatedNodes, setRelatedNodes] = useState<any[]>([]);
  const wc_mode = params.get("wc_mode") || undefined;
  const universe = params.get("u") || undefined;

  useEffect(() => {
    async function loadRelated() {
      const res = await fetch("/api/wcm/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wc_mode, universe, intent: "RELATED" }),
      });
      const data = await res.json();
      setRelatedNodes(data.relatedNodes ?? []);
    }
    loadRelated();
  }, [universe, wc_mode]);

  async function handleRoute() {
    const res = await fetch("/api/wcm/resolve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wc_mode, universe, intent: "NEXT", prompt, nodeId: "npc-prompt-command" }),
    });
    const data = await res.json();
    setNextNodes(data.nextNodes ?? []);
  }

  return (
    <main>
      <h1>NPC Prompt Command</h1>
      <p>This neutral prompt surface can route anywhere through the multiverse graph.</p>
      <div style={{ display: "flex", gap: "0.5rem", flexDirection: "column", maxWidth: 480 }}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe what you want to open"
          rows={4}
        />
        <button onClick={handleRoute}>Route Me</button>
      </div>
      <section>
        <h2>Suggested Next Nodes</h2>
        <ul>
          {nextNodes.map((node) => (
            <li key={node.id}>
              <WcmLink toRoute={node.route}>{node.title}</WcmLink>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Related Pathways</h2>
        <ul>
          {relatedNodes.map((node) => (
            <li key={node.id}>
              <WcmLink toRoute={node.route}>{node.title}</WcmLink>
            </li>
          ))}
        </ul>
      </section>
      <WcmLink toRoute="/student-union" className="btn">
        Return to Student Union
      </WcmLink>
      <WcmNavPanel currentRoute="/npc-prompt-command" />
    </main>
  );
}
