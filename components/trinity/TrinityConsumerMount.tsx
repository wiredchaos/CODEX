"use client";

import { useEffect, useState } from "react";

export type TrinityConsumerMountProps = {
  patchId: string;
  kind?: string;
};

type RendererComponent = React.ComponentType<{ patchId: string; kind?: string }>;

export function TrinityConsumerMount({ patchId, kind }: TrinityConsumerMountProps) {
  const [Renderer, setRenderer] = useState<RendererComponent | null>(null);

  useEffect(() => {
    let cancelled = false;
    import("./EnvironmentRenderer")
      .then((mod) => {
        if (cancelled) return;
        const available = (mod as any).TRINITY_ENVIRONMENT_AVAILABLE;
        const candidate = (mod as any).EnvironmentRenderer || (mod as any).default || null;
        setRenderer(available === false ? null : candidate);
      })
      .catch(() => {
        if (!cancelled) setRenderer(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (Renderer) {
    return <Renderer patchId={patchId} kind={kind} />;
  }

  return (
    <div className="trinity-fallback">
      <div className="trinity-fallback__media" aria-label="Trinity environment fallback">
        <video controls={false} autoPlay muted loop poster="/trinity-fallback.jpg" style={{ width: "100%", maxHeight: 360 }}>
          <source src="/trinity-fallback.mp4" type="video/mp4" />
          3D environment unavailable.
        </video>
      </div>
      <p>3D environment unavailable. Showing fallback for {patchId}.</p>
    </div>
  );
}
