import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import api from '../services/api';
import FlyerDetailModal from '../components/FlyerDetailModal';
import UserMap from '../components/maps/UserMap';
import './DashboardPage.css';

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

type FilterType = 'all' | 'unwatched' | 'liked' | 'highClicks' | 'lowClicks';

export default function DashboardPage() {
  const [flyers, setFlyers] = useState<Flyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedFlyer, setSelectedFlyer] = useState<Flyer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [watchedFlyers, setWatchedFlyers] = useState<Set<string>>(new Set());
  const [likedFlyers, setLikedFlyers] = useState<Set<string>>(new Set());
  const [currentFilter, setCurrentFilter] = useState<FilterType>('all');
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = authService.getUser();
    // Temporarily allow access without authentication for demo
    const mockUser = currentUser || { email: 'user1@example.com', role: 'user', id: '1' };
    setUser(mockUser);
    loadFlyers();
    loadWatchedFlyers();
    loadLikedFlyers();
  }, [navigate]);

  const loadWatchedFlyers = () => {
    const stored = localStorage.getItem('watchedFlyers');
    let watchedSet: Set<string>;

    if (stored) {
      watchedSet = new Set(JSON.parse(stored));
    } else {
      // 초기 데모용: "신선한 과일"(id: 1)과 "헬스장"(id: 2)은 이미 시청 완료 상태
      watchedSet = new Set(['1', '2']);
      localStorage.setItem('watchedFlyers', JSON.stringify(['1', '2']));
    }

    setWatchedFlyers(watchedSet);
  };

  const loadLikedFlyers = () => {
    const stored = localStorage.getItem('likedFlyers');
    if (stored) {
      setLikedFlyers(new Set(JSON.parse(stored)));
    }
  };

  const markAsWatched = (flyerId: string) => {
    const newWatched = new Set(watchedFlyers);
    newWatched.add(flyerId);
    setWatchedFlyers(newWatched);
    localStorage.setItem('watchedFlyers', JSON.stringify(Array.from(newWatched)));
  };

  const toggleLike = (flyerId: string) => {
    const newLiked = new Set(likedFlyers);
    if (newLiked.has(flyerId)) {
      newLiked.delete(flyerId);
    } else {
      newLiked.add(flyerId);
    }
    setLikedFlyers(newLiked);
    localStorage.setItem('likedFlyers', JSON.stringify(Array.from(newLiked)));
  };

  const loadFlyers = async () => {
    try {
      // Mock data for demonstration
      const mockFlyers: Flyer[] = [
        {
          id: '1',
          title: '신선한 과일 50% 할인!',
          description: '오늘만 특가! 사과, 배, 귤 등 신선한 과일을 반값에',
          imageUrl: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&h=300&fit=crop',
          merchant: { businessName: '의정부 과일가게' },
          viewCount: 234,
          clickCount: 45,
        },
        {
          id: '2',
          title: '헬스장 회원권 특별 할인',
          description: '3개월 등록 시 1개월 무료! 최신 장비 완비',
          imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop',
          merchant: { businessName: '피트니스센터' },
          viewCount: 156,
          clickCount: 28,
        },
        {
          id: '3',
          title: '치킨 + 콜라 세트 12,900원',
          description: '바삭바삭한 황금 후라이드치킨',
          imageUrl: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&h=300&fit=crop',
          merchant: { businessName: '황금치킨' },
          viewCount: 567,
          clickCount: 89,
        },
        {
          id: '4',
          title: '신규 오픈 카페 커피 무료',
          description: '오픈 기념 아메리카노 1잔 무료 제공',
          imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop',
          merchant: { businessName: '브라운 카페' },
          viewCount: 423,
          clickCount: 67,
        },
        {
          id: '5',
          title: '학원 등록 할인 이벤트',
          description: '수학, 영어 전문 학원. 첫 달 50% 할인',
          imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop',
          merchant: { businessName: '스마트 학원' },
          viewCount: 198,
          clickCount: 32,
        },
        {
          id: '6',
          title: '피자 2판 주문 시 1판 무료',
          description: '맛있는 수제 피자를 저렴하게!',
          imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
          merchant: { businessName: '피자하우스' },
          viewCount: 345,
          clickCount: 56,
        },
      ];
      setFlyers(mockFlyers);
      // Uncomment below to use real API
      // const response = await api.get('/flyers');
      // setFlyers(response.data.slice(0, 6));
    } catch (error) {
      console.error('Failed to load flyers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
  };

  const handleFlyerClick = async (flyer: Flyer) => {
    try {
      // Track click (uncomment when API is ready)
      // await api.post(`/flyers/${flyer.id}/click`);

      // Open modal with flyer details
      setSelectedFlyer(flyer);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Failed to track click:', error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setSelectedFlyer(null);
    }, 300); // Wait for animation to complete
  };

  const getFilteredFlyers = () => {
    let filtered = [...flyers];

    switch (currentFilter) {
      case 'unwatched':
        filtered = filtered.filter(f => !watchedFlyers.has(f.id));
        break;
      case 'liked':
        filtered = filtered.filter(f => likedFlyers.has(f.id));
        break;
      case 'highClicks':
        filtered = filtered.sort((a, b) => b.clickCount - a.clickCount);
        break;
      case 'lowClicks':
        filtered = filtered.sort((a, b) => a.clickCount - b.clickCount);
        break;
      default:
        break;
    }

    return filtered;
  };

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Townin</h1>
          <div className="header-actions">
            <span className="user-email">{user?.email}</span>
            <button onClick={handleLogout} className="logout-button">
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <h2>안녕하세요!</h2>
            <p>의정부동의 새로운 소식을 확인해보세요</p>
          </div>
        </section>

        {/* Map Section */}
        <section className="map-section">
          <h3>내 주변 안전 지도</h3>
          <UserMap />
        </section>

        {/* Flyers Section */}
        <section className="flyers-section">
          <div className="section-header">
            <h3>내 주변 전단지</h3>
            <div className="filter-buttons">
              <button
                className={`filter-btn ${currentFilter === 'all' ? 'active' : ''}`}
                onClick={() => setCurrentFilter('all')}
              >
                전체
              </button>
              <button
                className={`filter-btn ${currentFilter === 'unwatched' ? 'active' : ''}`}
                onClick={() => setCurrentFilter('unwatched')}
              >
                미시청
              </button>
              <button
                className={`filter-btn ${currentFilter === 'liked' ? 'active' : ''}`}
                onClick={() => setCurrentFilter('liked')}
              >
                좋아요
              </button>
              <button
                className={`filter-btn ${currentFilter === 'highClicks' ? 'active' : ''}`}
                onClick={() => setCurrentFilter('highClicks')}
              >
                큰포인터순
              </button>
              <button
                className={`filter-btn ${currentFilter === 'lowClicks' ? 'active' : ''}`}
                onClick={() => setCurrentFilter('lowClicks')}
              >
                작은포인터순
              </button>
            </div>
          </div>

          <div className="flyers-grid">
            {getFilteredFlyers().map((flyer) => (
              <div
                key={flyer.id}
                className={`flyer-card ${watchedFlyers.has(flyer.id) ? 'watched' : ''}`}
                onClick={() => handleFlyerClick(flyer)}
              >
                {watchedFlyers.has(flyer.id) && (
                  <div className="watched-badge">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    시청완료
                  </div>
                )}
                <button
                  className={`like-button ${likedFlyers.has(flyer.id) ? 'liked' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLike(flyer.id);
                  }}
                >
                  ❤️
                </button>
                <div className="flyer-image">
                  {flyer.imageUrl ? (
                    <img src={flyer.imageUrl} alt={flyer.title} />
                  ) : (
                    <div className="flyer-placeholder">
                      <svg
                        width="48"
                        height="48"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flyer-content">
                  <div className="flyer-merchant">
                    {flyer.merchant?.businessName || '상점'}
                  </div>
                  <h4 className="flyer-title">{flyer.title}</h4>
                  <p className="flyer-description">{flyer.description}</p>
                  <div className="flyer-stats">
                    <span>👁 {flyer.viewCount}</span>
                    <span>👆 {flyer.clickCount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Community Section */}
        <section className="community-section">
          <h3>커뮤니티</h3>
          <div className="community-grid">
            <div className="community-card">
              <div className="community-icon">📰</div>
              <h4>동네 소식</h4>
            </div>
            <div className="community-card">
              <div className="community-icon">🛡️</div>
              <h4>안전 정보</h4>
            </div>
            <div className="community-card">
              <div className="community-icon">👥</div>
              <h4>이웃 찾기</h4>
            </div>
            <div className="community-card">
              <div className="community-icon">❓</div>
              <h4>문의하기</h4>
            </div>
          </div>
        </section>
      </div>

      {/* Flyer Detail Modal */}
      <FlyerDetailModal
        flyer={selectedFlyer}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onWatchComplete={markAsWatched}
      />
    </div>
  );
}
