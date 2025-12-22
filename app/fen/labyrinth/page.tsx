"use client";

import { useEffect, useState } from "react";
import { WcmLink } from "../../../components/wcm/WcmLink";
import { WcmNavPanel } from "../../../components/wcm/WcmNavPanel";
import { useSearchParams } from "next/navigation";
import { getLabyrinthEntryNodeId } from "../../../lib/labyrinth/engine";

export default function FenLabyrinthPage() {
  const params = useSearchParams();
  const [prompt, setPrompt] = useState("");
  const [gateMessage, setGateMessage] = useState("Provide a prompt to begin.");
  const [hints, setHints] = useState<string[]>([]);
  const [nextNodes, setNextNodes] = useState<any[]>([]);
  const nodeId = getLabyrinthEntryNodeId() || "fen-akashic-entry";
  const wc_mode = (params.get("wc_mode") as any) || "AKASHIC";
  const universe = params.get("u") || undefined;

  useEffect(() => {
    setNextNodes([]);
  }, [universe, wc_mode]);

  async function handlePromptSubmit() {
    const res = await fetch("/api/labyrinth/step", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nodeId, wc_mode, universe, prompt }),
    });
    const data = await res.json();
    setGateMessage(data.gateMessage || "");
    setHints(data.hints || []);
    setNextNodes(data.nextNodes || []);
  }

  return (
    <main>
      <h1>FEN Akashic Labyrinth</h1>
      <p>Advance by providing intent-rich prompts that satisfy labyrinth gates.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: 560 }}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your intent with detail and pathway keywords"
          rows={5}
        />
        <button onClick={handlePromptSubmit}>Submit Prompt</button>
      </div>
      <p>{gateMessage}</p>
      {hints.length > 0 && (
        <ul>
          {hints.map((hint) => (
            <li key={hint}>{hint}</li>
          ))}
        </ul>
      )}
      <section>
        <h2>Next Nodes</h2>
        <ul>
          {nextNodes.map((node: any) => (
            <li key={node.id}>
              <WcmLink toRoute={node.route}>{node.title}</WcmLink>
            </li>
          ))}
        </ul>
      </section>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <WcmLink toRoute="/student-union" className="btn">
          Return to Student Union
        </WcmLink>
        <WcmLink toRoute="/npc-prompt-command" className="btn">
          Open NPC Prompt Command
        </WcmLink>
      </div>
      <WcmNavPanel currentRoute="/fen/labyrinth" />
    </main>
  );
}
