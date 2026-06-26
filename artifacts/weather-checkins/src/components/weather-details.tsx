import { WeatherData } from "@/hooks/use-weather";
import { AirQualityData } from "@/hooks/use-air-quality";

interface Props {
  weather: WeatherData;
  airQuality: AirQualityData;
}

const getMoonEmoji = (phase: number): { emoji: string; label: string } => {
  if (phase < 0.0625 || phase >= 0.9375) return { emoji: "🌑", label: "New Moon" };
  if (phase < 0.1875) return { emoji: "🌒", label: "Waxing Crescent" };
  if (phase < 0.3125) return { emoji: "🌓", label: "First Quarter" };
  if (phase < 0.4375) return { emoji: "🌔", label: "Waxing Gibbous" };
  if (phase < 0.5625) return { emoji: "🌕", label: "Full Moon" };
  if (phase < 0.6875) return { emoji: "🌖", label: "Waning Gibbous" };
  if (phase < 0.8125) return { emoji: "🌗", label: "Last Quarter" };
  return { emoji: "🌘", label: "Waning Crescent" };
};

const getUvLabel = (uv: number): { label: string; color: string } => {
  if (uv <= 2)  return { label: "Low",       color: "text-green-600 dark:text-green-400" };
  if (uv <= 5)  return { label: "Moderate",  color: "text-yellow-600 dark:text-yellow-400" };
  if (uv <= 7)  return { label: "High",      color: "text-orange-600 dark:text-orange-400" };
  if (uv <= 10) return { label: "Very High", color: "text-red-600 dark:text-red-400" };
  return         { label: "Extreme",         color: "text-purple-600 dark:text-purple-400" };
};

interface TileProps {
  icon: string;
  label: string;
  value: React.ReactNode;
  sub?: string;
}

function Tile({ icon, label, value, sub }: TileProps) {
  return (
    <div className="bg-muted/40 rounded-2xl p-4 flex flex-col gap-1 border border-border/60">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        <span>{icon}</span>
        <span>{label}</span>
      </div>
      <div className="text-2xl font-display font-extrabold text-foreground leading-none mt-1">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}

export function WeatherDetails({ weather, airQuality }: Props) {
  const { feelsLike, uvIndex, dewPoint, pressure, visibility, moonPhase, sunrise, sunset } = weather;
  const moon = getMoonEmoji(moonPhase);
  const uv = getUvLabel(uvIndex);

  return (
    <div>
      <h3 className="font-display font-bold text-foreground text-base mb-3">Weather Details</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">

        <Tile
          icon="🌡"
          label="Feels Like"
          value={<>{feelsLike}°F</>}
          sub={feelsLike < weather.temperature ? "Cooler than actual" : feelsLike > weather.temperature ? "Warmer than actual" : "Same as actual"}
        />

        <Tile
          icon="☀️"
          label="UV Index"
          value={<span className={uv.color}>{uvIndex}</span>}
          sub={uv.label}
        />

        <Tile
          icon="💧"
          label="Dew Point"
          value={<>{dewPoint}°F</>}
          sub={dewPoint >= 65 ? "Humid / muggy" : dewPoint >= 55 ? "Comfortable" : "Dry"}
        />

        <Tile
          icon="🌬"
          label="Pressure"
          value={<>{pressure} <span className="text-base font-semibold">mb</span></>}
          sub={pressure > 1013 ? "High pressure" : pressure < 1000 ? "Low pressure" : "Normal"}
        />

        <Tile
          icon="👁"
          label="Visibility"
          value={<>{visibility} <span className="text-base font-semibold">mi</span></>}
          sub={visibility >= 10 ? "Clear" : visibility >= 5 ? "Moderate" : "Poor"}
        />

        <Tile
          icon="🌬️"
          label="Air Quality"
          value={
            airQuality.loading
              ? <span className="text-base text-muted-foreground">—</span>
              : airQuality.aqi !== null
                ? <span className={airQuality.textColor}>{airQuality.aqi}</span>
                : <span className="text-base text-muted-foreground">—</span>
          }
          sub={airQuality.loading ? "Loading…" : airQuality.label}
        />

        <Tile
          icon="🌅"
          label="Sunrise"
          value={<span className="text-xl">{sunrise}</span>}
        />

        <Tile
          icon="🌇"
          label="Sunset"
          value={<span className="text-xl">{sunset}</span>}
        />

        <Tile
          icon={moon.emoji}
          label="Moon Phase"
          value={<span className="text-xl">{moon.emoji}</span>}
          sub={moon.label}
        />

      </div>
    </div>
  );
}
