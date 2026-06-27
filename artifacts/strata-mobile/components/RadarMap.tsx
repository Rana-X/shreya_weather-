import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { StyleSheet } from "react-native";
import { WebView } from "react-native-webview";

export interface RadarMapHandle {
  /** Push a new location into the already-loaded map without reloading it. */
  setLocation: (lat: number, lon: number) => void;
}

interface RadarMapProps {
  html: string;
}

export const RadarMap = forwardRef<RadarMapHandle, RadarMapProps>(
  function RadarMap({ html }, ref) {
    const webRef = useRef<WebView>(null);

    useImperativeHandle(
      ref,
      () => ({
        setLocation(lat: number, lon: number) {
          webRef.current?.injectJavaScript(
            `window.__setLocation && window.__setLocation(${lat}, ${lon}); true;`,
          );
        },
      }),
      [],
    );

    return (
      <WebView
        ref={webRef}
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
        androidLayerType="hardware"
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        onError={(e) => console.warn("WebView error", e.nativeEvent)}
      />
    );
  },
);

const styles = StyleSheet.create({
  map: { flex: 1, backgroundColor: "#0F172A" },
});
