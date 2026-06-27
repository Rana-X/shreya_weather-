import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { type WeatherType } from "@/hooks/useWeather";

interface WeatherIconProps {
  type: WeatherType;
  size?: number;
  color?: string;
}

const ICON_MAP: Record<WeatherType, keyof typeof Ionicons.glyphMap> = {
  sunny: "sunny",
  cloudy: "cloudy",
  rainy: "rainy",
  stormy: "thunderstorm",
  windy: "partly-sunny",
  snowy: "snow",
  foggy: "cloud",
};

const ICON_COLORS: Record<WeatherType, string> = {
  sunny: "#FFD070",
  cloudy: "#B0CDD8",
  rainy: "#7AAEC8",
  stormy: "#9090C0",
  windy: "#90C8E8",
  snowy: "#C8E8FA",
  foggy: "#A0B8C0",
};

export function WeatherIcon({ type, size = 32, color }: WeatherIconProps) {
  return (
    <Ionicons
      name={ICON_MAP[type]}
      size={size}
      color={color ?? ICON_COLORS[type]}
    />
  );
}
