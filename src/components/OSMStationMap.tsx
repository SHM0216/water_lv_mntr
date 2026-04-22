import React, { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { LevelReading } from '@/types';
import { DAEGU_BOUNDS, STATIONS } from '@/data/stations';
import { useTheme } from '@/theme/useTheme';
import { OSMMapHost, OSMMapHostRef, OSMMapMessage } from './OSMMapHost';

type Props = {
  readings: Record<string, LevelReading>;
  onSelect: (stationId: string) => void;
};

const LIGHT_TILE = {
  url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '© OpenStreetMap contributors',
};

const DARK_TILE = {
  url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
  attribution: '© OpenStreetMap © CARTO',
};

export function OSMStationMap({ readings, onSelect }: Props) {
  const { mode, levelColors } = useTheme();
  const hostRef = useRef<OSMMapHostRef>(null);
  const readyRef = useRef(false);
  const pendingLevelsRef = useRef<Record<string, number> | null>(null);

  // HTML 은 테마/레벨-팔레트 변경 시에만 재생성. 실시간 값은 postMessage 로 반영.
  const html = useMemo(
    () => buildHtml({
      stations: STATIONS,
      bounds: DAEGU_BOUNDS,
      tile: mode === 'dark' ? DARK_TILE : LIGHT_TILE,
      dark: mode === 'dark',
      levelColors,
      initialLevels: toLevelDict(readings),
    }),
    // 일부러 readings 는 의존성에서 제외 (값 변경은 post 로만 처리)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mode, levelColors],
  );

  // readings 변경 시 지도에 주입
  useEffect(() => {
    const levels = toLevelDict(readings);
    if (readyRef.current) {
      hostRef.current?.post({ type: 'levels', levels });
    } else {
      pendingLevelsRef.current = levels;
    }
  }, [readings]);

  // HTML 이 재생성되면 ready 플래그 리셋
  useEffect(() => {
    readyRef.current = false;
  }, [html]);

  const onMessage = (msg: OSMMapMessage) => {
    if (msg.type === 'ready') {
      readyRef.current = true;
      const pending = pendingLevelsRef.current;
      if (pending) {
        hostRef.current?.post({ type: 'levels', levels: pending });
        pendingLevelsRef.current = null;
      }
    } else if (msg.type === 'select') {
      onSelect(msg.stationId);
    }
  };

  return (
    <View style={styles.wrap}>
      <OSMMapHost ref={hostRef} html={html} style={styles.host} onMessage={onMessage} />
    </View>
  );
}

function toLevelDict(readings: Record<string, LevelReading>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const r of Object.values(readings)) out[r.stationId] = r.level;
  return out;
}

type BuildHtmlOpts = {
  stations: typeof STATIONS;
  bounds: typeof DAEGU_BOUNDS;
  tile: { url: string; attribution: string };
  dark: boolean;
  levelColors: Record<number, string>;
  initialLevels: Record<string, number>;
};

function buildHtml(opts: BuildHtmlOpts): string {
  const markers = opts.stations.map((s) => ({
    id: s.id,
    name: s.name,
    district: s.district,
    lat: s.lat,
    lng: s.lng,
  }));
  const bg = opts.dark ? '#0A1628' : '#F5F7FA';
  const labelBg = opts.dark ? 'rgba(10,22,40,0.82)' : 'rgba(255,255,255,0.92)';
  const labelColor = opts.dark ? '#E8EEF7' : '#0F172A';
  const labelBorder = opts.dark ? '#24457A' : '#E5E7EB';

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/[email protected]/dist/leaflet.css" crossorigin="anonymous" />
<script src="https://unpkg.com/[email protected]/dist/leaflet.js" crossorigin="anonymous"></script>
<style>
  html,body{margin:0;padding:0;height:100%;background:${bg};}
  #map{position:absolute;inset:0;height:100%;width:100%;background:${bg};}
  .wlm-dot{width:18px;height:18px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 6px rgba(0,0,0,0.4);box-sizing:border-box;}
  .wlm-tip{background:${labelBg};color:${labelColor};border:1px solid ${labelBorder};padding:3px 6px;border-radius:6px;font-size:11px;font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;font-weight:600;white-space:nowrap;}
  .leaflet-tooltip.wlm-tip:before{display:none;}
  .leaflet-control-attribution{font-size:9px;background:${labelBg}!important;color:${labelColor}!important;}
  .leaflet-control-attribution a{color:${labelColor}!important;}
</style>
</head>
<body>
<div id="map"></div>
<script>
(function(){
  var LEVEL_COLORS = ${JSON.stringify(opts.levelColors)};
  var STATIONS = ${JSON.stringify(markers)};
  var INITIAL_LEVELS = ${JSON.stringify(opts.initialLevels)};
  var BOUNDS = ${JSON.stringify(opts.bounds)};
  var TILE = ${JSON.stringify(opts.tile)};

  function send(msg){
    try {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify(msg));
      } else if (window.parent && window.parent !== window) {
        window.parent.postMessage(msg, '*');
      }
    } catch(e){}
  }

  function icon(color){
    return L.divIcon({
      html: '<div class="wlm-dot" style="background:'+color+';"></div>',
      className: '',
      iconSize: [18,18],
      iconAnchor: [9,9],
    });
  }

  var map = L.map('map', {
    zoomControl: true,
    attributionControl: true,
    tap: true,
    preferCanvas: false,
  });
  map.fitBounds([[BOUNDS.minLat, BOUNDS.minLng],[BOUNDS.maxLat, BOUNDS.maxLng]], { padding: [20,20] });

  L.tileLayer(TILE.url, {
    maxZoom: 18,
    attribution: TILE.attribution,
    subdomains: 'abc',
  }).addTo(map);

  var markers = {};
  STATIONS.forEach(function(s){
    var lvl = INITIAL_LEVELS[s.id] != null ? INITIAL_LEVELS[s.id] : 0;
    var m = L.marker([s.lat, s.lng], { icon: icon(LEVEL_COLORS[lvl]) }).addTo(map);
    m.bindTooltip(s.name + '<br/><span style="font-weight:400;opacity:0.75;">'+s.district+'</span>', {
      direction: 'top', offset: [0,-10], className: 'wlm-tip', opacity: 1,
    });
    m.on('click', function(){ send({type:'select', stationId: s.id}); });
    markers[s.id] = m;
  });

  window.__osmHandle = function(cmd){
    if (!cmd) return;
    if (cmd.type === 'levels') {
      Object.keys(cmd.levels).forEach(function(id){
        var m = markers[id];
        if (m) m.setIcon(icon(LEVEL_COLORS[cmd.levels[id]] || LEVEL_COLORS[0]));
      });
    }
  };

  // iframe(웹) postMessage 수신
  window.addEventListener('message', function(e){
    try {
      var data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
      if (data && data.type) window.__osmHandle(data);
    } catch(err){}
  });

  // ready 신호
  send({type:'ready'});
})();
</script>
</body>
</html>`;
}

const styles = StyleSheet.create({
  wrap: { flex: 1, borderRadius: 12, overflow: 'hidden', minHeight: 300 },
  host: { flex: 1 },
});
