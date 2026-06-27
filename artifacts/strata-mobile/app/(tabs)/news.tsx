import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import React from "react";
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
import { useColors } from "@/hooks/useColors";
import { useNews, type NewsArticle } from "@/hooks/useNews";

function timeAgo(pubDate: string): string {
  if (!pubDate) return "";
  try {
    const d = new Date(pubDate);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
    return `${Math.round(diff / 86400)}d ago`;
  } catch {
    return "";
  }
}

function categoryEmoji(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("storm") || t.includes("thunder") || t.includes("lightning")) return "⛈️";
  if (t.includes("snow") || t.includes("blizzard") || t.includes("ice")) return "🌨️";
  if (t.includes("rain") || t.includes("flood") || t.includes("wet")) return "🌧️";
  if (t.includes("heat") || t.includes("hot") || t.includes("sunny")) return "☀️";
  if (t.includes("wind") || t.includes("tornado") || t.includes("hurricane")) return "🌀";
  if (t.includes("fog") || t.includes("mist")) return "🌫️";
  if (t.includes("cold") || t.includes("frost") || t.includes("freeze")) return "🥶";
  return "📰";
}

function NewsCard({
  item,
  colors,
  bottomPad,
}: {
  item: NewsArticle;
  colors: ReturnType<typeof useColors>;
  bottomPad: number;
}) {
  const emoji = categoryEmoji(item.title);
  const ago = timeAgo(item.pubDate);

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={() => {
        if (item.url) Linking.openURL(item.url);
      }}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={styles.cardTop}>
        <View style={[styles.emojiWrap, { backgroundColor: colors.muted }]}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
        <View style={styles.cardMeta}>
          {item.source ? (
            <Text style={[styles.source, { color: colors.primary }]} numberOfLines={1}>
              {item.source}
            </Text>
          ) : null}
          {ago ? (
            <Text style={[styles.ago, { color: colors.mutedForeground }]}>{ago}</Text>
          ) : null}
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} style={{ opacity: 0.5 }} />
      </View>

      <Text style={[styles.headline, { color: colors.foreground }]} numberOfLines={3}>
        {item.title}
      </Text>

      {item.description ? (
        <Text style={[styles.description, { color: colors.mutedForeground }]} numberOfLines={2}>
          {item.description}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

export default function NewsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data, isLoading, isRefetching, refetch, error } = useNews();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

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
          <Text style={[styles.title, { color: colors.foreground }]}>Weather News</Text>
          {data?.city ? (
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              {data.city}{data.region ? `, ${data.region}` : ""}
            </Text>
          ) : null}
        </View>
        <View style={[styles.liveBadge, { backgroundColor: colors.primary + "18", borderColor: colors.primary + "40" }]}>
          <View style={[styles.liveDot, { backgroundColor: colors.primary }]} />
          <Text style={[styles.liveText, { color: colors.primary }]}>Live</Text>
        </View>
      </View>

      <FlatList<NewsArticle>
        data={data?.articles ?? []}
        keyExtractor={(item, i) => `${i}-${item.title}`}
        renderItem={({ item }) => (
          <NewsCard item={item} colors={colors} bottomPad={bottomPad} />
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
          !data?.articles?.length && styles.emptyFlex,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 60 }} />
          ) : error ? (
            <View style={styles.empty}>
              <Ionicons name="cloud-offline-outline" size={54} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Couldn't load news</Text>
              <Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>
                Pull down to try again.
              </Text>
            </View>
          ) : (
            <View style={styles.empty}>
              <Ionicons name="newspaper-outline" size={54} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No news yet</Text>
              <Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>
                Weather news for your area will appear here.
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
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3 },
  liveText: { fontSize: 12, fontWeight: "600" },
  list: { padding: 16, gap: 12 },
  emptyFlex: { flexGrow: 1 },
  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  emojiWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: { fontSize: 20 },
  cardMeta: { flex: 1 },
  source: { fontSize: 12, fontWeight: "600" },
  ago: { fontSize: 11, marginTop: 1 },
  headline: { fontSize: 16, fontWeight: "600", lineHeight: 22 },
  description: { fontSize: 13, lineHeight: 19 },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 12,
  },
  emptyTitle: { fontSize: 20, fontWeight: "600", textAlign: "center" },
  emptyBody: { fontSize: 15, textAlign: "center", lineHeight: 22 },
});
