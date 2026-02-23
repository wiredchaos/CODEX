import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignalBar } from "@/components/SignalBar";
import { EventsList } from "@/components/EventsList";
import { useRedLedgerData } from "@/hooks/useRedLedgerData";
import {
  Activity,
  Globe,
  Users,
  AlertCircle,
  CheckCircle2,
  Signal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RelayDiagnostics, RelayNotConfiguredBanner } from "@/components/RelayDiagnostics";
import { isRelayConfigured } from "@/core/relay";

export default function Dashboard() {
  const { state, events, factions, isLoading, error, connected } = useRedLedgerData();
  const relayReady = isRelayConfigured();

  return (
    <div className="min-h-screen bg-black text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-red-500 rounded-xl flex items-center justify-center">
                <Signal className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-red-500">RED LEDGER</h1>
                <p className="text-xs text-gray-500">Relay Dashboard</p>
              </div>
            </div>

            <div className="hidden md:block">
              <RelayDiagnostics />
            </div>

            <div className="flex items-center gap-3">
              {relayReady && (
                <div className="flex items-center gap-2">
                  {connected ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-400" />
                  )}
                  <span className="text-sm text-gray-400">
                    {connected ? "Connected" : "Disconnected"}
                  </span>
                </div>
              )}
              <Badge variant="outline" className="border-white/10 bg-black/40 text-white/70 font-mono">
                {relayReady ? (connected ? "SSE" : "POLL") : "DISABLED"}
              </Badge>
            </div>
          </div>

          <div className="mt-3 md:hidden">
            <RelayDiagnostics className="justify-start" />
          </div>

          <div className="mt-3">
            <RelayNotConfiguredBanner />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {!relayReady ? (
          <Card className="max-w-xl mx-auto border-amber-500/20 bg-gray-900/40">
            <CardHeader className="text-center">
              <div className="h-16 w-16 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-amber-200" />
              </div>
              <CardTitle className="text-amber-200">Relay Not Configured</CardTitle>
              <CardDescription className="text-gray-400">
                This build is missing <span className="font-mono">VITE_RELAY_URL</span> and/or <span className="font-mono">VITE_RELAY_APP_ID</span>.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-gray-300">
              No network calls will be attempted.
            </CardContent>
          </Card>
        ) : isLoading ? (
          /* Loading State */
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Activity className="h-12 w-12 text-red-500 animate-pulse mx-auto mb-4" />
              <p className="text-gray-400">Connecting to RedLedger Relay Core...</p>
            </div>
          </div>
        ) : error ? (
          /* Error State */
          <Card className="max-w-md mx-auto border-red-900">
            <CardHeader className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <CardTitle className="text-red-500">Connection Error</CardTitle>
              <CardDescription className="text-gray-400">{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-gray-500">Check the relay domain, routes, and CORS.</div>
            </CardContent>
          </Card>
        ) : (
          /* Dashboard Content */
          <div className="space-y-6">
            {/* World Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Globe className="h-5 w-5" />
                  World State
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-900 rounded-xl">
                  <span className="text-sm text-gray-400">Version</span>
                  <Badge variant="outline" className="font-mono border-white/10 bg-black/40">
                    {state?.worldVersion || "N/A"}
                  </Badge>
                </div>
                <SignalBar label="Global Signal" value={state?.globalSignal || 0} color="cyan" />
              </CardContent>
            </Card>

            {/* Factions */}
            {factions && factions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="h-5 w-5" />
                    Faction Influence
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {factions.map((faction) => (
                    <div key={faction.id} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: faction.color }} />
                        <span className="font-medium text-sm">{faction.name}</span>
                      </div>
                      <SignalBar
                        label={`${faction.name} Influence`}
                        value={faction.influence}
                        color={
                          faction.color === "#ff0044"
                            ? "red"
                            : faction.color === "#00ffff"
                              ? "cyan"
                              : faction.color === "#00ff00"
                                ? "green"
                                : faction.color === "#ffff00"
                                  ? "yellow"
                                  : faction.color === "#8b5cf6"
                                    ? "purple"
                                    : "blue"
                        }
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Events */}
            <div className="grid md:grid-cols-2 gap-6">
              {events?.active && events.active.length > 0 && (
                <EventsList events={events.active} title="Active Events" variant="active" />
              )}
              {events?.upcoming && events.upcoming.length > 0 && (
                <EventsList events={events.upcoming} title="Upcoming Events" variant="upcoming" />
              )}
            </div>

            {/* Connection Status */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {connected ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-gray-400">
                      {connected ? "Live connection established" : "Connection lost"}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-gray-600">{connected ? "SSE" : "Polling"}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}