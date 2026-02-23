import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, RotateCcw } from "lucide-react";
import { useRedLedgerConfig } from "@/hooks/useRedLedgerConfig";

export function ConfigPanel() {
  const { config, updateConfig, resetConfig, isOpen, setIsOpen, isValid } = useRedLedgerConfig();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            RedLedger Configuration
          </DialogTitle>
          <DialogDescription>
            Connect to your RedLedger Relay Core instance
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="relayBaseUrl">Relay Base URL</Label>
            <Input
              id="relayBaseUrl"
              placeholder="https://your-relay-domain.com"
              value={config.relayBaseUrl}
              onChange={(e) => updateConfig({ relayBaseUrl: e.target.value })}
              type="url"
            />
            <p className="text-xs text-muted-foreground">
              The base URL of your RedLedger Relay Core instance
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="appId">App ID</Label>
            <Input
              id="appId"
              placeholder="your-app-id"
              value={config.appId}
              onChange={(e) => updateConfig({ appId: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Your application identifier for the relay
            </p>
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetConfig}
              className="flex-1"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button
              onClick={() => setIsOpen(false)}
              className="flex-1"
              disabled={!isValid}
            >
              {isValid ? "Connect" : "Fill all fields"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
