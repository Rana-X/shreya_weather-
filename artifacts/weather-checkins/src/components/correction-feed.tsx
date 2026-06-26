import { useListCorrections, useGetCorrectionSummary } from "@workspace/api-client-react";
import { CorrectionCard } from "./correction-card";
import { Loader2, CloudRain, AlertTriangle } from "lucide-react";
import { useWeather } from "@/hooks/use-weather";
import { getWeatherLabel } from "./weather-icon";

export function CorrectionFeed() {
  const { type: officialType, loading: weatherLoading } = useWeather();
  const { data: corrections, isLoading: correctionsLoading, isError } = useListCorrections(
    { limit: 50 },
    { query: { refetchInterval: 30000 } }
  );
  const { data: summary } = useGetCorrectionSummary({ query: { refetchInterval: 30000 } });

  const isLoading = weatherLoading || correctionsLoading;

  if (isLoading) {
    return (
      <div className="space-y-4 py-8 flex flex-col items-center justify-center text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p>Loading neighborhood reports...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-destructive/10 text-destructive p-6 rounded-2xl text-center border border-destructive/20">
        <p className="font-semibold">Couldn't load corrections.</p>
        <p className="text-sm mt-1">Please check your connection and try again.</p>
      </div>
    );
  }

  const hasActiveDisagreements = summary && summary.activeDisagreements > 0;
  const showBanner = hasActiveDisagreements && summary.mostReportedActual && summary.mostReportedActual !== officialType;

  return (
    <div className="space-y-6">
      {showBanner && (
        <div className="bg-warning/20 border-2 border-warning text-warning-foreground p-5 rounded-2xl flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2 shadow-sm">
          <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-0.5 text-warning" />
          <div>
            <h3 className="font-bold text-lg leading-tight mb-1">
              Warning: Forecast might be wrong!
            </h3>
            <p className="text-sm font-medium">
              {summary.activeDisagreements} neighbor{summary.activeDisagreements === 1 ? '' : 's'} say it's actually <strong>{getWeatherLabel(summary.mostReportedActual!)}</strong> — not {getWeatherLabel(officialType!)}.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-bold text-foreground">Neighborhood Reports</h2>
        <span className="text-xs font-bold text-muted-foreground bg-muted px-3 py-1 rounded-full uppercase tracking-wider">Live Feed</span>
      </div>

      {!corrections || corrections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-card rounded-3xl border border-dashed border-border shadow-sm">
          <CloudRain className="w-16 h-16 text-muted-foreground/50 mb-6" />
          <h3 className="text-2xl font-display font-bold text-foreground mb-2">No corrections yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6 leading-relaxed">
            If the forecast is wrong, be the first to let your neighbors know.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {corrections.map((correction) => (
            <CorrectionCard key={correction.id} correction={correction} />
          ))}
        </div>
      )}
    </div>
  );
}
