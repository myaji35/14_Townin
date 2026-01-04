import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Deck } from '@deck.gl/core';
import { HexagonLayer } from '@deck.gl/aggregation-layers';
import { ScatterplotLayer } from '@deck.gl/layers';
import 'mapbox-gl/dist/mapbox-gl.css';
import './MapView.css';

// Mapbox access token (replace with your own)
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoidG93bmluLWRldiIsImEiOiJjbTByOTBmeDMwMDAwMmtvaWM3N3R2YmVxIn0.example';

interface MapViewProps {
  center?: [number, number];
  zoom?: number;
  showHeatmap?: boolean;
  showMarkers?: boolean;
}

// 의정부시 샘플 데이터 (전단지 활성 지역)
const SAMPLE_FLYER_DATA = [
  // 의정부역 주변
  { position: [127.0478, 37.7411], count: 25, name: '의정부역' },
  { position: [127.0468, 37.7421], count: 18, name: '의정부역 북쪽' },
  { position: [127.0488, 37.7401], count: 22, name: '의정부역 남쪽' },

  // 회룡역 주변
  { position: [127.0444, 37.7394], count: 15, name: '회룡역' },
  { position: [127.0434, 37.7404], count: 12, name: '회룡역 북쪽' },

  // 의정부 시청 주변
  { position: [127.0336, 37.7381], count: 20, name: '의정부 시청' },
  { position: [127.0346, 37.7391], count: 17, name: '시청 북쪽' },

  // 가능역 주변
  { position: [127.0512, 37.7369], count: 14, name: '가능역' },
  { position: [127.0522, 37.7379], count: 11, name: '가능역 북쪽' },

  // 의정부 중앙로 상권
  { position: [127.0395, 37.7425], count: 19, name: '중앙로 상권' },
  { position: [127.0405, 37.7435], count: 16, name: '중앙로 북부' },

  // 호원동 상권
  { position: [127.0551, 37.7512], count: 13, name: '호원동' },
  { position: [127.0561, 37.7522], count: 10, name: '호원동 북쪽' },
];

// AI 추천 매장 마커 데이터
const AI_RECOMMENDED_STORES = [
  { position: [127.0478, 37.7411], name: '유기농 샐러드 카페', discount: '30% OFF', distance: '0.3km' },
  { position: [127.0468, 37.7421], name: '프리미엄 요가 스튜디오', discount: 'Free Trial', distance: '0.8km' },
  { position: [127.0488, 37.7401], name: '아티산 커피', discount: 'Buy 2 Get 1', distance: '0.5km' },
  { position: [127.0444, 37.7394], name: '의정부 베이커리', discount: '20% OFF', distance: '0.6km' },
  { position: [127.0336, 37.7381], name: '건강한 도시락', discount: '1+1', distance: '1.2km' },
];

export default function MapView({
  center = [127.0478, 37.7411], // 의정부역 좌표
  zoom = 13.5,
  showHeatmap = true,
  showMarkers = true,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const deckgl = useRef<Deck | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize Mapbox map with dark style
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        name: 'Townin Dark',
        sources: {
          'raster-tiles': {
            type: 'raster',
            tiles: [
              'https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/{z}/{x}/{y}?access_token=' + mapboxgl.accessToken
            ],
            tileSize: 256,
          },
        },
        layers: [
          {
            id: 'simple-tiles',
            type: 'raster',
            source: 'raster-tiles',
            minzoom: 0,
            maxzoom: 22,
          },
        ],
        glyphs: 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf',
      },
      center: center,
      zoom: zoom,
      pitch: 45, // 3D tilt
      bearing: 0,
      antialias: true,
    });

    map.current.on('load', () => {
      setMapLoaded(true);

      // Add 3D buildings layer
      if (map.current) {
        map.current.addLayer({
          id: '3d-buildings',
          source: 'composite',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          type: 'fill-extrusion',
          minzoom: 14,
          paint: {
            'fill-extrusion-color': '#1C2026',
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              14,
              0,
              14.05,
              ['get', 'height'],
            ],
            'fill-extrusion-base': [
              'interpolate',
              ['linear'],
              ['zoom'],
              14,
              0,
              14.05,
              ['get', 'min_height'],
            ],
            'fill-extrusion-opacity': 0.6,
          },
        });
      }

      // Add custom markers for AI recommended stores
      if (showMarkers) {
        AI_RECOMMENDED_STORES.forEach((store) => {
          const el = document.createElement('div');
          el.className = 'ai-marker';
          el.innerHTML = `
            <div class="marker-pulse"></div>
            <div class="marker-core">✨</div>
          `;

          el.addEventListener('click', () => {
            alert(`${store.name}\n${store.discount}\n거리: ${store.distance}`);
          });

          if (map.current) {
            new mapboxgl.Marker({ element: el })
              .setLngLat(store.position as [number, number])
              .addTo(map.current);
          }
        });
      }
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      if (deckgl.current) {
        deckgl.current.finalize();
      }
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Initialize deck.gl overlay
    const layers = [];

    // Hexagon heatmap layer (GraphRAG density)
    if (showHeatmap) {
      layers.push(
        new HexagonLayer({
          id: 'heatmap',
          data: SAMPLE_FLYER_DATA,
          getPosition: (d: any) => d.position,
          getElevationWeight: (d: any) => d.count,
          elevationScale: 100,
          extruded: true,
          radius: 200,
          coverage: 0.8,
          upperPercentile: 100,
          colorRange: [
            [245, 166, 35, 50],   // Light gold
            [245, 166, 35, 100],
            [245, 166, 35, 150],
            [245, 166, 35, 200],
            [245, 166, 35, 255],  // Full gold
          ],
          opacity: 0.6,
          pickable: true,
          onClick: (info: any) => {
            if (info.object) {
              console.log('Hexagon clicked:', info.object);
            }
          },
        })
      );
    }

    // Scatterplot layer for flyer hotspots
    if (showMarkers) {
      layers.push(
        new ScatterplotLayer({
          id: 'scatterplot',
          data: SAMPLE_FLYER_DATA,
          getPosition: (d: any) => d.position,
          getRadius: (d: any) => Math.sqrt(d.count) * 30,
          getFillColor: [245, 166, 35, 180],
          getLineColor: [245, 166, 35, 255],
          lineWidthMinPixels: 2,
          opacity: 0.8,
          pickable: true,
          stroked: true,
          filled: true,
          radiusMinPixels: 5,
          radiusMaxPixels: 50,
          onClick: (info: any) => {
            if (info.object) {
              alert(`${info.object.name}\n활성 전단지: ${info.object.count}개`);
            }
          },
        })
      );
    }

    deckgl.current = new Deck({
      canvas: 'deck-canvas',
      width: '100%',
      height: '100%',
      initialViewState: {
        longitude: center[0],
        latitude: center[1],
        zoom: zoom,
        pitch: 45,
        bearing: 0,
      },
      controller: true,
      layers: layers,
      onViewStateChange: ({ viewState }: any) => {
        if (map.current) {
          map.current.jumpTo({
            center: [viewState.longitude, viewState.latitude],
            zoom: viewState.zoom,
            bearing: viewState.bearing,
            pitch: viewState.pitch,
          });
        }
      },
    });

    return () => {
      if (deckgl.current) {
        deckgl.current.finalize();
      }
    };
  }, [mapLoaded, showHeatmap, showMarkers]);

  return (
    <div className="map-view-container">
      {/* Search Bar */}
      <div className="map-search-bar">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="의정부역 근처 카페, 30% 할인 음식점..."
          className="search-input"
        />
        <button className="search-filter-btn">🎯</button>
        <button className="search-location-btn">📍</button>
      </div>

      {/* Map Container */}
      <div ref={mapContainer} className="map-container" />

      {/* Deck.gl Canvas Overlay */}
      <canvas id="deck-canvas" className="deck-canvas" />

      {/* Layer Controls */}
      <div className="map-layer-controls">
        <button className="layer-btn active" title="GraphRAG 히트맵">
          🔥
        </button>
        <button className="layer-btn" title="안전 레이어">
          🛡️
        </button>
        <button className="layer-btn" title="실시간 활성">
          ⚡
        </button>
        <button className="layer-btn" title="3D 건물">
          🏢
        </button>
      </div>

      {/* Legend */}
      <div className="map-legend">
        <div className="legend-item">
          <span className="legend-color" style={{ background: '#F5A623' }}></span>
          <span>AI 추천 고밀도</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon">✨</span>
          <span>AI 추천 매장</span>
        </div>
      </div>
    </div>
  );
}
