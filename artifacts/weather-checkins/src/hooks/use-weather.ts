import { useState, useEffect } from "react";
import { CorrectionOfficialWeatherType } from "@workspace/api-client-react";

export interface WeatherData {
  temperature: number;
  windSpeed: number;
  type: CorrectionOfficialWeatherType;
  loading: boolean;
  error: string | null;
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
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m&wind_speed_unit=mph&temperature_unit=fahrenheit`
  );
  if (!res.ok) throw new Error("Weather API failed");
  const json = await res.json();
  const temp = json.current.temperature_2m;
  const wind = json.current.wind_speed_10m;
  const code = json.current.weather_code;
  return {
    temperature: Math.round(temp),
    windSpeed: Math.round(wind),
    type: mapWeatherCode(code, wind),
    loading: false,
    error: null,
  };
};

export function useWeather() {
  const [data, setData] = useState<WeatherData>({
    temperature: 0,
    windSpeed: 0,
    type: "sunny",
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    // Immediately fetch with fallback location — no waiting for geolocation
    fetchWeatherData(NYC_LAT, NYC_LON)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch(() => {
        if (!cancelled)
          setData((prev) => ({ ...prev, loading: false, error: "Could not load weather" }));
      });

    // Also try to get real location in the background — update if successful
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (cancelled) return;
          fetchWeatherData(pos.coords.latitude, pos.coords.longitude)
            .then((result) => {
              if (!cancelled) setData(result);
            })
            .catch(() => {});
        },
        () => {},
        { timeout: 5000, maximumAge: 60000 }
      );
    }

    return () => {
      cancelled = true;
    };
  }, []);

  return data;
}
