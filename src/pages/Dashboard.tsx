import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfigPanel } from "@/components/ConfigPanel";
import { SignalBar } from "@/components/SignalBar";
import { EventsList } from "@/components/EventsList";
import { useRedLedgerData } from "@/hooks/useRedLedgerData";
import { useRedLedgerConfig } from "@/hooks/useRedLedgerConfig";
import { 
  Activity, 
  Globe, 
  Users, 
  AlertCircle, 
  CheckCircle2,
  Signal
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { config, isValid } = useRedLedgerConfig();
  const { state, events, factions, isLoading, error, connected } = useRedLedgerData(
    isValid ? config : null
  );

  return (
    <div className="min-h-screen bg-black text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-red-500 rounded-lg flex items-center justify-center">
                <Signal className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-red-500">RED LEDGER</h1>
                <p className="text-xs text-gray-500">Relay Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {isValid && (
                <div className="flex items-center gap-2">
                  {connected ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm text-gray-400">
                    {connected ? "Connected" : "Disconnected"}
                  </span>
                </div>
              )}
              <ConfigPanel />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {!isValid ? (
          /* Setup Prompt */
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="h-16 w-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-gray-600" />
              </div>
              <CardTitle>Configure Your Connection</CardTitle>
              <CardDescription>
                Enter your RedLedger Relay Core details to start monitoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <button
                onClick={() => {
                  const panel = document.querySelector('[data-radix-dialog-trigger]') as HTMLElement;
                  panel?.click();
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Open Configuration
              </button>
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
              <CardDescription className="text-gray-400">
                {error}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Retry Connection
              </button>
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
                <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                  <span className="text-sm text-gray-400">Version</span>
                  <Badge variant="outline" className="font-mono">
                    {state?.worldVersion || "N/A"}
                  </Badge>
                </div>
                <SignalBar 
                  label="Global Signal" 
                  value={state?.globalSignal || 0}
                  color="cyan"
                />
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
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: faction.color }}
                        />
                        <span className="font-medium text-sm">{faction.name}</span>
                      </div>
                      <SignalBar 
                        label={`${faction.name} Influence`}
                        value={faction.influence}
                        color={
                          faction.color === "#ff0044" ? "red" :
                          faction.color === "#00ffff" ? "cyan" :
                          faction.color === "#00ff00" ? "green" :
                          faction.color === "#ffff00" ? "yellow" :
                          faction.color === "#8b5cf6" ? "purple" :
                          "blue"
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
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-gray-400">
                      {connected ? "Live connection established" : "Connection lost"}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-gray-600">
                    {connected ? "SSE" : "Polling"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
