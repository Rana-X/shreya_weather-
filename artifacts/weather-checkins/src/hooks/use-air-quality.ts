import { useState, useEffect } from "react";

export interface AirQualityData {
  aqi: number | null;
  label: string;
  color: string;
  textColor: string;
  loading: boolean;
}

const getAqiInfo = (aqi: number): { label: string; color: string; textColor: string } => {
  if (aqi <= 50)  return { label: "Good",                        color: "bg-green-100 dark:bg-green-950/40 border-green-300 dark:border-green-700",  textColor: "text-green-700 dark:text-green-400" };
  if (aqi <= 100) return { label: "Moderate",                    color: "bg-yellow-100 dark:bg-yellow-950/40 border-yellow-300 dark:border-yellow-700", textColor: "text-yellow-700 dark:text-yellow-400" };
  if (aqi <= 150) return { label: "Unhealthy for Sensitive",     color: "bg-orange-100 dark:bg-orange-950/40 border-orange-300 dark:border-orange-700", textColor: "text-orange-700 dark:text-orange-400" };
  if (aqi <= 200) return { label: "Unhealthy",                   color: "bg-red-100 dark:bg-red-950/40 border-red-300 dark:border-red-700",        textColor: "text-red-700 dark:text-red-400" };
  if (aqi <= 300) return { label: "Very Unhealthy",              color: "bg-purple-100 dark:bg-purple-950/40 border-purple-300 dark:border-purple-700", textColor: "text-purple-700 dark:text-purple-400" };
  return           { label: "Hazardous",                         color: "bg-rose-100 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700",     textColor: "text-rose-800 dark:text-rose-400" };
};

export function useAirQuality(lat: number, lon: number) {
  const [data, setData] = useState<AirQualityData>({
    aqi: null,
    label: "—",
    color: "",
    textColor: "",
    loading: true,
  });

  useEffect(() => {
    if (!lat || !lon) return;
    let cancelled = false;

    fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}` +
      `&current=us_aqi&timezone=auto`
    )
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        const aqi: number | null = json.current?.us_aqi ?? null;
        if (aqi === null) {
          setData({ aqi: null, label: "Unavailable", color: "", textColor: "text-muted-foreground", loading: false });
        } else {
          const info = getAqiInfo(aqi);
          setData({ aqi, ...info, loading: false });
        }
      })
      .catch(() => {
        if (!cancelled) setData({ aqi: null, label: "Unavailable", color: "", textColor: "text-muted-foreground", loading: false });
      });

    return () => { cancelled = true; };
  }, [lat, lon]);

  return data;
}
