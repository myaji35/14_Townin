import { useEffect, useState, useRef } from 'react';
import './FlyerDetailModal.css';

interface Flyer {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  merchant: {
    businessName: string;
  };
  viewCount: number;
  clickCount: number;
}

interface FlyerDetailModalProps {
  flyer: Flyer | null;
  isOpen: boolean;
  onClose: () => void;
  onWatchComplete?: (flyerId: string) => void;
}

export default function FlyerDetailModal({ flyer, isOpen, onClose, onWatchComplete }: FlyerDetailModalProps) {
  const [viewTime, setViewTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const maxViewTime = 5; // 최대 5초

  // 시청 시간 카운터
  useEffect(() => {
    if (isOpen) {
      setViewTime(0);
      intervalRef.current = setInterval(() => {
        setViewTime((prev) => {
          const newTime = prev + 0.1;
          if (newTime >= maxViewTime) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            // 5초 시청 완료 시 콜백 호출
            if (flyer && onWatchComplete) {
              onWatchComplete(flyer.id);
            }
            return maxViewTime;
          }
          return newTime;
        });
      }, 100); // 0.1초마다 업데이트
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
  }, [isOpen]);

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

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !flyer) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="닫기">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="modal-body">
          {/* 이미지 섹션 */}
          <div className="modal-image-section">
            {flyer.imageUrl ? (
              <img src={flyer.imageUrl} alt={flyer.title} className="modal-image" />
            ) : (
              <div className="modal-image-placeholder">
                <svg width="80" height="80" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* 정보 섹션 */}
          <div className="modal-info-section">
            <div className="modal-merchant">
              <div className="merchant-icon">🏪</div>
              <div className="merchant-info">
                <div className="merchant-header">
                  <h3>{flyer.merchant.businessName}</h3>
                  <span className="view-timer">
                    ⏱ {viewTime.toFixed(1)}초 / {maxViewTime}초
                  </span>
                </div>
                <span className="merchant-badge">공식 인증</span>
              </div>
            </div>

            <h2 className="modal-title">{flyer.title}</h2>
            <p className="modal-description">{flyer.description}</p>

            {/* 통계 정보 */}
            <div className="modal-stats">
              <div className="stat-item">
                <span className="stat-icon">👁</span>
                <span className="stat-label">조회수</span>
                <span className="stat-value">{flyer.viewCount.toLocaleString()}</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">👆</span>
                <span className="stat-label">클릭수</span>
                <span className="stat-value">{flyer.clickCount.toLocaleString()}</span>
              </div>
            </div>

            {/* 상세 정보 */}
            <div className="modal-details">
              <h4>상세 정보</h4>
              <div className="detail-item">
                <span className="detail-label">📍 위치</span>
                <span className="detail-value">의정부동 인근</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">⏰ 영업시간</span>
                <span className="detail-value">매일 09:00 - 22:00</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">📞 연락처</span>
                <span className="detail-value">031-123-4567</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">🏷️ 유효기간</span>
                <span className="detail-value">2025년 12월 31일까지</span>
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="modal-actions">
              <button className="action-button primary">
                <span>📞</span>
                전화하기
              </button>
              <button className="action-button secondary">
                <span>🗺️</span>
                길찾기
              </button>
              <button className="action-button secondary">
                <span>❤️</span>
                찜하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
