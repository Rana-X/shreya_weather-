import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { type CityResult, useLocation } from "@/context/LocationContext";

function CityRow({
  city,
  onSelect,
  onSave,
  onRemove,
  saved,
}: {
  city: CityResult;
  onSelect: (city: CityResult) => void;
  onSave?: (city: CityResult) => void;
  onRemove?: (id: string) => void;
  saved?: boolean;
}) {
  const colors = useColors();
  return (
    <TouchableOpacity
      style={[styles.cityRow, { borderBottomColor: colors.border }]}
      onPress={() => {
        Haptics.selectionAsync();
        onSelect(city);
      }}
      activeOpacity={0.7}
    >
      <View style={styles.cityInfo}>
        <Text style={[styles.cityName, { color: colors.foreground }]}>
          {city.name}
        </Text>
        <Text style={[styles.cityMeta, { color: colors.mutedForeground }]}>
          {city.admin1 ? `${city.admin1}, ` : ""}
          {city.country}
        </Text>
      </View>
      {onSave && !saved && (
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSave(city);
          }}
          hitSlop={8}
        >
          <Ionicons name="bookmark-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      )}
      {onRemove && (
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onRemove(city.id);
          }}
          hitSlop={8}
        >
          <Ionicons name="close-circle" size={22} color={colors.mutedForeground} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    cityName,
    savedLocations,
    searchCities,
    setManualLocation,
    resetToGPS,
    saveLocation,
    removeLocation,
  } = useLocation();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CityResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      const cities = await searchCities(query);
      setResults(cities);
      setIsSearching(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [query, searchCities]);

  const handleSelect = (city: CityResult) => {
    setManualLocation(city);
    setQuery("");
    setResults([]);
  };

  const savedIds = new Set(savedLocations.map((l) => l.id));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Settings</Text>
      </View>

      <FlatList
        data={[]}
        renderItem={null}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: bottomPad + 100 },
        ]}
        ListHeaderComponent={
          <>
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
                LOCATION
              </Text>
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.currentLoc}>
                  <Ionicons name="location" size={16} color={colors.primary} />
                  <Text style={[styles.currentLocText, { color: colors.foreground }]} numberOfLines={1}>
                    {cityName}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      resetToGPS();
                    }}
                    hitSlop={8}
                  >
                    <Ionicons name="navigate" size={18} color={colors.primary} />
                  </TouchableOpacity>
                </View>

                <View style={[styles.searchBox, { backgroundColor: colors.secondary, borderRadius: colors.radius }]}>
                  <Ionicons name="search" size={16} color={colors.mutedForeground} />
                  <TextInput
                    style={[styles.searchInput, { color: colors.foreground }]}
                    placeholder="Search for a city..."
                    placeholderTextColor={colors.mutedForeground}
                    value={query}
                    onChangeText={setQuery}
                    clearButtonMode="while-editing"
                  />
                  {isSearching && <ActivityIndicator size="small" color={colors.primary} />}
                </View>

                {results.length > 0 && (
                  <View style={[styles.resultsList, { borderTopColor: colors.border }]}>
                    {results.map((city) => (
                      <CityRow
                        key={city.id}
                        city={city}
                        onSelect={handleSelect}
                        onSave={saveLocation}
                        saved={savedIds.has(city.id)}
                      />
                    ))}
                  </View>
                )}
              </View>
            </View>

            {savedLocations.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
                  SAVED LOCATIONS
                </Text>
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  {savedLocations.map((city) => (
                    <CityRow
                      key={city.id}
                      city={city}
                      onSelect={handleSelect}
                      onRemove={removeLocation}
                    />
                  ))}
                </View>
              </View>
            )}

            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
                ABOUT
              </Text>
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.aboutRow}>
                  <Text style={[styles.aboutTitle, { color: colors.foreground }]}>WeatherAxis</Text>
                  <Text style={[styles.aboutSub, { color: colors.mutedForeground }]}>
                    Your local weather app — where neighbors help each other know what it's really like outside!
                  </Text>
                  <Text style={[styles.aboutVersion, { color: colors.mutedForeground }]}>
                    Version 1.0 · Weather by Open-Meteo
                  </Text>
                </View>
              </View>
            </View>
          </>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginTop: 8,
  },
  content: {
    paddingHorizontal: 16,
    gap: 20,
    paddingTop: 8,
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    marginLeft: 4,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  currentLoc: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 14,
  },
  currentLocText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    margin: 12,
    marginTop: 0,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  resultsList: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  cityRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  cityInfo: {
    flex: 1,
    gap: 2,
  },
  cityName: {
    fontSize: 15,
    fontWeight: "500",
  },
  cityMeta: {
    fontSize: 12,
  },
  aboutRow: {
    padding: 16,
    gap: 8,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  aboutSub: {
    fontSize: 14,
    lineHeight: 20,
  },
  aboutVersion: {
    fontSize: 12,
    marginTop: 4,
  },
});
