import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "@/context/LocationContext";

export type WeatherType =
  | "sunny"
  | "cloudy"
  | "rainy"
  | "stormy"
  | "windy"
  | "snowy"
  | "foggy";

export interface Correction {
  id: number;
  actualWeatherType: WeatherType;
  officialWeatherType: WeatherType;
  description: string | null;
  locationName: string | null;
  createdAt: string;
  agrees: number;
}

export interface CorrectionInput {
  actualWeatherType: WeatherType;
  officialWeatherType: WeatherType;
  description?: string;
  locationName?: string;
}

function getBaseUrl(): string {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (domain) return `https://${domain}`;
  return "";
}

export function useCorrections() {
  const { lat, lon } = useLocation();
  const qc = useQueryClient();

  const query = useQuery<Correction[]>({
    queryKey: ["corrections", lat, lon],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "30" });
      if (lat !== null) params.set("lat", String(lat));
      if (lon !== null) params.set("lon", String(lon));
      const res = await fetch(`${getBaseUrl()}/api/corrections?${params}`);
      if (!res.ok) throw new Error("Failed to fetch corrections");
      return res.json();
    },
    staleTime: 60 * 1000,
  });

  const submit = useMutation({
    mutationFn: async (input: CorrectionInput) => {
      const res = await fetch(`${getBaseUrl()}/api/corrections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Failed to submit correction");
      return res.json() as Promise<Correction>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["corrections"] });
    },
  });

  const agree = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${getBaseUrl()}/api/corrections/${id}/agree`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to agree");
      return res.json() as Promise<Correction>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["corrections"] });
    },
  });

  return { ...query, submit, agree };
}
