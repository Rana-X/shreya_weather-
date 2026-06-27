import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useUnit } from "@/context/UnitContext";
import { useTripWeather } from "@/hooks/useTripWeather";
import {
  TRIPS,
  SEASON_CONFIG,
  getCurrentSeason,
  type Season,
  type TripDestination,
} from "@/data/trips";
import { WeatherIcon } from "@/components/WeatherIcon";

const SEASONS: Season[] = ["spring", "summer", "fall", "winter"];

function ActivityChip({ label }: { label: string }) {
  const colors = useColors();
  return (
    <View style={[styles.chip, { backgroundColor: colors.secondary }]}>
      <Text style={[styles.chipText, { color: colors.mutedForeground }]}>
        {label}
      </Text>
    </View>
  );
}

function WeatherRow({
  lat,
  lon,
  expanded,
}: {
  lat: number;
  lon: number;
  expanded: boolean;
}) {
  const colors = useColors();
  const { formatTemp } = useUnit();
  const { data, isLoading } = useTripWeather(lat, lon, expanded);

  if (!expanded) return null;

  return (
    <View style={[styles.weatherBox, { borderTopColor: colors.border }]}>
      {isLoading ? (
        <ActivityIndicator color={colors.primary} size="small" />
      ) : data ? (
        <>
          <Text style={[styles.forecastLabel, { color: colors.mutedForeground }]}>
            5-DAY FORECAST
          </Text>
          <View style={styles.forecastRow}>
            {data.daily.map((day) => (
              <View key={day.date} style={styles.forecastDay}>
                <Text style={[styles.dayName, { color: colors.mutedForeground }]}>
                  {day.dayName}
                </Text>
                <WeatherIcon
                  type={day.weatherType}
                  size={20}
                  color={colors.primary}
                />
                {day.precipChance > 20 && (
                  <Text style={[styles.precip, { color: colors.primary }]}>
                    {day.precipChance}%
                  </Text>
                )}
                <Text style={[styles.highTemp, { color: colors.foreground }]}>
                  {formatTemp(day.high)}
                </Text>
                <Text style={[styles.lowTemp, { color: colors.mutedForeground }]}>
                  {formatTemp(day.low)}
                </Text>
              </View>
            ))}
          </View>
        </>
      ) : (
        <Text style={[styles.forecastLabel, { color: colors.mutedForeground }]}>
          Could not load weather
        </Text>
      )}
    </View>
  );
}

function TripCard({
  trip,
  seasonColor,
}: {
  trip: TripDestination;
  seasonColor: string;
}) {
  const colors = useColors();
  const [expanded, setExpanded] = useState(false);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: expanded ? seasonColor : colors.border,
          borderWidth: expanded ? 1.5 : 1,
        },
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setExpanded((v) => !v);
      }}
      activeOpacity={0.85}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardEmoji}>{trip.emoji}</Text>
        <View style={styles.cardInfo}>
          <Text style={[styles.cardName, { color: colors.foreground }]}>
            {trip.name}
          </Text>
          <Text style={[styles.cardRegion, { color: colors.mutedForeground }]}>
            {trip.region}
          </Text>
          <Text style={[styles.cardTagline, { color: seasonColor }]}>
            {trip.tagline}
          </Text>
        </View>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={18}
          color={colors.mutedForeground}
        />
      </View>

      <View style={styles.activitiesRow}>
        {trip.activities.map((a) => (
          <ActivityChip key={a} label={a} />
        ))}
      </View>

      <View style={[styles.whyNowBox, { backgroundColor: `${seasonColor}15` }]}>
        <Ionicons name="bulb-outline" size={14} color={seasonColor} />
        <Text style={[styles.whyNowText, { color: colors.foreground }]}>
          {trip.whyNow}
        </Text>
      </View>

      <WeatherRow lat={trip.lat} lon={trip.lon} expanded={expanded} />
    </TouchableOpacity>
  );
}

export default function TripsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [selectedSeason, setSelectedSeason] = useState<Season>(getCurrentSeason());

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const cfg = SEASON_CONFIG[selectedSeason];
  const trips = TRIPS.filter((t) => t.season === selectedSeason);
  const currentSeason = getCurrentSeason();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 8, backgroundColor: colors.background },
        ]}
      >
        <View>
          <Text style={[styles.title, { color: colors.foreground }]}>Trips</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Best destinations by season
          </Text>
        </View>
        {currentSeason === selectedSeason && (
          <View style={[styles.nowBadge, { backgroundColor: cfg.color + "20", borderColor: cfg.color }]}>
            <Text style={[styles.nowBadgeText, { color: cfg.color }]}>
              {cfg.emoji} Now
            </Text>
          </View>
        )}
      </View>

      {/* Season tabs */}
      <View style={[styles.seasonTabs, { borderBottomColor: colors.border }]}>
        {SEASONS.map((season) => {
          const s = SEASON_CONFIG[season];
          const isActive = season === selectedSeason;
          return (
            <TouchableOpacity
              key={season}
              style={[
                styles.seasonTab,
                isActive && {
                  borderBottomColor: s.color,
                  borderBottomWidth: 2,
                },
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                setSelectedSeason(season);
              }}
            >
              <Text style={styles.seasonTabEmoji}>{s.emoji}</Text>
              <Text
                style={[
                  styles.seasonTabLabel,
                  { color: isActive ? s.color : colors.mutedForeground },
                ]}
              >
                {s.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Season banner */}
      <View
        style={[
          styles.seasonBanner,
          { backgroundColor: cfg.color + "18", marginHorizontal: 16, marginTop: 14 },
        ]}
      >
        <Text style={[styles.seasonBannerText, { color: cfg.color }]}>
          {cfg.emoji}{"  "}{cfg.label} picks — {cfg.months}
        </Text>
      </View>

      {/* Trip cards */}
      <ScrollView
        contentContainerStyle={[
          styles.list,
          { paddingBottom: bottomPad + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {trips.map((trip) => (
          <TripCard key={trip.id} trip={trip} seasonColor={cfg.color} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginTop: 8,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  nowBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  nowBadgeText: {
    fontSize: 13,
    fontWeight: "600",
  },
  seasonTabs: {
    flexDirection: "row",
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 8,
  },
  seasonTab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    gap: 3,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
    marginBottom: -StyleSheet.hairlineWidth,
  },
  seasonTabEmoji: {
    fontSize: 18,
  },
  seasonTabLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  seasonBanner: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 4,
  },
  seasonBannerText: {
    fontSize: 14,
    fontWeight: "600",
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 14,
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  cardEmoji: {
    fontSize: 36,
    width: 48,
    textAlign: "center",
  },
  cardInfo: {
    flex: 1,
    gap: 2,
  },
  cardName: {
    fontSize: 17,
    fontWeight: "700",
  },
  cardRegion: {
    fontSize: 12,
    fontWeight: "400",
  },
  cardTagline: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
  },
  activitiesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "500",
  },
  whyNowBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 10,
    borderRadius: 10,
  },
  whyNowText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  weatherBox: {
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: 16,
    alignItems: "center",
    minHeight: 72,
    justifyContent: "center",
  },
  forecastLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.1,
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  forecastRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  forecastDay: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  dayName: {
    fontSize: 11,
    fontWeight: "500",
  },
  precip: {
    fontSize: 10,
    fontWeight: "500",
  },
  highTemp: {
    fontSize: 13,
    fontWeight: "700",
  },
  lowTemp: {
    fontSize: 12,
    fontWeight: "400",
  },
});
