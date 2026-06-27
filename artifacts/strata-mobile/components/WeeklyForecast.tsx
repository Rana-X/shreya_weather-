import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { WeatherIcon } from "@/components/WeatherIcon";
import { useColors } from "@/hooks/useColors";
import { type DailyItem } from "@/hooks/useWeather";

interface Props {
  items: DailyItem[];
}

function DayRow({ item }: { item: DailyItem }) {
  const colors = useColors();
  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <Text style={[styles.dayName, { color: colors.foreground, width: 54 }]}>
        {item.dayName}
      </Text>
      <View style={styles.iconWrap}>
        <WeatherIcon type={item.weatherType} size={20} color={colors.primary} />
        {item.precipChance > 20 && (
          <Text style={[styles.precip, { color: colors.primary }]}>
            {item.precipChance}%
          </Text>
        )}
      </View>
      <View style={styles.temps}>
        <Text style={[styles.high, { color: colors.foreground }]}>
          {item.high}°
        </Text>
        <Text style={[styles.low, { color: colors.mutedForeground }]}>
          {item.low}°
        </Text>
      </View>
    </View>
  );
}

export function WeeklyForecast({ items }: Props) {
  const colors = useColors();
  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderRadius: 16, borderColor: colors.border, borderWidth: 1 }]}>
      {items.map((item) => (
        <DayRow key={item.date} item={item} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dayName: {
    fontSize: 15,
    fontWeight: "500",
  },
  iconWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  precip: {
    fontSize: 12,
    fontWeight: "500",
  },
  temps: {
    flexDirection: "row",
    gap: 10,
    minWidth: 72,
    justifyContent: "flex-end",
  },
  high: {
    fontSize: 15,
    fontWeight: "600",
  },
  low: {
    fontSize: 15,
    fontWeight: "400",
  },
});
