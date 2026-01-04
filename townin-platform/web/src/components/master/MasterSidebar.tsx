import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Home, Users, DollarSign, BarChart3, Settings, Sun, Moon, LogOut, TrendingUp } from 'lucide-react';
import './MasterSidebar.css';

interface MasterSidebarProps {
  totalRevenue?: number;
  monthlyRevenue?: number;
  masterName?: string;
  activeNav?: string;
  onNavChange?: (nav: string) => void;
}

export default function MasterSidebar({
  totalRevenue = 125340000,
  monthlyRevenue = 12450000,
  masterName = '관리자',
  activeNav = 'overview',
  onNavChange,
}: MasterSidebarProps) {
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
    { id: 'partners', label: t('master.partnerManagement'), icon: Users },
    { id: 'revenue', label: t('master.revenueAnalytics'), icon: DollarSign },
    { id: 'analytics', label: t('master.regionalStats'), icon: BarChart3 },
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <aside className="master-sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="brand">
          <div className="logo-icon">T</div>
          <div className="brand-text">
            <h1>Townin OS</h1>
            <span>{t('master.dashboard')}</span>
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

      {/* Revenue Cards */}
      <div className="sidebar-scrollable">
        <div className="revenue-card total">
          <TrendingUp className="background-icon" size={80} strokeWidth={1} />
          <label className="label">{t('master.totalRevenue').toUpperCase()}</label>
          <div className="revenue-value">
            {formatCurrency(totalRevenue)}
          </div>
          <div className="revenue-trend">
            <TrendingUp className="trend-icon" size={14} />
            전년 대비 +25.3%
          </div>
        </div>

        <div className="revenue-card monthly">
          <DollarSign className="background-icon" size={80} strokeWidth={1} />
          <label className="label">{t('master.monthlyRevenue').toUpperCase()}</label>
          <div className="revenue-value">
            {formatCurrency(monthlyRevenue)}
          </div>
          <div className="revenue-trend">
            이번 달 수익
          </div>
        </div>

        <div className="info-card">
          <div className="info-item">
            <div className="info-label">{t('master.systemHealth')}</div>
            <div className="info-value status-online">
              <span className="status-dot"></span>
              정상 운영
            </div>
          </div>
        </div>
      </div>

      {/* Master Profile */}
      <div className="user-profile">
        <div className="avatar">
          <span>👑</span>
        </div>
        <div className="info">
          <div className="name">{masterName}</div>
          <div className="role">{t('master.systemMaster')}</div>
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
