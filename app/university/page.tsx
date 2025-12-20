import { TrinityConsumerMount } from "../../components/trinity/TrinityConsumerMount";
import { WcmLink } from "../../components/wcm/WcmLink";
import { WcmNavPanel } from "../../components/wcm/WcmNavPanel";

export default function UniversityPage() {
  return (
    <main>
      <h1>WCM University</h1>
      <p>Education-oriented neutral experience with Trinity rendering when available.</p>
      <TrinityConsumerMount patchId="UNIVERSITY" kind="lobby" />
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "1rem" }}>
        <WcmLink toNodeId="university-entry" intent="NEXT" className="btn">
          Continue University Pathway
        </WcmLink>
        <WcmLink toRoute="/chaos-vault/io" className="btn">
          Route to Chaos Vault IO
        </WcmLink>
        <WcmLink toRoute="/student-union" className="btn">
          Return to Student Union
        </WcmLink>
        <WcmLink toRoute="/npc-prompt-command" className="btn">
          Open NPC Prompt Command
        </WcmLink>
      </div>
      <WcmNavPanel currentRoute="/university" />
    </main>
  );
}
