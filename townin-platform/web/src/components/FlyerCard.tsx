import './FlyerCard.css';

interface FlyerCardProps {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  merchantName: string;
  merchantBadge?: string;
  points?: number;
  isHotDeal?: boolean;
  onClick?: () => void;
}

export default function FlyerCard({
  id,
  title,
  description,
  imageUrl,
  merchantName,
  merchantBadge,
  points = 25,
  isHotDeal = false,
  onClick
}: FlyerCardProps) {
  return (
    <div className="flyer-card-new" onClick={onClick}>
      {/* Image Section */}
      <div className="flyer-card-image">
        {imageUrl ? (
          <img src={imageUrl} alt={title} loading="lazy" />
        ) : (
          <div className="flyer-card-placeholder">
            <span>📰</span>
          </div>
        )}

        {/* Hot Deal Badge */}
        {isHotDeal && (
          <div className="hot-deal-badge">HOT DEAL</div>
        )}

        {/* Merchant Badge */}
        {merchantBadge && (
          <div className="merchant-badge">{merchantBadge}</div>
        )}
      </div>

      {/* Content Section */}
      <div className="flyer-card-body">
        {/* Merchant Name */}
        <div className="flyer-merchant-name">{merchantName}</div>

        {/* Title */}
        <h4 className="flyer-card-title">{title}</h4>

        {/* Description */}
        <p className="flyer-card-description">{description}</p>

        {/* CTA Button */}
        <button className="earn-points-btn" onClick={(e) => e.stopPropagation()}>
          <span className="btn-icon">⚡</span>
          <span>Earn Points</span>
        </button>
      </div>
    </div>
  );
}
