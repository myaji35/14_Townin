import { useLanguage } from '../../contexts/LanguageContext';
import { Sparkles, MapPin, Coins } from 'lucide-react';
import './FlyerCardPremium.css';

interface FlyerCardPremiumProps {
  imageUrl: string;
  title: string;
  description: string;
  category: string;
  distance?: string;
  aiRecommended?: boolean;
  matchScore?: number;
  discount?: string;
  badge?: string;
  badgeType?: 'hot' | 'new' | 'free';
  points: number;
  onClick?: () => void;
  onEarnPoints?: () => void;
}

export default function FlyerCardPremium({
  imageUrl,
  title,
  description,
  category,
  distance = '0.5km',
  aiRecommended = false,
  matchScore,
  discount,
  badge,
  badgeType = 'hot',
  points,
  onClick,
  onEarnPoints,
}: FlyerCardPremiumProps) {
  const { t } = useLanguage();

  return (
    <article className="flyer-card-premium" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      {/* Card Image */}
      <div
        className="card-image"
        style={{ backgroundImage: `url(${imageUrl})` }}
      >
        {aiRecommended && (
          <div className="ai-tag">
            <Sparkles className="ai-icon" size={14} /> {t('flyer.aiPick')}
          </div>
        )}

        {discount && (
          <div className={`offer-badge badge-${badgeType}`}>
            {discount}
          </div>
        )}

        {matchScore && (
          <div className="match-tag">
            {matchScore}% Match
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="card-body">
        {/* Meta Info */}
        <div className="meta">
          <span className="category">{category}</span>
          <span className="distance">
            <MapPin size={12} /> {distance}
          </span>
        </div>

        {/* Title */}
        <h4 className="card-title">{title}</h4>

        {/* Description */}
        <p className="card-desc">{description}</p>

        {/* Badge (optional) */}
        {badge && (
          <div className="flyer-badge">
            {badge}
          </div>
        )}

        {/* Action Button */}
        <button
          className="earn-points-btn"
          onClick={(e) => {
            e.stopPropagation();
            onEarnPoints?.();
          }}
        >
          <Coins className="btn-icon" size={16} />
          <span>Earn {points}P</span>
        </button>
      </div>
    </article>
  );
}
