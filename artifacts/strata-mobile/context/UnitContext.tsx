import React, { createContext, useContext, useState } from "react";

type TempUnit = "C" | "F";

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

  const toggleUnit = () => setUnit((prev) => (prev === "C" ? "F" : "C"));

  const formatTemp = (celsius: number): string => {
    if (unit === "F") {
      return `${Math.round(celsius * 9 / 5 + 32)}°`;
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
