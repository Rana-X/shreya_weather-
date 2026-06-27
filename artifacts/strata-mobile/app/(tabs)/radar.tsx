import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useLocation } from "@/context/LocationContext";
import { RadarMap } from "@/components/RadarMap";

function buildMapHtml(lat: number, lon: number, isDark: boolean, modesTop: number): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html, body { width:100%; height:100%; background:#0F172A; overflow:hidden; }
  #map { width:100%; height:100%; }

  #modes {
    position:absolute; top:${modesTop}px; left:50%; transform:translateX(-50%);
    z-index:1000; display:flex; gap:5px;
    background:rgba(10,18,34,0.88); padding:5px;
    border-radius:14px; border:1px solid rgba(255,255,255,0.08);
    box-shadow:0 4px 20px rgba(0,0,0,0.5);
    backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px);
  }
  .mode-btn {
    padding:8px 13px; border-radius:10px; border:none;
    background:transparent; color:rgba(255,255,255,0.55);
    font-size:12px; font-weight:600; cursor:pointer;
    font-family:-apple-system,BlinkMacSystemFont,sans-serif;
    white-space:nowrap; transition:all 0.15s ease;
  }
  .mode-btn.active { background:#25A8E4; color:#fff; box-shadow:0 2px 8px rgba(37,168,228,0.4); }

  #legend {
    position:absolute; bottom:28px; left:12px; z-index:1000;
    background:rgba(10,18,34,0.92); padding:11px 13px; border-radius:13px;
    border:1px solid rgba(255,255,255,0.1);
    box-shadow:0 4px 20px rgba(0,0,0,0.5);
    backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px);
    display:none; flex-direction:column; gap:7px;
    max-width:calc(100vw - 24px);
  }
  .legend-section { display:flex; flex-direction:column; gap:5px; }
  .legend-section-title {
    color:rgba(255,255,255,0.5); font-size:9px; font-weight:700;
    text-transform:uppercase; letter-spacing:0.9px;
    font-family:-apple-system,BlinkMacSystemFont,sans-serif;
  }
  .legend-items { display:flex; gap:6px; align-items:flex-end; flex-wrap:wrap; }
  .legend-item { display:flex; flex-direction:column; align-items:center; gap:3px; }
  .legend-swatch { width:22px; height:7px; border-radius:2px; }
  .legend-label {
    color:rgba(255,255,255,0.42); font-size:8px;
    font-family:-apple-system,BlinkMacSystemFont,sans-serif; white-space:nowrap;
  }
  .legend-divider { height:1px; background:rgba(255,255,255,0.1); }

  #time-badge {
    position:absolute; top:12px; right:12px; z-index:1000;
    background:rgba(10,18,34,0.88); padding:6px 10px; border-radius:10px;
    border:1px solid rgba(255,255,255,0.08); display:none;
    color:rgba(255,255,255,0.55); font-size:11px; font-weight:600;
    font-family:-apple-system,sans-serif;
  }

  .leaflet-control-attribution { font-size:8px !important; opacity:0.35 !important; }
  .leaflet-control-zoom { display:none; }
</style>
</head>
<body>
<div id="map"></div>
<div id="modes">
  <button class="mode-btn active" onclick="setMode('satellite')" id="btn-satellite">🛰️ Satellite</button>
  <button class="mode-btn" onclick="setMode('radar')" id="btn-radar">🌧️ Radar</button>
  <button class="mode-btn" onclick="setMode('wind')" id="btn-wind">💨 Wind</button>
  <button class="mode-btn" onclick="setMode('temp')" id="btn-temp">🌡️ Temp</button>
</div>
<div id="legend"></div>
<div id="time-badge" id="time-badge"></div>

<script>
var LAT = ${lat};
var LON = ${lon};

// ── MAP INIT ──────────────────────────────────────────────
var map = L.map('map', {
  zoomControl: false, attributionControl: true,
  tap: true, touchZoom: true
}).setView([LAT, LON], 9);

// Base layers
var satellite = L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  { attribution: 'Tiles &copy; Esri', maxZoom: 19 }
);
var dark = L.tileLayer(
  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  { attribution: '&copy; OpenStreetMap &copy; CartoDB', maxZoom: 19 }
);
satellite.addTo(map);

// Satellite label overlay (city names on top of satellite imagery)
var labels = L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
  { attribution: '', maxZoom: 19, opacity: 0.8 }
);
labels.addTo(map);

// User location pulse marker
var pulseIcon = L.divIcon({
  html: '<div style="position:relative;width:16px;height:16px;">' +
    '<div style="position:absolute;inset:0;border-radius:50%;background:#25A8E4;border:2.5px solid white;box-shadow:0 0 0 5px rgba(37,168,228,0.25),0 2px 8px rgba(0,0,0,0.4);"></div>' +
    '</div>',
  iconSize: [16,16], iconAnchor: [8,8], className: ''
});
L.marker([LAT, LON], { icon: pulseIcon }).addTo(map);

// ── RADAR ────────────────────────────────────────────────
var radarFrames = [];
var radarLayers = [];
var radarTimer = null;
var radarIdx = 0;
var timeBadge = document.getElementById('time-badge');

async function loadRadarFrames() {
  try {
    var res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
    var data = await res.json();
    radarFrames = [...(data.radar.past||[]), ...(data.radar.nowcast||[])];
    // Pre-create tile layers (hidden)
    radarFrames.forEach(function(f) {
      var l = L.tileLayer(
        'https://tilecache.rainviewer.com' + f.path + '/512/{z}/{x}/{y}/8/1_1.png',
        { opacity:0, zIndex:200, crossOrigin: true }
      );
      radarLayers.push(l);
    });
  } catch(e) { console.warn('radar fetch failed', e); }
}

function startRadar() {
  if (!radarFrames.length) return;
  radarIdx = 0;
  radarLayers.forEach(function(l) { l.addTo(map); l.setOpacity(0); });
  radarLayers[0].setOpacity(0.75);
  showTimestamp(radarFrames[0].time);
  timeBadge.style.display = 'block';
  radarTimer = setInterval(function() {
    radarLayers[radarIdx].setOpacity(0);
    radarIdx = (radarIdx + 1) % radarLayers.length;
    radarLayers[radarIdx].setOpacity(0.75);
    showTimestamp(radarFrames[radarIdx].time);
  }, 700);
}

function stopRadar() {
  if (radarTimer) { clearInterval(radarTimer); radarTimer = null; }
  radarLayers.forEach(function(l) { l.setOpacity(0); map.removeLayer(l); });
  radarLayers = []; radarFrames = [];
  timeBadge.style.display = 'none';
}

function showTimestamp(unix) {
  var d = new Date(unix * 1000);
  var isNowcast = unix > Date.now()/1000 - 300;
  var label = isNowcast ? '▶ Forecast' : d.toLocaleTimeString([], {hour:'numeric',minute:'2-digit'});
  timeBadge.textContent = label;
}

// ── WIND ────────────────────────────────────────────────
var windLayer = L.layerGroup();

async function loadWind() {
  windLayer.clearLayers();
  var steps = 5, span = 1.8;
  var lats=[], lons=[];
  for(var i=0;i<steps;i++) for(var j=0;j<steps;j++) {
    lats.push((LAT+(i-2)*span/(steps-1)).toFixed(3));
    lons.push((LON+(j-2)*span/(steps-1)).toFixed(3));
  }
  try {
    var url='https://api.open-meteo.com/v1/forecast?latitude='+lats.join(',')+'&longitude='+lons.join(',')+'&current=windspeed_10m,winddirection_10m&wind_speed_unit=mph&timezone=auto&forecast_days=1';
    var res=await fetch(url);
    var json=await res.json();
    var pts=Array.isArray(json)?json:[json];
    pts.forEach(function(pt,idx){
      if(!pt.current) return;
      var spd=pt.current.windspeed_10m||0;
      var dir=pt.current.winddirection_10m||0;
      var la=parseFloat(lats[idx]), lo=parseFloat(lons[idx]);
      var col=spd<5?'#93C5FD':spd<15?'#60A5FA':spd<25?'#2563EB':spd<40?'#7C3AED':'#DB2777';
      var sz=Math.round(Math.min(18+spd*0.7, 38));
      var ic=L.divIcon({
        html:'<div style="transform:rotate('+dir+'deg);width:'+sz+'px;height:'+sz+'px;display:flex;align-items:center;justify-content:center;">'+
          '<svg viewBox="0 0 20 20" width="'+sz+'" height="'+sz+'">'+
          '<polygon points="10,1 14,16 10,13 6,16" fill="'+col+'" opacity="0.92" stroke="rgba(0,0,0,0.2)" stroke-width="0.5"/>'+
          '</svg></div>'+
          '<div style="text-align:center;color:'+col+';font-size:9px;font-weight:700;font-family:-apple-system,sans-serif;text-shadow:0 1px 3px rgba(0,0,0,0.8);">'+Math.round(spd)+'</div>',
        iconSize:[sz+4,sz+14], iconAnchor:[(sz+4)/2, sz/2], className:''
      });
      L.marker([la,lo],{icon:ic}).addTo(windLayer);
    });
  } catch(e){ console.warn('wind error',e); }
}

// ── TEMPERATURE ───────────────────────────────────────────
var tempLayerGroup = L.layerGroup();

var TEMP_COLORS=[
  [-20,'#1e1b4b'],[-5,'#312e81'],[10,'#1d4ed8'],[25,'#0ea5e9'],
  [32,'#06b6d4'],[45,'#10b981'],[55,'#84cc16'],[65,'#facc15'],
  [75,'#f97316'],[85,'#ef4444'],[95,'#b91c1c'],[110,'#7f1d1d']
];

function tempColor(f){
  for(var i=1;i<TEMP_COLORS.length;i++){
    if(f<=TEMP_COLORS[i][0]){
      return TEMP_COLORS[i-1][1];
    }
  }
  return TEMP_COLORS[TEMP_COLORS.length-1][1];
}

async function loadTemp(){
  tempLayerGroup.clearLayers();
  var steps=5, span=1.8;
  var lats=[],lons=[];
  for(var i=0;i<steps;i++) for(var j=0;j<steps;j++){
    lats.push((LAT+(i-2)*span/(steps-1)).toFixed(3));
    lons.push((LON+(j-2)*span/(steps-1)).toFixed(3));
  }
  try{
    var url='https://api.open-meteo.com/v1/forecast?latitude='+lats.join(',')+'&longitude='+lons.join(',')+'&current=temperature_2m&temperature_unit=fahrenheit&timezone=auto&forecast_days=1';
    var res=await fetch(url);
    var json=await res.json();
    var pts=Array.isArray(json)?json:[json];
    pts.forEach(function(pt,idx){
      if(!pt.current) return;
      var t=pt.current.temperature_2m;
      var la=parseFloat(lats[idx]),lo=parseFloat(lons[idx]);
      var col=tempColor(t);
      var ic=L.divIcon({
        html:'<div style="background:'+col+';border-radius:50%;width:46px;height:46px;display:flex;align-items:center;justify-content:center;border:2px solid rgba(255,255,255,0.45);box-shadow:0 2px 10px rgba(0,0,0,0.5);">'+
          '<span style="color:#fff;font-size:13px;font-weight:800;font-family:-apple-system,sans-serif;text-shadow:0 1px 3px rgba(0,0,0,0.4);">'+Math.round(t)+'°</span></div>',
        iconSize:[46,46], iconAnchor:[23,23], className:''
      });
      L.marker([la,lo],{icon:ic}).addTo(tempLayerGroup);
    });
  }catch(e){ console.warn('temp error',e); }
}

// ── LEGEND ────────────────────────────────────────────────
var LEGENDS={
  radar:{sections:[
    {title:'🌧 Rain',items:[
      {c:'#7FE87F',l:'Drizzle'},{c:'#4DFF00',l:'Light'},
      {c:'#FFFF00',l:'Moderate'},{c:'#FF8C00',l:'Heavy'},
      {c:'#FF2200',l:'Intense'},{c:'#CC00FF',l:'Extreme'}
    ]},
    {title:'❄️ Snow & Ice',items:[
      {c:'#BFEFFF',l:'Lt Snow'},{c:'#40C8FF',l:'Snow'},
      {c:'#1455CC',l:'Hvy Snow'},{c:'#FF80C0',l:'Sleet/Ice'}
    ]}
  ]},
  wind:{sections:[
    {title:'💨 Wind speed (mph)',items:[
      {c:'#93C5FD',l:'< 5'},{c:'#60A5FA',l:'5–15'},
      {c:'#2563EB',l:'15–25'},{c:'#7C3AED',l:'25–40'},{c:'#DB2777',l:'40+'}
    ]}
  ]},
  temp:{sections:[
    {title:'🌡️ Temperature (°F)',items:[
      {c:'#1d4ed8',l:'< 25'},{c:'#0ea5e9',l:'32'},
      {c:'#10b981',l:'50'},{c:'#84cc16',l:'65'},
      {c:'#facc15',l:'75'},{c:'#f97316',l:'85'},{c:'#ef4444',l:'95+'}
    ]}
  ]}
};

function updateLegend(mode){
  var el=document.getElementById('legend');
  var cfg=LEGENDS[mode];
  if(!cfg){ el.style.display='none'; return; }
  el.style.display='flex';
  el.innerHTML=cfg.sections.map(function(sec,si){
    return (si>0?'<div class="legend-divider"></div>':'')+
      '<div class="legend-section">'+
        '<div class="legend-section-title">'+sec.title+'</div>'+
        '<div class="legend-items">'+
          sec.items.map(function(x){
            return '<div class="legend-item">'+
              '<div class="legend-swatch" style="background:'+x.c+'"></div>'+
              '<div class="legend-label">'+x.l+'</div>'+
            '</div>';
          }).join('')+
        '</div>'+
      '</div>';
  }).join('');
}

// ── MODE SWITCH ───────────────────────────────────────────
var currentMode='satellite';

async function setMode(mode){
  document.querySelectorAll('.mode-btn').forEach(function(b){ b.classList.remove('active'); });
  document.getElementById('btn-'+mode).classList.add('active');

  // Tear down previous
  stopRadar();
  windLayer.remove();
  tempLayerGroup.remove();

  // Base layer
  if(mode==='satellite'){
    map.removeLayer(dark);
    satellite.addTo(map);
    labels.addTo(map);
  } else {
    map.removeLayer(satellite);
    map.removeLayer(labels);
    dark.addTo(map);
  }

  currentMode=mode;
  updateLegend(mode);

  if(mode==='radar'){ await loadRadarFrames(); startRadar(); }
  else if(mode==='wind'){ await loadWind(); windLayer.addTo(map); }
  else if(mode==='temp'){ await loadTemp(); tempLayerGroup.addTo(map); }
}

// Boot
setMode('satellite');
<\/script>
</body>
</html>`;
}

export default function RadarScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { lat, lon, cityName } = useLocation();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  // Position mode buttons below the "Radar" title header
  // topPad + 8 (content start) + ~38 (title) + ~19 (subtitle) + 12 (gap)
  const modesTop = topPad + 77;

  const html = useMemo(() => {
    if (lat == null || lon == null) return null;
    return buildMapHtml(lat, lon, true, modesTop);
  }, [lat, lon, modesTop]);

  if (lat == null || lon == null || !html) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
        <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
          Getting your location…
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: "#0F172A" }]}>
      {/* Header sits above the map */}
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 8 },
        ]}
      >
        <View>
          <Text style={styles.title}>Radar</Text>
          <Text style={styles.subtitle}>{cityName}</Text>
        </View>
      </View>

      <RadarMap html={html} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 15,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 20,
    paddingBottom: 0,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.55)",
    marginTop: 2,
  },
  map: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
});
