import { Ionicons } from "@expo/vector-icons";
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
import { WeeklyForecast } from "@/components/WeeklyForecast";
import { TempChart } from "@/components/TempChart";
import { useColors } from "@/hooks/useColors";
import { useWeather } from "@/hooks/useWeather";
import { useLocation } from "@/context/LocationContext";

export default function ForecastScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { cityName } = useLocation();
  const { data: weather, isLoading, isError, refetch, isRefetching } = useWeather();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  if (isLoading && !weather) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isError && !weather) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Ionicons name="cloud-offline-outline" size={52} color={colors.mutedForeground} />
        <Text style={[styles.errorText, { color: colors.mutedForeground }]}>
          Couldn't load forecast
        </Text>
        <TouchableOpacity
          style={[styles.retryBtn, { backgroundColor: colors.primary }]}
          onPress={() => refetch()}
        >
          <Text style={styles.retryBtnText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPad + 16, paddingBottom: bottomPad + 100 },
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={colors.primary}
        />
      }
    >
      <Text style={[styles.screenTitle, { color: colors.foreground }]}>Forecast</Text>
      <Text style={[styles.location, { color: colors.mutedForeground }]}>{cityName}</Text>

      {weather && (
        <>
          {/* 24h temperature chart */}
          <View
            style={[
              styles.section,
              { borderColor: colors.border, backgroundColor: colors.card },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
              24-HOUR TEMPERATURE
            </Text>
            <TempChart items={weather.hourly} />
          </View>

          {/* Hour-by-hour strip */}
          <View
            style={[
              styles.section,
              { borderColor: colors.border, backgroundColor: colors.card },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
              TODAY — HOUR BY HOUR
            </Text>
            <HourlyStrip items={weather.hourly} textColor={colors.foreground} />
          </View>

          {/* 7-day forecast — now inside a matching card */}
          <View
            style={[
              styles.section,
              styles.sectionNoPad,
              { borderColor: colors.border, backgroundColor: colors.card },
            ]}
          >
            <Text
              style={[
                styles.sectionTitle,
                { color: colors.mutedForeground, marginTop: 14, marginBottom: 12 },
              ]}
            >
              7-DAY FORECAST
            </Text>
            <WeeklyForecast items={weather.daily} />
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    fontWeight: "500",
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 24,
  },
  retryBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  content: {
    paddingHorizontal: 16,
    gap: 12,
  },
  screenTitle: {
    fontSize: 32,
    fontWeight: "700",
    marginTop: 8,
  },
  location: {
    fontSize: 15,
    fontWeight: "400",
    marginBottom: 4,
  },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 14,
    overflow: "hidden",
    boxShadow: "0 1px 4px rgba(18, 36, 54, 0.07)",
  } as never,
  sectionNoPad: {
    paddingVertical: 0,
    paddingBottom: 0,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginLeft: 16,
    marginBottom: 10,
  },
});
