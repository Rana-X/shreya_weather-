import { useState, useEffect } from "react";

export type AlertSeverity = "Extreme" | "Severe" | "Moderate" | "Minor" | "Unknown";

export interface WeatherAlert {
  id: string;
  event: string;
  headline: string;
  description: string;
  severity: AlertSeverity;
  certainty: string;
  urgency: string;
  areaDesc: string;
  effective: string;
  expires: string;
}

export interface AlertsData {
  alerts: WeatherAlert[];
  loading: boolean;
  error: string | null;
  supported: boolean; // NWS only covers the US
}

export function useAlerts(lat: number, lon: number) {
  const [data, setData] = useState<AlertsData>({
    alerts: [],
    loading: true,
    error: null,
    supported: true,
  });

  useEffect(() => {
    if (!lat || !lon) return;

    let cancelled = false;
    setData((prev) => ({ ...prev, loading: true, error: null }));

    const fetchAlerts = async () => {
      try {
        // NWS alerts API — free, no key, US only
        const res = await fetch(
          `https://api.weather.gov/alerts/active?point=${lat},${lon}&status=actual`,
          { headers: { "User-Agent": "NeighborWeather/1.0 (educational project)" } }
        );

        if (res.status === 404 || res.status === 400) {
          // Location not supported (outside US)
          if (!cancelled) setData({ alerts: [], loading: false, error: null, supported: false });
          return;
        }

        if (!res.ok) throw new Error(`NWS API error: ${res.status}`);

        const json = await res.json();
        const features = json.features ?? [];

        const alerts: WeatherAlert[] = features
          .filter((f: any) => f.properties?.status === "Actual")
          .map((f: any) => ({
            id: f.properties.id,
            event: f.properties.event ?? "Weather Alert",
            headline: f.properties.headline ?? f.properties.event ?? "Weather Alert",
            description: f.properties.description ?? "",
            severity: (f.properties.severity ?? "Unknown") as AlertSeverity,
            certainty: f.properties.certainty ?? "Unknown",
            urgency: f.properties.urgency ?? "Unknown",
            areaDesc: f.properties.areaDesc ?? "",
            effective: f.properties.effective ?? "",
            expires: f.properties.expires ?? "",
          }))
          // Sort by severity: Extreme > Severe > Moderate > Minor
          .sort((a: WeatherAlert, b: WeatherAlert) => {
            const order: Record<AlertSeverity, number> = { Extreme: 0, Severe: 1, Moderate: 2, Minor: 3, Unknown: 4 };
            return (order[a.severity] ?? 4) - (order[b.severity] ?? 4);
          });

        if (!cancelled) setData({ alerts, loading: false, error: null, supported: true });
      } catch {
        if (!cancelled) setData({ alerts: [], loading: false, error: "Could not load alerts", supported: true });
      }
    };

    fetchAlerts();
    return () => { cancelled = true; };
  }, [lat, lon]);

  return data;
}
