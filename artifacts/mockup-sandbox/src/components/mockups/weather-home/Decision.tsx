import { useState } from "react";

const WEATHER = {
  temp: 74,
  city: "Austin",
  condition: "Sunny",
  humidity: 52,
  wind: 8,
  high: 79,
  low: 61,
  uv: 6,
  rain: 5,
};

type Activity = {
  emoji: string;
  name: string;
  verdict: "great" | "ok" | "nope";
  reason: string;
};

const ACTIVITIES: Activity[] = [
  { emoji: "🚴", name: "Bike ride", verdict: "great", reason: "Perfect wind & temp" },
  { emoji: "🏊", name: "Swim", verdict: "great", reason: "Hot enough, no rain" },
  { emoji: "⛺️", name: "Camping", verdict: "ok", reason: "UV is a bit high" },
  { emoji: "☂️", name: "Umbrella", verdict: "nope", reason: "Only 5% rain chance" },
  { emoji: "🧥", name: "Heavy coat", verdict: "nope", reason: "It's 74° out!" },
  { emoji: "🧴", name: "Sunscreen", verdict: "great", reason: "UV index is 6" },
];

const VERDICT_COLORS = {
  great: { bg: "#d1fae5", text: "#065f46", border: "#6ee7b7", dot: "#10b981" },
  ok: { bg: "#fef3c7", text: "#92400e", border: "#fcd34d", dot: "#f59e0b" },
  nope: { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5", dot: "#ef4444" },
};

const VERDICT_LABELS = {
  great: "✓ yes",
  ok: "~ maybe",
  nope: "✗ nope",
};

export function Decision() {
  const [selected, setSelected] = useState<number | null>(null);

  const score = Math.round(
    ((100 - WEATHER.humidity) * 0.2 + (100 - WEATHER.wind * 3) * 0.3 + (WEATHER.temp > 60 && WEATHER.temp < 85 ? 100 : 50) * 0.5)
  );

  return (
    <div
      style={{
        width: 390,
        minHeight: 844,
        background: "#f0f9ff",
        fontFamily: "'Inter', sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
        padding: "54px 24px 28px",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute",
          top: -40, right: -40,
          width: 180, height: 180,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.08)",
        }} />
        <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, marginBottom: 4, letterSpacing: 0.5 }}>
          {WEATHER.city} · {WEATHER.temp}°F · {WEATHER.condition}
        </div>

        {/* The Big Verdict */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
          <div style={{
            width: 56, height: 56,
            borderRadius: 16,
            background: "#22c55e",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
            flexShrink: 0,
            boxShadow: "0 4px 16px rgba(34,197,94,0.4)",
          }}>
            ✓
          </div>
          <div>
            <div style={{ color: "#fff", fontSize: 28, fontWeight: 800, lineHeight: 1.1 }}>
              Go outside!
            </div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, marginTop: 2 }}>
              Great weather day
            </div>
          </div>
        </div>

        {/* Score bar */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 500 }}>
              Outdoor score
            </span>
            <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>{score}/100</span>
          </div>
          <div style={{
            height: 6, borderRadius: 99,
            background: "rgba(255,255,255,0.2)",
            overflow: "hidden",
          }}>
            <div style={{
              height: "100%",
              width: `${score}%`,
              borderRadius: 99,
              background: "linear-gradient(90deg, #86efac, #22c55e)",
              transition: "width 0.6s ease",
            }} />
          </div>
        </div>
      </div>

      {/* Activities section */}
      <div style={{ padding: "24px 20px", flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 14 }}>
          Activity checklist
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {ACTIVITIES.map((act, i) => {
            const colors = VERDICT_COLORS[act.verdict];
            const isSelected = selected === i;
            return (
              <button
                key={act.name}
                onClick={() => setSelected(isSelected ? null : i)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 16px",
                  borderRadius: 14,
                  border: `1.5px solid ${isSelected ? colors.border : "#e2e8f0"}`,
                  background: isSelected ? colors.bg : "#fff",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s ease",
                  boxShadow: isSelected ? `0 2px 12px rgba(0,0,0,0.06)` : "none",
                }}
              >
                <span style={{ fontSize: 26, flexShrink: 0 }}>{act.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#1e293b" }}>{act.name}</div>
                  {isSelected && (
                    <div style={{ fontSize: 12, color: colors.text, marginTop: 2, fontWeight: 500 }}>
                      {act.reason}
                    </div>
                  )}
                </div>
                <div style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: colors.text,
                  background: colors.bg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 99,
                  padding: "3px 10px",
                  whiteSpace: "nowrap",
                }}>
                  {VERDICT_LABELS[act.verdict]}
                </div>
              </button>
            );
          })}
        </div>

        {/* Quick stats row at bottom */}
        <div style={{
          marginTop: 24,
          padding: "14px 16px",
          borderRadius: 14,
          background: "#fff",
          border: "1.5px solid #e2e8f0",
          display: "flex",
          justifyContent: "space-between",
        }}>
          {[
            { icon: "🌡️", val: `${WEATHER.high}°/${WEATHER.low}°`, label: "Range" },
            { icon: "💧", val: `${WEATHER.humidity}%`, label: "Humidity" },
            { icon: "🌞", val: `UV ${WEATHER.uv}`, label: "Index" },
            { icon: "🌧️", val: `${WEATHER.rain}%`, label: "Rain" },
          ].map(({ icon, val, label }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 18 }}>{icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginTop: 2 }}>{val}</div>
              <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
