import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { WeatherIcon } from "@/components/WeatherIcon";
import { useColors } from "@/hooks/useColors";
import { type HourlyItem } from "@/hooks/useWeather";

interface Props {
  items: HourlyItem[];
  textColor?: string;
}

function formatHour(hour: number, index: number): string {
  if (index === 0) return "Now";
  if (hour === 0) return "12am";
  if (hour < 12) return `${hour}am`;
  if (hour === 12) return "12pm";
  return `${hour - 12}pm`;
}

function HourCell({
  item,
  index,
  textColor,
}: {
  item: HourlyItem;
  index: number;
  textColor: string;
}) {
  return (
    <View style={styles.cell}>
      <Text style={[styles.hourLabel, { color: textColor, opacity: 0.7 }]}>
        {formatHour(item.hour, index)}
      </Text>
      <WeatherIcon type={item.weatherType} size={22} color={textColor} />
      <Text style={[styles.temp, { color: textColor }]}>{item.temp}°</Text>
      {item.precipChance > 20 && (
        <Text style={[styles.precip, { color: textColor, opacity: 0.6 }]}>
          {item.precipChance}%
        </Text>
      )}
    </View>
  );
}

export function HourlyStrip({ items, textColor = "#FFFFFF" }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
    >
      {items.slice(0, 24).map((item, i) => (
        <HourCell key={item.time} item={item} index={i} textColor={textColor} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 16,
    gap: 4,
  },
  cell: {
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    width: 64,
  },
  hourLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  temp: {
    fontSize: 15,
    fontWeight: "600",
  },
  precip: {
    fontSize: 11,
    fontWeight: "500",
  },
});
