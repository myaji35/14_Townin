import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import MerchantSidebar from '../components/merchant/MerchantSidebar';
import LanguageToggle from '../components/LanguageToggle';
import { authService } from '../services/auth';
import { merchantService } from '../services/merchant';
import type { Merchant } from '../services/merchant';
import { flyerService } from '../services/flyer';
import type { Flyer } from '../services/flyer';
import FlyerEditModal from '../components/FlyerEditModal';
import { MapPin, ChevronDown, Store, FileEdit, BarChart3, Settings, MessageCircle, Plus, Eye, Sparkles, FileText } from 'lucide-react';
import './MerchantDashboard.css';

export default function MerchantDashboard() {
  const { t } = useLanguage();
  const [user, setUser] = useState<any>(null);
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [flyers, setFlyers] = useState<Flyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingFlyer, setEditingFlyer] = useState<Flyer | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('dashboard');
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = authService.getUser();
    // Temporarily allow access without authentication for demo
    const mockUser = currentUser || { email: 'ceo@example.com', role: 'merchant', id: '1' };
    setUser(mockUser);
    loadMerchantData();
  }, [navigate]);

  const loadMerchantData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock merchant data
      const mockMerchant: Merchant = {
        id: '1',
        businessName: '스마일 치과의원',
        category: '의료/건강',
        gridCell: '의정부동',
        signboardStatus: 'open',
        totalViews: 3842,
        totalClicks: 687,
      };

      // Mock flyers data
      const mockFlyers: Flyer[] = [
        {
          id: '1',
          merchantId: '1',
          title: '스케일링 30% 할인 이벤트',
          description: '구강 건강의 시작! 전문 스케일링 30% 특별 할인',
          imageUrl: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=400&h=300&fit=crop',
          category: '의료/건강',
          gridCell: '의정부동',
          isActive: true,
          viewCount: 456,
          clickCount: 89,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          merchantId: '1',
          title: '임플란트 특가 프로모션',
          description: '최신 디지털 임플란트 시스템, 무이자 할부 가능',
          imageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=400&h=300&fit=crop',
          category: '의료/건강',
          gridCell: '의정부동',
          isActive: true,
          viewCount: 892,
          clickCount: 156,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '3',
          merchantId: '1',
          title: '어린이 불소도포 무료',
          description: '우리 아이 치아 건강! 12세 이하 무료 불소도포',
          imageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400&h=300&fit=crop',
          category: '의료/건강',
          gridCell: '의정부동',
          isActive: true,
          viewCount: 324,
          clickCount: 67,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '4',
          merchantId: '1',
          title: '치아미백 봄맞이 특가',
          description: '화이트닝으로 환한 미소를! 전문 치아미백 50% 할인',
          imageUrl: 'https://images.unsplash.com/photo-1609840114035-3c981960b21b?w=400&h=300&fit=crop',
          category: '의료/건강',
          gridCell: '의정부동',
          isActive: false,
          viewCount: 198,
          clickCount: 34,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      setMerchant(mockMerchant);
      setFlyers(mockFlyers);
    } catch (err: any) {
      console.error('Failed to load merchant data:', err);
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
  };

  const handleToggleActive = (flyerId: string) => {
    setFlyers(flyers.map(f =>
      f.id === flyerId ? { ...f, isActive: !f.isActive } : f
    ));
  };

  const handleEditFlyer = (flyerId: string) => {
    const flyer = flyers.find(f => f.id === flyerId);
    if (flyer) {
      setEditingFlyer(flyer);
      setIsEditModalOpen(true);
    }
  };

  const handleSaveFlyer = (updatedFlyer: Flyer) => {
    setFlyers(flyers.map(f => f.id === updatedFlyer.id ? updatedFlyer : f));
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setTimeout(() => {
      setEditingFlyer(null);
    }, 300);
  };

  const handleDeleteFlyer = (flyerId: string) => {
    if (window.confirm('정말 이 전단지를 삭제하시겠습니까?')) {
      setFlyers(flyers.filter(f => f.id !== flyerId));
    }
  };

  const handleCreateFlyer = () => {
    navigate('/ceo/flyers/new');
  };

  const handleNavChange = (nav: string) => {
    setActiveNav(nav);
    console.log('Navigation changed to:', nav);
  };

  if (loading || !user) {
    return (
      <div className="merchant-dashboard-container">
        <div className="loading">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="merchant-dashboard-container">
        <div className="error-message">
          <p>오류: {error}</p>
          <button onClick={loadMerchantData}>다시 시도</button>
        </div>
      </div>
    );
  }

  const activeFlyers = flyers.filter(f => f.isActive);

  return (
    <div className="merchant-dashboard-container">
      {/* Left Sidebar */}
      <MerchantSidebar
        totalViews={merchant?.totalViews}
        totalClicks={merchant?.totalClicks}
        businessName={merchant?.businessName}
        activeNav={activeNav}
        onNavChange={handleNavChange}
      />

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <button className="location-selector">
            <MapPin className="location-icon" size={16} />
            <span>{t('location.uijeongbuFull')}</span>
            <ChevronDown className="dropdown-icon" size={12} />
          </button>
          <h2 className="page-title">{t('merchant.dashboard')}</h2>
          <LanguageToggle />
        </header>

        {/* Welcome Banner */}
        <section className="hero-banner">
          <div className="hero-icon-box">
            <Store className="hero-icon" size={28} />
          </div>
          <div className="hero-text">
            <h3>
              {t('merchant.welcome')}, {merchant?.businessName}님!
            </h3>
            <p>
              디지털 전단지로 더 많은 고객에게 다가가세요. 오늘도 좋은 하루 되세요!
            </p>
          </div>
        </section>

        {/* Quick Actions */}
        <div className="quick-actions">
          <button className="quick-action-card" onClick={handleCreateFlyer}>
            <div className="quick-action-icon">
              <FileEdit size={24} />
            </div>
            <h4>{t('merchant.createFlyer')}</h4>
          </button>
          <button className="quick-action-card" onClick={() => alert('분석 리포트는 준비 중입니다.')}>
            <div className="quick-action-icon">
              <BarChart3 size={24} />
            </div>
            <h4>{t('merchant.performance')}</h4>
          </button>
          <button className="quick-action-card" onClick={() => alert('매장 관리는 준비 중입니다.')}>
            <div className="quick-action-icon">
              <Settings size={24} />
            </div>
            <h4>{t('merchant.settings')}</h4>
          </button>
          <button className="quick-action-card" onClick={() => alert('고객 리뷰는 준비 중입니다.')}>
            <div className="quick-action-icon">
              <MessageCircle size={24} />
            </div>
            <h4>{t('merchant.feedback')}</h4>
          </button>
        </div>

        {/* Flyers Management Section */}
        <div className="section-header">
          <h3>
            <FileText className="section-icon" size={20} />
            {t('merchant.manageFlyers')}
          </h3>
          <button className="create-flyer-btn" onClick={handleCreateFlyer}>
            <Plus size={16} />
            {t('merchant.createFlyer')}
          </button>
        </div>

        {flyers.length === 0 ? (
          <div className="empty-state">
            <FileText className="empty-state-icon" size={64} strokeWidth={1} />
            <p>아직 등록된 전단지가 없습니다.</p>
            <button className="create-flyer-btn" onClick={handleCreateFlyer}>
              <Plus size={16} />
              첫 전단지 만들기
            </button>
          </div>
        ) : (
          <div className="flyers-grid">
            {flyers.map((flyer) => (
              <article key={flyer.id} className={`flyer-card ${!flyer.isActive ? 'inactive' : ''}`}>
                {/* Flyer Image */}
                <div className="flyer-image" style={{ backgroundImage: `url(${flyer.imageUrl})` }}>
                  <div className={`status-badge ${flyer.isActive ? 'active' : 'inactive'}`}>
                    {flyer.isActive ? t('merchant.active') : t('merchant.inactive')}
                  </div>
                </div>

                {/* Flyer Body */}
                <div className="flyer-body">
                  <h4 className="flyer-title">{flyer.title}</h4>
                  <p className="flyer-desc">{flyer.description}</p>

                  {/* Stats */}
                  <div className="flyer-stats">
                    <div className="stat">
                      <Eye className="stat-icon" size={16} />
                      <span className="stat-value">{flyer.viewCount}</span>
                      <span className="stat-label">{t('merchant.views')}</span>
                    </div>
                    <div className="stat">
                      <Sparkles className="stat-icon" size={16} />
                      <span className="stat-value">{flyer.clickCount}</span>
                      <span className="stat-label">{t('merchant.clicks')}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flyer-actions">
                    <button
                      className={`action-btn ${flyer.isActive ? 'secondary' : 'primary'}`}
                      onClick={() => handleToggleActive(flyer.id)}
                    >
                      {flyer.isActive ? t('merchant.deactivate') : t('merchant.activate')}
                    </button>
                    <button className="action-btn secondary" onClick={() => handleEditFlyer(flyer.id)}>
                      {t('merchant.edit')}
                    </button>
                    <button className="action-btn danger" onClick={() => handleDeleteFlyer(flyer.id)}>
                      {t('merchant.delete')}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Flyer Edit Modal */}
      <FlyerEditModal
        flyer={editingFlyer}
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleSaveFlyer}
      />
    </div>
  );
}
