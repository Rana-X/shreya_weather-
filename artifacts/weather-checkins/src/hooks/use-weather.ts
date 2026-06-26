import { useState, useEffect } from "react";
import { CorrectionOfficialWeatherType } from "@workspace/api-client-react";

export interface HourlyPrecip {
  hour: string;
  probability: number;
}

export interface HourlyForecast {
  time: string;
  label: string;   // "Now", "1 PM", "2 AM", …
  temp: number;
  type: CorrectionOfficialWeatherType;
  precipChance: number;
  isNow: boolean;
  isMidnight: boolean; // marks day boundary
}

export interface DayForecast {
  date: string;        // "2026-06-27"
  dayName: string;     // "Today", "Mon", "Tue", …
  high: number;
  low: number;
  type: CorrectionOfficialWeatherType;
  precipChance: number;
}

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  windSpeed: number;
  humidity: number;
  type: CorrectionOfficialWeatherType;
  precipitationChance: number;
  hourlyPrecip: HourlyPrecip[];
  hourlyForecast: HourlyForecast[];
  uvIndex: number;
  dewPoint: number;
  pressure: number;
  visibility: number; // miles
  moonPhase: number; // 0–1
  sunrise: string;
  sunset: string;
  forecast: DayForecast[];
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

const fmtTime = (iso: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "—" : d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};

// Calculate moon phase (0–1) from date using the known lunar cycle
const calcMoonPhase = (date: Date): number => {
  const knownNewMoon = new Date("2000-01-06T18:14:00Z");
  const lunarCycleDays = 29.530588853;
  const elapsed = (date.getTime() - knownNewMoon.getTime()) / 86400000;
  const phase = ((elapsed % lunarCycleDays) + lunarCycleDays) % lunarCycleDays;
  return phase / lunarCycleDays; // 0 = new moon, 0.5 = full moon
};

// Find which hourly index best matches "now"
const currentHourIndex = (times: string[]): number => {
  const now = Date.now();
  let best = 0;
  let bestDiff = Infinity;
  for (let i = 0; i < times.length; i++) {
    const diff = Math.abs(new Date(times[i]).getTime() - now);
    if (diff < bestDiff) { bestDiff = diff; best = i; }
  }
  return best;
};

const fetchWeatherData = async (lat: number, lon: number): Promise<WeatherData> => {
  // current: variables Open-Meteo supports as `current`
  // hourly:  visibility & uv_index are only hourly in Open-Meteo
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,` +
    `relative_humidity_2m,precipitation_probability,dew_point_2m,surface_pressure` +
    `&hourly=precipitation_probability,visibility,uv_index,temperature_2m,weather_code` +
    `&daily=sunrise,sunset,temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max` +
    `&wind_speed_unit=mph&temperature_unit=fahrenheit&forecast_days=7&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Weather API ${res.status}`);
  const json = await res.json();

  const cur = json.current;
  const daily = json.daily ?? {};

  // Build 7-day forecast from daily data
  const dailyTimes: string[]  = daily.time ?? [];
  const dailyMaxes: number[]  = daily.temperature_2m_max ?? [];
  const dailyMins: number[]   = daily.temperature_2m_min ?? [];
  const dailyCodes: number[]  = daily.weather_code ?? [];
  const dailyPrecip: number[] = daily.precipitation_probability_max ?? [];
  const forecast: DayForecast[] = dailyTimes.map((dateStr, i) => {
    const d = new Date(`${dateStr}T12:00:00`);
    const dayName = i === 0
      ? "Today"
      : d.toLocaleDateString([], { weekday: "short" });
    return {
      date: dateStr,
      dayName,
      high: Math.round(dailyMaxes[i] ?? 0),
      low:  Math.round(dailyMins[i]  ?? 0),
      type: mapWeatherCode(dailyCodes[i] ?? 0, 0),
      precipChance: Math.round(dailyPrecip[i] ?? 0),
    };
  });

  const hourlyTimes: string[] = json.hourly?.time ?? [];
  const hourlyProb: number[] = json.hourly?.precipitation_probability ?? [];
  const hourlyVis: number[] = json.hourly?.visibility ?? [];
  const hourlyUV: number[] = json.hourly?.uv_index ?? [];

  const temp = cur.temperature_2m ?? 0;
  const wind = cur.wind_speed_10m ?? 0;
  const code = cur.weather_code ?? 0;

  // Current hourly index for visibility & UV
  const hIdx = currentHourIndex(hourlyTimes);
  const visibilityM = hourlyVis[hIdx] ?? 0;
  const visibilityMi = Math.round((visibilityM / 1609.34) * 10) / 10;
  const uvIndex = Math.round(hourlyUV[hIdx] ?? 0);

  // Next 12 hours of precipitation probability
  const now = new Date();
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
    feelsLike: Math.round(cur.apparent_temperature ?? temp),
    windSpeed: Math.round(wind),
    humidity: Math.round(cur.relative_humidity_2m ?? 0),
    type: mapWeatherCode(code, wind),
    precipitationChance: Math.round(cur.precipitation_probability ?? 0),
    hourlyPrecip,
    uvIndex,
    dewPoint: Math.round(cur.dew_point_2m ?? 0),
    pressure: Math.round(cur.surface_pressure ?? 0),
    visibility: visibilityMi,
    moonPhase: calcMoonPhase(new Date()),
    sunrise: fmtTime(daily.sunrise?.[0] ?? ""),
    sunset: fmtTime(daily.sunset?.[0] ?? ""),
    forecast,
    loading: false,
    error: null,
    lat,
    lon,
  };
};

export function useWeather() {
  const [data, setData] = useState<WeatherData>({
    temperature: 0,
    feelsLike: 0,
    windSpeed: 0,
    humidity: 0,
    type: "sunny",
    precipitationChance: 0,
    hourlyPrecip: [],
    uvIndex: 0,
    dewPoint: 0,
    pressure: 0,
    visibility: 0,
    moonPhase: 0,
    sunrise: "—",
    sunset: "—",
    forecast: [],
    loading: true,
    error: null,
    lat: NYC_LAT,
    lon: NYC_LON,
  });

  useEffect(() => {
    let cancelled = false;

    fetchWeatherData(NYC_LAT, NYC_LON)
      .then((result) => { if (!cancelled) setData(result); })
      .catch(() => {
        if (!cancelled)
          setData((prev) => ({ ...prev, loading: false, error: "Could not load weather" }));
      });

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
