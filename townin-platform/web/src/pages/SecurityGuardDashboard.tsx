import { useState } from 'react';
import SecurityGuardSidebar from '../components/security/SecurityGuardSidebar';
import { useLanguage } from '../contexts/LanguageContext';
import { Shield, Camera, AlertTriangle, CheckCircle, Clock, MapPin } from 'lucide-react';
import './SecurityGuardDashboard.css';

interface CCTVStatus {
  id: string;
  location: string;
  status: 'online' | 'offline' | 'warning';
  lastCheck: string;
}

interface IncidentReport {
  id: string;
  type: string;
  location: string;
  severity: 'low' | 'medium' | 'high';
  status: 'pending' | 'resolved';
  reportedAt: string;
  description: string;
}

interface PatrolRecord {
  id: string;
  area: string;
  startTime: string;
  endTime: string;
  status: 'completed' | 'in_progress';
  notes?: string;
}

export default function SecurityGuardDashboard() {
  const { t } = useLanguage();
  const [activeNav, setActiveNav] = useState('dashboard');

  // Mock data - CCTV 상태
  const [cctvList] = useState<CCTVStatus[]>([
    { id: '1', location: '송산1동 입구', status: 'online', lastCheck: '2분 전' },
    { id: '2', location: '중앙공원', status: 'online', lastCheck: '5분 전' },
    { id: '3', location: '어린이공원', status: 'warning', lastCheck: '30분 전' },
    { id: '4', location: '주차장 A동', status: 'online', lastCheck: '1분 전' },
    { id: '5', location: '상가 입구', status: 'offline', lastCheck: '2시간 전' },
  ]);

  // Mock data - 사고 보고
  const [incidents, setIncidents] = useState<IncidentReport[]>([
    {
      id: '1',
      type: '불법 주정차',
      location: '송산1동 123번지',
      severity: 'low',
      status: 'pending',
      reportedAt: '2024-01-15T10:30:00Z',
      description: '소화전 앞 불법 주정차 차량 발견',
    },
    {
      id: '2',
      type: '가로등 고장',
      location: '중앙공원 진입로',
      severity: 'medium',
      status: 'pending',
      reportedAt: '2024-01-15T09:15:00Z',
      description: '가로등 3개 점등 안됨',
    },
    {
      id: '3',
      type: '쓰레기 무단 투기',
      location: '어린이공원',
      severity: 'low',
      status: 'resolved',
      reportedAt: '2024-01-14T16:00:00Z',
      description: '대형 쓰레기 무단 투기 처리 완료',
    },
  ]);

  // Mock data - 순찰 기록
  const [patrols] = useState<PatrolRecord[]>([
    {
      id: '1',
      area: '송산1동 전역',
      startTime: '2024-01-15T14:00:00Z',
      endTime: '2024-01-15T16:00:00Z',
      status: 'completed',
      notes: '이상 없음',
    },
    {
      id: '2',
      area: '중앙공원',
      startTime: '2024-01-15T10:00:00Z',
      endTime: '2024-01-15T11:30:00Z',
      status: 'completed',
      notes: '가로등 고장 발견 및 신고',
    },
  ]);

  const handleResolveIncident = (incidentId: string) => {
    setIncidents(incidents =>
      incidents.map(inc =>
        inc.id === incidentId ? { ...inc, status: 'resolved' as const } : inc
      )
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return <span className="status-badge online">● 정상</span>;
      case 'offline':
        return <span className="status-badge offline">● 오프라인</span>;
      case 'warning':
        return <span className="status-badge warning">● 주의</span>;
      default:
        return <span className="status-badge">● 알 수 없음</span>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <span className="severity-badge high">긴급</span>;
      case 'medium':
        return <span className="severity-badge medium">보통</span>;
      case 'low':
        return <span className="severity-badge low">낮음</span>;
      default:
        return <span className="severity-badge">-</span>;
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

  const onlineCount = cctvList.filter(c => c.status === 'online').length;
  const pendingIncidents = incidents.filter(i => i.status === 'pending').length;

  return (
    <div className="security-guard-dashboard-container">
      <SecurityGuardSidebar
        safetyScore={92}
        activityScore={85}
        guardName="김보안"
        areaName="의정부 송산1동"
        activeNav={activeNav}
        onNavChange={setActiveNav}
      />

      <main className="security-guard-main-content">
        {/* Header */}
        <header className="dashboard-header">
          <div>
            <h1 className="dashboard-title">{t('securityGuard.welcome')}, 김보안님</h1>
            <p className="dashboard-subtitle">의정부 송산1동 지역을 안전하게 관리하고 계십니다</p>
          </div>
        </header>

        {/* Stats Summary */}
        <div className="stats-summary">
          <div className="stat-card safety">
            <div className="stat-icon">
              <Shield size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">92점</div>
              <div className="stat-label">{t('securityGuard.safetyScore')}</div>
            </div>
          </div>

          <div className="stat-card cctv">
            <div className="stat-icon">
              <Camera size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{onlineCount}/{cctvList.length}</div>
              <div className="stat-label">CCTV 정상 작동</div>
            </div>
          </div>

          <div className="stat-card incidents">
            <div className="stat-icon">
              <AlertTriangle size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{pendingIncidents}</div>
              <div className="stat-label">처리 대기 사고</div>
            </div>
          </div>

          <div className="stat-card patrols">
            <div className="stat-icon">
              <MapPin size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{patrols.length}</div>
              <div className="stat-label">이번 주 순찰</div>
            </div>
          </div>
        </div>

        {/* CCTV Status Section */}
        <section className="dashboard-section">
          <div className="section-header">
            <h2>{t('securityGuard.cctvStatus')}</h2>
            <span className="badge-count">{cctvList.length}대</span>
          </div>

          <div className="cctv-grid">
            {cctvList.map((cctv) => (
              <div key={cctv.id} className={`cctv-card ${cctv.status}`}>
                <div className="cctv-header">
                  <Camera size={20} />
                  <h3>{cctv.location}</h3>
                </div>
                <div className="cctv-status">
                  {getStatusBadge(cctv.status)}
                </div>
                <div className="cctv-meta">
                  <Clock size={14} />
                  마지막 확인: {cctv.lastCheck}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Incident Reports Section */}
        <section className="dashboard-section">
          <div className="section-header">
            <h2>{t('securityGuard.incidentReports')}</h2>
            <span className="badge-count">{pendingIncidents}건 대기</span>
          </div>

          <div className="incidents-list">
            {incidents.map((incident) => (
              <div key={incident.id} className={`incident-card ${incident.status}`}>
                <div className="incident-header">
                  <div>
                    <h3>{incident.type}</h3>
                    <p className="incident-location">
                      <MapPin size={14} />
                      {incident.location}
                    </p>
                  </div>
                  <div className="incident-badges">
                    {getSeverityBadge(incident.severity)}
                    {incident.status === 'resolved' && (
                      <span className="status-badge resolved">
                        <CheckCircle size={14} />
                        처리완료
                      </span>
                    )}
                  </div>
                </div>

                <p className="incident-description">{incident.description}</p>

                <div className="incident-meta">
                  <span className="incident-time">{getTimeAgo(incident.reportedAt)}</span>
                </div>

                {incident.status === 'pending' && (
                  <div className="incident-actions">
                    <button
                      className="action-btn resolve-btn"
                      onClick={() => handleResolveIncident(incident.id)}
                    >
                      <CheckCircle size={18} />
                      처리 완료
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Patrol History Section */}
        <section className="dashboard-section">
          <div className="section-header">
            <h2>{t('securityGuard.patrolHistory')}</h2>
          </div>

          <div className="patrols-list">
            {patrols.map((patrol) => (
              <div key={patrol.id} className="patrol-card">
                <div className="patrol-header">
                  <MapPin size={18} />
                  <h3>{patrol.area}</h3>
                </div>
                <div className="patrol-time">
                  {new Date(patrol.startTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                  {' - '}
                  {new Date(patrol.endTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                </div>
                {patrol.notes && (
                  <p className="patrol-notes">{patrol.notes}</p>
                )}
                <div className="patrol-status">
                  <CheckCircle size={14} />
                  {patrol.status === 'completed' ? '완료' : '진행중'}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
