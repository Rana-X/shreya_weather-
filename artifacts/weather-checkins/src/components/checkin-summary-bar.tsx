import { useGetCheckinSummary } from "@workspace/api-client-react";
import { Users } from "lucide-react";
import { WeatherIcon, getWeatherLabel } from "./weather-icon";

export function CheckinSummaryBar() {
  const { data: summary, isLoading } = useGetCheckinSummary({
    query: {
      refetchInterval: 30000, // Refresh every 30s along with feed
    }
  });

  if (isLoading || !summary) {
    return (
      <div className="bg-secondary/50 rounded-2xl p-4 animate-pulse flex items-center justify-between h-20">
        <div className="h-4 bg-secondary w-1/3 rounded"></div>
        <div className="h-4 bg-secondary w-1/4 rounded"></div>
      </div>
    );
  }

  if (summary.totalToday === 0) {
    return (
      <div className="bg-secondary/30 rounded-2xl p-4 text-center text-muted-foreground text-sm font-medium border border-secondary/50">
        No check-ins yet today. Be the first!
      </div>
    );
  }

  const mostCommonItem = summary.items.find(i => i.weatherType === summary.mostCommon);

  return (
    <div className="bg-gradient-to-br from-primary/10 to-secondary/30 rounded-2xl p-5 border border-primary/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-background flex items-center justify-center shadow-sm">
          {summary.mostCommon ? (
            <WeatherIcon weatherType={summary.mostCommon} className="w-7 h-7" />
          ) : (
            <Users className="w-6 h-6 text-primary" />
          )}
        </div>
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Current Consensus
          </h2>
          <p className="text-xl font-display font-bold text-foreground">
            {summary.mostCommon && mostCommonItem ? (
              <>
                {mostCommonItem.count} {mostCommonItem.count === 1 ? "neighbor says" : "neighbors say"} it's{" "}
                <span className="text-primary">{getWeatherLabel(summary.mostCommon)}</span>
              </>
            ) : (
              "Mixed reports right now"
            )}
          </p>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {summary.items.filter(i => i.count > 0).map((item) => (
          <div key={item.weatherType} className="flex items-center gap-1.5 bg-background/60 px-3 py-1.5 rounded-full text-sm font-medium">
            <WeatherIcon weatherType={item.weatherType} className="w-4 h-4" />
            <span>{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
