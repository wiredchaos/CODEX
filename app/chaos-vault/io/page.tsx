import { WcmLink } from "../../../components/wcm/WcmLink";
import { WcmNavPanel } from "../../../components/wcm/WcmNavPanel";

export const dynamic = "force-dynamic"

export default function ChaosVaultIoPage() {
  return (
    <main>
      <h1>Chaos Vault — IO</h1>
      <p>Institutional Chaos Vault surface for verified and implied IP artifacts with provenance focus.</p>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "1rem" }}>
        <WcmLink toRoute="/student-union" className="btn">
          Return to Student Union
        </WcmLink>
        <WcmLink toRoute="/npc-prompt-command" className="btn">
          Open NPC Prompt Command
        </WcmLink>
      </div>
      <WcmNavPanel currentRoute="/chaos-vault/io" />
    </main>
  );
}
