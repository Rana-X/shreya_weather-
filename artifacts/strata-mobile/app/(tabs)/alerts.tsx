import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  SEVERITY_CONFIG,
  useAlerts,
  type WeatherAlert,
} from "@/hooks/useAlerts";
import { useColors } from "@/hooks/useColors";
import { HomeBackButton } from "@/components/HomeBackButton";
import { useLocation } from "@/context/LocationContext";

function timeLabel(iso: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function AlertCard({
  alert,
  colors,
}: {
  alert: WeatherAlert;
  colors: ReturnType<typeof useColors>;
}) {
  const [expanded, setExpanded] = useState(false);
  const cfg = SEVERITY_CONFIG[alert.severity];

  return (
    <TouchableOpacity
      onPress={() => setExpanded((e) => !e)}
      activeOpacity={0.8}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: cfg.border,
          borderLeftColor: cfg.color,
        },
      ]}
    >
      {/* Top row */}
      <View style={styles.cardTop}>
        <View
          style={[styles.severityBadge, { backgroundColor: cfg.bg, borderColor: cfg.border }]}
        >
          <Ionicons name="warning" size={12} color={cfg.color} />
          <Text style={[styles.severityText, { color: cfg.color }]}>
            {cfg.label}
          </Text>
        </View>
        <Text style={[styles.urgency, { color: colors.mutedForeground }]}>
          {alert.urgency !== "Unknown" ? alert.urgency : ""}
        </Text>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={16}
          color={colors.mutedForeground}
          style={{ opacity: 0.5 }}
        />
      </View>

      {/* Event title */}
      <Text style={[styles.event, { color: colors.foreground }]}>
        {alert.event}
      </Text>

      {/* Area */}
      {alert.areaDesc ? (
        <Text style={[styles.area, { color: colors.mutedForeground }]} numberOfLines={expanded ? undefined : 1}>
          📍 {alert.areaDesc}
        </Text>
      ) : null}

      {/* Expanded body */}
      {expanded && (
        <>
          {alert.headline ? (
            <Text style={[styles.headline, { color: colors.foreground }]}>
              {alert.headline}
            </Text>
          ) : null}

          {alert.description ? (
            <View style={[styles.descBox, { backgroundColor: colors.muted }]}>
              <Text style={[styles.descText, { color: colors.foreground }]}>
                {alert.description}
              </Text>
            </View>
          ) : null}

          {alert.instruction ? (
            <View style={[styles.instructBox, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
              <Text style={[styles.instructLabel, { color: cfg.color }]}>
                ⚡ What to do
              </Text>
              <Text style={[styles.instructText, { color: colors.foreground }]}>
                {alert.instruction}
              </Text>
            </View>
          ) : null}

          <View style={styles.timeRow}>
            {alert.effective ? (
              <Text style={[styles.timeText, { color: colors.mutedForeground }]}>
                Issued: {timeLabel(alert.effective)}
              </Text>
            ) : null}
            {alert.expires ? (
              <Text style={[styles.timeText, { color: colors.mutedForeground }]}>
                Expires: {timeLabel(alert.expires)}
              </Text>
            ) : null}
          </View>
        </>
      )}
    </TouchableOpacity>
  );
}

export default function AlertsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { cityName } = useLocation();
  const { data, isLoading, isRefetching, refetch, error } = useAlerts();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const alerts = data?.alerts ?? [];
  const hasAlerts = alerts.length > 0;

  // Most severe first
  const severityOrder: Record<string, number> = {
    Extreme: 0, Severe: 1, Moderate: 2, Minor: 3, Unknown: 4,
  };
  const sorted = [...alerts].sort(
    (a, b) => (severityOrder[a.severity] ?? 4) - (severityOrder[b.severity] ?? 4)
  );

  const worstSeverity = sorted[0]?.severity ?? "Unknown";
  const cfg = SEVERITY_CONFIG[worstSeverity];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
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
          <HomeBackButton tint={colors.primary} />
          <Text style={[styles.title, { color: colors.foreground }]}>
            Alerts
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            {cityName}
          </Text>
        </View>
        {hasAlerts && (
          <View
            style={[
              styles.countBadge,
              { backgroundColor: cfg.color + "18", borderColor: cfg.color + "40" },
            ]}
          >
            <Ionicons name="warning" size={14} color={cfg.color} />
            <Text style={[styles.countText, { color: cfg.color }]}>
              {alerts.length} active
            </Text>
          </View>
        )}
      </View>

      <FlatList<WeatherAlert>
        data={sorted}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <AlertCard alert={item} colors={colors} />}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={[
          styles.list,
          { paddingBottom: bottomPad + 100 },
          sorted.length === 0 && styles.emptyFlex,
        ]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          hasAlerts ? (
            <View style={[styles.infoBar, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
              <Ionicons name="information-circle" size={16} color={cfg.color} />
              <Text style={[styles.infoText, { color: cfg.color }]}>
                Tap any alert to read the full details and instructions.
              </Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator
              color={colors.primary}
              size="large"
              style={{ marginTop: 60 }}
            />
          ) : error ? (
            <View style={styles.empty}>
              <Ionicons
                name="cloud-offline-outline"
                size={54}
                color={colors.mutedForeground}
              />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                Couldn't load alerts
              </Text>
              <Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>
                Pull down to try again.
              </Text>
            </View>
          ) : (
            <View style={styles.empty}>
              <Text style={styles.clearIcon}>✅</Text>
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                All clear!
              </Text>
              <Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>
                No active weather alerts for your area right now. Stay safe out there!
              </Text>
            </View>
          )
        }
      />
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
  countBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  countText: { fontSize: 13, fontWeight: "700" },
  list: { padding: 16, gap: 12 },
  emptyFlex: { flexGrow: 1 },
  infoBar: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 4,
  },
  infoText: { flex: 1, fontSize: 13, lineHeight: 18 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderLeftWidth: 4,
    padding: 14,
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  severityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
    borderWidth: 1,
  },
  severityText: { fontSize: 11, fontWeight: "700" },
  urgency: { fontSize: 11, fontWeight: "500", flex: 1 },
  event: { fontSize: 17, fontWeight: "700", lineHeight: 22 },
  area: { fontSize: 13, lineHeight: 18 },
  headline: { fontSize: 14, lineHeight: 20, fontWeight: "500" },
  descBox: { borderRadius: 10, padding: 12 },
  descText: { fontSize: 13, lineHeight: 20 },
  instructBox: {
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    gap: 6,
  },
  instructLabel: { fontSize: 12, fontWeight: "700", letterSpacing: 0.3 },
  instructText: { fontSize: 13, lineHeight: 20 },
  timeRow: { gap: 2 },
  timeText: { fontSize: 11 },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 12,
  },
  clearIcon: { fontSize: 54 },
  emptyTitle: { fontSize: 22, fontWeight: "700", textAlign: "center" },
  emptyBody: { fontSize: 15, textAlign: "center", lineHeight: 22 },
});
