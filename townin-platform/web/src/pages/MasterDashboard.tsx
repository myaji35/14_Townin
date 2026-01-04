import { useState } from 'react';
import MasterSidebar from '../components/master/MasterSidebar';
import { useLanguage } from '../contexts/LanguageContext';
import { Users, DollarSign, FileText, TrendingUp, Award, Activity } from 'lucide-react';
import './MasterDashboard.css';

interface PartnerPerformance {
  id: string;
  name: string;
  area: string;
  totalEarnings: number;
  approvedFlyers: number;
  avgApprovalTime: number; // in hours
  rating: number;
}

interface RegionalStats {
  region: string;
  totalUsers: number;
  totalPartners: number;
  totalFlyers: number;
  revenue: number;
  growth: number;
}

export default function MasterDashboard() {
  const { t } = useLanguage();
  const [activeNav, setActiveNav] = useState('overview');

  // Mock data - Partner Performance
  const [partners] = useState<PartnerPerformance[]>([
    {
      id: '1',
      name: '김파트너',
      area: '의정부 송산1동',
      totalEarnings: 12500,
      approvedFlyers: 145,
      avgApprovalTime: 2.5,
      rating: 4.8,
    },
    {
      id: '2',
      name: '이파트너',
      area: '의정부 의정부2동',
      totalEarnings: 9800,
      approvedFlyers: 98,
      avgApprovalTime: 3.2,
      rating: 4.6,
    },
    {
      id: '3',
      name: '박파트너',
      area: '의정부 호원1동',
      totalEarnings: 11200,
      approvedFlyers: 121,
      avgApprovalTime: 2.8,
      rating: 4.7,
    },
  ]);

  // Mock data - Regional Stats
  const [regions] = useState<RegionalStats[]>([
    {
      region: '의정부 송산1동',
      totalUsers: 3456,
      totalPartners: 1,
      totalFlyers: 234,
      revenue: 12340000,
      growth: 12.5,
    },
    {
      region: '의정부 의정부2동',
      totalUsers: 2845,
      totalPartners: 1,
      totalFlyers: 189,
      revenue: 8900000,
      growth: 8.3,
    },
    {
      region: '의정부 호원1동',
      totalUsers: 3156,
      totalPartners: 1,
      totalFlyers: 212,
      revenue: 10500000,
      growth: 10.2,
    },
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalStats = {
    totalPartners: partners.length,
    activePartners: partners.length,
    totalUsers: regions.reduce((sum, r) => sum + r.totalUsers, 0),
    totalFlyers: regions.reduce((sum, r) => sum + r.totalFlyers, 0),
    totalRevenue: regions.reduce((sum, r) => sum + r.revenue, 0),
    pendingFlyers: 8,
  };

  return (
    <div className="master-dashboard-container">
      <MasterSidebar
        totalRevenue={125340000}
        monthlyRevenue={12450000}
        masterName="관리자"
        activeNav={activeNav}
        onNavChange={setActiveNav}
      />

      <main className="master-main-content">
        {/* Header */}
        <header className="dashboard-header">
          <div>
            <h1 className="dashboard-title">{t('master.welcome')}, 관리자님</h1>
            <p className="dashboard-subtitle">전체 시스템과 파트너들을 관리하고 계십니다</p>
          </div>
        </header>

        {/* Stats Summary */}
        <div className="stats-summary">
          <div className="stat-card partners">
            <div className="stat-icon">
              <Users size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{totalStats.totalPartners}</div>
              <div className="stat-label">{t('master.totalPartners')}</div>
            </div>
          </div>

          <div className="stat-card users">
            <div className="stat-icon">
              <Activity size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{totalStats.totalUsers.toLocaleString()}</div>
              <div className="stat-label">{t('master.totalUsers')}</div>
            </div>
          </div>

          <div className="stat-card flyers">
            <div className="stat-icon">
              <FileText size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{totalStats.totalFlyers}</div>
              <div className="stat-label">{t('master.totalFlyers')}</div>
            </div>
          </div>

          <div className="stat-card revenue">
            <div className="stat-icon">
              <DollarSign size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{formatCurrency(totalStats.totalRevenue)}</div>
              <div className="stat-label">{t('master.totalRevenue')}</div>
            </div>
          </div>
        </div>

        {/* Partner Performance Section */}
        <section className="dashboard-section">
          <div className="section-header">
            <h2>{t('master.partnerPerformance')}</h2>
            <span className="badge-count">{partners.length}명</span>
          </div>

          <div className="partners-grid">
            {partners.map((partner, index) => (
              <div key={partner.id} className="partner-card">
                <div className="partner-header">
                  <div className="partner-avatar">
                    {index === 0 && <Award size={20} color="var(--accent-gold)" />}
                    {index !== 0 && <Users size={20} />}
                  </div>
                  <div>
                    <h3>{partner.name}</h3>
                    <p className="partner-area">{partner.area}</p>
                  </div>
                  {index === 0 && (
                    <div className="top-badge">
                      <Award size={14} />
                      <span>1위</span>
                    </div>
                  )}
                </div>

                <div className="partner-stats">
                  <div className="partner-stat">
                    <div className="stat-label">수익</div>
                    <div className="stat-value">{partner.totalEarnings.toLocaleString()}P</div>
                  </div>
                  <div className="partner-stat">
                    <div className="stat-label">승인</div>
                    <div className="stat-value">{partner.approvedFlyers}건</div>
                  </div>
                  <div className="partner-stat">
                    <div className="stat-label">평균 처리</div>
                    <div className="stat-value">{partner.avgApprovalTime}시간</div>
                  </div>
                </div>

                <div className="partner-rating">
                  <span className="rating-stars">⭐ {partner.rating}</span>
                  <span className="rating-label">평점</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Regional Statistics Section */}
        <section className="dashboard-section">
          <div className="section-header">
            <h2>{t('master.regionalStats')}</h2>
            <span className="badge-count">{regions.length}개 지역</span>
          </div>

          <div className="regions-list">
            {regions.map((region) => (
              <div key={region.region} className="region-card">
                <div className="region-header">
                  <h3>{region.region}</h3>
                  <div className={`growth-badge ${region.growth > 0 ? 'positive' : 'negative'}`}>
                    <TrendingUp size={14} />
                    {region.growth > 0 ? '+' : ''}{region.growth}%
                  </div>
                </div>

                <div className="region-stats">
                  <div className="region-stat">
                    <Users size={16} />
                    <span className="stat-label">사용자</span>
                    <span className="stat-value">{region.totalUsers.toLocaleString()}</span>
                  </div>
                  <div className="region-stat">
                    <FileText size={16} />
                    <span className="stat-label">전단지</span>
                    <span className="stat-value">{region.totalFlyers}</span>
                  </div>
                  <div className="region-stat">
                    <DollarSign size={16} />
                    <span className="stat-label">수익</span>
                    <span className="stat-value">{formatCurrency(region.revenue)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* System Health Section */}
        <section className="dashboard-section">
          <div className="section-header">
            <h2>{t('master.systemHealth')}</h2>
            <div className="status-indicator online">정상</div>
          </div>

          <div className="system-health-grid">
            <div className="health-card">
              <div className="health-label">API 서버</div>
              <div className="health-bar">
                <div className="health-fill" style={{ width: '95%' }}></div>
              </div>
              <div className="health-value">95% 가동률</div>
            </div>

            <div className="health-card">
              <div className="health-label">데이터베이스</div>
              <div className="health-bar">
                <div className="health-fill" style={{ width: '88%' }}></div>
              </div>
              <div className="health-value">88% 가동률</div>
            </div>

            <div className="health-card">
              <div className="health-label">스토리지</div>
              <div className="health-bar">
                <div className="health-fill" style={{ width: '72%' }}></div>
              </div>
              <div className="health-value">72% 사용중</div>
            </div>

            <div className="health-card">
              <div className="health-label">메모리</div>
              <div className="health-bar">
                <div className="health-fill" style={{ width: '65%' }}></div>
              </div>
              <div className="health-value">65% 사용중</div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
