import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, {
  Path,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
  Text as SvgText,
  Line,
} from "react-native-svg";
import { useColors } from "@/hooks/useColors";
import { useUnit } from "@/context/UnitContext";
import type { HourlyItem } from "@/hooks/useWeather";

interface TempChartProps {
  items: HourlyItem[];
}

function fmtHour(h: number): string {
  if (h === 0) return "12am";
  if (h < 12) return `${h}am`;
  if (h === 12) return "12pm";
  return `${h - 12}pm`;
}

function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i];
    const p1 = pts[i + 1];
    const cpx = ((p0.x + p1.x) / 2).toFixed(1);
    d += ` C ${cpx} ${p0.y.toFixed(1)}, ${cpx} ${p1.y.toFixed(1)}, ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
  }
  return d;
}

const VB_W = 340;
const VB_H = 110;
const PAD_L = 8;
const PAD_R = 8;
const PAD_T = 20;
const PAD_B = 22;
const CHART_W = VB_W - PAD_L - PAD_R;
const CHART_H = VB_H - PAD_T - PAD_B;

export function TempChart({ items }: TempChartProps) {
  const colors = useColors();
  const { formatTemp, unit } = useUnit();

  if (items.length < 2) return null;

  const toDisplayTemp = (c: number) =>
    unit === "F" ? Math.round(c * 9 / 5 + 32) : Math.round(c);

  const displayTemps = items.map((h) => toDisplayTemp(h.temp));
  const minT = Math.min(...displayTemps);
  const maxT = Math.max(...displayTemps);
  const range = maxT - minT || 1;

  const toX = (i: number) => PAD_L + (i / (items.length - 1)) * CHART_W;
  const toY = (t: number) => PAD_T + (1 - (t - minT) / range) * CHART_H;

  const pts = displayTemps.map((t, i) => ({ x: toX(i), y: toY(t) }));
  const linePath = smoothPath(pts);
  const lastPt = pts[pts.length - 1];
  const firstPt = pts[0];
  const areaPath =
    linePath +
    ` L ${lastPt.x.toFixed(1)} ${(VB_H - PAD_B).toFixed(1)}` +
    ` L ${firstPt.x.toFixed(1)} ${(VB_H - PAD_B).toFixed(1)} Z`;

  const labelEvery = Math.max(1, Math.floor(items.length / 5));
  const labelIndices = items.reduce<number[]>((acc, _, i) => {
    if (i === 0 || i % labelEvery === 0 || i === items.length - 1) acc.push(i);
    return acc;
  }, []);

  return (
    <View style={styles.container}>
      <Svg
        width="100%"
        height={VB_H}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="none"
      >
        <Defs>
          <SvgGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={colors.primary} stopOpacity="0.35" />
            <Stop offset="100%" stopColor={colors.primary} stopOpacity="0.02" />
          </SvgGradient>
        </Defs>

        <Line
          x1={PAD_L}
          y1={VB_H - PAD_B}
          x2={VB_W - PAD_R}
          y2={VB_H - PAD_B}
          stroke={colors.border}
          strokeWidth="0.5"
        />

        <Path d={areaPath} fill="url(#tempGrad)" />
        <Path
          d={linePath}
          fill="none"
          stroke={colors.primary}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {labelIndices.map((i) => {
          const h = items[i];
          const x = toX(i);
          const y = toY(displayTemps[i]);
          return (
            <React.Fragment key={i}>
              <SvgText
                x={x}
                y={VB_H - 5}
                textAnchor="middle"
                fontSize="11"
                fill={colors.mutedForeground}
              >
                {i === 0 ? "Now" : fmtHour(h.hour)}
              </SvgText>
              <SvgText
                x={x}
                y={y - 5}
                textAnchor="middle"
                fontSize="11"
                fontWeight="600"
                fill={colors.foreground}
              >
                {formatTemp(h.temp)}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
});
