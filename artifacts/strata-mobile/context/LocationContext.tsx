import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Platform } from "react-native";

export interface CityResult {
  id: string;
  name: string;
  country: string;
  admin1?: string;
  lat: number;
  lon: number;
}

interface LocationState {
  lat: number | null;
  lon: number | null;
  cityName: string;
  isLoading: boolean;
  hasPermission: boolean;
  savedLocations: CityResult[];
  searchCities: (query: string) => Promise<CityResult[]>;
  setManualLocation: (city: CityResult) => void;
  resetToGPS: () => void;
  saveLocation: (city: CityResult) => void;
  removeLocation: (id: string) => void;
}

const LocationContext = createContext<LocationState>({
  lat: null,
  lon: null,
  cityName: "Finding your location...",
  isLoading: true,
  hasPermission: false,
  savedLocations: [],
  searchCities: async () => [],
  setManualLocation: () => {},
  resetToGPS: () => {},
  saveLocation: () => {},
  removeLocation: () => {},
});

const SAVED_KEY = "strata-saved-locations";
const MANUAL_LOCATION_KEY = "strata-manual-location";

async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      { headers: { "Accept-Language": "en" } }
    );
    const data = await res.json();
    const city =
      data.address?.city ||
      data.address?.town ||
      data.address?.village ||
      data.address?.county ||
      "Your Location";
    return city;
  } catch {
    return "Your Location";
  }
}

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);
  const [cityName, setCityName] = useState("Finding your location...");
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [savedLocations, setSavedLocations] = useState<CityResult[]>([]);
  const [gpsLat, setGpsLat] = useState<number | null>(null);
  const [gpsLon, setGpsLon] = useState<number | null>(null);
  const [gpsCityName, setGpsCityName] = useState("Your Location");
  const [isManual, setIsManual] = useState(false);
  const isManualRef = useRef(false);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(SAVED_KEY),
      AsyncStorage.getItem(MANUAL_LOCATION_KEY),
    ]).then(([savedRaw, manualRaw]) => {
      if (savedRaw) {
        try {
          setSavedLocations(JSON.parse(savedRaw));
        } catch {}
      }
      if (manualRaw) {
        try {
          const city: CityResult = JSON.parse(manualRaw);
          setLat(city.lat);
          setLon(city.lon);
          setCityName(`${city.name}${city.admin1 ? ", " + city.admin1 : ""}`);
          setIsManual(true);
          isManualRef.current = true;
          setIsLoading(false);
        } catch {}
      }
    });
  }, []);

  const getGPSLocation = useCallback(async () => {
    try {
      if (Platform.OS === "web") {
        // Default fallback: New York City — used when geolocation is denied or unavailable
        const DEFAULT_LAT = 40.7128;
        const DEFAULT_LON = -74.006;
        const DEFAULT_CITY = "New York, NY";

        const applyFallback = () => {
          setLat((prev) => (prev === null ? DEFAULT_LAT : prev));
          setLon((prev) => (prev === null ? DEFAULT_LON : prev));
          setCityName((prev) =>
            prev === "Finding your location..." ? DEFAULT_CITY : prev
          );
          setIsLoading(false);
        };

        // Fallback fires after 6 s if geolocation hasn't resolved
        const timeout = setTimeout(applyFallback, 6000);

        if (!navigator.geolocation) {
          clearTimeout(timeout);
          applyFallback();
          return;
        }

        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            clearTimeout(timeout);
            const { latitude, longitude } = pos.coords;
            setGpsLat(latitude);
            setGpsLon(longitude);
            setHasPermission(true);
            const name = await reverseGeocode(latitude, longitude);
            setGpsCityName(name);
            if (!isManualRef.current) {
              setLat(latitude);
              setLon(longitude);
              setCityName(name);
              setIsLoading(false);
            }
          },
          () => {
            clearTimeout(timeout);
            if (!isManualRef.current) applyFallback();
          }
        );
      } else {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setHasPermission(false);
          if (!isManualRef.current) setIsLoading(false);
          return;
        }
        setHasPermission(true);
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const { latitude, longitude } = loc.coords;
        setGpsLat(latitude);
        setGpsLon(longitude);
        const name = await reverseGeocode(latitude, longitude);
        setGpsCityName(name);
        if (!isManualRef.current) {
          setLat(latitude);
          setLon(longitude);
          setCityName(name);
          setIsLoading(false);
        }
      }
    } catch {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getGPSLocation();
  }, [getGPSLocation]);

  const searchCities = useCallback(async (query: string): Promise<CityResult[]> => {
    if (query.length < 2) return [];
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en&format=json`
      );
      const data = await res.json();
      return (data.results ?? []).map((r: {
        id: number; name: string; country: string; admin1?: string;
        latitude: number; longitude: number;
      }) => ({
        id: String(r.id),
        name: r.name,
        country: r.country,
        admin1: r.admin1,
        lat: r.latitude,
        lon: r.longitude,
      }));
    } catch {
      return [];
    }
  }, []);

  const setManualLocation = useCallback((city: CityResult) => {
    setLat(city.lat);
    setLon(city.lon);
    setCityName(`${city.name}${city.admin1 ? ", " + city.admin1 : ""}`);
    setIsManual(true);
    isManualRef.current = true;
    AsyncStorage.setItem(MANUAL_LOCATION_KEY, JSON.stringify(city));
  }, []);

  const resetToGPS = useCallback(() => {
    setIsManual(false);
    isManualRef.current = false;
    AsyncStorage.removeItem(MANUAL_LOCATION_KEY);
    if (gpsLat && gpsLon) {
      setLat(gpsLat);
      setLon(gpsLon);
      setCityName(gpsCityName);
    } else {
      getGPSLocation();
    }
  }, [gpsLat, gpsLon, gpsCityName, getGPSLocation]);

  const saveLocation = useCallback((city: CityResult) => {
    setSavedLocations((prev) => {
      if (prev.find((l) => l.id === city.id)) return prev;
      const updated = [city, ...prev].slice(0, 6);
      AsyncStorage.setItem(SAVED_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeLocation = useCallback((id: string) => {
    setSavedLocations((prev) => {
      const updated = prev.filter((l) => l.id !== id);
      AsyncStorage.setItem(SAVED_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <LocationContext.Provider
      value={{
        lat, lon, cityName, isLoading, hasPermission,
        savedLocations, searchCities, setManualLocation,
        resetToGPS, saveLocation, removeLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  return useContext(LocationContext);
}
