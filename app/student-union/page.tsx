import { WcmLink } from "../../components/wcm/WcmLink";
import { WcmNavPanel } from "../../components/wcm/WcmNavPanel";

export default function StudentUnionPage() {
  return (
    <main>
      <h1>Student Union (Neutral Hub)</h1>
      <p>You are in the Student Union. This neutral hub connects to every pathway.</p>
      <div className="actions" style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <WcmLink toRoute="/mall" className="btn">
          Enter Mall
        </WcmLink>
        <WcmLink toRoute="/driponchain" className="btn">
          Enter dripONchain Thrift Store
        </WcmLink>
        <WcmLink toRoute="/university" className="btn">
          Enter University
        </WcmLink>
        <WcmLink toRoute="/fen/labyrinth" className="btn">
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
