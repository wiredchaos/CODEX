import { WcmNavPanel } from "../../components/wcm/WcmNavPanel";
import { WcmLink } from "../../components/wcm/WcmLink";

export default function DripOnChainPage() {
  return (
    <main>
      <h1>dripONchain Thrift Store</h1>
      <p>Blockchain thrift store inside the Student Union → Mall pathway with protected trade by default.</p>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "1rem" }}>
        <WcmLink toRoute="/chaos-vault/io" className="btn">
          Route listings to Chaos Vault IO
        </WcmLink>
        <WcmLink toRoute="/student-union" className="btn">
          Return to Student Union
        </WcmLink>
        <WcmLink toRoute="/npc-prompt-command" className="btn">
          Open NPC Prompt Command
        </WcmLink>
      </div>

      <section>
        <h2>Stall Leasing</h2>
        <ul>
          <li>Lease tiers (FREE / STANDARD / PRO) unlock listing limits and branding.</li>
          <li>Leases are entitlements tied to stalls; they never represent investment stakes.</li>
          <li>Protected Trade escrow covers all leasing payments and renewals.</li>
        </ul>
      </section>

      <section>
        <h2>Listing Creation Pipeline</h2>
        <ol>
          <li>User uploads images; no raw wallets are exposed.</li>
          <li>Select template: thrift_basic, streetwear, archive, or collector.</li>
          <li>Creator Codex normalizes framing, backgrounds, thumbnails, and alt text.</li>
          <li>Listing Draft emits with UNKNOWN IP status by default and layaway ON.</li>
          <li>Seller confirms title, category, condition, price, layaway, and shipping mode.</li>
        </ol>
      </section>

      <section>
        <h2>Fees, Layaway, and OTC Safety</h2>
        <ul>
          <li>Platform fee + optional render fee recorded in an append-only ledger.</li>
          <li>Layaway uses deposit + installments with grace and cancel windows; buyer receives a Layaway Claim NFT.</li>
          <li>Protected Trade escrow with invoice-only payments, approval firewall, signature simulation, and anti-drain rails.</li>
          <li>OTC private links support QR mutual scans and panic cancel for in-person meetups.</li>
        </ul>
      </section>

      <section>
        <h2>Wallet Separation</h2>
        <ul>
          <li>Akashic Wallet surfaces inventory, claims, and progress.</li>
          <li>Business Wallet manages escrow, payouts, and receipts.</li>
          <li>No direct address pasting; everything is invoice and approval gated.</li>
        </ul>
      </section>

      <WcmNavPanel currentRoute="/driponchain" />
    </main>
  );
}
