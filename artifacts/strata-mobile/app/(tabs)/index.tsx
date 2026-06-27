import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HourlyStrip } from "@/components/HourlyStrip";
import { WeatherIcon } from "@/components/WeatherIcon";
import { useColors } from "@/hooks/useColors";
import { useAQI } from "@/hooks/useAQI";
import {
  WEATHER_DARK_TEXT,
  WEATHER_GRADIENTS,
  WEATHER_LABELS,
  useWeather,
  type CurrentWeather,
} from "@/hooks/useWeather";
import { useLocation } from "@/context/LocationContext";
import { AlertBanner } from "@/components/AlertBanner";
import { useAlerts } from "@/hooks/useAlerts";
import { useUnit } from "@/context/UnitContext";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getDateString(): string {
  const d = new Date();
  return `${DAY_NAMES[d.getDay()]}, ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
}

function uvLabel(uv: number): string {
  if (uv <= 2) return "Low";
  if (uv <= 5) return "Moderate";
  if (uv <= 7) return "High";
  if (uv <= 10) return "Very High";
  return "Extreme";
}

function getOutfitSuggestion(current: CurrentWeather): string {
  const { temp, weatherType, windSpeed } = current;
  const isRainy = weatherType === "rainy" || weatherType === "stormy";
  const isSnowy = weatherType === "snowy";
  const isWindy = windSpeed > 20;

  if (temp >= 35) return "Shorts and a light t-shirt — stay hydrated!";
  if (temp >= 28 && isRainy) return "Light clothes and an umbrella — warm but wet.";
  if (temp >= 28) return "Light clothes — shorts or a summer outfit.";
  if (temp >= 20 && isRainy) return "Light jacket and umbrella needed.";
  if (temp >= 20) return "T-shirt and jeans should work great.";
  if (temp >= 10 && isRainy) return "Hoodie and umbrella — good idea.";
  if (temp >= 10 && isWindy) return "Windbreaker — it's breezy out there.";
  if (temp >= 10) return "Hoodie or light jacket time.";
  if (temp >= 0 && isSnowy) return "Warm coat, boots, and a scarf!";
  if (temp >= 0) return "Warm coat and layers — it's cold!";
  return "Heavy coat, hat, and gloves — bundle up!";
}

function getOutfitEmoji(current: CurrentWeather): string {
  const { temp, weatherType } = current;
  const isRainy = weatherType === "rainy" || weatherType === "stormy";
  const isSnowy = weatherType === "snowy";
  if (temp >= 35) return "🌞";
  if (isRainy) return "☔";
  if (isSnowy) return "❄️";
  if (temp >= 20) return "👕";
  if (temp >= 10) return "🧥";
  return "🥶";
}

function StatPill({
  icon,
  value,
  label,
  textColor,
}: {
  icon: string;
  value: string;
  label: string;
  textColor: string;
}) {
  return (
    <View style={styles.stat}>
      <Ionicons
        name={icon as keyof typeof Ionicons.glyphMap}
        size={18}
        color={textColor}
        style={{ opacity: 0.8 }}
      />
      <Text style={[styles.statValue, { color: textColor }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: textColor, opacity: 0.65 }]}>
        {label}
      </Text>
    </View>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { cityName, isLoading: locationLoading } = useLocation();
  const { data: weather, isLoading, isError, refetch, isRefetching } = useWeather();
  const { data: alertsData } = useAlerts();
  const { data: aqiData } = useAQI();
  const { formatTemp } = useUnit();
  const activeAlerts = alertsData?.alerts ?? [];

  const weatherType = weather?.current.weatherType ?? "cloudy";
  const gradient = WEATHER_GRADIENTS[weatherType];
  const isDarkText = WEATHER_DARK_TEXT.includes(weatherType);
  const textColor = isDarkText ? "#122436" : "#FFFFFF";

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const today = weather?.daily[0];
  const panelBg = `${textColor === "#FFFFFF" ? "#000000" : "#FFFFFF"}18`;
  const dateStr = getDateString();

  if (locationLoading || (isLoading && !weather)) {
    return (
      <LinearGradient
        colors={["#4A90C4", "#87D8F5"]}
        style={[styles.loading, { paddingTop: topPad }]}
      >
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.loadingText}>Finding your weather...</Text>
      </LinearGradient>
    );
  }

  if (isError && !weather) {
    return (
      <LinearGradient
        colors={["#4A90C4", "#87D8F5"]}
        style={[styles.loading, { paddingTop: topPad }]}
      >
        <Ionicons name="cloud-offline-outline" size={52} color="#FFFFFF" style={{ opacity: 0.8 }} />
        <Text style={styles.loadingText}>Couldn't load weather</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
          <Text style={styles.retryBtnText}>Try Again</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={gradient} style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: topPad + 8 }]}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never"
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={textColor}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.locationRow}>
              <Ionicons
                name="location"
                size={15}
                color={textColor}
                style={{ opacity: 0.8 }}
              />
              <Text style={[styles.cityName, { color: textColor }]} numberOfLines={1}>
                {cityName}
              </Text>
            </View>
            <Text style={[styles.dateStr, { color: textColor, opacity: 0.65 }]}>
              {dateStr}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/settings")}
            hitSlop={10}
            style={styles.searchBtn}
          >
            <Ionicons name="search" size={22} color={textColor} style={{ opacity: 0.8 }} />
          </TouchableOpacity>
        </View>

        <AlertBanner alerts={activeAlerts} textColor={textColor} />

        {/* Hero */}
        <View style={styles.hero}>
          <WeatherIcon type={weatherType} size={88} color={textColor} />
          <Text style={[styles.temp, { color: textColor }]}>
            {weather ? formatTemp(weather.current.temp) : "--°"}
          </Text>
          <Text style={[styles.condition, { color: textColor }]}>
            {WEATHER_LABELS[weatherType]}
          </Text>
          <Text style={[styles.feelsLike, { color: textColor, opacity: 0.7 }]}>
            Feels like {weather ? formatTemp(weather.current.feelsLike) : "--°"}
          </Text>
          {today && (
            <Text style={[styles.highLow, { color: textColor, opacity: 0.65 }]}>
              ↑ {formatTemp(today.high)}{"   "}↓ {formatTemp(today.low)}
            </Text>
          )}
        </View>

        {/* Stats card — two rows */}
        <View style={[styles.statsCard, { borderColor: `${textColor}30` }]}>
          <View style={styles.statsRow}>
            <StatPill
              icon="water"
              value={`${weather?.current.humidity ?? "--"}%`}
              label="Humidity"
              textColor={textColor}
            />
            <View style={[styles.statDivider, { backgroundColor: `${textColor}30` }]} />
            <StatPill
              icon="speedometer"
              value={`${weather?.current.windSpeed ?? "--"}mph`}
              label="Wind"
              textColor={textColor}
            />
            <View style={[styles.statDivider, { backgroundColor: `${textColor}30` }]} />
            <StatPill
              icon="eye"
              value={`${weather?.current.pressure ?? "--"}mb`}
              label="Pressure"
              textColor={textColor}
            />
          </View>

          <View style={[styles.rowSep, { backgroundColor: `${textColor}20` }]} />

          <View style={styles.statsRow}>
            <StatPill
              icon="sunny"
              value={`UV ${weather?.current.uvIndex ?? "--"}`}
              label={weather ? uvLabel(weather.current.uvIndex) : "UV"}
              textColor={textColor}
            />
            <View style={[styles.statDivider, { backgroundColor: `${textColor}30` }]} />
            <StatPill
              icon="sunny-outline"
              value={today?.sunrise ?? "--"}
              label="Sunrise"
              textColor={textColor}
            />
            <View style={[styles.statDivider, { backgroundColor: `${textColor}30` }]} />
            <StatPill
              icon="moon-outline"
              value={today?.sunset ?? "--"}
              label="Sunset"
              textColor={textColor}
            />
          </View>
        </View>

        {/* AQI card */}
        {aqiData && (
          <View style={[styles.infoCard, { backgroundColor: panelBg }]}>
            <View style={styles.aqiRow}>
              <View
                style={[
                  styles.aqiBadge,
                  { backgroundColor: aqiData.color + "33", borderColor: aqiData.color },
                ]}
              >
                <View style={[styles.aqiDot, { backgroundColor: aqiData.color }]} />
                <Text style={[styles.aqiBadgeText, { color: textColor }]}>
                  {aqiData.label}
                </Text>
              </View>
              <Text style={[styles.aqiDesc, { color: textColor }]}>
                Air Quality · AQI {aqiData.aqi}
              </Text>
            </View>
          </View>
        )}

        {/* What to Wear card */}
        {weather && (
          <View style={[styles.infoCard, { backgroundColor: panelBg }]}>
            <View style={styles.wearLabelRow}>
              <Text style={styles.wearEmoji}>{getOutfitEmoji(weather.current)}</Text>
              <Text style={[styles.cardLabel, { color: textColor }]}>WHAT TO WEAR</Text>
            </View>
            <Text style={[styles.wearText, { color: textColor }]}>
              {getOutfitSuggestion(weather.current)}
            </Text>
          </View>
        )}

        {/* Hourly panel */}
        {weather && weather.hourly.length > 0 && (
          <View style={[styles.panel, { backgroundColor: panelBg }]}>
            <Text style={[styles.panelTitle, { color: textColor, opacity: 0.8 }]}>
              HOURLY
            </Text>
            <HourlyStrip items={weather.hourly} textColor={textColor} />
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  loadingText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  retryBtn: {
    marginTop: 4,
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
  },
  retryBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  scroll: { flex: 1 },
  content: {
    paddingBottom: 120,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  headerLeft: {
    flex: 1,
    marginRight: 16,
    gap: 3,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  cityName: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
  },
  dateStr: {
    fontSize: 13,
    fontWeight: "400",
    marginLeft: 20,
  },
  searchBtn: {
    paddingTop: 2,
  },
  hero: {
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
  },
  temp: {
    fontSize: 90,
    fontWeight: "200",
    lineHeight: 96,
    letterSpacing: -4,
    marginTop: 4,
  },
  condition: {
    fontSize: 22,
    fontWeight: "500",
  },
  feelsLike: {
    fontSize: 15,
    fontWeight: "400",
  },
  highLow: {
    fontSize: 14,
    fontWeight: "400",
    marginTop: 2,
    letterSpacing: 0.5,
  },
  statsCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)",
  } as never,
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowSep: {
    height: 1,
    marginHorizontal: 16,
  },
  stat: {
    flex: 1,
    alignItems: "center",
    gap: 3,
  },
  statValue: {
    fontSize: 13,
    fontWeight: "600",
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "400",
  },
  statDivider: {
    width: 1,
    height: 32,
  },
  infoCard: {
    marginHorizontal: 16,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)",
  } as never,
  aqiRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  aqiBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  aqiDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  aqiBadgeText: {
    fontSize: 13,
    fontWeight: "600",
  },
  aqiDesc: {
    fontSize: 13,
    fontWeight: "400",
    opacity: 0.8,
  },
  wearLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  wearEmoji: {
    fontSize: 16,
    lineHeight: 20,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    opacity: 0.7,
  },
  wearText: {
    fontSize: 15,
    fontWeight: "500",
    lineHeight: 22,
  },
  panel: {
    marginHorizontal: 16,
    borderRadius: 16,
    paddingTop: 12,
    paddingBottom: 8,
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)",
  } as never,
  panelTitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginLeft: 20,
    marginBottom: 8,
  },
  bottomSpacer: { height: 16 },
});
