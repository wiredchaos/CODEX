import SpatialShell from "@/components/spatial/SpatialShell"
import { SpatialCard, SpatialSection } from "@/components/spatial/primitives"

export default function Page() {
  return (
    <SpatialShell>
      <header className="spatial-hero" aria-labelledby="home-heading">
        <p className="spatial-eyebrow">AGENTROPOLIS spatial pilot</p>
        <h1 id="home-heading">Operational clarity first. Cinematic depth only when safe.</h1>
        <p>
          This landing page pilots spatial design primitives as progressive enhancement. The readable DOM, navigation,
          and calls to action remain complete without JavaScript, WebGL, or animation.
        </p>
        <nav className="spatial-actions" aria-label="Primary">
          <a href="/intake">Open intake</a>
          <a href="/world/clear">Review CLEAR world</a>
          <a href="/student-union">Visit student union</a>
        </nav>
      </header>

      <main>
        <SpatialSection eyebrow="Pilot scope" title="Primitives before citywide rollout">
          <p>
            SpatialShell provides the server-compatible content wrapper. The optional canvas is lazy-loaded, decorative,
            non-interactive, and isolated from the route content.
          </p>
        </SpatialSection>

        <section className="spatial-grid" aria-label="Spatial design safeguards">
          <SpatialCard>
            <h2>Fallback-safe</h2>
            <p>No-WebGL, disabled JavaScript, canvas initialization failures, and low-power devices keep the CSS shell.</p>
          </SpatialCard>
          <SpatialCard>
            <h2>Motion-aware</h2>
            <p>Reduced-motion users receive static gradients and depth styling without continuous camera movement.</p>
          </SpatialCard>
          <SpatialCard>
            <h2>Operator-safe</h2>
            <p>Forms, tables, logs, queues, transaction controls, wallet actions, and incident controls stay planar.</p>
          </SpatialCard>
        </section>
      </main>
    </SpatialShell>
  )
}
