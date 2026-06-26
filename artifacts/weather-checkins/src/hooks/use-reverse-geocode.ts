import { useState, useEffect } from "react";

export function useReverseGeocode(lat: number, lon: number): string {
  const [cityName, setCityName] = useState("");

  useEffect(() => {
    if (!lat || !lon) return;
    let cancelled = false;
    fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
    )
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const name =
          (data.city as string) ||
          (data.locality as string) ||
          (data.principalSubdivision as string) ||
          "";
        setCityName(name);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [lat, lon]);

  return cityName;
}
