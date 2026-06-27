import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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
import { CorrectionCard } from "@/components/CorrectionCard";
import { SubmitCorrectionSheet } from "@/components/SubmitCorrectionSheet";
import { useColors } from "@/hooks/useColors";
import { useCorrections, type Correction } from "@/hooks/useCorrections";
import { useWeather } from "@/hooks/useWeather";
import { useLocation } from "@/context/LocationContext";

export default function CommunityScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { cityName } = useLocation();
  const { data: corrections, isLoading, refetch, isRefetching, submit, agree } =
    useCorrections();
  const { data: weather } = useWeather();
  const [sheetVisible, setSheetVisible] = useState(false);
  const [agreeingId, setAgreeingId] = useState<number | null>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleAgree = async (id: number) => {
    setAgreeingId(id);
    try {
      await agree.mutateAsync(id);
    } catch {}
    setAgreeingId(null);
  };

  const handleSubmit = async (input: Parameters<typeof submit.mutateAsync>[0]) => {
    await submit.mutateAsync(input);
  };

  const officialWeatherType =
    weather?.current.weatherType ?? "cloudy";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Community
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            {cityName}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.reportBtn, { backgroundColor: colors.primary }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setSheetVisible(true);
          }}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.reportBtnLabel}>Report</Text>
        </TouchableOpacity>
      </View>

      <FlatList<Correction>
        data={corrections ?? []}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <CorrectionCard
            item={item}
            onAgree={handleAgree}
            isAgreeing={agreeingId === item.id}
          />
        )}
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
          (!corrections || corrections.length === 0) && styles.emptyContainer,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color={colors.primary} size="large" />
          ) : (
            <View style={styles.empty}>
              <Ionicons name="cloud-outline" size={56} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                No reports yet
              </Text>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                Be the first to report what the weather is really like in your neighborhood!
              </Text>
            </View>
          )
        }
      />

      <SubmitCorrectionSheet
        visible={sheetVisible}
        officialWeatherType={officialWeatherType}
        locationName={cityName}
        onClose={() => setSheetVisible(false)}
        onSubmit={handleSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "400",
    marginTop: 2,
  },
  reportBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
  },
  reportBtnLabel: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  list: {
    paddingTop: 12,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },
  emptyText: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
});
