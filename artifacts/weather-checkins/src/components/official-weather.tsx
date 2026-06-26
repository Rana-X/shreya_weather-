import { useWeather } from "@/hooks/use-weather";
import { WeatherIcon, getWeatherLabel } from "./weather-icon";
import { Loader2, Wind, Thermometer, Droplets } from "lucide-react";

export function OfficialWeather() {
  const { temperature, windSpeed, humidity, precipitationChance, type, loading, error } = useWeather();

  if (loading) {
    return (
      <div className="bg-card rounded-3xl p-8 border border-border shadow-sm flex flex-col items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-medium">Fetching official forecast...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card rounded-3xl p-8 border border-border shadow-sm flex flex-col items-center justify-center min-h-[200px] text-center">
        <p className="text-destructive font-bold mb-2">Could not load official weather.</p>
        <p className="text-muted-foreground text-sm">Check your connection and try again.</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-3xl p-8 border border-border shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

      <div className="flex flex-col items-center text-center relative z-10">
        <WeatherIcon weatherType={type} className="w-24 h-24 mb-6" />
        <h2 className="text-5xl font-display font-extrabold text-foreground tracking-tight mb-2">
          {getWeatherLabel(type)}
        </h2>

        <div className="flex flex-wrap items-center justify-center gap-3 mt-6 mb-8">
          <div className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-2xl text-lg font-medium">
            <Thermometer className="w-5 h-5 text-primary" />
            <span>{temperature}°F</span>
          </div>
          <div className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-2xl text-lg font-medium">
            <Wind className="w-5 h-5 text-teal-500" />
            <span>{windSpeed} mph</span>
          </div>
          <div className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-2xl text-lg font-medium">
            <Droplets className="w-5 h-5 text-blue-400" />
            <span>{humidity}% humidity</span>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/30 px-4 py-2 rounded-2xl text-lg font-medium text-blue-600 dark:text-blue-400">
            <span>☂</span>
            <span>{precipitationChance}% rain</span>
          </div>
        </div>

        <div className="w-full h-px bg-border my-2" />
        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mt-4">
          According to official forecast
        </p>
      </div>
    </div>
  );
}
