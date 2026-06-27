import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SEVERITY_CONFIG, type WeatherAlert } from "@/hooks/useAlerts";

interface AlertBannerProps {
  alerts: WeatherAlert[];
  textColor: string;
}

export function AlertBanner({ alerts, textColor }: AlertBannerProps) {
  const router = useRouter();

  if (!alerts || alerts.length === 0) return null;

  // Show the most severe alert first
  const severityOrder: Record<string, number> = {
    Extreme: 0,
    Severe: 1,
    Moderate: 2,
    Minor: 3,
    Unknown: 4,
  };
  const sorted = [...alerts].sort(
    (a, b) =>
      (severityOrder[a.severity] ?? 4) - (severityOrder[b.severity] ?? 4)
  );
  const top = sorted[0];
  const cfg = SEVERITY_CONFIG[top.severity];

  return (
    <TouchableOpacity
      onPress={() => router.push("/(tabs)/alerts")}
      activeOpacity={0.82}
      style={[
        styles.banner,
        {
          backgroundColor: cfg.color + "22",
          borderColor: cfg.color + "55",
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: cfg.color + "33" }]}>
        <Ionicons name="warning" size={18} color={cfg.color} />
      </View>
      <View style={styles.textWrap}>
        <Text style={[styles.event, { color: cfg.color }]} numberOfLines={1}>
          {top.event}
        </Text>
        <Text
          style={[styles.headline, { color: textColor }]}
          numberOfLines={1}
        >
          {top.headline || top.areaDesc || "Tap to view details"}
        </Text>
      </View>
      {alerts.length > 1 && (
        <View style={[styles.countBadge, { backgroundColor: cfg.color }]}>
          <Text style={styles.countText}>{alerts.length}</Text>
        </View>
      )}
      <Ionicons
        name="chevron-forward"
        size={16}
        color={cfg.color}
        style={{ opacity: 0.7 }}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  textWrap: { flex: 1 },
  event: { fontSize: 12, fontWeight: "700", letterSpacing: 0.3 },
  headline: { fontSize: 13, fontWeight: "500", marginTop: 1, opacity: 0.85 },
  countBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  countText: { color: "#fff", fontSize: 11, fontWeight: "700" },
});
