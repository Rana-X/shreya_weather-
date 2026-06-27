import { useState, useEffect } from "react";

function applyTheme(dark: boolean) {
  document.documentElement.classList.toggle("dark", dark);
}

export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem("strata-theme");
    if (stored) return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    applyTheme(isDark);
    localStorage.setItem("strata-theme", isDark ? "dark" : "light");
  }, [isDark]);

  // Apply on first render too.
  useEffect(() => { applyTheme(isDark); }, []);

  return { isDark, toggle: () => setIsDark((d) => !d) };
}
