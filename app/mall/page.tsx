import { TrinityConsumerMount } from "../../components/trinity/TrinityConsumerMount";
import { WcmLink } from "../../components/wcm/WcmLink";
import { WcmNavPanel } from "../../components/wcm/WcmNavPanel";

export default function MallPage() {
  return (
    <main>
      <h1>WCM Mall</h1>
      <p>Commerce-oriented neutral experience with Trinity rendering when available.</p>
      <TrinityConsumerMount patchId="MALL" kind="lobby" />
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "1rem" }}>
        <WcmLink toNodeId="mall-entry" intent="NEXT" className="btn">
          Continue Mall Pathway
        </WcmLink>
        <WcmLink toRoute="/student-union" className="btn">
          Return to Student Union
        </WcmLink>
        <WcmLink toRoute="/npc-prompt-command" className="btn">
          Open NPC Prompt Command
        </WcmLink>
      </div>
      <WcmNavPanel currentRoute="/mall" />
    </main>
  );
}
