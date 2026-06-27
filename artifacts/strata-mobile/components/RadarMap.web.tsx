import React, { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";

interface RadarMapProps {
  html: string;
}

export function RadarMap({ html }: RadarMapProps) {
  const containerRef = useRef<View>(null);

  useEffect(() => {
    const node = containerRef.current as unknown as HTMLElement | null;
    if (!node) return;

    const iframe = document.createElement("iframe");
    iframe.srcdoc = html;
    iframe.setAttribute("sandbox", "allow-scripts allow-same-origin");
    iframe.style.cssText =
      "border:none;width:100%;height:100%;display:block;flex:1;background:#0F172A;";
    node.appendChild(iframe);

    return () => {
      if (node.contains(iframe)) node.removeChild(iframe);
    };
  }, [html]);

  return <View ref={containerRef} style={styles.container} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
});
