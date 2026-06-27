import { useQuery } from "@tanstack/react-query";
import { wmoToWeatherType, type WeatherType } from "@/hooks/useWeather";

export interface TripDayForecast {
  date: string;
  dayName: string;
  high: number;
  low: number;
  weatherType: WeatherType;
  precipChance: number;
}

export interface TripWeatherData {
  currentTemp: number;
  weatherType: WeatherType;
  daily: TripDayForecast[];
}

async function fetchTripWeather(lat: number, lon: number): Promise<TripWeatherData> {
  const url =
    `https://api.open-meteo.com/v1/forecast?` +
    `latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,weathercode` +
    `&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
    `&timezone=auto&forecast_days=5&wind_speed_unit=mph`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Trip weather fetch failed");
  const data = await res.json();

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const daily: TripDayForecast[] = (data.daily.time as string[]).map(
    (date: string, i: number) => {
      const d = new Date(date + "T12:00:00");
      return {
        date,
        dayName: i === 0 ? "Today" : dayNames[d.getDay()],
        high: Math.round(data.daily.temperature_2m_max[i] as number),
        low: Math.round(data.daily.temperature_2m_min[i] as number),
        weatherType: wmoToWeatherType(data.daily.weathercode[i] as number),
        precipChance: Math.round(
          data.daily.precipitation_probability_max[i] as number
        ),
      };
    }
  );

  return {
    currentTemp: Math.round(data.current.temperature_2m),
    weatherType: wmoToWeatherType(data.current.weathercode),
    daily,
  };
}

export function useTripWeather(lat: number, lon: number, enabled: boolean) {
  return useQuery<TripWeatherData>({
    queryKey: ["trip-weather", lat, lon],
    queryFn: () => fetchTripWeather(lat, lon),
    enabled,
    staleTime: 30 * 60 * 1000,
    retry: 1,
  });
}
