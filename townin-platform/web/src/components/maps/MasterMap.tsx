import { APIProvider, Map } from '@vis.gl/react-google-maps';
import { useState, useEffect } from 'react';
import { latLngToCell, cellToBoundary } from 'h3-js';
import './MasterMap.css';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE';

interface H3Data {
  h3Index: string;
  value: number;
  lat: number;
  lng: number;
}

type MetricType = 'users' | 'flyers' | 'engagement';

export default function MasterMap() {
  const [metric, setMetric] = useState<MetricType>('users');
  const [resolution, setResolution] = useState(8); // H3 resolution
  const [h3Data, setH3Data] = useState<H3Data[]>([]);

  const center = { lat: 37.738, lng: 127.034 };

  useEffect(() => {
    generateH3Heatmap();
  }, [metric, resolution]);

  const generateH3Heatmap = () => {
    // Generate sample H3 data
    const data: H3Data[] = [];
    const basePoints = [
      { lat: 37.738, lng: 127.034, intensity: 100 },
      { lat: 37.740, lng: 127.036, intensity: 80 },
      { lat: 37.735, lng: 127.032, intensity: 60 },
      { lat: 37.742, lng: 127.038, intensity: 90 },
      { lat: 37.736, lng: 127.030, intensity: 70 },
    ];

    basePoints.forEach(point => {
      const h3Index = latLngToCell(point.lat, point.lng, resolution);
      data.push({
        h3Index,
        value: point.intensity * (metric === 'users' ? 1 : metric === 'flyers' ? 0.8 : 0.6),
        lat: point.lat,
        lng: point.lng,
      });
    });

    setH3Data(data);
  };

  const getHeatmapColor = (value: number, maxValue: number): string => {
    const ratio = value / maxValue;
    if (ratio > 0.8) return 'rgba(220, 38, 38, 0.6)'; // red
    if (ratio > 0.6) return 'rgba(234, 88, 12, 0.6)'; // orange
    if (ratio > 0.4) return 'rgba(234, 179, 8, 0.6)'; // yellow
    if (ratio > 0.2) return 'rgba(34, 197, 94, 0.6)'; // green
    return 'rgba(59, 130, 246, 0.6)'; // blue
  };

  const maxValue = Math.max(...h3Data.map(d => d.value), 1);

  const getMetricLabel = (metric: MetricType): string => {
    switch (metric) {
      case 'users':
        return '사용자 밀도';
      case 'flyers':
        return '전단지 분포';
      case 'engagement':
        return '참여도';
    }
  };

  return (
    <div className="master-map-container">
      <div className="map-controls">
        <div className="control-group">
          <label>데이터 유형</label>
          <div className="button-group">
            <button
              className={metric === 'users' ? 'active' : ''}
              onClick={() => setMetric('users')}
            >
              사용자
            </button>
            <button
              className={metric === 'flyers' ? 'active' : ''}
              onClick={() => setMetric('flyers')}
            >
              전단지
            </button>
            <button
              className={metric === 'engagement' ? 'active' : ''}
              onClick={() => setMetric('engagement')}
            >
              참여도
            </button>
          </div>
        </div>

        <div className="control-group">
          <label>해상도</label>
          <div className="button-group">
            <button
              className={resolution === 7 ? 'active' : ''}
              onClick={() => setResolution(7)}
            >
              구 단위
            </button>
            <button
              className={resolution === 8 ? 'active' : ''}
              onClick={() => setResolution(8)}
            >
              동 단위
            </button>
            <button
              className={resolution === 9 ? 'active' : ''}
              onClick={() => setResolution(9)}
            >
              거리 단위
            </button>
          </div>
        </div>
      </div>

      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
        <Map
          defaultCenter={center}
          defaultZoom={13}
          mapId="master-heatmap"
          gestureHandling="greedy"
          disableDefaultUI={false}
          styles={[
            {
              elementType: 'geometry',
              stylers: [{ color: '#242f3e' }],
            },
            {
              elementType: 'labels.text.stroke',
              stylers: [{ color: '#242f3e' }],
            },
            {
              elementType: 'labels.text.fill',
              stylers: [{ color: '#746855' }],
            },
          ]}
        >
          {h3Data.map((data) => {
            const boundary = cellToBoundary(data.h3Index, true);
            const paths = boundary.map(([lat, lng]) => ({ lat, lng }));
            const color = getHeatmapColor(data.value, maxValue);

            return (
              <div key={data.h3Index}>
                {/* Polygon rendering would go here with advanced Map API */}
              </div>
            );
          })}
        </Map>
      </APIProvider>

      <div className="map-stats">
        <h4>{getMetricLabel(metric)}</h4>
        <div className="stat-grid">
          <div className="stat-item">
            <span className="stat-label">총 영역</span>
            <span className="stat-value">{h3Data.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">평균 값</span>
            <span className="stat-value">
              {(h3Data.reduce((sum, d) => sum + d.value, 0) / h3Data.length).toFixed(1)}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">최대 값</span>
            <span className="stat-value">{maxValue.toFixed(1)}</span>
          </div>
        </div>

        <div className="heatmap-legend">
          <span className="legend-label">낮음</span>
          <div className="legend-gradient"></div>
          <span className="legend-label">높음</span>
        </div>
      </div>
    </div>
  );
}
