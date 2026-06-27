import { useQuery } from "@tanstack/react-query";
import { useLocation } from "@/context/LocationContext";

export interface AQIData {
  aqi: number;
  label: string;
  color: string;
  pm25: number;
  pm10: number;
}

function aqiInfo(aqi: number): { label: string; color: string } {
  if (aqi <= 20) return { label: "Good", color: "#4CAF50" };
  if (aqi <= 40) return { label: "Fair", color: "#CDDC39" };
  if (aqi <= 60) return { label: "Moderate", color: "#FF9800" };
  if (aqi <= 80) return { label: "Poor", color: "#F44336" };
  if (aqi <= 100) return { label: "Very Poor", color: "#9C27B0" };
  return { label: "Hazardous", color: "#7B1FA2" };
}

async function fetchAQI(lat: number, lon: number): Promise<AQIData> {
  const url =
    `https://air-quality-api.open-meteo.com/v1/air-quality?` +
    `latitude=${lat}&longitude=${lon}` +
    `&current=european_aqi,pm2_5,pm10&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("AQI fetch failed");
  const data = await res.json();
  const aqi = Math.round(data.current?.european_aqi ?? 0);
  const { label, color } = aqiInfo(aqi);
  return {
    aqi,
    label,
    color,
    pm25: Math.round(data.current?.pm2_5 ?? 0),
    pm10: Math.round(data.current?.pm10 ?? 0),
  };
}

export function useAQI() {
  const { lat, lon } = useLocation();
  return useQuery<AQIData>({
    queryKey: ["aqi", lat, lon],
    queryFn: () => fetchAQI(lat!, lon!),
    enabled: lat !== null && lon !== null,
    staleTime: 15 * 60 * 1000,
    retry: 1,
  });
}
