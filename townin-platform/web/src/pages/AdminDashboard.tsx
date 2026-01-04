import { useState } from 'react';
import AdminSidebar from '../components/admin/AdminSidebar';
import { useLanguage } from '../contexts/LanguageContext';
import { Users, FileText, MapPin, TrendingUp, CheckCircle, XCircle, Activity } from 'lucide-react';
import './AdminDashboard.css';

interface UserData {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface FlyerData {
  id: string;
  title: string;
  merchant: string;
  status: 'active' | 'pending' | 'expired';
  views: number;
  clicks: number;
  createdAt: string;
}

interface RegionData {
  id: string;
  name: string;
  level: string;
  users: number;
  merchants: number;
  flyers: number;
}

export default function AdminDashboard() {
  const { t } = useLanguage();
  const [activeNav, setActiveNav] = useState('overview');

  // Mock data - Users
  const [users] = useState<UserData[]>([
    {
      id: '1',
      email: 'user1@townin.com',
      role: 'user',
      isActive: true,
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      email: 'merchant1@store.com',
      role: 'merchant',
      isActive: true,
      createdAt: '2024-02-01',
    },
    {
      id: '3',
      email: 'partner1@townin.com',
      role: 'partner',
      isActive: true,
      createdAt: '2024-02-10',
    },
    {
      id: '4',
      email: 'guard1@townin.com',
      role: 'security_guard',
      isActive: true,
      createdAt: '2024-02-20',
    },
    {
      id: '5',
      email: 'admin1@townin.com',
      role: 'admin',
      isActive: true,
      createdAt: '2024-01-01',
    },
  ]);

  // Mock data - Flyers
  const [flyers] = useState<FlyerData[]>([
    {
      id: '1',
      title: '봄맞이 대세일',
      merchant: '신선마트',
      status: 'active',
      views: 1245,
      clicks: 87,
      createdAt: '2024-03-15',
    },
    {
      id: '2',
      title: '커피 1+1 이벤트',
      merchant: '타운카페',
      status: 'active',
      views: 892,
      clicks: 45,
      createdAt: '2024-03-18',
    },
    {
      id: '3',
      title: '헬스장 신규 회원 모집',
      merchant: '파워짐',
      status: 'pending',
      views: 0,
      clicks: 0,
      createdAt: '2024-03-20',
    },
    {
      id: '4',
      title: '치과 스케일링 할인',
      merchant: '타운치과',
      status: 'expired',
      views: 534,
      clicks: 23,
      createdAt: '2024-02-01',
    },
  ]);

  // Mock data - Regions
  const [regions] = useState<RegionData[]>([
    {
      id: '1',
      name: '의정부 송산1동',
      level: 'neighborhood',
      users: 3456,
      merchants: 145,
      flyers: 234,
    },
    {
      id: '2',
      name: '의정부 의정부2동',
      level: 'neighborhood',
      users: 2845,
      merchants: 98,
      flyers: 189,
    },
    {
      id: '3',
      name: '의정부 호원1동',
      level: 'neighborhood',
      users: 3156,
      merchants: 121,
      flyers: 212,
    },
  ]);

  const totalStats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.isActive).length,
    totalFlyers: flyers.length,
    activeFlyers: flyers.filter(f => f.status === 'active').length,
    pendingFlyers: flyers.filter(f => f.status === 'pending').length,
    totalRegions: regions.length,
  };

  const getRoleLabel = (role: string) => {
    const roleMap: Record<string, string> = {
      user: '일반 사용자',
      merchant: '사장님',
      partner: '파트너',
      security_guard: '보안관',
      admin: '관리자',
      super_admin: '최고 관리자',
    };
    return roleMap[role] || role;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="status-badge active"><CheckCircle size={14} /> 활성</span>;
      case 'pending':
        return <span className="status-badge pending"><Activity size={14} /> 대기</span>;
      case 'expired':
        return <span className="status-badge expired"><XCircle size={14} /> 만료</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  return (
    <div className="admin-dashboard-container">
      <AdminSidebar
        totalUsers={totalStats.totalUsers}
        totalFlyers={totalStats.totalFlyers}
        systemHealth="online"
        adminName="관리자"
        activeNav={activeNav}
        onNavChange={setActiveNav}
      />

      <main className="admin-main-content">
        {/* Header */}
        <header className="dashboard-header">
          <div>
            <h1 className="dashboard-title">시스템 관리 대시보드</h1>
            <p className="dashboard-subtitle">전체 플랫폼을 모니터링하고 관리합니다</p>
          </div>
        </header>

        {/* Overview Section */}
        {activeNav === 'overview' && (
          <>
            {/* Stats Summary */}
            <div className="stats-summary">
              <div className="stat-card users">
                <div className="stat-icon">
                  <Users size={24} />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{totalStats.totalUsers}</div>
                  <div className="stat-label">총 사용자</div>
                </div>
              </div>

              <div className="stat-card flyers">
                <div className="stat-icon">
                  <FileText size={24} />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{totalStats.activeFlyers}</div>
                  <div className="stat-label">활성 전단지</div>
                </div>
              </div>

              <div className="stat-card regions">
                <div className="stat-icon">
                  <MapPin size={24} />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{totalStats.totalRegions}</div>
                  <div className="stat-label">관리 지역</div>
                </div>
              </div>

              <div className="stat-card pending">
                <div className="stat-icon">
                  <Activity size={24} />
                </div>
                <div className="stat-content">
                  <div className="stat-value">{totalStats.pendingFlyers}</div>
                  <div className="stat-label">승인 대기</div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <section className="dashboard-section">
              <div className="section-header">
                <h2>최근 활동</h2>
              </div>

              <div className="activity-cards">
                <div className="activity-card">
                  <div className="activity-icon users">
                    <Users size={20} />
                  </div>
                  <div className="activity-content">
                    <div className="activity-title">신규 사용자 가입</div>
                    <div className="activity-description">이번 주 37명의 신규 사용자가 가입했습니다</div>
                    <div className="activity-meta">
                      <TrendingUp size={14} />
                      <span>+12% 전주 대비</span>
                    </div>
                  </div>
                </div>

                <div className="activity-card">
                  <div className="activity-icon flyers">
                    <FileText size={20} />
                  </div>
                  <div className="activity-content">
                    <div className="activity-title">전단지 등록</div>
                    <div className="activity-description">오늘 15개의 전단지가 등록되었습니다</div>
                    <div className="activity-meta">
                      <TrendingUp size={14} />
                      <span>+8% 어제 대비</span>
                    </div>
                  </div>
                </div>

                <div className="activity-card">
                  <div className="activity-icon regions">
                    <MapPin size={20} />
                  </div>
                  <div className="activity-content">
                    <div className="activity-title">지역 활성화</div>
                    <div className="activity-description">의정부 송산1동이 가장 활발합니다</div>
                    <div className="activity-meta">
                      <span>3,456명 활성 사용자</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Users Section */}
        {activeNav === 'users' && (
          <section className="dashboard-section">
            <div className="section-header">
              <h2>사용자 관리</h2>
              <span className="badge-count">{users.length}명</span>
            </div>

            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>이메일</th>
                    <th>역할</th>
                    <th>상태</th>
                    <th>가입일</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.email}</td>
                      <td>{getRoleLabel(user.role)}</td>
                      <td>
                        {user.isActive ? (
                          <span className="status-badge active"><CheckCircle size={14} /> 활성</span>
                        ) : (
                          <span className="status-badge inactive"><XCircle size={14} /> 비활성</span>
                        )}
                      </td>
                      <td>{user.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Flyers Section */}
        {activeNav === 'flyers' && (
          <section className="dashboard-section">
            <div className="section-header">
              <h2>전단지 관리</h2>
              <span className="badge-count">{flyers.length}개</span>
            </div>

            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>제목</th>
                    <th>사장님</th>
                    <th>상태</th>
                    <th>조회수</th>
                    <th>클릭수</th>
                    <th>등록일</th>
                  </tr>
                </thead>
                <tbody>
                  {flyers.map(flyer => (
                    <tr key={flyer.id}>
                      <td>{flyer.title}</td>
                      <td>{flyer.merchant}</td>
                      <td>{getStatusBadge(flyer.status)}</td>
                      <td>{flyer.views.toLocaleString()}</td>
                      <td>{flyer.clicks}</td>
                      <td>{flyer.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Regions Section */}
        {activeNav === 'regions' && (
          <section className="dashboard-section">
            <div className="section-header">
              <h2>지역 관리</h2>
              <span className="badge-count">{regions.length}개 지역</span>
            </div>

            <div className="regions-grid">
              {regions.map(region => (
                <div key={region.id} className="region-card">
                  <div className="region-header">
                    <h3>{region.name}</h3>
                    <span className="level-badge">{region.level}</span>
                  </div>

                  <div className="region-stats">
                    <div className="region-stat">
                      <Users size={16} />
                      <span className="stat-label">사용자</span>
                      <span className="stat-value">{region.users.toLocaleString()}</span>
                    </div>
                    <div className="region-stat">
                      <FileText size={16} />
                      <span className="stat-label">사장님</span>
                      <span className="stat-value">{region.merchants}</span>
                    </div>
                    <div className="region-stat">
                      <Activity size={16} />
                      <span className="stat-label">전단지</span>
                      <span className="stat-value">{region.flyers}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Analytics Section */}
        {activeNav === 'analytics' && (
          <section className="dashboard-section">
            <div className="section-header">
              <h2>통계 분석</h2>
            </div>

            <div className="analytics-placeholder">
              <TrendingUp size={48} />
              <h3>통계 분석 기능</h3>
              <p>상세한 통계 및 분석 기능이 곧 추가될 예정입니다.</p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
