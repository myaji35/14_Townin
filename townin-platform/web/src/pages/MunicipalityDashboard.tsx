import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import './DashboardPage.css';

export default function MunicipalityDashboard() {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = authService.getUser();
    if (!currentUser || currentUser.role !== 'municipality') {
      navigate('/login');
      return;
    }
    setUser(currentUser);
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Townin - 지자체 대시보드</h1>
        <div className="user-info">
          <span>{user.email}</span>
          <button onClick={handleLogout} className="logout-button">
            로그아웃
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-welcome">
          <h2>안녕하세요, 공무원님!</h2>
          <p>지역 통계와 관리 데이터를 확인하세요.</p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>총 사용자</h3>
            <p className="card-value">0</p>
            <p className="card-label">관내 등록 사용자</p>
          </div>

          <div className="dashboard-card">
            <h3>등록 상인</h3>
            <p className="card-value">0</p>
            <p className="card-label">관내 상인 수</p>
          </div>

          <div className="dashboard-card">
            <h3>보안요원</h3>
            <p className="card-value">0</p>
            <p className="card-label">활동 보안요원</p>
          </div>

          <div className="dashboard-card">
            <h3>지역 안전도</h3>
            <p className="card-value">-</p>
            <p className="card-label">평균 점수</p>
          </div>
        </div>

        <div className="dashboard-section">
          <h3>지역 통계</h3>
          <p className="empty-state">통계 데이터가 준비 중입니다.</p>
        </div>

        <div className="dashboard-section">
          <h3>최근 활동</h3>
          <p className="empty-state">활동 내역이 없습니다.</p>
        </div>
      </main>
    </div>
  );
}
