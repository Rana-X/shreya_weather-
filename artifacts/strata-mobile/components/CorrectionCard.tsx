import * as Haptics from "expo-haptics";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WeatherIcon } from "@/components/WeatherIcon";
import { useColors } from "@/hooks/useColors";
import {
  type Correction,
  type WeatherType,
} from "@/hooks/useCorrections";
import { WEATHER_LABELS } from "@/hooks/useWeather";

interface Props {
  item: Correction;
  onAgree: (id: number) => void;
  isAgreeing?: boolean;
}

function timeAgo(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function CorrectionCard({ item, onAgree, isAgreeing }: Props) {
  const colors = useColors();

  const handleAgree = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onAgree(item.id);
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderRadius: colors.radius,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.weather}>
          <View style={styles.typeRow}>
            <WeatherIcon type={item.actualWeatherType as WeatherType} size={18} color={colors.primary} />
            <Text style={[styles.typeLabel, { color: colors.foreground }]}>
              {WEATHER_LABELS[item.actualWeatherType as WeatherType] ?? item.actualWeatherType}
            </Text>
          </View>
          <Text style={[styles.vs, { color: colors.mutedForeground }]}>
            vs official:{" "}
            <Text style={{ color: colors.mutedForeground }}>
              {WEATHER_LABELS[item.officialWeatherType as WeatherType] ?? item.officialWeatherType}
            </Text>
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleAgree}
          style={[
            styles.agreeBtn,
            { backgroundColor: colors.secondary },
          ]}
          activeOpacity={0.7}
        >
          {isAgreeing ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <>
              <Text style={styles.thumbs}>👍</Text>
              <Text style={[styles.agreeCount, { color: colors.primary }]}>
                {item.agrees}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {item.description ? (
        <Text style={[styles.desc, { color: colors.foreground }]}>
          "{item.description}"
        </Text>
      ) : null}

      <View style={styles.footer}>
        <Text style={[styles.meta, { color: colors.mutedForeground }]}>
          {item.locationName ?? "Nearby"} · {timeAgo(item.createdAt)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderWidth: 1,
    marginHorizontal: 16,
    marginVertical: 5,
    gap: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  weather: {
    gap: 3,
    flex: 1,
  },
  typeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  typeLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  vs: {
    fontSize: 12,
    marginLeft: 24,
  },
  agreeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    minWidth: 52,
    justifyContent: "center",
  },
  thumbs: {
    fontSize: 14,
  },
  agreeCount: {
    fontSize: 14,
    fontWeight: "600",
  },
  desc: {
    fontSize: 14,
    fontStyle: "italic",
    lineHeight: 20,
  },
  footer: {
    flexDirection: "row",
  },
  meta: {
    fontSize: 12,
  },
});
