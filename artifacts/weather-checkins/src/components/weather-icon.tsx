import { Sun, Cloud, CloudRain, CloudLightning, Wind, CloudSnow, CloudFog, HelpCircle } from "lucide-react";

interface WeatherIconProps {
  weatherType: string;
  className?: string;
}

export function WeatherIcon({ weatherType, className = "w-6 h-6" }: WeatherIconProps) {
  switch (weatherType) {
    case "sunny":
      return <Sun className={`text-yellow-500 ${className}`} />;
    case "cloudy":
      return <Cloud className={`text-slate-400 ${className}`} />;
    case "rainy":
      return <CloudRain className={`text-blue-400 ${className}`} />;
    case "stormy":
      return <CloudLightning className={`text-indigo-600 ${className}`} />;
    case "windy":
      return <Wind className={`text-teal-400 ${className}`} />;
    case "snowy":
      return <CloudSnow className={`text-sky-200 ${className}`} />;
    case "foggy":
      return <CloudFog className={`text-gray-400 ${className}`} />;
    default:
      return <HelpCircle className={`text-gray-400 ${className}`} />;
  }
}

export function getWeatherLabel(weatherType: string): string {
  switch (weatherType) {
    case "sunny": return "Sunny";
    case "cloudy": return "Cloudy";
    case "rainy": return "Rainy";
    case "stormy": return "Stormy";
    case "windy": return "Windy";
    case "snowy": return "Snowy";
    case "foggy": return "Foggy";
    default: return "Unknown";
  }
}
