import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { Loader2 } from "lucide-react";
import "leaflet/dist/leaflet.css";

interface RadarFrame {
  time: number;
  path: string;
}

interface Props {
  lat: number;
  lon: number;
}

// Inner component: updates the radar tile layer when frame changes
function RadarLayer({ frames, frameIndex }: { frames: RadarFrame[]; frameIndex: number }) {
  const map = useMap();
  const layerRef = useRef<any>(null);

  useEffect(() => {
    if (!frames.length) return;
    const L = (window as any).L || require("leaflet");
    if (layerRef.current) map.removeLayer(layerRef.current);
    const frame = frames[frameIndex];
    const layer = L.tileLayer(
      `https://tilecache.rainviewer.com${frame.path}/256/{z}/{x}/{y}/6/1_1.png`,
      { opacity: 0.65, attribution: "RainViewer" }
    );
    layer.addTo(map);
    layerRef.current = layer;
    return () => { if (layerRef.current) map.removeLayer(layerRef.current); };
  }, [frames, frameIndex]);

  return null;
}

export function WeatherRadar({ lat, lon }: Props) {
  const [frames, setFrames] = useState<RadarFrame[]>([]);
  const [frameIndex, setFrameIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [radarLoading, setRadarLoading] = useState(true);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  const toggleAnimation = () => {
    if (animating) {
      if (animRef.current) clearInterval(animRef.current);
      setAnimating(false);
    } else {
      setAnimating(true);
      animRef.current = setInterval(() => {
        setFrameIndex((prev) => (prev + 1) % frames.length);
      }, 600);
    }
  };

  useEffect(() => {
    return () => { if (animRef.current) clearInterval(animRef.current); };
  }, []);

  const frameTime = frames[frameIndex]
    ? new Date(frames[frameIndex].time * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4">
        <h3 className="font-display font-bold text-foreground text-base">Live Radar</h3>
        <div className="flex items-center gap-3">
          {frameTime && (
            <span className="text-xs text-muted-foreground font-medium">{frameTime}</span>
          )}
          {frames.length > 1 && !radarLoading && (
            <button
              onClick={toggleAnimation}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              {animating ? "Pause" : "Animate"}
            </button>
          )}
        </div>
      </div>

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

      <div className="px-5 py-3 border-t border-border flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Radar by RainViewer</p>
        {frames.length > 1 && (
          <div className="flex items-center gap-1">
            {frames.slice(-6).map((_, i) => {
              const actualIdx = frames.length - 6 + i;
              return (
                <button
                  key={i}
                  onClick={() => { setFrameIndex(actualIdx); if (animating) { if (animRef.current) clearInterval(animRef.current); setAnimating(false); } }}
                  className={`w-2 h-2 rounded-full transition-colors ${actualIdx === frameIndex ? "bg-primary" : "bg-border"}`}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
