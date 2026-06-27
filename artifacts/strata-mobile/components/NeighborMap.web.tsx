import React, { useRef, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import type { Correction } from "@/hooks/useCorrections";

interface NeighborMapProps {
  corrections: Correction[];
  lat: number;
  lon: number;
}

function buildHtml(lat: number, lon: number, corrections: Correction[]): string {
  const data = JSON.stringify(corrections);
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>
<style>
*{box-sizing:border-box}
body{margin:0;background:#0F1C29}
#map{position:absolute;inset:0}
.cm{display:flex;align-items:center;justify-content:center;width:34px;height:34px;
    border-radius:50%;border:2px solid rgba(255,255,255,0.9);font-size:15px;
    box-shadow:0 2px 8px rgba(0,0,0,0.5)}
</style>
</head>
<body>
<div id="map"></div>
<script>
var WC={'sunny':'#FFD070','cloudy':'#7AAEC8','rainy':'#2E4A60','stormy':'#1A1E32',
        'windy':'#4498C8','snowy':'#EAF6FF','foggy':'#9AADB4'};
var WE={'sunny':'☀️','cloudy':'☁️','rainy':'🌧️','stormy':'⛈️',
        'windy':'💨','snowy':'❄️','foggy':'🌫️'};
var lat=${lat},lon=${lon};
var corrections=${data};
var map=L.map('map',{center:[lat,lon],zoom:13,zoomControl:false});
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  {attribution:'©OpenStreetMap ©CartoDB',maxZoom:19}).addTo(map);
L.circleMarker([lat,lon],{radius:10,fillColor:'#25A8E4',color:'white',
  weight:2.5,fillOpacity:0.95}).addTo(map).bindPopup('Your location');
corrections.forEach(function(c){
  var seed=c.id;
  var angle=(seed*137.508)%360*Math.PI/180;
  var r=0.003+0.005*((seed*7)%10)/10;
  var mlat=lat+r*Math.cos(angle);
  var mlon=lon+r*Math.sin(angle);
  var col=WC[c.actualWeatherType]||'#7AAEC8';
  var em=WE[c.actualWeatherType]||'🌤️';
  var icon=L.divIcon({html:'<div class="cm" style="background:'+col+'">'+em+'<\/div>',
    className:'',iconSize:[34,34],iconAnchor:[17,17]});
  var desc=c.description?'<br/>'+c.description:'';
  L.marker([mlat,mlon],{icon:icon}).addTo(map)
    .bindPopup('<b>'+em+' '+c.actualWeatherType+'<\/b>'+desc+
               '<br/><small>👍 '+c.agrees+' agree<\/small>');
});
<\/script>
</body>
</html>`;
}

export default function NeighborMap({ corrections, lat, lon }: NeighborMapProps) {
  const containerRef = useRef<View>(null);

  useEffect(() => {
    const el = containerRef.current as unknown as HTMLElement;
    if (!el) return;

    const iframe = document.createElement("iframe");
    iframe.style.cssText = "width:100%;height:100%;border:none;display:block";
    iframe.setAttribute("sandbox", "allow-scripts allow-same-origin");
    iframe.srcdoc = buildHtml(lat, lon, corrections);
    el.appendChild(iframe);

    return () => {
      if (el.contains(iframe)) el.removeChild(iframe);
    };
  }, [lat, lon, corrections]);

  return <View ref={containerRef} style={styles.container} />;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
