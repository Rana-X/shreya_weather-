import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WeatherIcon } from "@/components/WeatherIcon";
import { useColors } from "@/hooks/useColors";
import {
  type CorrectionInput,
  type WeatherType as CorrectionsWeatherType,
} from "@/hooks/useCorrections";
import { WEATHER_LABELS, type WeatherType } from "@/hooks/useWeather";

const WEATHER_TYPES: WeatherType[] = [
  "sunny",
  "cloudy",
  "rainy",
  "stormy",
  "snowy",
  "foggy",
  "windy",
];

interface Props {
  visible: boolean;
  officialWeatherType: WeatherType;
  locationName: string;
  onClose: () => void;
  onSubmit: (input: CorrectionInput) => Promise<void>;
}

export function SubmitCorrectionSheet({
  visible,
  officialWeatherType,
  locationName,
  onClose,
  onSubmit,
}: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<WeatherType | null>(null);
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleClose = () => {
    setSelected(null);
    setDescription("");
    setError("");
    onClose();
  };

  const handleSubmit = async () => {
    if (!selected) {
      setError("Please pick what you see outside!");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      await onSubmit({
        actualWeatherType: selected as CorrectionsWeatherType,
        officialWeatherType: officialWeatherType as CorrectionsWeatherType,
        description: description.trim() || undefined,
        locationName: locationName || undefined,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      handleClose();
    } catch {
      setError("Couldn't send your report. Try again!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.backdrop} onPress={handleClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.card,
              paddingBottom: insets.bottom + 16,
            },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          <Text style={[styles.title, { color: colors.foreground }]}>
            What do you see outside?
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            The forecast says{" "}
            <Text style={{ fontWeight: "600" }}>
              {WEATHER_LABELS[officialWeatherType]}
            </Text>
            {" "}in {locationName}.
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.typeRow}
          >
            {WEATHER_TYPES.map((type) => {
              const active = selected === type;
              return (
                <TouchableOpacity
                  key={type}
                  onPress={() => {
                    setSelected(type);
                    setError("");
                    Haptics.selectionAsync();
                  }}
                  style={[
                    styles.typeBtn,
                    {
                      backgroundColor: active ? colors.primary : colors.secondary,
                      borderRadius: colors.radius,
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <WeatherIcon
                    type={type}
                    size={24}
                    color={active ? "#FFFFFF" : colors.mutedForeground}
                  />
                  <Text
                    style={[
                      styles.typeBtnLabel,
                      { color: active ? "#FFFFFF" : colors.foreground },
                    ]}
                  >
                    {WEATHER_LABELS[type]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {error ? (
            <Text style={[styles.error, { color: colors.destructive }]}>
              {error}
            </Text>
          ) : null}

          <TextInput
            style={[
              styles.noteInput,
              {
                backgroundColor: colors.secondary,
                color: colors.foreground,
                borderRadius: colors.radius,
                borderColor: colors.border,
              },
            ]}
            placeholder="Add a note (optional)"
            placeholderTextColor={colors.mutedForeground}
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={200}
          />

          <TouchableOpacity
            style={[
              styles.submitBtn,
              {
                backgroundColor: selected ? colors.primary : colors.muted,
                borderRadius: colors.radius,
              },
            ]}
            onPress={handleSubmit}
            activeOpacity={0.8}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text
                style={[
                  styles.submitLabel,
                  { color: selected ? "#FFFFFF" : colors.mutedForeground },
                ]}
              >
                Send Report
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  keyboardView: {
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingTop: 12,
    gap: 14,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  typeRow: {
    gap: 8,
    paddingHorizontal: 2,
  },
  typeBtn: {
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 4,
    minWidth: 80,
  },
  typeBtnLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  error: {
    fontSize: 13,
    fontWeight: "500",
  },
  noteInput: {
    padding: 12,
    fontSize: 15,
    minHeight: 72,
    textAlignVertical: "top",
    borderWidth: 1,
  },
  submitBtn: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  submitLabel: {
    fontSize: 16,
    fontWeight: "700",
  },
});
