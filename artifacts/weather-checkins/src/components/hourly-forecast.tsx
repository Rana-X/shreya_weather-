import { useRef } from "react";
import { HourlyForecast } from "@/hooks/use-weather";
import { WeatherIcon } from "./weather-icon";

interface Props {
  hours: HourlyForecast[];
}

export function HourlyForecastStrip({ hours }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!hours.length) return null;

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <div className="px-5 pt-4 pb-2">
        <h3 className="font-display font-bold text-foreground text-base">Hourly Forecast</h3>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-0 overflow-x-auto pb-4 px-3 scrollbar-none"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {hours.map((hour, i) => (
          <div key={i} className="flex flex-col items-center flex-shrink-0">
            {/* Day boundary label */}
            {hour.isMidnight && !hour.isNow && (
              <div className="w-full text-center mb-1 px-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-muted/60 rounded-full px-2 py-0.5">
                  {new Date(hour.time).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
                </span>
              </div>
            )}

            <div
              className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-2xl mx-0.5 min-w-[62px] transition-colors ${
                hour.isNow
                  ? "bg-primary/10 dark:bg-primary/15"
                  : "hover:bg-muted/50"
              }`}
            >
              {/* Time */}
              <span className={`text-xs font-semibold ${hour.isNow ? "text-primary" : "text-muted-foreground"}`}>
                {hour.label}
              </span>

              {/* Weather icon */}
              <WeatherIcon weatherType={hour.type} className="w-6 h-6" />

              {/* Temperature */}
              <span className={`text-sm font-extrabold tabular-nums ${hour.isNow ? "text-primary" : "text-foreground"}`}>
                {hour.temp}°
              </span>

              {/* Precip chance — only show if > 0 */}
              <span className={`text-[10px] font-semibold tabular-nums ${hour.precipChance > 0 ? "text-blue-500" : "text-transparent"}`}>
                {hour.precipChance > 0 ? `${hour.precipChance}%` : "·"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
