import { useEffect, useState, useRef, useCallback } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { Loader2, Play, Pause } from "lucide-react";
import "leaflet/dist/leaflet.css";

interface RadarFrame {
  time: number;
  path: string;
}

interface Props {
  lat: number;
  lon: number;
}

// Pre-creates all radar tile layers at opacity 0, then just toggles opacity
// between frames — no layer removal during animation, so there's no blank gap.
function RadarLayer({
  frames,
  frameIndex,
}: {
  frames: RadarFrame[];
  frameIndex: number;
}) {
  const map = useMap();
  const layersRef = useRef<any[]>([]);
  const prevIndexRef = useRef<number>(-1);

  // Build all layers once when frames arrive
  useEffect(() => {
    if (!frames.length) return;
    const L = (window as any).L;

    layersRef.current.forEach((l) => { try { map.removeLayer(l); } catch {} });
    layersRef.current = [];

    frames.forEach((frame) => {
      const layer = L.tileLayer(
        `https://tilecache.rainviewer.com${frame.path}/256/{z}/{x}/{y}/6/1_1.png`,
        { opacity: 0, attribution: "RainViewer" }
      );
      layer.addTo(map);
      layersRef.current.push(layer);
    });

    // Show the most-recent frame right away
    const last = frames.length - 1;
    layersRef.current[last]?.setOpacity(0.7);
    prevIndexRef.current = last;

    return () => {
      layersRef.current.forEach((l) => { try { map.removeLayer(l); } catch {} });
      layersRef.current = [];
    };
  }, [frames]);

  // Swap opacity — no layer creation, instant switch
  useEffect(() => {
    if (!layersRef.current.length) return;
    const prev = prevIndexRef.current;
    if (prev >= 0 && prev < layersRef.current.length) {
      layersRef.current[prev].setOpacity(0);
    }
    layersRef.current[frameIndex]?.setOpacity(0.7);
    prevIndexRef.current = frameIndex;
  }, [frameIndex]);

  return null;
}

const FRAME_MS = 500; // ms per radar frame
const PAUSE_AT_END_MS = 1200; // linger on the most-recent frame before looping

export function WeatherRadar({ lat, lon }: Props) {
  const [frames, setFrames] = useState<RadarFrame[]>([]);
  const [frameIndex, setFrameIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [radarLoading, setRadarLoading] = useState(true);
  const animRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLastFrame = frameIndex === frames.length - 1;

  // Fetch frame list once
  useEffect(() => {
    fetch("https://api.rainviewer.com/public/weather-maps.json")
      .then((r) => r.json())
      .then((data) => {
        const past: RadarFrame[] = data.radar?.past ?? [];
        setFrames(past);
        setFrameIndex(past.length > 0 ? past.length - 1 : 0);
      })
      .catch(() => {})
      .finally(() => setRadarLoading(false));
  }, []);

  // Auto-start animation after a short preload delay
  useEffect(() => {
    if (!frames.length || radarLoading) return;
    const t = setTimeout(() => setPlaying(true), 1500);
    return () => clearTimeout(t);
  }, [frames.length, radarLoading]);

  // Animation loop using setTimeout so we can pause longer on the last frame
  const scheduleNext = useCallback(
    (currentIndex: number) => {
      const isLast = currentIndex === frames.length - 1;
      const delay = isLast ? PAUSE_AT_END_MS : FRAME_MS;
      animRef.current = setTimeout(() => {
        const next = (currentIndex + 1) % frames.length;
        setFrameIndex(next);
        scheduleNext(next);
      }, delay);
    },
    [frames.length]
  );

  useEffect(() => {
    if (!frames.length) return;
    if (playing) {
      scheduleNext(frameIndex);
    } else {
      if (animRef.current) clearTimeout(animRef.current);
    }
    return () => { if (animRef.current) clearTimeout(animRef.current); };
  }, [playing, frames.length]);

  const togglePlay = () => setPlaying((p) => !p);

  const goToFrame = (idx: number) => {
    if (animRef.current) clearTimeout(animRef.current);
    setFrameIndex(idx);
    setPlaying(false);
  };

  const frameTime = frames[frameIndex]
    ? new Date(frames[frameIndex].time * 1000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  const progress = frames.length > 1 ? frameIndex / (frames.length - 1) : 1;

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2">
          <h3 className="font-display font-bold text-foreground text-base">Live Radar</h3>
          {playing && !radarLoading && (
            <span className="flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {frameTime && (
            <span className="text-xs tabular-nums text-muted-foreground font-medium">
              {isLastFrame ? (
                <span className="text-primary font-semibold">Now · {frameTime}</span>
              ) : frameTime}
            </span>
          )}
          {frames.length > 1 && !radarLoading && (
            <button
              onClick={togglePlay}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              {playing ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              {playing ? "Pause" : "Play"}
            </button>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="relative" style={{ height: 280 }}>
        {radarLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/30 z-10">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}
        <MapContainer
          center={[lat, lon]}
          zoom={7}
          style={{ height: "100%", width: "100%" }}
          zoomControl={true}
          attributionControl={true}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />
          {frames.length > 0 && (
            <RadarLayer frames={frames} frameIndex={frameIndex} />
          )}
        </MapContainer>
      </div>

      {/* Radar color key — accessible design */}
      <div className="px-5 pt-4 pb-2 space-y-3">
        {/* Rain intensity — gradient bar with labeled endpoints */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-foreground uppercase tracking-wider">Rain intensity</span>
            <span className="text-[10px] text-muted-foreground">light → extreme</span>
          </div>
          {/* Gradient bar matching RainViewer scheme 6 */}
          <div
            className="w-full h-4 rounded-md border border-black/15"
            style={{
              background: "linear-gradient(to right, #b3f0ff, #00c8ff, #00d800, #ffff00, #ff8800, #ff0000, #cc00cc)",
            }}
            aria-label="Rain intensity scale from light blue (light rain) to purple (extreme rain)"
          />
          {/* Labels below the bar */}
          <div className="flex justify-between mt-1">
            {["Drizzle", "Light", "Moderate", "Heavy", "Intense", "Severe", "Extreme"].map((l) => (
              <span key={l} className="text-[9px] font-medium text-muted-foreground">{l}</span>
            ))}
          </div>
        </div>

        {/* Winter precipitation — distinct shapes + colors + labels */}
        <div>
          <span className="text-[11px] font-bold text-foreground uppercase tracking-wider block mb-1.5">
            Snow &amp; ice
          </span>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Snow — circle (round snowflake-like) */}
            <div className="flex items-center gap-1.5">
              <span
                className="inline-flex items-center justify-center w-5 h-5 rounded-full border-2 border-slate-400 shrink-0"
                style={{ backgroundColor: "#ddefff" }}
                aria-label="Snow"
              >
                <span className="text-[8px] font-black text-slate-600">❄</span>
              </span>
              <span className="text-[11px] font-semibold text-foreground">Snow</span>
            </div>
            {/* Sleet — diamond shape */}
            <div className="flex items-center gap-1.5">
              <span
                className="inline-block w-4 h-4 shrink-0 border-2 border-slate-500 rotate-45"
                style={{ backgroundColor: "#7ab0d8" }}
                aria-label="Sleet"
              />
              <span className="text-[11px] font-semibold text-foreground">Sleet</span>
            </div>
            {/* Mix — half-circle / semi pattern */}
            <div className="flex items-center gap-1.5">
              <span
                className="inline-block w-5 h-5 shrink-0 border-2 border-purple-400"
                style={{
                  backgroundColor: "#9888cc",
                  borderRadius: "50% 50% 50% 0",
                  transform: "rotate(-45deg)",
                }}
                aria-label="Mixed precipitation"
              />
              <span className="text-[11px] font-semibold text-foreground">Mix</span>
            </div>
            {/* Hail — hexagon-ish (pentagon via border-radius trick) */}
            <div className="flex items-center gap-1.5">
              <span
                className="inline-block w-5 h-5 shrink-0 border-2 border-purple-700"
                style={{
                  backgroundColor: "#5c1f8a",
                  borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
                }}
                aria-label="Hail"
              />
              <span className="text-[11px] font-semibold text-foreground">Hail</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar + scrubber dots */}
      <div className="px-5 py-3 border-t border-border space-y-2">
        {/* Continuous progress bar */}
        {frames.length > 1 && (
          <div className="w-full h-1 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Radar by RainViewer</p>
          {/* Frame dots — clicking scrubs to that frame */}
          {frames.length > 1 && (
            <div className="flex items-center gap-1">
              {frames.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToFrame(i)}
                  title={new Date(frames[i].time * 1000).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  className={`rounded-full transition-all duration-150 ${
                    i === frameIndex
                      ? "bg-primary w-3 h-2"
                      : "bg-border w-2 h-2 hover:bg-muted-foreground"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
