import React, { createContext, useContext, useState } from "react";
import { Appearance, useColorScheme } from "react-native";

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

  const isDark = override !== null ? override : system === "dark";

  const toggleTheme = () => {
    const next = !isDark;
    setOverride(next);
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
