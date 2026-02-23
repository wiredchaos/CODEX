import { Badge } from "@/components/ui/badge";
import { isRelayConfigured, getAppId, getBuildHash, getRelayBase } from "@/core/relay";

function safe<T>(fn: () => T): T | null {
  try {
    return fn();
  } catch {
    return null;
  }
}

export function RelayDiagnostics({ className = "" }: { className?: string }) {
  const configured = isRelayConfigured();
  const relay = safe(getRelayBase);
  const appId = safe(getAppId);
  const build = safe(getBuildHash);

  return (
    <div className={`flex flex-wrap items-center justify-end gap-2 ${className}`.trim()}>
      <Badge
        variant="outline"
        className={`font-mono border-white/10 bg-black/40 ${
          configured ? "text-emerald-200" : "text-amber-200 border-amber-500/30"
        }`}
      >
        {configured ? "RELAY READY" : "RELAY NOT CONFIGURED"}
      </Badge>
      <Badge variant="outline" className="font-mono border-white/10 bg-black/40 text-white/80">
        RELAY: {relay ?? "(unset)"}
      </Badge>
      <Badge variant="outline" className="font-mono border-white/10 bg-black/40 text-white/80">
        APP: {appId ?? "(unset)"}
      </Badge>
      <Badge variant="outline" className="font-mono border-white/10 bg-black/40 text-white/60">
        BUILD: {build ?? "unknown"}
      </Badge>
    </div>
  );
}

export function RelayNotConfiguredBanner({ className = "" }: { className?: string }) {
  if (isRelayConfigured()) return null;

  return (
    <div
      className={
        `rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-100 ` +
        className
      }
    >
      <div className="font-mono text-sm tracking-wide">RELAY NOT CONFIGURED – BUILD ENV INVALID</div>
      <div className="mt-1 text-xs text-amber-100/80">
        Set <span className="font-mono">VITE_RELAY_URL</span> and <span className="font-mono">VITE_RELAY_APP_ID</span> at build time.
      </div>
    </div>
  );
}