import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, Zap, Wind, CloudSnow, Info } from "lucide-react";
import { WeatherAlert, AlertSeverity } from "@/hooks/use-alerts";

interface Props {
  alerts: WeatherAlert[];
}

const severityConfig: Record<AlertSeverity, { bg: string; border: string; badge: string; icon: React.FC<any> }> = {
  Extreme: {
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-300 dark:border-red-700",
    badge: "bg-red-600 text-white",
    icon: Zap,
  },
  Severe: {
    bg: "bg-orange-50 dark:bg-orange-950/30",
    border: "border-orange-300 dark:border-orange-700",
    badge: "bg-orange-500 text-white",
    icon: AlertTriangle,
  },
  Moderate: {
    bg: "bg-yellow-50 dark:bg-yellow-950/30",
    border: "border-yellow-300 dark:border-yellow-700",
    badge: "bg-yellow-500 text-white",
    icon: Wind,
  },
  Minor: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800",
    badge: "bg-blue-500 text-white",
    icon: Info,
  },
  Unknown: {
    bg: "bg-muted/40",
    border: "border-border",
    badge: "bg-muted-foreground text-white",
    icon: CloudSnow,
  },
};

function formatExpires(expires: string) {
  if (!expires) return null;
  const d = new Date(expires);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function AlertCard({ alert }: { alert: WeatherAlert }) {
  const [expanded, setExpanded] = useState(false);
  const config = severityConfig[alert.severity] ?? severityConfig.Unknown;
  const Icon = config.icon;
  const expiresStr = formatExpires(alert.expires);

  // Trim description to first 3 sentences for preview
  const sentences = alert.description.split(/(?<=[.!?])\s+/);
  const preview = sentences.slice(0, 3).join(" ");
  const hasMore = sentences.length > 3;

  return (
    <div className={`rounded-2xl border p-4 ${config.bg} ${config.border}`}>
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 rounded-full p-1.5 ${config.badge}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-2 mb-1">
            <span className={`text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${config.badge}`}>
              {alert.severity}
            </span>
            <span className="font-bold text-foreground text-sm leading-tight">{alert.event}</span>
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed">
            {expanded ? alert.description : preview}
          </p>
          {hasMore && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-1 flex items-center gap-1 text-xs font-semibold text-foreground/60 hover:text-foreground transition-colors"
            >
              {expanded ? <><ChevronUp className="w-3 h-3" /> Show less</> : <><ChevronDown className="w-3 h-3" /> Read full alert</>}
            </button>
          )}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
            {alert.areaDesc && <span>📍 {alert.areaDesc.split(";")[0].trim()}</span>}
            {expiresStr && <span>⏱ Expires {expiresStr}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

export function WeatherAlerts({ alerts }: Props) {
  if (alerts.length === 0) return null;

  const hasExtreme = alerts.some((a) => a.severity === "Extreme");
  const hasSevere = alerts.some((a) => a.severity === "Severe");

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className={`w-5 h-5 ${hasExtreme ? "text-red-600" : hasSevere ? "text-orange-500" : "text-yellow-500"}`} />
        <h2 className="font-display font-bold text-foreground text-base">
          {alerts.length === 1 ? "Active Weather Alert" : `${alerts.length} Active Weather Alerts`}
        </h2>
      </div>
      <div className="space-y-3">
        {alerts.map((alert) => (
          <AlertCard key={alert.id} alert={alert} />
        ))}
      </div>
    </section>
  );
}
