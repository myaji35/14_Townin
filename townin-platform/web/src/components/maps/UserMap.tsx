import { APIProvider, Map, Marker, InfoWindow } from '@vis.gl/react-google-maps';
import { useState } from 'react';
import './UserMap.css';

interface SafetyFacility {
  id: string;
  type: 'cctv' | 'light' | 'parking' | 'bell';
  position: { lat: number; lng: number };
  name: string;
}

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE';

export default function UserMap() {
  const [selectedFacility, setSelectedFacility] = useState<SafetyFacility | null>(null);

  // Default center: 의정부시
  const center = { lat: 37.738, lng: 127.034 };

  // Sample safety facilities data
  const safetyFacilities: SafetyFacility[] = [
    { id: '1', type: 'cctv', position: { lat: 37.740, lng: 127.035 }, name: 'CCTV #1' },
    { id: '2', type: 'light', position: { lat: 37.736, lng: 127.032 }, name: '가로등 #1' },
    { id: '3', type: 'parking', position: { lat: 37.742, lng: 127.038 }, name: '공영주차장' },
    { id: '4', type: 'bell', position: { lat: 37.735, lng: 127.036 }, name: '비상벨 #1' },
    { id: '5', type: 'cctv', position: { lat: 37.741, lng: 127.033 }, name: 'CCTV #2' },
  ];

  const getMarkerIcon = (type: string) => {
    const icons: Record<string, string> = {
      cctv: '📹',
      light: '💡',
      parking: '🅿️',
      bell: '🔔',
    };
    return icons[type] || '📍';
  };

  return (
    <div className="user-map-container">
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
        <Map
          defaultCenter={center}
          defaultZoom={14}
          mapId="user-safety-map"
          gestureHandling="greedy"
          disableDefaultUI={false}
        >
          {safetyFacilities.map((facility) => (
            <Marker
              key={facility.id}
              position={facility.position}
              title={facility.name}
              onClick={() => setSelectedFacility(facility)}
            />
          ))}

          {selectedFacility && (
            <InfoWindow
              position={selectedFacility.position}
              onCloseClick={() => setSelectedFacility(null)}
            >
              <div className="info-window">
                <h4>{getMarkerIcon(selectedFacility.type)} {selectedFacility.name}</h4>
                <p>타입: {selectedFacility.type}</p>
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>

      <div className="map-legend">
        <h4>안전 시설</h4>
        <div className="legend-items">
          <div className="legend-item">
            <span>📹</span> CCTV
          </div>
          <div className="legend-item">
            <span>💡</span> 가로등
          </div>
          <div className="legend-item">
            <span>🅿️</span> 주차장
          </div>
          <div className="legend-item">
            <span>🔔</span> 비상벨
          </div>
        </div>
      </div>
    </div>
  );
}
