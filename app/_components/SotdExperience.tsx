"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { ArrowUpRight } from "lucide-react"

const mirrorSelector = "[data-3d-mirror]"

type MirrorRect = {
  id: string
  x: number
  y: number
  width: number
  height: number
}

export default function SotdExperience() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const workerRef = useRef<Worker | null>(null)
  const rafRef = useRef<number | null>(null)
  const [offscreenSupported, setOffscreenSupported] = useState(true)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    if (!canvas.transferControlToOffscreen) {
      setOffscreenSupported(false)
      return
    }

    const worker = new Worker(new URL("../_workers/sotd-renderer.ts", import.meta.url), {
      type: "module",
    })
    workerRef.current = worker

    const offscreen = canvas.transferControlToOffscreen()
    const size = { width: window.innerWidth, height: window.innerHeight }
    worker.postMessage(
      {
        type: "init",
        canvas: offscreen,
        size,
        dpr: window.devicePixelRatio ?? 1,
      },
      [offscreen]
    )

    const handleResize = () => {
      worker.postMessage({
        type: "resize",
        size: { width: window.innerWidth, height: window.innerHeight },
        dpr: window.devicePixelRatio ?? 1,
      })
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      worker.terminate()
      workerRef.current = null
    }
  }, [])

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return

    const sendLayout = () => {
      const elements = Array.from(container.querySelectorAll<HTMLElement>(mirrorSelector))
      const rects: MirrorRect[] = elements.map((element, index) => {
        const rect = element.getBoundingClientRect()
        return {
          id: element.dataset.mirrorId ?? `mirror-${index}`,
          x: rect.left,
          y: rect.top,
          width: rect.width,
          height: rect.height,
        }
      })

      workerRef.current?.postMessage({
        type: "layout",
        rects,
        size: { width: window.innerWidth, height: window.innerHeight },
      })
    }

    const resizeObserver = new ResizeObserver(() => {
      if (rafRef.current !== null) return
      rafRef.current = window.requestAnimationFrame(() => {
        sendLayout()
        rafRef.current = null
      })
    })

    const elements = Array.from(container.querySelectorAll<HTMLElement>(mirrorSelector))
    elements.forEach((element) => resizeObserver.observe(element))

    const handleScroll = () => {
      if (rafRef.current !== null) return
      rafRef.current = window.requestAnimationFrame(() => {
        const scrollTop = window.scrollY
        const scrollRange = document.body.scrollHeight - window.innerHeight
        const progress = scrollRange > 0 ? scrollTop / scrollRange : 0
        workerRef.current?.postMessage({ type: "scroll", progress })
        sendLayout()
        rafRef.current = null
      })
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("resize", sendLayout)
    sendLayout()

    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", sendLayout)
      resizeObserver.disconnect()
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current)
      }
    }
  }, [])

  return (
    <div ref={containerRef} className="relative min-h-screen bg-[#0b0b0c] text-white">
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 h-full w-full"
        aria-hidden
      />

      {!offscreenSupported && (
        <div className="fixed inset-x-0 top-20 z-30 mx-auto flex max-w-md items-center justify-center rounded-full border border-white/10 bg-black/70 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/70">
          OffscreenCanvas unavailable — 3D accents paused.
        </div>
      )}

      <header className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 text-xs uppercase tracking-[0.35em] text-white/70">
          <span>Three.js Blocks</span>
          <span>Edition 2025</span>
        </div>
      </header>

      <main className="relative z-10">
        <section className="mx-auto flex min-h-[90vh] max-w-6xl flex-col justify-center gap-8 px-6 py-24">
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-white/60">
            <span className="h-[1px] w-12 bg-white/40" data-3d-mirror data-mirror-id="hero-line" />
            <span>Editorial Systems</span>
          </div>
          <h1
            className="max-w-4xl text-4xl font-light leading-tight tracking-tight text-white sm:text-6xl"
            data-3d-mirror
            data-mirror-id="hero-title"
          >
            A minimal, editorial space where text stays crisp and 3D stays restrained.
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-white/70" data-3d-mirror data-mirror-id="hero-copy">
            WebGPU-first, offscreen-rendered accents synchronize with the DOM to deliver calm, premium motion without
            layout shifts.
          </p>
          <div className="flex flex-wrap items-center gap-6 text-sm uppercase tracking-[0.2em] text-white/60">
            <button className="flex items-center gap-2 border-b border-white/50 pb-1 text-white">
              Enter the build <ArrowUpRight className="h-4 w-4" />
            </button>
            <span>Scroll to calibrate</span>
          </div>
        </section>

        <section className="mx-auto grid min-h-[85vh] max-w-6xl grid-cols-1 gap-12 px-6 py-24 md:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">Craft Notes</p>
            <h2
              className="text-3xl font-light leading-snug text-white sm:text-4xl"
              data-3d-mirror
              data-mirror-id="section-title"
            >
              Blocks orchestrate UI and rendering into a single, predictable rhythm.
            </h2>
            <p className="text-base leading-relaxed text-white/70" data-3d-mirror data-mirror-id="section-copy">
              Each component owns its DOM signature, while the worker thread mirrors that geometry into soft light and
              depth. Scroll transitions remain GPU-friendly and measured.
            </p>
          </div>
          <div className="space-y-6 text-sm text-white/70">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span>WebGPU primary</span>
              <span className="text-white">✓</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span>WebGL fallback</span>
              <span className="text-white">✓</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span>OffscreenCanvas</span>
              <span className="text-white">✓</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span>DOM mirrored to 3D</span>
              <span className="text-white">✓</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span>Zero layout shift</span>
              <span className="text-white">✓</span>
            </div>
          </div>
        </section>

        <section className="mx-auto flex min-h-[75vh] max-w-6xl flex-col justify-center gap-10 px-6 py-24">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.4em] text-white/60">
            <span>Scroll-driven transitions</span>
            <span>03</span>
          </div>
          <div className="grid gap-10 md:grid-cols-3">
            {[
              {
                title: "Hero sync",
                copy: "Typography leads. 3D accents glide beneath, aligned to DOM geometry for clarity.",
              },
              {
                title: "Editorial pacing",
                copy: "Measured motion anchors attention and allows negative space to breathe.",
              },
              {
                title: "Calm resolution",
                copy: "The footer settles into a resolved state with minimal drift.",
              },
            ].map((item) => (
              <div key={item.title} className="space-y-3 border-t border-white/10 pt-6">
                <h3 className="text-base uppercase tracking-[0.3em] text-white" data-3d-mirror data-mirror-id={item.title}>
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-white/70">{item.copy}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/10 bg-black/30">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/60">Resolution</p>
            <p className="mt-3 text-lg font-light text-white">A calm state for the final motion.</p>
          </div>
          <div className="text-xs uppercase tracking-[0.35em] text-white/60">SOTD-ready • 2025</div>
        </div>
      </footer>
    </div>
  )
}
