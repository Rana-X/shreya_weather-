import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import { Platform, StyleSheet, Text, TouchableOpacity } from "react-native";

export function HomeBackButton({ tint = "#25A8E4" }: { tint?: string }) {
  const router = useRouter();
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel="Back to Home"
      hitSlop={8}
      activeOpacity={0.7}
      onPress={() => {
        if (Platform.OS !== "web") {
          Haptics.selectionAsync();
        }
        router.navigate("/(tabs)");
      }}
      style={[
        styles.button,
        { backgroundColor: `${tint}14`, borderColor: `${tint}40` },
      ]}
    >
      <Ionicons name="arrow-back" size={16} color={tint} />
      <Text style={[styles.label, { color: tint }]}>Home</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 4,
    paddingLeft: 8,
    paddingRight: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
  },
});
