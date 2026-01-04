import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Home, FileText, BarChart3, Settings, Eye, MousePointerClick, TrendingUp, Store, Sun, Moon, LogOut } from 'lucide-react';
import './MerchantSidebar.css';

interface MerchantSidebarProps {
  totalViews?: number;
  totalClicks?: number;
  businessName?: string;
  activeNav?: string;
  onNavChange?: (nav: string) => void;
}

export default function MerchantSidebar({
  totalViews = 2456,
  totalClicks = 423,
  businessName = '스마일 치과의원',
  activeNav = 'dashboard',
  onNavChange,
}: MerchantSidebarProps) {
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Close settings menu when clicking outside
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
    { id: 'dashboard', label: t('common.home'), icon: Home },
    { id: 'flyers', label: t('common.digitalFlyers'), icon: FileText },
    { id: 'analytics', label: t('merchant.performance'), icon: BarChart3 },
    { id: 'settings', label: t('merchant.settings'), icon: Settings },
  ];

  const handleNavClick = (navId: string) => {
    if (onNavChange) {
      onNavChange(navId);
    }
  };

  const handleLogout = () => {
    // TODO: Implement actual logout logic
    if (confirm('로그아웃 하시겠습니까?')) {
      window.location.href = '/login';
    }
  };

  const handleThemeToggle = () => {
    toggleTheme();
    setIsSettingsOpen(false);
  };

  const clickRate = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0.0';

  return (
    <aside className="merchant-sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="brand">
          <div className="logo-icon">T</div>
          <div className="brand-text">
            <h1>Townin OS</h1>
            <span>{t('merchant.dashboard')}</span>
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
        <div className="stats-card">
          <Eye className="background-icon" size={80} strokeWidth={1} />
          <label className="label">{t('merchant.totalViews').toUpperCase()}</label>
          <div className="stats-value">
            {totalViews.toLocaleString()}
          </div>
          <div className="stats-trend">
            <TrendingUp className="trend-icon" size={14} />
            일 평균 245회
          </div>
        </div>

        <div className="stats-card">
          <MousePointerClick className="background-icon" size={80} strokeWidth={1} />
          <label className="label">{t('merchant.totalClicks').toUpperCase()}</label>
          <div className="stats-value">
            {totalClicks.toLocaleString()}
          </div>
          <div className="stats-trend">
            <TrendingUp className="trend-icon" size={14} />
            일 평균 42회
          </div>
        </div>

        <div className="stats-card">
          <TrendingUp className="background-icon" size={80} strokeWidth={1} />
          <label className="label">{t('merchant.clickRate').toUpperCase()}</label>
          <div className="stats-value">
            {clickRate}<span className="unit">%</span>
          </div>
          <div className="stats-trend">
            <TrendingUp className="trend-icon" size={14} />
            평균 대비 높음
          </div>
        </div>
      </div>

      {/* Business Profile */}
      <div className="user-profile">
        <div className="avatar">
          <Store size={20} />
        </div>
        <div className="info">
          <div className="name">{businessName}</div>
          <div className="role">{t('merchant.businessName')}</div>
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
