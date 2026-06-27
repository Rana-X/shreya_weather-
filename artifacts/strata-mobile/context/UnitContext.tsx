import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

type TempUnit = "C" | "F";

const STORAGE_KEY = "@weatheraxis_unit";

interface UnitContextValue {
  unit: TempUnit;
  toggleUnit: () => void;
  formatTemp: (celsius: number) => string;
}

const UnitContext = createContext<UnitContextValue>({
  unit: "C",
  toggleUnit: () => {},
  formatTemp: (c) => `${Math.round(c)}°`,
});

export function UnitProvider({ children }: { children: React.ReactNode }) {
  const [unit, setUnit] = useState<TempUnit>("C");

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((val) => {
        if (val === "F" || val === "C") setUnit(val);
      })
      .catch(() => {});
  }, []);

  const toggleUnit = () => {
    const next: TempUnit = unit === "C" ? "F" : "C";
    setUnit(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  };

  const formatTemp = (celsius: number): string => {
    if (unit === "F") {
      return `${Math.round((celsius * 9) / 5 + 32)}°`;
    }
    return `${Math.round(celsius)}°`;
  };

  return (
    <UnitContext.Provider value={{ unit, toggleUnit, formatTemp }}>
      {children}
    </UnitContext.Provider>
  );
}

export function useUnit() {
  return useContext(UnitContext);
}
