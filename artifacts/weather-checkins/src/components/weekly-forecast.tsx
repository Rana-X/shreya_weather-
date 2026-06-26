import { DayForecast } from "@/hooks/use-weather";
import { WeatherIcon } from "./weather-icon";

interface Props {
  days: DayForecast[];
}

export function WeeklyForecast({ days }: Props) {
  if (!days.length) return null;

  const globalHigh = Math.max(...days.map((d) => d.high));
  const globalLow  = Math.min(...days.map((d) => d.low));
  const range = globalHigh - globalLow || 1;

  return (
    <div className="bg-card rounded-2xl border border-border p-5">
      <h3 className="font-display font-bold text-foreground text-base mb-4">7-Day Forecast</h3>

      <div className="space-y-1">
        {days.map((day, i) => {
          const isToday = i === 0;
          const barLeft  = ((day.low  - globalLow)  / range) * 100;
          const barWidth = ((day.high - day.low)     / range) * 100;

          return (
            <div
              key={day.date}
              className={`grid items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                isToday ? "bg-primary/8 dark:bg-primary/10" : "hover:bg-muted/50"
              }`}
              style={{ gridTemplateColumns: "4.5rem 2rem 3.5rem 1fr 2.5rem" }}
            >
              {/* Day name */}
              <span className={`text-sm font-semibold ${isToday ? "text-primary" : "text-foreground"}`}>
                {day.dayName}
              </span>

              {/* Weather icon */}
              <WeatherIcon weatherType={day.type} className="w-5 h-5" />

              {/* Low temp */}
              <span className="text-sm text-muted-foreground text-right tabular-nums">
                {day.low}°
              </span>

              {/* Temperature range bar */}
              <div className="relative h-1.5 rounded-full bg-muted">
                <div
                  className="absolute h-full rounded-full bg-gradient-to-r from-blue-400 to-orange-400"
                  style={{ left: `${barLeft}%`, width: `${Math.max(barWidth, 6)}%` }}
                />
              </div>

              {/* High temp */}
              <span className="text-sm font-semibold text-foreground text-right tabular-nums">
                {day.high}°
              </span>
            </div>
          );
        })}
      </div>

      {/* Precip chance row */}
      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Rain chance</p>
        <div className="grid gap-0" style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}>
          {days.map((day) => (
            <div key={day.date} className="flex flex-col items-center gap-1">
              <span className="text-xs font-bold text-blue-500">{day.precipChance}%</span>
              <div className="w-full bg-muted rounded-full h-1 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-400"
                  style={{ width: `${day.precipChance}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground">{day.dayName === "Today" ? "Today" : day.dayName}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
