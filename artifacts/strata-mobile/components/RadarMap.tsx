import React from "react";
import { StyleSheet } from "react-native";
import { WebView } from "react-native-webview";

interface RadarMapProps {
  html: string;
}

export function RadarMap({ html }: RadarMapProps) {
  return (
    <WebView
      style={styles.map}
      source={{ html }}
      originWhitelist={["*"]}
      javaScriptEnabled
      domStorageEnabled
      allowsInlineMediaPlayback
      mediaPlaybackRequiresUserAction={false}
      scrollEnabled={false}
      bounces={false}
      overScrollMode="never"
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      onError={(e) => console.warn("WebView error", e.nativeEvent)}
    />
  );
}

const styles = StyleSheet.create({
  map: { flex: 1, backgroundColor: "#0F172A" },
});
