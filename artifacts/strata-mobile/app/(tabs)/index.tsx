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
import { useCorrections } from "@/hooks/useCorrections";
import {
  WEATHER_DARK_TEXT,
  WEATHER_GRADIENTS,
  WEATHER_LABELS,
  useWeather,
} from "@/hooks/useWeather";
import { useLocation } from "@/context/LocationContext";

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
  const { data: weather, isLoading, refetch, isRefetching } = useWeather();
  const { data: corrections } = useCorrections();

  const weatherType = weather?.current.weatherType ?? "cloudy";
  const gradient = WEATHER_GRADIENTS[weatherType];
  const isDarkText = WEATHER_DARK_TEXT.includes(weatherType);
  const textColor = isDarkText ? "#122436" : "#FFFFFF";

  const disagreements = corrections?.filter(
    (c) => c.actualWeatherType !== c.officialWeatherType
  ).length ?? 0;

  const topPad = Platform.OS === "web" ? 67 : insets.top;

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

  return (
    <LinearGradient colors={gradient} style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: topPad + 8 },
        ]}
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
        <View style={styles.header}>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={16} color={textColor} style={{ opacity: 0.8 }} />
            <Text
              style={[styles.cityName, { color: textColor }]}
              numberOfLines={1}
            >
              {cityName}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/settings")}
            hitSlop={10}
          >
            <Ionicons name="search" size={22} color={textColor} style={{ opacity: 0.8 }} />
          </TouchableOpacity>
        </View>

        <View style={styles.hero}>
          <WeatherIcon type={weatherType} size={80} color={textColor} />
          <Text style={[styles.temp, { color: textColor }]}>
            {weather?.current.temp ?? "--"}°
          </Text>
          <Text style={[styles.condition, { color: textColor }]}>
            {WEATHER_LABELS[weatherType]}
          </Text>
          <Text style={[styles.feelsLike, { color: textColor, opacity: 0.7 }]}>
            Feels like {weather?.current.feelsLike ?? "--"}°
          </Text>
        </View>

        <View style={[styles.statsRow, { borderColor: `${textColor}30` }]}>
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

        {weather && weather.hourly.length > 0 && (
          <View style={[styles.panel, { backgroundColor: `${textColor === "#FFFFFF" ? "#000000" : "#FFFFFF"}18` }]}>
            <Text style={[styles.panelTitle, { color: textColor, opacity: 0.8 }]}>
              HOURLY
            </Text>
            <HourlyStrip items={weather.hourly} textColor={textColor} />
          </View>
        )}

        {disagreements > 0 && (
          <TouchableOpacity
            style={[
              styles.neighborBanner,
              { backgroundColor: `${textColor === "#FFFFFF" ? "#000000" : "#FFFFFF"}20` },
            ]}
            onPress={() => router.push("/(tabs)/community")}
            activeOpacity={0.8}
          >
            <Ionicons name="people" size={18} color={textColor} />
            <Text style={[styles.neighborText, { color: textColor }]}>
              {disagreements} neighbor{disagreements !== 1 ? "s" : ""} see something different
            </Text>
            <Ionicons name="chevron-forward" size={16} color={textColor} style={{ opacity: 0.6 }} />
          </TouchableOpacity>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 120,
    gap: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
    marginRight: 16,
  },
  cityName: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
  },
  hero: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 16,
  },
  temp: {
    fontSize: 90,
    fontWeight: "200",
    lineHeight: 96,
    letterSpacing: -4,
  },
  condition: {
    fontSize: 22,
    fontWeight: "500",
  },
  feelsLike: {
    fontSize: 15,
    fontWeight: "400",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  stat: {
    flex: 1,
    alignItems: "center",
    gap: 3,
  },
  statValue: {
    fontSize: 15,
    fontWeight: "600",
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "400",
  },
  statDivider: {
    width: 1,
    height: 32,
  },
  panel: {
    marginHorizontal: 16,
    borderRadius: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  panelTitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginLeft: 20,
    marginBottom: 8,
  },
  neighborBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 14,
  },
  neighborText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
  bottomSpacer: {
    height: 16,
  },
});
