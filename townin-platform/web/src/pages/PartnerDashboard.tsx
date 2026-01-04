import { useState } from 'react';
import PartnerSidebar from '../components/partner/PartnerSidebar';
import { useLanguage } from '../contexts/LanguageContext';
import { CheckCircle, XCircle, Eye, Clock } from 'lucide-react';
import './PartnerDashboard.css';

interface PendingFlyer {
  id: string;
  merchantName: string;
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function PartnerDashboard() {
  const { t } = useLanguage();
  const [activeNav, setActiveNav] = useState('dashboard');

  // Mock data - 승인 대기 중인 전단지
  const [pendingFlyers, setPendingFlyers] = useState<PendingFlyer[]>([
    {
      id: '1',
      merchantName: '스마일 치과의원',
      title: '스케일링 30% 할인 이벤트',
      description: '구강 건강의 시작! 전문 스케일링 30% 특별 할인',
      category: '의료/건강',
      createdAt: '2024-01-15T10:00:00Z',
      status: 'pending',
    },
    {
      id: '2',
      merchantName: '의정부 과일가게',
      title: '겨울철 제철 과일 대전',
      description: '신선한 딸기, 한라봉 등 겨울 과일 최대 40% 할인',
      category: '식품',
      createdAt: '2024-01-15T09:30:00Z',
      status: 'pending',
    },
    {
      id: '3',
      merchantName: '바른 약국',
      title: '건강기능식품 할인전',
      description: '비타민, 유산균 등 건강기능식품 최대 50% 할인',
      category: '의료/건강',
      createdAt: '2024-01-15T08:45:00Z',
      status: 'pending',
    },
  ]);

  const handleApprove = (flyerId: string) => {
    setPendingFlyers(flyers =>
      flyers.map(f =>
        f.id === flyerId ? { ...f, status: 'approved' as const } : f
      )
    );
    // TODO: Call backend API
    console.log('Approved flyer:', flyerId);
  };

  const handleReject = (flyerId: string) => {
    setPendingFlyers(flyers =>
      flyers.map(f =>
        f.id === flyerId ? { ...f, status: 'rejected' as const } : f
      )
    );
    // TODO: Call backend API
    console.log('Rejected flyer:', flyerId);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="status-badge approved">✓ {t('partner.approved')}</span>;
      case 'rejected':
        return <span className="status-badge rejected">✕ {t('partner.rejected')}</span>;
      default:
        return <span className="status-badge pending">⏱ {t('partner.pending')}</span>;
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return '방금 전';
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    return `${Math.floor(diffInHours / 24)}일 전`;
  };

  const pendingCount = pendingFlyers.filter(f => f.status === 'pending').length;
  const approvedCount = pendingFlyers.filter(f => f.status === 'approved').length;

  return (
    <div className="partner-dashboard-container">
      <PartnerSidebar
        totalEarnings={12500}
        monthlyEarnings={1850}
        partnerName="김보안"
        areaName="의정부 송산1동"
        activeNav={activeNav}
        onNavChange={setActiveNav}
      />

      <main className="partner-main-content">
        {/* Header */}
        <header className="dashboard-header">
          <div>
            <h1 className="dashboard-title">{t('partner.welcome')}, 김보안님</h1>
            <p className="dashboard-subtitle">의정부 송산1동 지역을 담당하고 계십니다</p>
          </div>
        </header>

        {/* Stats Summary */}
        <div className="stats-summary">
          <div className="stat-card">
            <div className="stat-icon pending-icon">
              <Clock size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{pendingCount}</div>
              <div className="stat-label">{t('partner.pendingFlyers')}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon approved-icon">
              <CheckCircle size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{approvedCount}</div>
              <div className="stat-label">{t('partner.approvedFlyers')}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon earnings-icon">
              <Eye size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">1,850P</div>
              <div className="stat-label">이번 달 수익</div>
            </div>
          </div>
        </div>

        {/* Pending Flyers List */}
        <section className="flyers-section">
          <div className="section-header">
            <h2>{t('partner.pendingFlyers')}</h2>
            <span className="badge-count">{pendingCount}개</span>
          </div>

          <div className="flyers-list">
            {pendingFlyers.map((flyer) => (
              <div key={flyer.id} className={`flyer-approval-card ${flyer.status}`}>
                <div className="flyer-header">
                  <div>
                    <h3 className="flyer-title">{flyer.title}</h3>
                    <p className="flyer-merchant">{flyer.merchantName}</p>
                  </div>
                  {getStatusBadge(flyer.status)}
                </div>

                <p className="flyer-description">{flyer.description}</p>

                <div className="flyer-meta">
                  <span className="flyer-category">{flyer.category}</span>
                  <span className="flyer-time">{getTimeAgo(flyer.createdAt)}</span>
                </div>

                {flyer.status === 'pending' && (
                  <div className="flyer-actions">
                    <button
                      className="action-btn approve-btn"
                      onClick={() => handleApprove(flyer.id)}
                    >
                      <CheckCircle size={18} />
                      {t('partner.approve')}
                    </button>
                    <button
                      className="action-btn reject-btn"
                      onClick={() => handleReject(flyer.id)}
                    >
                      <XCircle size={18} />
                      {t('partner.reject')}
                    </button>
                  </div>
                )}

                {flyer.status === 'approved' && (
                  <div className="approval-note">
                    <CheckCircle size={16} />
                    승인 완료 - 클릭당 5P 수익이 발생합니다
                  </div>
                )}

                {flyer.status === 'rejected' && (
                  <div className="rejection-note">
                    <XCircle size={16} />
                    반려됨 - 사장님에게 알림이 전송되었습니다
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
