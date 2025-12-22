import { WcmLink } from "../../../components/wcm/WcmLink";
import { WcmNavPanel } from "../../../components/wcm/WcmNavPanel";

export default function ChaosVaultAkashicPage() {
  return (
    <main>
      <h1>Chaos Vault — Akashic</h1>
      <p>Restricted Akashic archive surface. Access requires a valid portal context token and session qualification.</p>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "1rem" }}>
        <WcmLink toRoute="/npc-prompt-command" className="btn">
          Open NPC Prompt Command
        </WcmLink>
        <WcmLink toRoute="/student-union" className="btn">
          Return to Student Union
        </WcmLink>
      </div>
      <WcmNavPanel currentRoute="/chaos-vault/akashic" />
    </main>
  );
}
