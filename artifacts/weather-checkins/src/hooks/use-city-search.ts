import { useState, useEffect, useRef } from "react";

export interface CityResult {
  id: number;
  name: string;
  admin1: string;   // state / province
  country: string;
  lat: number;
  lon: number;
  display: string;  // "New York, New York, United States"
}

export function useCitySearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CityResult[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=6&language=en&format=json`
        );
        const json = await res.json();
        const raw: Array<Record<string, unknown>> = json.results ?? [];
        setResults(
          raw.map((r) => ({
            id: r.id as number,
            name: r.name as string,
            admin1: (r.admin1 as string) ?? "",
            country: (r.country as string) ?? "",
            lat: r.latitude as number,
            lon: r.longitude as number,
            display: [r.name, r.admin1, r.country].filter(Boolean).join(", "),
          }))
        );
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  }, [query]);

  const clear = () => { setQuery(""); setResults([]); };

  return { query, setQuery, results, searching, clear };
}
