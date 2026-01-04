import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import Sidebar from '../components/Sidebar';
import GraphRAGBanner from '../components/GraphRAGBanner';
import FlyerCard from '../components/FlyerCard';
import UserMap from '../components/maps/UserMap';
import './DashboardPageNew.css';

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

export default function DashboardPageNew() {
  const [flyers, setFlyers] = useState<Flyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [activeMenu, setActiveMenu] = useState('home');
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = authService.getUser();
    const mockUser = currentUser || { email: 'user1@example.com', role: 'user', id: '1' };
    setUser(mockUser);
    loadFlyers();
  }, [navigate]);

  const loadFlyers = async () => {
    try {
      const mockFlyers: Flyer[] = [
        {
          id: '1',
          title: '30% OFF Organic Salad Subscription',
          description: 'Exclusive discount based on your recent searches for healthy options. Perfect for your daily nutrition needs!',
          imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=450&fit=crop',
          merchant: { businessName: 'FRESH GREENS MARKET' },
          viewCount: 234,
          clickCount: 45,
        },
        {
          id: '2',
          title: 'Free Trial + 500P Bonus for Joiners',
          description: 'Start your wellness journey with us. First class free + earn 500 points instantly when you sign up!',
          imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=450&fit=crop',
          merchant: { businessName: 'AURA YOGA STUDIO' },
          viewCount: 156,
          clickCount: 28,
        },
        {
          id: '3',
          title: 'Premium Coffee Beans 20% Off',
          description: 'Artisanal coffee from local roasters. Limited time offer for neighborhood members only.',
          imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=450&fit=crop',
          merchant: { businessName: 'TOWNIN CAFE' },
          viewCount: 567,
          clickCount: 89,
        },
        {
          id: '4',
          title: 'Fresh Bakery Opening Special',
          description: 'Grand opening this weekend! Free pastry with any coffee purchase.',
          imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=450&fit=crop',
          merchant: { businessName: 'ARTISAN BAKERY' },
          viewCount: 423,
          clickCount: 67,
        },
        {
          id: '5',
          title: 'Local Organic Produce Market',
          description: 'Farm-fresh vegetables and fruits delivered to your neighborhood every week.',
          imageUrl: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600&h=450&fit=crop',
          merchant: { businessName: 'GREEN VALLEY FARM' },
          viewCount: 198,
          clickCount: 32,
        },
        {
          id: '6',
          title: 'Fitness Center Membership Sale',
          description: 'Join now and get 2 months free! State-of-the-art equipment and personal training included.',
          imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=450&fit=crop',
          merchant: { businessName: 'POWER GYM' },
          viewCount: 345,
          clickCount: 56,
        },
      ];
      setFlyers(mockFlyers);
    } catch (error) {
      console.error('Failed to load flyers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuChange = (menuId: string) => {
    setActiveMenu(menuId);
  };

  const handleFlyerClick = (flyer: Flyer) => {
    console.log('Flyer clicked:', flyer);
    // Navigate to flyer detail or open modal
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-new">
      {/* Sidebar */}
      <Sidebar
        currentPoints={2450}
        streak={7}
        activeMenu={activeMenu}
        onMenuChange={handleMenuChange}
      />

      {/* Main Content */}
      <main className="dashboard-main-content">
        {/* Search Bar */}
        <div className="search-section">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search shops, stores..."
              className="search-input"
            />
          </div>
          <button className="notification-btn">
            <span>🔔</span>
          </button>
        </div>

        {/* Personalized Flyers Section Title */}
        <div className="section-header">
          <h2 className="section-title">Personalized Flyers</h2>
        </div>

        {/* GraphRAG Banner */}
        <GraphRAGBanner />

        {/* Recommendations Section */}
        <div className="recommendations-header">
          <h3 className="recommendations-title">
            <span className="title-icon">✨</span>
            This Week's Recommendations
          </h3>
          <div className="nav-arrows">
            <button className="nav-arrow" aria-label="Previous">
              ←
            </button>
            <button className="nav-arrow" aria-label="Next">
              →
            </button>
          </div>
        </div>

        {/* Flyers Grid */}
        <div className="flyers-grid-new">
          {flyers.map((flyer, index) => (
            <FlyerCard
              key={flyer.id}
              id={flyer.id}
              title={flyer.title}
              description={flyer.description}
              imageUrl={flyer.imageUrl}
              merchantName={flyer.merchant.businessName}
              merchantBadge={index === 0 ? '✨ Personalized' : undefined}
              isHotDeal={index === 2}
              onClick={() => handleFlyerClick(flyer)}
            />
          ))}
        </div>
      </main>

      {/* Map Sidebar */}
      <aside className="dashboard-map-sidebar">
        <div className="map-container">
          <UserMap />
        </div>

        {/* Personalized Help */}
        <div className="help-section">
          <button className="help-btn">
            <span className="help-icon">💬</span>
            <span>Personalized Help</span>
          </button>
          <p className="help-text">Get recommendations matching your neighborhood</p>
        </div>
      </aside>
    </div>
  );
}
