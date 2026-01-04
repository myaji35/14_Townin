import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Home, Users, FileText, MapPin, Activity, Settings, Sun, Moon, LogOut, BarChart3 } from 'lucide-react';
import './AdminSidebar.css';

interface AdminSidebarProps {
  totalUsers?: number;
  totalFlyers?: number;
  systemHealth?: 'online' | 'warning' | 'offline';
  adminName?: string;
  activeNav?: string;
  onNavChange?: (nav: string) => void;
}

export default function AdminSidebar({
  totalUsers = 1543,
  totalFlyers = 89,
  systemHealth = 'online',
  adminName = '관리자',
  activeNav = 'overview',
  onNavChange,
}: AdminSidebarProps) {
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { id: 'overview', label: t('master.overview'), icon: Home },
    { id: 'users', label: '사용자 관리', icon: Users },
    { id: 'flyers', label: '전단지 관리', icon: FileText },
    { id: 'regions', label: '지역 관리', icon: MapPin },
    { id: 'analytics', label: '통계 분석', icon: BarChart3 },
  ];

  const handleNavClick = (navId: string) => {
    if (onNavChange) {
      onNavChange(navId);
    }
  };

  const handleLogout = () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      window.location.href = '/login';
    }
  };

  const handleThemeToggle = () => {
    toggleTheme();
    setIsSettingsOpen(false);
  };

  const getHealthStatus = () => {
    switch (systemHealth) {
      case 'online':
        return { label: '정상 운영', color: '#22C55E' };
      case 'warning':
        return { label: '주의 필요', color: '#FBBF24' };
      case 'offline':
        return { label: '오프라인', color: '#EF4444' };
      default:
        return { label: '정상 운영', color: '#22C55E' };
    }
  };

  const healthStatus = getHealthStatus();

  return (
    <aside className="admin-sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="brand">
          <div className="logo-icon">T</div>
          <div className="brand-text">
            <h1>Townin OS</h1>
            <span>Admin Dashboard</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="nav-menu">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                <IconComponent className="nav-icon" size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Stats Cards */}
      <div className="sidebar-scrollable">
        <div className="stats-card users">
          <Users className="background-icon" size={80} strokeWidth={1} />
          <label className="label">총 사용자</label>
          <div className="stats-value">
            {totalUsers.toLocaleString()}
          </div>
          <div className="stats-trend">
            전체 플랫폼 사용자
          </div>
        </div>

        <div className="stats-card flyers">
          <FileText className="background-icon" size={80} strokeWidth={1} />
          <label className="label">전단지</label>
          <div className="stats-value">
            {totalFlyers}
          </div>
          <div className="stats-trend">
            활성 전단지 수
          </div>
        </div>

        <div className="info-card">
          <div className="info-item">
            <div className="info-label">{t('master.systemHealth')}</div>
            <div className="info-value status-indicator" style={{ color: healthStatus.color }}>
              <Activity size={16} />
              <span className="status-dot" style={{ background: healthStatus.color }}></span>
              {healthStatus.label}
            </div>
          </div>
        </div>
      </div>

      {/* Admin Profile */}
      <div className="user-profile">
        <div className="avatar">
          <span>👨‍💼</span>
        </div>
        <div className="info">
          <div className="name">{adminName}</div>
          <div className="role">시스템 관리자</div>
        </div>

        {/* Settings Menu */}
        <div className="settings-menu-wrapper" ref={settingsRef}>
          <button
            className="settings-toggle-btn"
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            aria-label="Settings"
          >
            <Settings size={16} />
          </button>

          {isSettingsOpen && (
            <div className="settings-dropdown">
              <button className="settings-menu-item" onClick={handleThemeToggle}>
                {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                <span>{theme === 'light' ? '다크 모드' : '라이트 모드'}</span>
              </button>
              <button className="settings-menu-item logout" onClick={handleLogout}>
                <LogOut size={16} />
                <span>로그아웃</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
