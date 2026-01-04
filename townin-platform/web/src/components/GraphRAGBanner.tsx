import './GraphRAGBanner.css';

interface GraphRAGBannerProps {
  onDismiss?: () => void;
}

export default function GraphRAGBanner({ onDismiss }: GraphRAGBannerProps) {
  return (
    <div className="graphrag-banner">
      <div className="banner-icon">
        <span className="icon-badge">📊</span>
      </div>

      <div className="banner-content">
        <div className="banner-header">
          <h3 className="banner-title">
            AI GraphRAG Analysis Complete
            <span className="badge-new">NEW</span>
          </h3>
        </div>

        <p className="banner-description">
          We identified your city-level context and dynamically configured your
          lifestyle graph and insurance scoring platform.
        </p>
      </div>

      {onDismiss && (
        <button className="banner-close" onClick={onDismiss} aria-label="Dismiss">
          ×
        </button>
      )}
    </div>
  );
}
