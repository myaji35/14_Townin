import { useState } from 'react';
import './MapPanel.css';

interface MapPin {
  id: string;
  lat: number;
  lng: number;
  type: 'flyer' | 'user' | 'merchant';
  active?: boolean;
}

interface MapPanelProps {
  pins?: MapPin[];
  onPinClick?: (pinId: string) => void;
  userName?: string;
}

export default function MapPanel({
  pins = [],
  onPinClick,
  userName = 'Alex',
}: MapPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [zoomLevel, setZoomLevel] = useState(14);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 1, 18));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 1, 10));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  return (
    <aside className="map-panel">
      {/* Map Background Grid */}
      <div className="map-background">
        {/* Simulated map pins */}
        {pins.map((pin) => (
          <div
            key={pin.id}
            className={`map-pin ${pin.type} ${pin.active ? 'active' : ''}`}
            style={{
              top: `${pin.lat}%`,
              left: `${pin.lng}%`,
            }}
            onClick={() => onPinClick?.(pin.id)}
          />
        ))}

        {/* Default demo pins if none provided */}
        {pins.length === 0 && (
          <>
            <div className="map-pin flyer active" style={{ top: '30%', left: '40%' }} />
            <div className="map-pin flyer" style={{ top: '45%', left: '55%' }} />
            <div className="map-pin merchant" style={{ top: '60%', left: '35%' }} />
            <div className="map-pin flyer" style={{ top: '70%', left: '60%' }} />
            <div className="map-pin user" style={{ top: '50%', left: '50%' }} />
          </>
        )}
      </div>

      {/* Floating Search Bar */}
      <div className="search-bar-floating">
        <form onSubmit={handleSearch} style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '12px' }}>
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search locations, flyers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="search-btn" aria-label="Search">
            <span>→</span>
          </button>
        </form>
      </div>

      {/* Map Controls */}
      <div className="map-controls">
        <button
          className="control-btn"
          onClick={handleZoomIn}
          aria-label="Zoom in"
          title="Zoom in"
        >
          +
        </button>
        <button
          className="control-btn"
          onClick={handleZoomOut}
          aria-label="Zoom out"
          title="Zoom out"
        >
          −
        </button>
        <button
          className="control-btn"
          aria-label="Recenter map"
          title="Recenter"
        >
          ⊙
        </button>
        <button
          className="control-btn"
          aria-label="Layers"
          title="Map layers"
        >
          ☰
        </button>
      </div>

      {/* Bottom Widget */}
      <div className="map-widget">
        <div className="widget-icon">🗺️</div>
        <div className="widget-content">
          <h4>Personalized Map</h4>
          <p>Showing {pins.length || 5} nearby flyers for {userName}</p>
        </div>
        <button className="widget-action" aria-label="Expand map">
          <span>↗</span>
        </button>
      </div>

      {/* Zoom level indicator (optional debug) */}
      <div className="zoom-indicator">
        Zoom: {zoomLevel}
      </div>
    </aside>
  );
}
