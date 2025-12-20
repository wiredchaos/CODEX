import { WcmLink } from "../../components/wcm/WcmLink";
import { WcmNavPanel } from "../../components/wcm/WcmNavPanel";

export default function StudentUnionPage() {
  return (
    <main>
      <h1>Student Union (Neutral Hub)</h1>
      <p>You are in the Student Union. This neutral hub connects to every pathway.</p>
      <div className="actions" style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <WcmLink toNodeId="mall-entry" intent="NEXT" className="btn">
          Enter Mall
        </WcmLink>
        <WcmLink toNodeId="university-entry" intent="NEXT" className="btn">
          Enter University
        </WcmLink>
        <WcmLink toNodeId="fen-akashic-entry" intent="NEXT" className="btn">
          Enter Akashic Labyrinth (FEN)
        </WcmLink>
        <WcmLink toRoute="/npc-prompt-command" className="btn">
          Open NPC Prompt Command
        </WcmLink>
      </div>
      <section>
        <WcmNavPanel currentRoute="/student-union" />
      </section>
    </main>
  );
}
