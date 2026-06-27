import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
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
  const { data: weather, isLoading, refetch, isRefetching } = useWeather();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  if (isLoading && !weather) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
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
      <Text style={[styles.screenTitle, { color: colors.foreground }]}>
        Forecast
      </Text>
      <Text style={[styles.location, { color: colors.mutedForeground }]}>
        {cityName}
      </Text>

      {weather && (
        <>
          {/* Temperature chart */}
          <View style={[styles.section, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
              24-HOUR TEMPERATURE
            </Text>
            <TempChart items={weather.hourly} />
          </View>

          {/* Hourly strip */}
          <View style={[styles.section, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
              TODAY — HOUR BY HOUR
            </Text>
            <HourlyStrip items={weather.hourly} textColor={colors.foreground} />
          </View>

          {/* 7-day */}
          <View style={styles.sectionLabel}>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground, marginLeft: 4 }]}>
              7-DAY FORECAST
            </Text>
          </View>
          <WeeklyForecast items={weather.daily} />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginLeft: 16,
    marginBottom: 10,
  },
  sectionLabel: {
    marginTop: 4,
  },
});
