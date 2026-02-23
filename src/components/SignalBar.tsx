import { Progress } from "@/components/ui/progress";

interface SignalBarProps {
  label: string;
  value: number;
  color?: string;
  max?: number;
}

export function SignalBar({ label, value, color = "cyan", max = 100 }: SignalBarProps) {
  const percentage = Math.min((value / max) * 100, 100);
  
  const colorClasses = {
    cyan: "bg-cyan-500",
    red: "bg-red-500",
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    purple: "bg-purple-500",
    blue: "bg-blue-500",
  };

  const progressColor = colorClasses[color as keyof typeof colorClasses] || "bg-cyan-500";

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-sm">
        <span className="font-medium text-gray-300">{label}</span>
        <span className="font-mono text-gray-400">{value.toFixed(1)}%</span>
      </div>
      <Progress 
        value={percentage} 
        className="h-2 bg-gray-800"
      />
    </div>
  );
}
