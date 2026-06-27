import { useState, useEffect } from "react";

const WEATHER = {
  temp: 74,
  feels: 71,
  city: "Austin",
  condition: "Sunny",
  humidity: 52,
  wind: 8,
  high: 79,
  low: 61,
  time: "2:17 PM",
};

const sunStyle: React.CSSProperties = {
  position: "absolute",
  top: "12%",
  right: "18%",
  width: 120,
  height: 120,
  borderRadius: "50%",
  background: "radial-gradient(circle, #fff9c4 0%, #ffe066 40%, #ffb300 70%, transparent 100%)",
  boxShadow: "0 0 60px 30px rgba(255,220,50,0.35), 0 0 120px 60px rgba(255,180,0,0.18)",
  animation: "pulse 4s ease-in-out infinite",
};

const glowRing = (size: number, opacity: number, delay: string): React.CSSProperties => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%,-50%)",
  width: size,
  height: size,
  borderRadius: "50%",
  border: `1px solid rgba(255,230,100,${opacity})`,
  animation: `expand 3s ease-out infinite`,
  animationDelay: delay,
});

const cloudStyle = (top: string, left: string, scale: number, opacity: number): React.CSSProperties => ({
  position: "absolute",
  top,
  left,
  width: 90 * scale,
  height: 36 * scale,
  background: "rgba(255,255,255,0.65)",
  borderRadius: 50,
  filter: "blur(2px)",
  opacity,
});

export function Ambient() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 50);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      style={{
        width: 390,
        minHeight: 844,
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(170deg, #1a6fa8 0%, #3db8f5 35%, #85d4f5 60%, #fce9a0 88%, #f9c74f 100%)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.06); opacity: 0.92; }
        }
        @keyframes expand {
          0% { transform: translate(-50%,-50%) scale(0.8); opacity: 0.6; }
          100% { transform: translate(-50%,-50%) scale(2.2); opacity: 0; }
        }
        @keyframes drift {
          0% { transform: translateX(0px); }
          50% { transform: translateX(12px); }
          100% { transform: translateX(0px); }
        }
      `}</style>

      {/* Sun */}
      <div style={sunStyle}>
        <div style={glowRing(160, 0.3, "0s")} />
        <div style={glowRing(160, 0.2, "1s")} />
        <div style={glowRing(160, 0.15, "2s")} />
      </div>

      {/* Drifting clouds */}
      <div style={{ ...cloudStyle("28%", "-5%", 1.3, 0.45), animation: "drift 7s ease-in-out infinite" }} />
      <div style={{ ...cloudStyle("25%", "6%", 0.9, 0.3), animation: "drift 9s ease-in-out infinite 2s" }} />
      <div style={{ ...cloudStyle("62%", "55%", 1.1, 0.25), animation: "drift 11s ease-in-out infinite 1s" }} />

      {/* Atmospheric haze at bottom */}
      <div style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0,
        height: 280,
        background: "linear-gradient(to top, rgba(249,199,79,0.55) 0%, transparent 100%)",
        pointerEvents: "none",
      }} />

      {/* Top bar */}
      <div style={{
        position: "absolute",
        top: 52, left: 0, right: 0,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 28px",
      }}>
        <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 500, letterSpacing: 1 }}>
          {WEATHER.time}
        </span>
        <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, fontWeight: 600, letterSpacing: 0.5 }}>
          {WEATHER.city}
        </span>
        <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>☀️</span>
      </div>

      {/* Bottom card — the only data surface */}
      <div style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0,
        padding: "32px 28px 48px",
        background: "linear-gradient(to top, rgba(10,30,50,0.72) 0%, transparent 100%)",
        backdropFilter: "blur(4px)",
      }}>
        {/* Sensory headline */}
        <p style={{
          margin: "0 0 4px",
          color: "rgba(255,255,255,0.6)",
          fontSize: 12,
          fontWeight: 500,
          letterSpacing: 2,
          textTransform: "uppercase",
        }}>It feels like</p>
        <h1 style={{
          margin: "0 0 16px",
          color: "#fff",
          fontSize: 48,
          fontWeight: 200,
          lineHeight: 1,
          letterSpacing: -1,
        }}>
          a warm, <br />
          <span style={{ fontWeight: 600 }}>golden afternoon.</span>
        </h1>

        {/* Mini stats — secondary, not hero */}
        <div style={{
          display: "flex",
          gap: 20,
          marginTop: 16,
          paddingTop: 16,
          borderTop: "1px solid rgba(255,255,255,0.15)",
        }}>
          {[
            { v: `${WEATHER.temp}°`, l: "actual" },
            { v: `${WEATHER.high}° / ${WEATHER.low}°`, l: "range" },
            { v: `${WEATHER.wind} mph`, l: "wind" },
          ].map(({ v, l }) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ color: "#fff", fontSize: 16, fontWeight: 500 }}>{v}</div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
