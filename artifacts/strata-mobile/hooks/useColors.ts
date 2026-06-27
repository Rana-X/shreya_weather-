import { useTheme } from "@/context/ThemeContext";
import colors from "@/constants/colors";

/**
 * Returns the design tokens for the current color scheme.
 * Reads from ThemeContext which supports manual dark/light override.
 */
export function useColors() {
  const { isDark } = useTheme();
  const palette = isDark && "dark" in colors ? colors.dark : colors.light;
  return { ...palette, radius: colors.radius };
}
