import { useEffect, useState, useRef, useCallback } from "react";
import { MapContainer, TileLayer, useMap, Marker } from "react-leaflet";
import {
  Loader2, Play, Pause, Wind, Thermometer, CloudRain, MapPin, Satellite, Zap,
} from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface RadarFrame {
  time: number;
  path: string;
}

interface Props {
  lat: number;
  lon: number;
  locationName?: string;
  isStormy?: boolean;
}

type Layer = "rain" | "satellite" | "wind" | "temperature";

const LAYERS: { id: Layer; label: string; icon: typeof CloudRain }[] = [
  { id: "rain",        label: "Rain",        icon: CloudRain   },
  { id: "satellite",   label: "Satellite",   icon: Satellite   },
  { id: "wind",        label: "Wind",        icon: Wind        },
  { id: "temperature", label: "Temperature", icon: Thermometer },
];

function rainTile(path: string) {
  return `https://tilecache.rainviewer.com${path}/256/{z}/{x}/{y}/6/1_1.png`;
}

const ESRI_SAT_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const ESRI_SAT_ATTR =
  "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community";

function FrameLayer({
  frames,
  frameIndex,
  tileUrl,
  attribution,
}: {
  frames: RadarFrame[];
  frameIndex: number;
  tileUrl: (path: string) => string;
  attribution: string;
}) {
  const map = useMap();
  const aRef = useRef<any>(null);
  const bRef = useRef<any>(null);
  const frontIsARef = useRef(true);

  // Create exactly TWO reusable tile layers — never one-per-frame. We swap the
  // back layer's tile URL to the current frame and crossfade, so only the
  // current/previous frame's tiles are ever in memory (no preloading).
  useEffect(() => {
    const Lx = (window as any).L;
    aRef.current = Lx.tileLayer("", { opacity: 0, attribution, zIndex: 200 }).addTo(map);
    bRef.current = Lx.tileLayer("", { opacity: 0, attribution, zIndex: 201 }).addTo(map);
    return () => {
      [aRef, bRef].forEach((r) => {
        if (r.current) { try { map.removeLayer(r.current); } catch {} r.current = null; }
      });
    };
  }, [map, attribution]);

  useEffect(() => {
    const frame = frames[frameIndex];
    if (!frame || !aRef.current || !bRef.current) return;
    const front = frontIsARef.current ? aRef.current : bRef.current;
    const back = frontIsARef.current ? bRef.current : aRef.current;
    back.setUrl(tileUrl(frame.path));
    back.setOpacity(0.7);
    front.setOpacity(0);
    frontIsARef.current = !frontIsARef.current;
  }, [frameIndex, frames, tileUrl]);

  return null;
}

function MapRecenter({ lat, lon, trigger }: { lat: number; lon: number; trigger: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lon], map.getZoom(), { animate: true, duration: 0.8 });
  }, [lat, lon, trigger]);
  return null;
}

// Animated lightning icon shown on the map during storms.
const lightningIcon = L.divIcon({
  className: "",
  html: `<div style="font-size:28px;line-height:1;filter:drop-shadow(0 0 6px #ffe066);animation:spin 2s linear infinite;">⚡</div>`,
  iconAnchor: [14, 14],
});

function WindyEmbed({ lat, lon, overlay }: { lat: number; lon: number; overlay: "wind" | "temp" }) {
  const src =
    `https://embed.windy.com/embed2.html` +
    `?lat=${lat.toFixed(2)}&lon=${lon.toFixed(2)}` +
    `&detailLat=${lat.toFixed(2)}&detailLon=${lon.toFixed(2)}` +
    `&width=650&height=280&zoom=6&level=surface` +
    `&overlay=${overlay}&product=ecmwf&menu=&message=&marker=&calendar=now` +
    `&pressure=&type=map&location=coordinates&detail=&radarRange=-1`;
  return (
    <iframe src={src} className="w-full border-0" style={{ height: 280 }}
      title={overlay === "wind" ? "Wind Speed Map" : "Temperature Map"} allow="fullscreen" />
  );
}

const FRAME_MS = 500;
const PAUSE_AT_END_MS = 1200;

export function WeatherRadar({ lat, lon, locationName, isStormy = false }: Props) {
  const [activeLayer, setActiveLayer] = useState<Layer>("rain");
  const [radarFrames, setRadarFrames] = useState<RadarFrame[]>([]);
  const [frameIndex,  setFrameIndex]  = useState(0);
  const [playing,     setPlaying]     = useState(false);
  const [loading,     setLoading]     = useState(true);
  const [recenterKey, setRecenterKey] = useState(0);
  const animRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);
  // Only animate when actually playing AND the radar is on-screen and the tab
  // is visible — keeps the rest of the app smooth.
  const active = playing && inView && pageVisible;

  const frames = radarFrames;
  const isLastFrame = frameIndex === frames.length - 1;

  useEffect(() => {
    fetch("https://api.rainviewer.com/public/weather-maps.json")
      .then((r) => r.json())
      .then((data) => {
        const radar: RadarFrame[] = data.radar?.past ?? [];
        setRadarFrames(radar);
        setFrameIndex(radar.length > 0 ? radar.length - 1 : 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!frames.length || loading) return;
    const t = setTimeout(() => setPlaying(true), 1500);
    return () => clearTimeout(t);
  }, [frames.length, loading]);

  // Pause the animation when the radar scrolls off-screen or the tab is hidden.
  useEffect(() => {
    const el = containerRef.current;
    const onVis = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    let io: IntersectionObserver | undefined;
    if (el && typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        ([entry]) => setInView(entry.isIntersecting),
        { threshold: 0.1 },
      );
      io.observe(el);
    }
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      io?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (animRef.current) clearTimeout(animRef.current);
    setPlaying(false);
    if (activeLayer === "rain") {
      setFrameIndex(radarFrames.length > 0 ? radarFrames.length - 1 : 0);
      const t = setTimeout(() => setPlaying(true), 600);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [activeLayer]);

  const scheduleNext = useCallback((currentIndex: number) => {
    const isLast = currentIndex === frames.length - 1;
    const delay  = isLast ? PAUSE_AT_END_MS : FRAME_MS;
    animRef.current = setTimeout(() => {
      const next = (currentIndex + 1) % frames.length;
      setFrameIndex(next);
      scheduleNext(next);
    }, delay);
  }, [frames.length]);

  useEffect(() => {
    if (activeLayer !== "rain") { if (animRef.current) clearTimeout(animRef.current); return; }
    if (!frames.length) return;
    if (active) { scheduleNext(frameIndex); }
    else { if (animRef.current) clearTimeout(animRef.current); }
    return () => { if (animRef.current) clearTimeout(animRef.current); };
  }, [active, frames.length, activeLayer]);

  const togglePlay = () => setPlaying((p) => !p);
  const goToFrame  = (idx: number) => { if (animRef.current) clearTimeout(animRef.current); setFrameIndex(idx); setPlaying(false); };

  const frameTime = frames[frameIndex]
    ? new Date(frames[frameIndex].time * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null;

  const progress = frames.length > 1 ? frameIndex / (frames.length - 1) : 1;
  const isMapLayer = activeLayer === "rain" || activeLayer === "satellite";
  const isRain     = activeLayer === "rain";

  return (
    <div ref={containerRef} className="bg-card rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-display font-bold text-foreground text-base">Live Radar</h3>
            {playing && isRain && !loading && (
              <span className="flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
            )}
            {/* Lightning badge */}
            {isStormy && isRain && (
              <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700 animate-pulse">
                <Zap className="w-3 h-3" /> Storm
              </span>
            )}
            {isMapLayer && (
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
            {isRain && frameTime && (
              <span className="text-xs tabular-nums text-muted-foreground font-medium">
                {isLastFrame
                  ? <span className="text-primary font-semibold">Now · {frameTime}</span>
                  : frameTime}
              </span>
            )}
            {isRain && frames.length > 1 && !loading && (
              <button onClick={togglePlay}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                {playing ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                {playing ? "Pause" : "Play"}
              </button>
            )}
          </div>
        </div>

        {/* Layer tabs */}
        <div className="flex gap-1.5 flex-wrap">
          {LAYERS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveLayer(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeLayer === id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
              }`}>
              <Icon className="w-3 h-3" />
              {label}
              {id === "rain" && isStormy && <span className="text-xs">⚡</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Map / embed area */}
      <div className="relative" style={{ height: 280 }}>
        {activeLayer === "satellite" ? (
          <MapContainer center={[lat, lon]} zoom={13} style={{ height: "100%", width: "100%" }} zoomControl attributionControl>
            <TileLayer url={ESRI_SAT_URL} attribution={ESRI_SAT_ATTR} maxZoom={19} />
            <MapRecenter lat={lat} lon={lon} trigger={recenterKey} />
          </MapContainer>
        ) : isRain ? (
          <>
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/30 z-10">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            )}
            <MapContainer center={[lat, lon]} zoom={7} style={{ height: "100%", width: "100%" }} zoomControl attributionControl>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; <a href="https://carto.com/">CARTO</a>' />
              <MapRecenter lat={lat} lon={lon} trigger={recenterKey} />
              {frames.length > 0 && (
                <FrameLayer frames={frames} frameIndex={frameIndex} tileUrl={rainTile} attribution="RainViewer" />
              )}
              {/* Lightning marker during storms */}
              {isStormy && <Marker position={[lat, lon]} icon={lightningIcon} />}
            </MapContainer>
          </>
        ) : (
          <WindyEmbed lat={lat} lon={lon} overlay={activeLayer === "wind" ? "wind" : "temp"} />
        )}
      </div>

      {/* Storm banner */}
      {isStormy && isRain && (
        <div className="mx-4 my-2 px-4 py-2 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-500 flex-shrink-0" />
          <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-300">
            Thunderstorm detected near {locationName || "your area"} — stay indoors if you can!
          </p>
        </div>
      )}

      {/* Footer */}
      {activeLayer === "rain" ? (
        <div className="px-5 pt-3 pb-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-foreground uppercase tracking-wider">Rain intensity</span>
            <span className="text-[10px] text-muted-foreground">light → extreme</span>
          </div>
          <div className="w-full h-4 rounded-md border border-black/15"
            style={{ background: "linear-gradient(to right, #b3f0ff, #00c8ff, #00d800, #ffff00, #ff8800, #ff0000, #cc00cc)" }}
            aria-label="Rain intensity scale" />
          <div className="flex justify-between mt-1">
            {["Drizzle", "Light", "Moderate", "Heavy", "Intense", "Severe", "Extreme"].map((l) => (
              <span key={l} className="text-[9px] font-medium text-muted-foreground">{l}</span>
            ))}
          </div>
        </div>
      ) : activeLayer === "satellite" ? (
        <div className="px-5 py-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Aerial imagery &copy;{" "}
            <a href="https://www.esri.com" target="_blank" rel="noopener" className="text-primary underline">Esri</a>
            {" "}— zoom in to see streets, buildings &amp; rooftops
          </p>
        </div>
      ) : (
        <div className="px-5 py-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            {activeLayer === "wind" ? "Wind map" : "Temperature map"} powered by{" "}
            <a href="https://www.windy.com" target="_blank" rel="noopener" className="text-primary underline">Windy.com</a>
          </p>
        </div>
      )}

      {/* Rain scrubber */}
      {isRain && (
        <div className="px-5 py-3 border-t border-border space-y-2">
          {frames.length > 1 && (
            <div className="w-full h-1 bg-border rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${progress * 100}%` }} />
            </div>
          )}
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Radar by RainViewer</p>
            {frames.length > 1 && (
              <div className="flex items-center gap-1">
                {frames.map((_, i) => (
                  <button key={i} onClick={() => goToFrame(i)}
                    title={new Date(frames[i].time * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    className={`rounded-full transition-all duration-150 ${i === frameIndex ? "bg-primary w-3 h-2" : "bg-border w-2 h-2 hover:bg-muted-foreground"}`} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
