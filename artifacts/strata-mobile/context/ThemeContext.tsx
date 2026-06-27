import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Appearance, useColorScheme } from "react-native";

const STORAGE_KEY = "@weatheraxis_theme";

interface ThemeContextValue {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  isDark: false,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [override, setOverride] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((val) => {
        if (val === "dark") setOverride(true);
        else if (val === "light") setOverride(false);
      })
      .catch(() => {});
  }, []);

  const isDark = override !== null ? override : system === "dark";

  const toggleTheme = () => {
    const next = !isDark;
    setOverride(next);
    AsyncStorage.setItem(STORAGE_KEY, next ? "dark" : "light").catch(() => {});
    try {
      Appearance.setColorScheme(next ? "dark" : "light");
    } catch {}
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
