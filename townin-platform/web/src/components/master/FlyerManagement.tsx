import { useState, useEffect } from 'react';
import { Eye, Sparkles, TrendingUp } from 'lucide-react';
import './FlyerManagement.css';

interface Flyer {
  id: string;
  title: string;
  merchantId: string;
  merchantName: string;
  category: string;
  region: string;
  status: 'active' | 'pending' | 'rejected' | 'expired';
  views: number;
  clicks: number;
  conversions: number;
  createdAt: string;
  expiresAt: string;
  aiScore: number;
  imageUrl?: string;
}

interface Merchant {
  id: string;
  name: string;
  businessName: string;
  email: string;
  region: string;
  category: string;
  status: 'active' | 'inactive' | 'suspended';
  totalFlyers: number;
  activeFlyers: number;
  totalViews: number;
  joinDate: string;
  tier: 'basic' | 'premium' | 'vip';
}

export default function FlyerManagement() {
  const [activeView, setActiveView] = useState<'flyers' | 'merchants'>('flyers');
  const [flyers, setFlyers] = useState<Flyer[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState<Flyer | Merchant | null>(null);

  useEffect(() => {
    // Mock 데이터
    const mockFlyers: Flyer[] = [
      {
        id: '1',
        title: '오늘만 반값! 치킨 특별할인',
        merchantId: '2',
        merchantName: '바삭바삭치킨',
        category: 'restaurant',
        region: '의정부시',
        status: 'active',
        views: 1234,
        clicks: 156,
        conversions: 23,
        createdAt: '2024-03-10',
        expiresAt: '2024-03-20',
        aiScore: 92,
        imageUrl: '/flyer1.jpg'
      },
      {
        id: '2',
        title: '신규오픈 30% 할인',
        merchantId: '3',
        merchantName: '행복카페',
        category: 'cafe',
        region: '양주시',
        status: 'pending',
        views: 0,
        clicks: 0,
        conversions: 0,
        createdAt: '2024-03-15',
        expiresAt: '2024-03-25',
        aiScore: 78,
        imageUrl: '/flyer2.jpg'
      },
      {
        id: '3',
        title: '봄맞이 세일 최대 50%',
        merchantId: '4',
        merchantName: '패션의정원',
        category: 'retail',
        region: '남양주시',
        status: 'active',
        views: 892,
        clicks: 67,
        conversions: 12,
        createdAt: '2024-03-12',
        expiresAt: '2024-03-22',
        aiScore: 85,
        imageUrl: '/flyer3.jpg'
      },
      {
        id: '4',
        title: '헬스 3개월 등록 이벤트',
        merchantId: '5',
        merchantName: '건강한체육관',
        category: 'fitness',
        region: '의정부시',
        status: 'rejected',
        views: 0,
        clicks: 0,
        conversions: 0,
        createdAt: '2024-03-14',
        expiresAt: '2024-04-14',
        aiScore: 45,
        imageUrl: '/flyer4.jpg'
      },
      {
        id: '5',
        title: '미용실 펌 할인 이벤트',
        merchantId: '6',
        merchantName: '예쁜미용실',
        category: 'beauty',
        region: '구리시',
        status: 'expired',
        views: 2341,
        clicks: 234,
        conversions: 45,
        createdAt: '2024-02-15',
        expiresAt: '2024-03-01',
        aiScore: 88,
        imageUrl: '/flyer5.jpg'
      },
    ];

    const mockMerchants: Merchant[] = [
      {
        id: '2',
        name: '김사장',
        businessName: '바삭바삭치킨',
        email: 'chicken@example.com',
        region: '의정부시',
        category: 'restaurant',
        status: 'active',
        totalFlyers: 15,
        activeFlyers: 3,
        totalViews: 12340,
        joinDate: '2024-01-15',
        tier: 'premium'
      },
      {
        id: '3',
        name: '이카페',
        businessName: '행복카페',
        email: 'cafe@example.com',
        region: '양주시',
        category: 'cafe',
        status: 'active',
        totalFlyers: 8,
        activeFlyers: 2,
        totalViews: 5670,
        joinDate: '2024-02-01',
        tier: 'basic'
      },
      {
        id: '4',
        name: '박패션',
        businessName: '패션의정원',
        email: 'fashion@example.com',
        region: '남양주시',
        category: 'retail',
        status: 'active',
        totalFlyers: 23,
        activeFlyers: 5,
        totalViews: 34560,
        joinDate: '2023-12-10',
        tier: 'vip'
      },
      {
        id: '5',
        name: '최헬스',
        businessName: '건강한체육관',
        email: 'gym@example.com',
        region: '의정부시',
        category: 'fitness',
        status: 'suspended',
        totalFlyers: 5,
        activeFlyers: 0,
        totalViews: 2340,
        joinDate: '2024-02-20',
        tier: 'basic'
      },
      {
        id: '6',
        name: '정미용',
        businessName: '예쁜미용실',
        email: 'beauty@example.com',
        region: '구리시',
        category: 'beauty',
        status: 'inactive',
        totalFlyers: 12,
        activeFlyers: 0,
        totalViews: 8900,
        joinDate: '2024-01-05',
        tier: 'premium'
      },
    ];

    setFlyers(mockFlyers);
    setMerchants(mockMerchants);
  }, []);

  const handleFlyerStatusChange = (flyerId: string, newStatus: 'active' | 'rejected') => {
    setFlyers(prev =>
      prev.map(flyer =>
        flyer.id === flyerId ? { ...flyer, status: newStatus } : flyer
      )
    );
  };

  const handleMerchantStatusChange = (merchantId: string, newStatus: 'active' | 'suspended') => {
    setMerchants(prev =>
      prev.map(merchant =>
        merchant.id === merchantId ? { ...merchant, status: newStatus } : merchant
      )
    );
  };

  const getFilteredFlyers = () => {
    return flyers.filter(flyer => {
      const matchesSearch = flyer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           flyer.merchantName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || flyer.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || flyer.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  };

  const getFilteredMerchants = () => {
    return merchants.filter(merchant => {
      const matchesSearch = merchant.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           merchant.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || merchant.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || merchant.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  };

  const getCategoryName = (category: string) => {
    const categories: { [key: string]: string } = {
      restaurant: '음식점',
      cafe: '카페',
      retail: '소매',
      fitness: '운동',
      beauty: '미용',
      mart: '마트',
      education: '교육',
      medical: '의료'
    };
    return categories[category] || category;
  };

  return (
    <div className="flyer-management">
      <div className="management-header">
        <h2>전단지 및 가맹점 관리</h2>
        <div className="view-toggle">
          <button
            className={`toggle-btn ${activeView === 'flyers' ? 'active' : ''}`}
            onClick={() => setActiveView('flyers')}
          >
            전단지 관리
          </button>
          <button
            className={`toggle-btn ${activeView === 'merchants' ? 'active' : ''}`}
            onClick={() => setActiveView('merchants')}
          >
            가맹점 관리
          </button>
        </div>
      </div>

      <div className="management-stats">
        <div className="stat-card">
          <div className="stat-label">전체 전단지</div>
          <div className="stat-value">{flyers.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">활성 전단지</div>
          <div className="stat-value">{flyers.filter(f => f.status === 'active').length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">대기중</div>
          <div className="stat-value">{flyers.filter(f => f.status === 'pending').length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">전체 가맹점</div>
          <div className="stat-value">{merchants.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">프리미엄</div>
          <div className="stat-value">{merchants.filter(m => m.tier === 'premium' || m.tier === 'vip').length}</div>
        </div>
      </div>

      <div className="management-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder={activeView === 'flyers' ? '전단지 제목, 가맹점명 검색...' : '가맹점명, 대표자명 검색...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>

        <div className="filter-group">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">모든 상태</option>
            {activeView === 'flyers' ? (
              <>
                <option value="active">활성</option>
                <option value="pending">대기중</option>
                <option value="rejected">거절됨</option>
                <option value="expired">만료</option>
              </>
            ) : (
              <>
                <option value="active">활성</option>
                <option value="inactive">비활성</option>
                <option value="suspended">정지</option>
              </>
            )}
          </select>

          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="all">모든 카테고리</option>
            <option value="restaurant">음식점</option>
            <option value="cafe">카페</option>
            <option value="retail">소매</option>
            <option value="fitness">운동</option>
            <option value="beauty">미용</option>
          </select>
        </div>
      </div>

      {activeView === 'flyers' ? (
        <div className="flyers-grid">
          {getFilteredFlyers().map(flyer => (
            <div key={flyer.id} className="flyer-card">
              <div className="flyer-image">
                {flyer.imageUrl ? (
                  <img src={flyer.imageUrl} alt={flyer.title} />
                ) : (
                  <div className="flyer-placeholder">이미지 없음</div>
                )}
                <div className={`flyer-status status-${flyer.status}`}>
                  {flyer.status === 'active' && '활성'}
                  {flyer.status === 'pending' && '대기중'}
                  {flyer.status === 'rejected' && '거절됨'}
                  {flyer.status === 'expired' && '만료'}
                </div>
              </div>
              <div className="flyer-content">
                <h3>{flyer.title}</h3>
                <p className="flyer-merchant">{flyer.merchantName}</p>
                <div className="flyer-meta">
                  <span>{getCategoryName(flyer.category)}</span>
                  <span>{flyer.region}</span>
                </div>
                <div className="flyer-stats">
                  <div className="stat">
                    <Eye size={14} />
                    <span className="stat-label">조회</span>
                    <span className="stat-value">{flyer.views}</span>
                  </div>
                  <div className="stat">
                    <Sparkles size={14} />
                    <span className="stat-label">클릭</span>
                    <span className="stat-value">{flyer.clicks}</span>
                  </div>
                  <div className="stat">
                    <TrendingUp size={14} />
                    <span className="stat-label">전환</span>
                    <span className="stat-value">{flyer.conversions}</span>
                  </div>
                </div>
                <div className="flyer-ai">
                  <span className="ai-label">AI 점수</span>
                  <div className="ai-bar">
                    <div className="ai-fill" style={{ width: `${flyer.aiScore}%` }}></div>
                  </div>
                  <span className="ai-value">{flyer.aiScore}점</span>
                </div>
                <div className="flyer-actions">
                  {flyer.status === 'pending' && (
                    <>
                      <button
                        className="action-btn approve"
                        onClick={() => handleFlyerStatusChange(flyer.id, 'active')}
                      >
                        승인
                      </button>
                      <button
                        className="action-btn reject"
                        onClick={() => handleFlyerStatusChange(flyer.id, 'rejected')}
                      >
                        거절
                      </button>
                    </>
                  )}
                  {flyer.status === 'active' && (
                    <button
                      className="action-btn suspend"
                      onClick={() => handleFlyerStatusChange(flyer.id, 'rejected')}
                    >
                      중단
                    </button>
                  )}
                  <button className="action-btn view">상세보기</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="merchants-table">
          <table>
            <thead>
              <tr>
                <th>가맹점명</th>
                <th>대표자</th>
                <th>카테고리</th>
                <th>지역</th>
                <th>등급</th>
                <th>전단지</th>
                <th>총 조회수</th>
                <th>상태</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredMerchants().map(merchant => (
                <tr key={merchant.id}>
                  <td className="merchant-name">
                    <div className="name-avatar">{merchant.businessName[0]}</div>
                    {merchant.businessName}
                  </td>
                  <td>{merchant.name}</td>
                  <td>{getCategoryName(merchant.category)}</td>
                  <td>{merchant.region}</td>
                  <td>
                    <span className={`tier-badge tier-${merchant.tier}`}>
                      {merchant.tier === 'basic' && '베이직'}
                      {merchant.tier === 'premium' && '프리미엄'}
                      {merchant.tier === 'vip' && 'VIP'}
                    </span>
                  </td>
                  <td>
                    <div className="flyer-count">
                      <span className="active-count">{merchant.activeFlyers}</span>
                      <span className="total-count">/{merchant.totalFlyers}</span>
                    </div>
                  </td>
                  <td>{merchant.totalViews.toLocaleString()}</td>
                  <td>
                    <span className={`status-badge status-${merchant.status}`}>
                      {merchant.status === 'active' && '활성'}
                      {merchant.status === 'inactive' && '비활성'}
                      {merchant.status === 'suspended' && '정지'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn view-btn" title="상세보기">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M8 3C3 3 0 8 0 8s3 5 8 5 8-5 8-5-3-5-8-5z" stroke="currentColor" strokeWidth="1.5"/>
                          <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/>
                        </svg>
                      </button>
                      {merchant.status === 'active' ? (
                        <button
                          className="action-btn suspend-btn"
                          onClick={() => handleMerchantStatusChange(merchant.id, 'suspended')}
                          title="정지"
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M6 6h4M6 10h4M14 8A6 6 0 112 8a6 6 0 0112 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        </button>
                      ) : (
                        <button
                          className="action-btn activate-btn"
                          onClick={() => handleMerchantStatusChange(merchant.id, 'active')}
                          title="활성화"
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M5 8l2 2 4-4M14 8A6 6 0 112 8a6 6 0 0112 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}