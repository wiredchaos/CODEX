import { WcmLink } from "../../components/wcm/WcmLink";
import { WcmNavPanel } from "../../components/wcm/WcmNavPanel";

const studentUnionEntries = [
  { href: "/mall", label: "Enter Mall" },
  { href: "/driponchain", label: "Enter dripONchain Thrift Store" },
  { href: "/university", label: "Enter University" },
  { href: "/fen/labyrinth", label: "Enter Akashic Labyrinth (FEN)" },
  { href: "/npc-prompt-command", label: "Open NPC Prompt Command" },
];

export default function StudentUnionPage() {
  return (
    <main>
      <h1>Student Union (Neutral Hub)</h1>
      <p>You are in the Student Union. This neutral hub connects to every pathway.</p>
      <div className="actions" style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        {studentUnionEntries.map((entry) => (
          <WcmLink key={entry.href} toRoute={entry.href} className="btn">
            {entry.label}
          </WcmLink>
        ))}
      </div>
      <section>
        <WcmNavPanel currentRoute="/student-union" />
      </section>
    </main>
  );
}
