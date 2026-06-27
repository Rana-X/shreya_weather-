import { useEffect, useState, useRef, useCallback } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { Loader2, Play, Pause, Wind, Thermometer, CloudRain, MapPin } from "lucide-react";
import "leaflet/dist/leaflet.css";

interface RadarFrame {
  time: number;
  path: string;
}

interface Props {
  lat: number;
  lon: number;
  locationName?: string;
}

type Layer = "rain" | "wind" | "temperature";

const LAYERS: { id: Layer; label: string; icon: typeof CloudRain }[] = [
  { id: "rain",        label: "Rain",        icon: CloudRain   },
  { id: "wind",        label: "Wind",        icon: Wind        },
  { id: "temperature", label: "Temperature", icon: Thermometer },
];

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

    const last = frames.length - 1;
    layersRef.current[last]?.setOpacity(0.7);
    prevIndexRef.current = last;

    return () => {
      layersRef.current.forEach((l) => { try { map.removeLayer(l); } catch {} });
      layersRef.current = [];
    };
  }, [frames]);

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

const FRAME_MS = 500;
const PAUSE_AT_END_MS = 1200;

// Flies the map to the given coordinates whenever they change or trigger fires.
function MapRecenter({ lat, lon, trigger }: { lat: number; lon: number; trigger: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lon], map.getZoom(), { animate: true, duration: 0.8 });
  }, [lat, lon, trigger]);
  return null;
}

function WindyEmbed({ lat, lon, overlay }: { lat: number; lon: number; overlay: "wind" | "temp" }) {
  const src =
    `https://embed.windy.com/embed2.html` +
    `?lat=${lat.toFixed(2)}&lon=${lon.toFixed(2)}` +
    `&detailLat=${lat.toFixed(2)}&detailLon=${lon.toFixed(2)}` +
    `&width=650&height=280&zoom=6&level=surface` +
    `&overlay=${overlay}&product=ecmwf&menu=&message=&marker=&calendar=now` +
    `&pressure=&type=map&location=coordinates&detail=&radarRange=-1`;

  return (
    <iframe
      src={src}
      className="w-full border-0"
      style={{ height: 280 }}
      title={overlay === "wind" ? "Wind Speed Map" : "Temperature Map"}
      allow="fullscreen"
    />
  );
}

export function WeatherRadar({ lat, lon, locationName }: Props) {
  const [activeLayer, setActiveLayer] = useState<Layer>("rain");
  const [frames, setFrames] = useState<RadarFrame[]>([]);
  const [frameIndex, setFrameIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [radarLoading, setRadarLoading] = useState(true);
  const [recenterKey, setRecenterKey] = useState(0);
  const animRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isLastFrame = frameIndex === frames.length - 1;

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

  useEffect(() => {
    if (!frames.length || radarLoading) return;
    const t = setTimeout(() => setPlaying(true), 1500);
    return () => clearTimeout(t);
  }, [frames.length, radarLoading]);

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
    if (activeLayer !== "rain") {
      if (animRef.current) clearTimeout(animRef.current);
      setPlaying(false);
      return;
    }
    if (!frames.length) return;
    if (playing) {
      scheduleNext(frameIndex);
    } else {
      if (animRef.current) clearTimeout(animRef.current);
    }
    return () => { if (animRef.current) clearTimeout(animRef.current); };
  }, [playing, frames.length, activeLayer]);

  const togglePlay = () => setPlaying((p) => !p);

  const goToFrame = (idx: number) => {
    if (animRef.current) clearTimeout(animRef.current);
    setFrameIndex(idx);
    setPlaying(false);
  };

  const frameTime = frames[frameIndex]
    ? new Date(frames[frameIndex].time * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null;

  const progress = frames.length > 1 ? frameIndex / (frames.length - 1) : 1;

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      {/* Header + layer switcher */}
      <div className="px-5 py-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-display font-bold text-foreground text-base">Live Radar</h3>
            {playing && activeLayer === "rain" && !radarLoading && (
              <span className="flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
            )}
            {/* Location pill — tap to snap map back to current location */}
            {activeLayer === "rain" && (
              <button
                onClick={() => setRecenterKey((k) => k + 1)}
                title="Snap back to your location"
                className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full bg-muted hover:bg-primary/10 hover:text-primary text-muted-foreground transition-colors max-w-[130px]"
              >
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate">{locationName || "My location"}</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            {activeLayer === "rain" && frameTime && (
              <span className="text-xs tabular-nums text-muted-foreground font-medium">
                {isLastFrame ? (
                  <span className="text-primary font-semibold">Now · {frameTime}</span>
                ) : frameTime}
              </span>
            )}
            {activeLayer === "rain" && frames.length > 1 && !radarLoading && (
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

        {/* Layer tabs */}
        <div className="flex gap-1.5">
          {LAYERS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveLayer(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeLayer === id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-3 h-3" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Map / embed area */}
      <div className="relative" style={{ height: 280 }}>
        {activeLayer === "rain" ? (
          <>
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
              <MapRecenter lat={lat} lon={lon} trigger={recenterKey} />
              {frames.length > 0 && (
                <RadarLayer frames={frames} frameIndex={frameIndex} />
              )}
            </MapContainer>
          </>
        ) : (
          <WindyEmbed lat={lat} lon={lon} overlay={activeLayer === "wind" ? "wind" : "temp"} />
        )}
      </div>

      {/* Footer */}
      {activeLayer === "rain" ? (
        <div className="px-5 pt-4 pb-2 space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-foreground uppercase tracking-wider">Rain intensity</span>
              <span className="text-[10px] text-muted-foreground">light → extreme</span>
            </div>
            <div
              className="w-full h-4 rounded-md border border-black/15"
              style={{
                background: "linear-gradient(to right, #b3f0ff, #00c8ff, #00d800, #ffff00, #ff8800, #ff0000, #cc00cc)",
              }}
              aria-label="Rain intensity scale"
            />
            <div className="flex justify-between mt-1">
              {["Drizzle", "Light", "Moderate", "Heavy", "Intense", "Severe", "Extreme"].map((l) => (
                <span key={l} className="text-[9px] font-medium text-muted-foreground">{l}</span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="px-5 py-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            {activeLayer === "wind" ? "Wind map" : "Temperature map"} powered by{" "}
            <a href="https://www.windy.com" target="_blank" rel="noopener" className="text-primary underline">Windy.com</a>
          </p>
        </div>
      )}

      {/* Rain progress + scrubber */}
      {activeLayer === "rain" && (
        <div className="px-5 py-3 border-t border-border space-y-2">
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
            {frames.length > 1 && (
              <div className="flex items-center gap-1">
                {frames.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goToFrame(i)}
                    title={new Date(frames[i].time * 1000).toLocaleTimeString([], {
                      hour: "2-digit", minute: "2-digit",
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
      )}
    </div>
  );
}
