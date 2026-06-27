import { useState, useCallback } from "react";
import { type CityResult } from "./use-city-search";

const KEY = "strata-saved-locations";
const MAX = 6;

export interface SavedLocation {
  lat: number;
  lon: number;
  display: string;
  name: string;
}

function load(): SavedLocation[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

function save(locs: SavedLocation[]) {
  localStorage.setItem(KEY, JSON.stringify(locs));
}

export function useSavedLocations() {
  const [saved, setSaved] = useState<SavedLocation[]>(load);

  const isSaved = useCallback(
    (city: CityResult | null) =>
      !!city && saved.some((s) => Math.abs(s.lat - city.lat) < 0.01 && Math.abs(s.lon - city.lon) < 0.01),
    [saved],
  );

  const add = useCallback((city: CityResult) => {
    setSaved((prev) => {
      if (prev.some((s) => Math.abs(s.lat - city.lat) < 0.01 && Math.abs(s.lon - city.lon) < 0.01)) return prev;
      const next = [{ lat: city.lat, lon: city.lon, display: city.display, name: city.name }, ...prev].slice(0, MAX);
      save(next);
      return next;
    });
  }, []);

  const remove = useCallback((loc: SavedLocation) => {
    setSaved((prev) => {
      const next = prev.filter((s) => !(Math.abs(s.lat - loc.lat) < 0.01 && Math.abs(s.lon - loc.lon) < 0.01));
      save(next);
      return next;
    });
  }, []);

  return { saved, isSaved, add, remove };
}
