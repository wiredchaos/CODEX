import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Activity } from "lucide-react";
import { Event } from "@/types/redledger";

interface EventsListProps {
  events: Event[];
  title: string;
  variant?: "active" | "upcoming";
}

function getCountdown(endTime: number): string {
  const now = Date.now();
  const remaining = endTime - now;

  if (remaining <= 0) {
    return "Ended";
  }

  const seconds = Math.floor(remaining / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

export function EventsList({ events, title, variant = "active" }: EventsListProps) {
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-sm">No {variant === "active" ? "active" : "upcoming"} events</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5" />
          {title}
          <Badge variant={variant === "active" ? "default" : "secondary"}>
            {events.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {events.map((event) => (
          <div
            key={event.id}
            className="p-3 bg-gray-900/50 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors"
          >
            <div className="flex justify-between items-start gap-2">
              <div className="flex-1">
                <h4 className="font-medium text-sm text-gray-200">{event.title}</h4>
                <p className="text-xs text-gray-500 mt-1">{event.description}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    variant === "active" ? "border-cyan-500 text-cyan-400" : ""
                  }`}
                >
                  {event.type}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>{getCountdown(event.endTime)}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
