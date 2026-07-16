import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import SpatialShell from "../../components/spatial/SpatialShell"
import { SpatialCard, SpatialSection } from "../../components/spatial/primitives"
import { getSpatialRenderProfile } from "../../components/spatial/spatial-types"

describe("spatial primitives", () => {
  it("renders children without requiring browser APIs", () => {
    const html = renderToStaticMarkup(
      <SpatialShell>
        <h1>Spatial pilot</h1>
        <p>Readable content</p>
      </SpatialShell>,
    )

    expect(html).toContain("Spatial pilot")
    expect(html).toContain("Readable content")
    expect(html).toContain("spatial-shell")
  })

  it("preserves semantic section and card content", () => {
    const html = renderToStaticMarkup(
      <>
        <SpatialSection eyebrow="Scope" title="Landing only">
          <p>No citywide rewrite.</p>
        </SpatialSection>
        <SpatialCard>
          <h2>Fallback</h2>
          <p>Canvas can fail safely.</p>
        </SpatialCard>
      </>,
    )

    expect(html).toContain("<section")
    expect(html).toContain("Landing only")
    expect(html).toContain("Canvas can fail safely")
  })

  it("disables animation profile for reduced motion", () => {
    expect(getSpatialRenderProfile({ reducedMotion: true }).enabled).toBe(false)
    expect(getSpatialRenderProfile({ reducedMotion: true }).frameloop).toBe("never")
  })

  it("uses a conservative no-WebGL low-power fallback profile", () => {
    const profile = getSpatialRenderProfile({ width: 375, hardwareConcurrency: 2, saveData: true })
    expect(profile.lowPower).toBe(true)
    expect(profile.enabled).toBe(false)
    expect(profile.dpr).toEqual([1, 1.5])
  })

  it("keeps the canvas decorative and non-interactive in shell markup", () => {
    const html = renderToStaticMarkup(<SpatialShell><h1>Content remains</h1></SpatialShell>)
    expect(html).toContain("Content remains")
    expect(html).not.toContain("role=\"button\"")
  })
})
