import { useQuery } from "@tanstack/react-query";
import { useLocation } from "@/context/LocationContext";

export type WeatherType =
  | "sunny"
  | "cloudy"
  | "rainy"
  | "stormy"
  | "windy"
  | "snowy"
  | "foggy";

export interface CurrentWeather {
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
  precipitation: number;
  weatherType: WeatherType;
  wmoCode: number;
  uvIndex: number;
}

export interface HourlyItem {
  time: string;
  hour: number;
  temp: number;
  precipChance: number;
  weatherType: WeatherType;
}

export interface DailyItem {
  date: string;
  dayName: string;
  high: number;
  low: number;
  precipChance: number;
  weatherType: WeatherType;
  uvIndexMax: number;
  sunrise: string;
  sunset: string;
}

export interface WeatherData {
  current: CurrentWeather;
  hourly: HourlyItem[];
  daily: DailyItem[];
}

export function wmoToWeatherType(code: number): WeatherType {
  if (code === 0 || code === 1) return "sunny";
  if (code === 2 || code === 3) return "cloudy";
  if (code === 45 || code === 48) return "foggy";
  if (code >= 51 && code <= 67) return "rainy";
  if (code >= 71 && code <= 77) return "snowy";
  if (code >= 80 && code <= 82) return "rainy";
  if (code >= 85 && code <= 86) return "snowy";
  if (code >= 95 && code <= 99) return "stormy";
  return "cloudy";
}

function fmtTime(isoStr: string): string {
  const d = new Date(isoStr);
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, "0")} ${ampm}`;
}

export const WEATHER_LABELS: Record<WeatherType, string> = {
  sunny: "Sunny",
  cloudy: "Cloudy",
  rainy: "Rainy",
  stormy: "Stormy",
  windy: "Windy",
  snowy: "Snowy",
  foggy: "Foggy",
};

export const WEATHER_GRADIENTS: Record<WeatherType, [string, string]> = {
  sunny: ["#87D8F5", "#FFD070"],
  cloudy: ["#4A7A96", "#7AAEC8"],
  rainy: ["#1E2D3D", "#2E4A60"],
  stormy: ["#080E1C", "#1A1E32"],
  snowy: ["#B8D8F0", "#EAF6FF"],
  foggy: ["#6A8A94", "#9AADB4"],
  windy: ["#1C6898", "#4498C8"],
};

export const WEATHER_DARK_TEXT: WeatherType[] = ["sunny", "snowy"];

async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const url =
    `https://api.open-meteo.com/v1/forecast?` +
    `latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,apparent_temperature,weathercode,windspeed_10m,` +
    `relative_humidity_2m,surface_pressure,precipitation,uv_index` +
    `&hourly=temperature_2m,precipitation_probability,weathercode` +
    `&daily=weathercode,temperature_2m_max,temperature_2m_min,` +
    `precipitation_probability_max,uv_index_max,sunrise,sunset` +
    `&timezone=auto&forecast_days=7&wind_speed_unit=mph`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Weather fetch failed");
  const data = await res.json();

  const c = data.current;
  const current: CurrentWeather = {
    temp: Math.round(c.temperature_2m),
    feelsLike: Math.round(c.apparent_temperature),
    humidity: Math.round(c.relative_humidity_2m),
    windSpeed: Math.round(c.windspeed_10m),
    pressure: Math.round(c.surface_pressure),
    precipitation: c.precipitation ?? 0,
    weatherType: wmoToWeatherType(c.weathercode),
    wmoCode: c.weathercode,
    uvIndex: Math.round(c.uv_index ?? 0),
  };

  const now = new Date();
  const hourly: HourlyItem[] = [];

  for (let i = 0; i < data.hourly.time.length; i++) {
    const time = data.hourly.time[i] as string;
    const hourDate = new Date(time);
    const diffH = (hourDate.getTime() - now.getTime()) / 3600000;
    if (diffH >= -1 && hourly.length < 24) {
      const h = hourDate.getHours();
      hourly.push({
        time,
        hour: h,
        temp: Math.round(data.hourly.temperature_2m[i] as number),
        precipChance: Math.round(data.hourly.precipitation_probability[i] as number),
        weatherType: wmoToWeatherType(data.hourly.weathercode[i] as number),
      });
    }
  }

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const daily: DailyItem[] = (data.daily.time as string[]).map((date, i) => {
    const d = new Date(date + "T12:00:00");
    const dayNum = d.getDay();
    const isToday = i === 0;
    return {
      date,
      dayName: isToday ? "Today" : dayNames[dayNum],
      high: Math.round(data.daily.temperature_2m_max[i] as number),
      low: Math.round(data.daily.temperature_2m_min[i] as number),
      precipChance: Math.round(data.daily.precipitation_probability_max[i] as number),
      weatherType: wmoToWeatherType(data.daily.weathercode[i] as number),
      uvIndexMax: Math.round(data.daily.uv_index_max[i] as number ?? 0),
      sunrise: fmtTime(data.daily.sunrise[i] as string),
      sunset: fmtTime(data.daily.sunset[i] as string),
    };
  });

  return { current, hourly, daily };
}

export function useWeather() {
  const { lat, lon } = useLocation();

  return useQuery<WeatherData>({
    queryKey: ["weather", lat, lon],
    queryFn: () => fetchWeather(lat!, lon!),
    enabled: lat !== null && lon !== null,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}
