import { useEffect, useState, useRef } from 'react';
import { X, Eye, Sparkles, MapPin, Clock, Tag, TrendingUp, Coins } from 'lucide-react';
import './FlyerDetailModal.css';

interface FlyerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  flyer: {
    id: string;
    imageUrl: string;
    title: string;
    description: string;
    category: string;
    distance?: string;
    discount?: string;
    points: number;
    merchantName?: string;
    validUntil?: string;
    terms?: string[];
  } | null;
  onEarnPoints?: (flyerId: string, points: number) => void;
}

export default function FlyerDetailModal({ isOpen, onClose, flyer, onEarnPoints }: FlyerDetailModalProps) {
  const [viewTime, setViewTime] = useState(0);
  const [pointsEarned, setPointsEarned] = useState(false);
  const [showPointsAnimation, setShowPointsAnimation] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const WATCH_TIME = 3; // 3초 시청 후 포인트 적립

  // 시청 시간 추적
  useEffect(() => {
    if (isOpen && flyer) {
      setViewTime(0);
      setPointsEarned(false);

      intervalRef.current = setInterval(() => {
        setViewTime((prev) => {
          const newTime = prev + 0.1;

          // 3초 시청 완료 시 포인트 적립
          if (newTime >= WATCH_TIME && !pointsEarned) {
            setPointsEarned(true);
            setShowPointsAnimation(true);

            if (onEarnPoints) {
              onEarnPoints(flyer.id, flyer.points);
            }

            // 애니메이션 후 자동 숨김
            setTimeout(() => {
              setShowPointsAnimation(false);
            }, 2000);
          }

          return newTime;
        });
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setViewTime(0);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isOpen, flyer, pointsEarned, onEarnPoints]);

  // ESC 키로 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Body 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !flyer) return null;

  const progress = (viewTime / WATCH_TIME) * 100;

  return (
    <div className="flyer-modal-overlay" onClick={onClose}>
      <div className="flyer-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="modal-close-btn" onClick={onClose} aria-label="닫기">
          <X size={24} />
        </button>

        {/* Points Earned Animation */}
        {showPointsAnimation && (
          <div className="points-earned-popup">
            <Coins size={24} />
            <span>+{flyer.points}P 적립!</span>
          </div>
        )}

        {/* Progress Bar (for watching time) */}
        {!pointsEarned && (
          <div className="watch-progress-bar">
            <div className="watch-progress-fill" style={{ width: `${progress}%` }} />
            <span className="watch-progress-text">
              {Math.ceil(WATCH_TIME - viewTime)}초 후 {flyer.points}P 적립
            </span>
          </div>
        )}

        {/* Modal Body */}
        <div className="modal-body-scroll">
          {/* Hero Image */}
          <div className="modal-hero-image" style={{ backgroundImage: `url(${flyer.imageUrl})` }}>
            {flyer.discount && (
              <div className="modal-discount-badge">
                {flyer.discount}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="modal-content-section">
            {/* Title */}
            <h2 className="modal-title">{flyer.title}</h2>

            {/* Meta Info */}
            <div className="modal-meta">
              {flyer.merchantName && (
                <div className="meta-item">
                  <Tag size={16} />
                  <span>{flyer.merchantName}</span>
                </div>
              )}
              {flyer.distance && (
                <div className="meta-item">
                  <MapPin size={16} />
                  <span>{flyer.distance}</span>
                </div>
              )}
              {flyer.category && (
                <div className="meta-item">
                  <TrendingUp size={16} />
                  <span>{flyer.category}</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="modal-description">
              <h3>상세 내용</h3>
              <p>{flyer.description}</p>
            </div>

            {/* Terms & Conditions */}
            {flyer.terms && flyer.terms.length > 0 && (
              <div className="modal-terms">
                <h3>유의사항</h3>
                <ul>
                  {flyer.terms.map((term, index) => (
                    <li key={index}>{term}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Valid Until */}
            {flyer.validUntil && (
              <div className="modal-validity">
                <Clock size={16} />
                <span>유효기간: {flyer.validUntil}까지</span>
              </div>
            )}

            {/* Stats */}
            <div className="modal-stats">
              <div className="stat-item">
                <Eye size={20} />
                <span className="stat-label">조회</span>
                <span className="stat-value">-</span>
              </div>
              <div className="stat-item">
                <Sparkles size={20} />
                <span className="stat-label">클릭</span>
                <span className="stat-value">-</span>
              </div>
              <div className="stat-item">
                <Coins size={20} />
                <span className="stat-label">포인트</span>
                <span className="stat-value">{flyer.points}P</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="modal-actions">
              <button className="action-btn primary" disabled={!pointsEarned}>
                {pointsEarned ? '방문하기' : `${Math.ceil(WATCH_TIME - viewTime)}초 후 활성화`}
              </button>
              <button className="action-btn secondary" onClick={onClose}>
                닫기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
