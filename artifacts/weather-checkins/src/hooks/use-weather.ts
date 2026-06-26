import { useState, useEffect } from "react";
import { CorrectionOfficialWeatherType } from "@workspace/api-client-react";

export interface HourlyPrecip {
  hour: string;
  probability: number;
}

export interface WeatherData {
  temperature: number;
  windSpeed: number;
  humidity: number;
  type: CorrectionOfficialWeatherType;
  precipitationChance: number;
  hourlyPrecip: HourlyPrecip[];
  loading: boolean;
  error: string | null;
  lat: number;
  lon: number;
}

const NYC_LAT = 40.71;
const NYC_LON = -74.01;

const mapWeatherCode = (code: number, windSpeed: number): CorrectionOfficialWeatherType => {
  if (code === 0) return "sunny";
  if ([1, 2, 3].includes(code)) return "cloudy";
  if ([45, 48].includes(code)) return "foggy";
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "rainy";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "snowy";
  if ([95, 96, 99].includes(code)) return "stormy";
  if (windSpeed > 20) return "windy";
  return "cloudy";
};

const fetchWeatherData = async (lat: number, lon: number): Promise<WeatherData> => {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m,precipitation_probability` +
    `&hourly=precipitation_probability` +
    `&wind_speed_unit=mph&temperature_unit=fahrenheit&forecast_days=2&timezone=auto`
  );
  if (!res.ok) throw new Error("Weather API failed");
  const json = await res.json();

  const temp = json.current.temperature_2m;
  const wind = json.current.wind_speed_10m;
  const code = json.current.weather_code;
  const humidity = json.current.relative_humidity_2m ?? 0;
  const precipChance = json.current.precipitation_probability ?? 0;

  // Get next 12 hours of hourly precipitation probability starting from now
  const now = new Date();
  const hourlyTimes: string[] = json.hourly?.time ?? [];
  const hourlyProb: number[] = json.hourly?.precipitation_probability ?? [];

  const hourlyPrecip: HourlyPrecip[] = [];
  let count = 0;
  for (let i = 0; i < hourlyTimes.length && count < 12; i++) {
    const slotTime = new Date(hourlyTimes[i]);
    if (slotTime >= now) {
      const h = slotTime.getHours();
      const label = h === 0 ? "12am" : h < 12 ? `${h}am` : h === 12 ? "12pm" : `${h - 12}pm`;
      hourlyPrecip.push({ hour: label, probability: hourlyProb[i] ?? 0 });
      count++;
    }
  }

  return {
    temperature: Math.round(temp),
    windSpeed: Math.round(wind),
    humidity: Math.round(humidity),
    type: mapWeatherCode(code, wind),
    precipitationChance: Math.round(precipChance),
    hourlyPrecip,
    loading: false,
    error: null,
    lat,
    lon,
  };
};

export function useWeather() {
  const [data, setData] = useState<WeatherData>({
    temperature: 0,
    windSpeed: 0,
    humidity: 0,
    type: "sunny",
    precipitationChance: 0,
    hourlyPrecip: [],
    loading: true,
    error: null,
    lat: NYC_LAT,
    lon: NYC_LON,
  });

  useEffect(() => {
    let cancelled = false;

    // Immediately fetch with fallback location
    fetchWeatherData(NYC_LAT, NYC_LON)
      .then((result) => { if (!cancelled) setData(result); })
      .catch(() => {
        if (!cancelled)
          setData((prev) => ({ ...prev, loading: false, error: "Could not load weather" }));
      });

    // Try real location in background
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (cancelled) return;
          fetchWeatherData(pos.coords.latitude, pos.coords.longitude)
            .then((result) => { if (!cancelled) setData(result); })
            .catch(() => {});
        },
        () => {},
        { timeout: 5000, maximumAge: 60000 }
      );
    }

    return () => { cancelled = true; };
  }, []);

  return data;
}
