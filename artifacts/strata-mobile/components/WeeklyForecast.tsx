import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { WeatherIcon } from "@/components/WeatherIcon";
import { useColors } from "@/hooks/useColors";
import { useUnit } from "@/context/UnitContext";
import { type DailyItem } from "@/hooks/useWeather";

interface Props {
  items: DailyItem[];
}

function DayRow({
  item,
  globalMin,
  globalMax,
}: {
  item: DailyItem;
  globalMin: number;
  globalMax: number;
}) {
  const colors = useColors();
  const { formatTemp } = useUnit();

  const totalRange = globalMax - globalMin;
  const leftPct = totalRange > 0 ? ((item.low - globalMin) / totalRange) * 100 : 0;
  const widthPct = totalRange > 0 ? ((item.high - item.low) / totalRange) * 100 : 100;

  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]}>
      <Text style={[styles.dayName, { color: colors.foreground }]}>
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

      <View style={[styles.rangeTrack, { backgroundColor: colors.secondary }]}>
        <View
          style={[
            styles.rangeBar,
            {
              backgroundColor: colors.primary,
              marginLeft: `${leftPct}%` as unknown as number,
              width: `${Math.max(widthPct, 8)}%` as unknown as number,
            },
          ]}
        />
      </View>

      <View style={styles.temps}>
        <Text style={[styles.low, { color: colors.mutedForeground }]}>
          {formatTemp(item.low)}
        </Text>
        <Text style={[styles.high, { color: colors.foreground }]}>
          {formatTemp(item.high)}
        </Text>
      </View>
    </View>
  );
}

export function WeeklyForecast({ items }: Props) {
  const colors = useColors();

  const allTemps = items.flatMap((i) => [i.low, i.high]);
  const globalMin = Math.min(...allTemps);
  const globalMax = Math.max(...allTemps);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
        },
      ]}
    >
      {items.map((item) => (
        <DayRow
          key={item.date}
          item={item}
          globalMin={globalMin}
          globalMax={globalMax}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    boxShadow: "0 1px 4px rgba(18, 36, 54, 0.07)",
  } as never,
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  dayName: {
    fontSize: 15,
    fontWeight: "500",
    width: 48,
  },
  iconWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    width: 48,
  },
  precip: {
    fontSize: 11,
    fontWeight: "500",
  },
  rangeTrack: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    overflow: "hidden",
    justifyContent: "center",
  },
  rangeBar: {
    height: 5,
    borderRadius: 3,
  },
  temps: {
    flexDirection: "row",
    gap: 8,
    width: 84,
    justifyContent: "flex-end",
  },
  low: {
    fontSize: 14,
    fontWeight: "400",
    textAlign: "right",
  },
  high: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "right",
    minWidth: 34,
  },
});
