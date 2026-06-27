const WEATHER = {
  temp: 74,
  feels: 71,
  city: "Austin",
  state: "TX",
  condition: "Sunny",
  humidity: 52,
  wind: 8,
  high: 79,
  low: 61,
  dayOfWeek: "Saturday",
  month: "June",
  day: 27,
};

const HOURLY = [
  { time: "Now", temp: 74, icon: "☀️", desc: "bright sun" },
  { time: "3 PM", temp: 79, icon: "🌤", desc: "a cloud or two" },
  { time: "6 PM", temp: 73, icon: "🌇", desc: "golden hour" },
  { time: "9 PM", temp: 66, icon: "🌙", desc: "clear & cool" },
  { time: "Mid", temp: 63, icon: "⭐", desc: "starry night" },
];

function sensoryDesc(temp: number, humidity: number, wind: number) {
  const parts: string[] = [];
  if (temp >= 75) parts.push("warm");
  else if (temp >= 65) parts.push("comfortable");
  else parts.push("cool");

  if (wind >= 15) parts.push("and pretty breezy");
  else if (wind >= 8) parts.push("with a gentle breeze");
  else parts.push("with calm air");

  if (humidity >= 70) parts.push("— a bit muggy");
  else if (humidity <= 40) parts.push("— nice and dry");

  return parts.join(" ");
}

export function Letter() {
  const desc = sensoryDesc(WEATHER.temp, WEATHER.humidity, WEATHER.wind);

  return (
    <div
      style={{
        width: 390,
        minHeight: 844,
        background: "#fafaf7",
        fontFamily: "'Georgia', 'Times New Roman', serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&display=swap');
      `}</style>

      {/* Envelope-flap header */}
      <div style={{
        background: "#25A8E4",
        padding: "52px 28px 24px",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: "100%",
          backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 12px)",
        }} />
        <div style={{ position: "relative" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(255,255,255,0.2)",
            borderRadius: 99,
            padding: "4px 14px",
            marginBottom: 12,
          }}>
            <span style={{ fontSize: 14 }}>☀️</span>
            <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 12, fontWeight: 600, letterSpacing: 0.5 }}>
              Today's Weather
            </span>
          </div>
          <h2 style={{
            margin: 0,
            color: "#fff",
            fontFamily: "'Lora', Georgia, serif",
            fontSize: 26,
            fontWeight: 600,
            lineHeight: 1.25,
          }}>
            {WEATHER.dayOfWeek}, {WEATHER.month} {WEATHER.day}
          </h2>
          <p style={{
            margin: "4px 0 0",
            color: "rgba(255,255,255,0.75)",
            fontSize: 14,
            fontFamily: "'Inter', sans-serif",
          }}>
            {WEATHER.city}, {WEATHER.state}
          </p>
        </div>
      </div>

      {/* Letter body */}
      <div style={{
        flex: 1,
        padding: "28px 28px 32px",
        display: "flex",
        flexDirection: "column",
        gap: 0,
      }}>

        {/* Drop cap greeting */}
        <div style={{
          fontSize: 15,
          lineHeight: 1.75,
          color: "#2d3748",
          fontFamily: "'Lora', Georgia, serif",
          marginBottom: 20,
        }}>
          <span style={{
            float: "left",
            fontSize: 52,
            lineHeight: 0.75,
            paddingTop: 10,
            paddingRight: 8,
            paddingBottom: 4,
            color: "#25A8E4",
            fontWeight: 600,
          }}>H</span>
          ey there! It's going to be a{" "}
          <em>{desc}</em> day in {WEATHER.city}.
          The temperature will reach a high of{" "}
          <strong style={{ color: "#1a202c" }}>{WEATHER.high}°</strong> this afternoon,
          then cool down to a comfortable{" "}
          <strong style={{ color: "#1a202c" }}>{WEATHER.low}°</strong> overnight.
        </div>

        {/* Separator */}
        <div style={{
          borderTop: "1px solid #e2e8f0",
          marginBottom: 22,
        }} />

        {/* Narrative timeline */}
        <div style={{
          fontSize: 12,
          fontWeight: 700,
          color: "#94a3b8",
          letterSpacing: 1.5,
          textTransform: "uppercase",
          fontFamily: "'Inter', sans-serif",
          marginBottom: 14,
        }}>
          Your day, hour by hour
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {HOURLY.map((h, i) => (
            <div key={h.time} style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 16,
              paddingBottom: i < HOURLY.length - 1 ? 18 : 0,
              position: "relative",
            }}>
              {/* Timeline line */}
              {i < HOURLY.length - 1 && (
                <div style={{
                  position: "absolute",
                  left: 19,
                  top: 26,
                  bottom: 0,
                  width: 1,
                  background: "#e2e8f0",
                }} />
              )}
              {/* Icon dot */}
              <div style={{
                width: 38, height: 38,
                borderRadius: "50%",
                background: "#f0f9ff",
                border: "1.5px solid #bae6fd",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                flexShrink: 0,
                zIndex: 1,
              }}>
                {h.icon}
              </div>
              {/* Content */}
              <div style={{ paddingTop: 6 }}>
                <div style={{
                  fontSize: 13,
                  fontFamily: "'Inter', sans-serif",
                  color: "#94a3b8",
                  fontWeight: 500,
                  marginBottom: 1,
                }}>
                  {h.time}
                </div>
                <div style={{
                  fontSize: 15,
                  fontFamily: "'Lora', Georgia, serif",
                  color: "#1e293b",
                }}>
                  {h.temp}° — <em style={{ color: "#475569" }}>{h.desc}</em>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sign-off */}
        <div style={{
          marginTop: "auto",
          paddingTop: 28,
          borderTop: "1px solid #e2e8f0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}>
          <div style={{
            fontFamily: "'Lora', Georgia, serif",
            fontStyle: "italic",
            color: "#94a3b8",
            fontSize: 13,
          }}>
            Stay comfortable out there ☀️
          </div>
          <div style={{
            fontFamily: "'Inter', sans-serif",
            color: "#25A8E4",
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: -0.5,
          }}>
            {WEATHER.temp}°
          </div>
        </div>
      </div>
    </div>
  );
}
