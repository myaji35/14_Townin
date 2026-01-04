import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import UserSidebar from '../components/user/UserSidebar';
import FlyerCardPremium from '../components/user/FlyerCardPremium';
import FlyerDetailModal from '../components/user/FlyerDetailModal';
import FamilyMemberManagement from '../components/user/FamilyMemberManagement';
import MapView from '../components/map/MapView';
import LanguageToggle from '../components/LanguageToggle';
import './UserDashboard.css';

export default function UserDashboard() {
  const { t } = useLanguage();
  const [activeNav, setActiveNav] = useState('flyers');
  const [selectedLocation, setSelectedLocation] = useState(t('location.uijeongbuFull'));
  const [currentPoints, setCurrentPoints] = useState(2450);
  const [pointsGained, setPointsGained] = useState(350);
  const [selectedFlyer, setSelectedFlyer] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNavChange = (nav: string) => {
    setActiveNav(nav);
    console.log('Navigation changed to:', nav);
  };

  const handleEarnPoints = (flyerId: string, points: number) => {
    console.log(`Earning ${points} points from flyer ${flyerId}`);
    setCurrentPoints(prev => prev + points);
    setPointsGained(prev => prev + points);
    // TODO: API call to record points
  };

  const handleFlyerClick = (flyer: any) => {
    setSelectedFlyer(flyer);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedFlyer(null), 300);
  };

  // Categories for filtering
  const categories = [
    { id: 'all', label: t('category.all') },
    { id: 'food', label: t('category.food') },
    { id: 'health', label: t('category.health') },
    { id: 'retail', label: t('category.retail') },
    { id: 'entertainment', label: t('category.entertainment') },
  ];

  // Demo flyer data
  const flyerData = [
    {
      id: 'flyer-1',
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop',
      title: 'Organic Garden Salad Bowl',
      description: 'Fresh seasonal vegetables with premium olive oil dressing. Limited time offer at Green Leaf Café.',
      category: 'Food & Dining',
      categoryId: 'food',
      distance: '0.3km',
      aiRecommended: true,
      matchScore: 95,
      discount: '30% OFF',
      badgeType: 'hot' as const,
      points: 25,
    },
    {
      id: 'flyer-2',
      imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop',
      title: 'Premium Yoga Studio Trial',
      description: 'Experience mindfulness and wellness with our certified instructors. First class free!',
      category: 'Health & Wellness',
      categoryId: 'health',
      distance: '0.8km',
      aiRecommended: true,
      matchScore: 88,
      discount: 'Free Trial',
      badgeType: 'free' as const,
      badge: 'NEW MEMBER OFFER',
      points: 25,
    },
    {
      id: 'flyer-3',
      imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop',
      title: 'Local Fashion Boutique Sale',
      description: 'Curated collection of sustainable fashion. Up to 50% off selected items this weekend.',
      category: 'Retail Shopping',
      categoryId: 'retail',
      distance: '1.2km',
      matchScore: 72,
      discount: '50% OFF',
      badgeType: 'hot' as const,
      badge: 'HOT DEAL',
      points: 20,
    },
    {
      id: 'flyer-4',
      imageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&h=400&fit=crop',
      title: 'Artisan Coffee Roastery',
      description: 'Single-origin beans roasted daily. Buy 2 bags, get 1 free loyalty rewards.',
      category: 'Food & Dining',
      categoryId: 'food',
      distance: '0.5km',
      aiRecommended: true,
      matchScore: 85,
      discount: 'Buy 2 Get 1',
      badgeType: 'new' as const,
      points: 25,
    },
  ];

  // Filter flyers based on selected category
  const filteredFlyers = selectedCategory === 'all'
    ? flyerData
    : flyerData.filter(flyer => flyer.categoryId === selectedCategory);

  return (
    <div className="user-dashboard-container">
      {/* Left Sidebar */}
      <UserSidebar
        currentPoints={currentPoints}
        pointsGained={pointsGained}
        userName="Alex Johnson"
        userRole="Premium Member"
        activeNav={activeNav}
        onNavChange={handleNavChange}
      />

      {/* Main Content Area */}
      <main className="dashboard-main">
        {/* Conditional rendering based on activeNav */}
        {activeNav === 'family' ? (
          <FamilyMemberManagement />
        ) : (
          <>
            {/* Top Header */}
            <header className="dashboard-header">
              <button className="location-selector">
                <span className="location-icon">📍</span>
                <span>{selectedLocation}</span>
                <span className="dropdown-icon">▼</span>
              </button>
              <h2 className="page-title">{t('common.digitalFlyers')}</h2>
              <LanguageToggle />
            </header>

        {/* Hero Card - AI GraphRAG Analysis */}
        <section className="hero-banner">
          <div className="hero-icon-box">
            <span className="hero-icon">✨</span>
          </div>
          <div className="hero-text">
            <h3>
              {t('dashboard.graphragTitle')}
              <span className="badge-new">{t('dashboard.badge.new')}</span>
            </h3>
            <p>
              {t('dashboard.graphragDescription')}
            </p>
          </div>
        </section>

        {/* Category Filter */}
        <div className="category-filter">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`category-chip ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Section Header */}
        <div className="section-header">
          <h3>
            <span className="section-icon">🎯</span>
            {t('dashboard.recommendedForYou')}
          </h3>
          <div className="arrows">
            <button className="arrow-btn" aria-label="Previous">‹</button>
            <button className="arrow-btn" aria-label="Next">›</button>
          </div>
        </div>

        {/* Flyer Cards Grid */}
        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>전단지를 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h3>전단지를 불러올 수 없습니다</h3>
            <p>{error}</p>
            <button className="retry-btn" onClick={() => setError(null)}>
              다시 시도
            </button>
          </div>
        ) : filteredFlyers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>전단지가 없습니다</h3>
            <p>선택한 카테고리에 해당하는 전단지가 없습니다.</p>
            <button className="reset-filter-btn" onClick={() => setSelectedCategory('all')}>
              전체 보기
            </button>
          </div>
        ) : (
          <div className="flyers-grid">
            {filteredFlyers.map((flyer) => (
              <FlyerCardPremium
                key={flyer.id}
                imageUrl={flyer.imageUrl}
                title={flyer.title}
                description={flyer.description}
                category={flyer.category}
                distance={flyer.distance}
                aiRecommended={flyer.aiRecommended}
                matchScore={flyer.matchScore}
                discount={flyer.discount}
                badge={flyer.badge}
                badgeType={flyer.badgeType}
                points={flyer.points}
                onClick={() => handleFlyerClick(flyer)}
                onEarnPoints={() => handleEarnPoints(flyer.id, flyer.points)}
              />
            ))}
          </div>
        )}

            {/* Load More Section */}
            <div className="load-more-section">
              <button className="load-more-btn">
                <span>{t('dashboard.loadMore')}</span>
                <span className="load-icon">↓</span>
              </button>
            </div>
          </>
        )}
      </main>

      {/* Right Map Panel */}
      <MapView
        center={[127.0478, 37.7411]}
        zoom={13.5}
        showHeatmap={true}
        showMarkers={true}
      />

      {/* Flyer Detail Modal */}
      <FlyerDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        flyer={selectedFlyer}
        onEarnPoints={handleEarnPoints}
      />
    </div>
  );
}
