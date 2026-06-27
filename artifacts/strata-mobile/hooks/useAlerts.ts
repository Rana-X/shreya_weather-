import { useQuery } from "@tanstack/react-query";
import { useLocation } from "@/context/LocationContext";

export type AlertSeverity = "Extreme" | "Severe" | "Moderate" | "Minor" | "Unknown";

export interface WeatherAlert {
  id: string;
  event: string;
  headline: string;
  description: string;
  instruction: string;
  severity: AlertSeverity;
  urgency: string;
  areaDesc: string;
  effective: string;
  expires: string;
}

export interface AlertsData {
  alerts: WeatherAlert[];
  count: number;
}

const API_BASE =
  typeof process !== "undefined" && process.env.EXPO_PUBLIC_DOMAIN
    ? `https://${process.env.EXPO_PUBLIC_DOMAIN}`
    : "";

async function fetchAlerts(lat: number, lon: number): Promise<AlertsData> {
  const res = await fetch(`${API_BASE}/api/alerts?lat=${lat}&lon=${lon}`);
  if (!res.ok) throw new Error("Alerts fetch failed");
  return res.json();
}

export const SEVERITY_CONFIG: Record<
  AlertSeverity,
  { color: string; bg: string; border: string; label: string }
> = {
  Extreme: {
    color: "#DC2626",
    bg: "#FEF2F2",
    border: "#FECACA",
    label: "Extreme",
  },
  Severe: {
    color: "#EA580C",
    bg: "#FFF7ED",
    border: "#FED7AA",
    label: "Severe",
  },
  Moderate: {
    color: "#D97706",
    bg: "#FFFBEB",
    border: "#FDE68A",
    label: "Moderate",
  },
  Minor: {
    color: "#65A30D",
    bg: "#F7FEE7",
    border: "#D9F99D",
    label: "Minor",
  },
  Unknown: {
    color: "#6B7280",
    bg: "#F9FAFB",
    border: "#E5E7EB",
    label: "Alert",
  },
};

export function useAlerts() {
  const { lat, lon } = useLocation();

  return useQuery<AlertsData>({
    queryKey: ["alerts", lat, lon],
    queryFn: () => fetchAlerts(lat!, lon!),
    enabled: lat !== null && lon !== null,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
