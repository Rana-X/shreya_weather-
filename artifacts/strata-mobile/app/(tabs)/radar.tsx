import React, { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient,
  Path,
  Polygon,
  Rect,
  Stop,
  Text as SvgText,
} from "react-native-svg";
import { useColors } from "@/hooks/useColors";
import { useWeather } from "@/hooks/useWeather";
import { useLocation } from "@/context/LocationContext";

const RADAR_SIZE = 300;
const CENTER = RADAR_SIZE / 2;
const RINGS = 4;

function precipColor(chance: number): string {
  if (chance < 20) return "#93C5FD";
  if (chance < 40) return "#60A5FA";
  if (chance < 60) return "#3B82F6";
  if (chance < 80) return "#2563EB";
  return "#1D4ED8";
}

function RadarSweep({ rotation }: { rotation: Animated.Value }) {
  return null;
}

function RadarDial({
  hourly,
  sweep,
  primaryColor,
}: {
  hourly: Array<{ hour: number; precipChance: number }>;
  sweep: Animated.Value;
  primaryColor: string;
}) {
  const slice = hourly.slice(0, 12);
  const angleStep = 360 / 12;

  const polygonPoints = slice.map((item, i) => {
    const angle = ((i * angleStep - 90) * Math.PI) / 180;
    const r = CENTER * 0.85 * (item.precipChance / 100);
    return `${CENTER + r * Math.cos(angle)},${CENTER + r * Math.sin(angle)}`;
  });

  const fillPath =
    polygonPoints.length > 0
      ? `M ${polygonPoints.join(" L ")} Z`
      : "";

  const sweepRotation = sweep as unknown as number;

  return (
    <Svg width={RADAR_SIZE} height={RADAR_SIZE}>
      <Defs>
        <LinearGradient id="sweepGrad" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={primaryColor} stopOpacity="0" />
          <Stop offset="1" stopColor={primaryColor} stopOpacity="0.35" />
        </LinearGradient>
        <LinearGradient id="precipGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#3B82F6" stopOpacity="0.8" />
          <Stop offset="1" stopColor="#1D4ED8" stopOpacity="0.5" />
        </LinearGradient>
      </Defs>

      {/* Background rings */}
      {Array.from({ length: RINGS }).map((_, i) => (
        <Circle
          key={i}
          cx={CENTER}
          cy={CENTER}
          r={((i + 1) / RINGS) * (CENTER * 0.88)}
          fill="none"
          stroke={primaryColor}
          strokeWidth={0.5}
          strokeOpacity={0.18}
        />
      ))}

      {/* Cross hairs */}
      <Line x1={CENTER} y1={8} x2={CENTER} y2={RADAR_SIZE - 8} stroke={primaryColor} strokeWidth={0.5} strokeOpacity={0.15} />
      <Line x1={8} y1={CENTER} x2={RADAR_SIZE - 8} y2={CENTER} stroke={primaryColor} strokeWidth={0.5} strokeOpacity={0.15} />

      {/* Hour labels */}
      {slice.map((item, i) => {
        const angle = ((i * angleStep - 90) * Math.PI) / 180;
        const r = CENTER * 0.94;
        const x = CENTER + r * Math.cos(angle);
        const y = CENTER + r * Math.sin(angle);
        const label = item.hour === 0 ? "12a" : item.hour === 12 ? "12p" : item.hour > 12 ? `${item.hour - 12}p` : `${item.hour}a`;
        return (
          <SvgText
            key={i}
            x={x}
            y={y + 4}
            textAnchor="middle"
            fontSize={9}
            fill={primaryColor}
            fillOpacity={0.5}
          >
            {label}
          </SvgText>
        );
      })}

      {/* Precipitation fill polygon */}
      {fillPath ? (
        <Path
          d={fillPath}
          fill="url(#precipGrad)"
          strokeWidth={1.5}
          stroke="#60A5FA"
          strokeOpacity={0.7}
        />
      ) : null}

      {/* Dot points at each hour */}
      {slice.map((item, i) => {
        const angle = ((i * angleStep - 90) * Math.PI) / 180;
        const r = CENTER * 0.85 * (item.precipChance / 100);
        const x = CENTER + r * Math.cos(angle);
        const y = CENTER + r * Math.sin(angle);
        if (item.precipChance < 5) return null;
        return (
          <Circle
            key={i}
            cx={x}
            cy={y}
            r={3.5}
            fill={precipColor(item.precipChance)}
            strokeWidth={1}
            stroke="#fff"
            strokeOpacity={0.4}
          />
        );
      })}

      {/* Center dot */}
      <Circle cx={CENTER} cy={CENTER} r={5} fill={primaryColor} fillOpacity={0.9} />
      <Circle cx={CENTER} cy={CENTER} r={2} fill="#fff" fillOpacity={0.8} />
    </Svg>
  );
}

function PrecipBar({
  chance,
  hour,
  maxChance,
  primaryColor,
}: {
  chance: number;
  hour: number;
  maxChance: number;
  primaryColor: string;
}) {
  const label =
    hour === 0
      ? "12a"
      : hour === 12
      ? "12p"
      : hour > 12
      ? `${hour - 12}p`
      : `${hour}a`;

  const heightPct = maxChance > 0 ? chance / maxChance : 0;

  return (
    <View style={barStyles.col}>
      <View style={barStyles.barWrap}>
        <View
          style={[
            barStyles.bar,
            {
              height: `${Math.max(heightPct * 100, chance > 0 ? 8 : 2)}%`,
              backgroundColor: chance > 0 ? precipColor(chance) : "rgba(148,163,184,0.2)",
            },
          ]}
        />
      </View>
      <Text style={[barStyles.pct, { color: chance >= 30 ? "#60A5FA" : "#94A3B8" }]}>
        {chance > 0 ? `${chance}%` : "—"}
      </Text>
      <Text style={barStyles.label}>{label}</Text>
    </View>
  );
}

const barStyles = StyleSheet.create({
  col: { alignItems: "center", flex: 1 },
  barWrap: { height: 60, width: 10, justifyContent: "flex-end", borderRadius: 5, overflow: "hidden", backgroundColor: "rgba(148,163,184,0.1)" },
  bar: { width: "100%", borderRadius: 5 },
  pct: { fontSize: 9, fontWeight: "600", marginTop: 4 },
  label: { fontSize: 9, color: "#64748B", marginTop: 1 },
});

export default function RadarScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { cityName } = useLocation();
  const { data: weather, isLoading, refetch, isRefetching } = useWeather();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const sweep = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(sweep, {
        toValue: 360,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const hourly = weather?.hourly.slice(0, 12) ?? [];
  const maxChance = Math.max(...hourly.map((h) => h.precipChance), 1);
  const avgPrecip = hourly.length
    ? Math.round(hourly.reduce((s, h) => s + h.precipChance, 0) / hourly.length)
    : 0;
  const peakHour = hourly.reduce(
    (best, h) => (h.precipChance > best.precipChance ? h : best),
    hourly[0] ?? { hour: 0, precipChance: 0 }
  );

  const rainRisk =
    avgPrecip < 20 ? "Low" : avgPrecip < 50 ? "Moderate" : "High";
  const rainRiskColor =
    avgPrecip < 20 ? "#22C55E" : avgPrecip < 50 ? "#F59E0B" : "#EF4444";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 8,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View>
          <Text style={[styles.title, { color: colors.foreground }]}>Radar</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            {cityName} · Next 12 hours
          </Text>
        </View>
        <View
          style={[
            styles.badge,
            { backgroundColor: rainRiskColor + "22", borderColor: rainRiskColor + "55" },
          ]}
        >
          <View style={[styles.dot, { backgroundColor: rainRiskColor }]} />
          <Text style={[styles.badgeText, { color: rainRiskColor }]}>{rainRisk} rain risk</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: bottomPad + 100 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Radar dial */}
        <View style={styles.radarWrap}>
          <View style={[styles.radarCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {isLoading ? (
              <View style={{ width: RADAR_SIZE, height: RADAR_SIZE, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: colors.mutedForeground }}>Loading…</Text>
              </View>
            ) : (
              <RadarDial hourly={hourly} sweep={sweep} primaryColor={colors.primary} />
            )}
            <Text style={[styles.radarLabel, { color: colors.mutedForeground }]}>
              Precipitation probability
            </Text>
          </View>
        </View>

        {/* Summary cards */}
        <View style={styles.summaryRow}>
          {[
            {
              label: "Avg chance",
              value: `${avgPrecip}%`,
              icon: "💧",
            },
            {
              label: "Peak at",
              value: peakHour
                ? peakHour.hour === 0
                  ? "12am"
                  : peakHour.hour === 12
                  ? "12pm"
                  : peakHour.hour > 12
                  ? `${peakHour.hour - 12}pm`
                  : `${peakHour.hour}am`
                : "—",
              icon: "🌧️",
            },
            {
              label: "Current",
              value: `${weather?.current.precipitation ?? 0} mm`,
              icon: "🌂",
            },
          ].map(({ label, value, icon }) => (
            <View
              key={label}
              style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Text style={styles.summaryIcon}>{icon}</Text>
              <Text style={[styles.summaryValue, { color: colors.foreground }]}>{value}</Text>
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Bar chart */}
        <View style={[styles.barCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
            Hourly precipitation chance
          </Text>
          <View style={styles.bars}>
            {hourly.map((h, i) => (
              <PrecipBar
                key={i}
                chance={h.precipChance}
                hour={h.hour}
                maxChance={maxChance}
                primaryColor={colors.primary}
              />
            ))}
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legendRow}>
          {[
            { label: "< 20%", color: "#93C5FD" },
            { label: "20–40%", color: "#60A5FA" },
            { label: "40–60%", color: "#3B82F6" },
            { label: "60–80%", color: "#2563EB" },
            { label: "> 80%", color: "#1D4ED8" },
          ].map(({ label, color }) => (
            <View key={label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: color }]} />
              <Text style={[styles.legendLabel, { color: colors.mutedForeground }]}>{label}</Text>
            </View>
          ))}
        </View>
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
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: { fontSize: 32, fontWeight: "700" },
  subtitle: { fontSize: 14, marginTop: 2 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
  badgeText: { fontSize: 12, fontWeight: "600" },
  radarWrap: { alignItems: "center", paddingTop: 20, paddingHorizontal: 20 },
  radarCard: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  radarLabel: { fontSize: 11, marginTop: 10, letterSpacing: 0.5 },
  summaryRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    marginTop: 14,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    alignItems: "center",
    gap: 4,
  },
  summaryIcon: { fontSize: 22 },
  summaryValue: { fontSize: 17, fontWeight: "700" },
  summaryLabel: { fontSize: 11 },
  barCard: {
    margin: 20,
    marginTop: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
  },
  sectionLabel: { fontSize: 11, fontWeight: "600", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 14 },
  bars: { flexDirection: "row", gap: 2, alignItems: "flex-end" },
  legendRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, paddingHorizontal: 20, paddingBottom: 8, justifyContent: "center" },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 11 },
});
