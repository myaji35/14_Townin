import { useState } from 'react';
import './Sidebar.css';

interface SidebarProps {
  currentPoints: number;
  streak: number;
  activeMenu?: string;
  onMenuChange?: (menu: string) => void;
}

export default function Sidebar({
  currentPoints = 2450,
  streak = 7,
  activeMenu = 'home',
  onMenuChange
}: SidebarProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const menuItems = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'flyers', label: 'Digital Flyers', icon: '📰' },
    { id: 'wallet', label: 'My Wallet', icon: '💳' },
    { id: 'community', label: 'Community', icon: '👥' }
  ];

  const filterCategories = [
    { id: 'all', label: 'All Categories' },
    { id: 'food', label: 'Food & Dining' },
    { id: 'retail', label: 'Retail Shopping' },
    { id: 'health', label: 'Health & Wellness' },
    { id: 'services', label: 'Life Services' }
  ];

  const handleMenuClick = (menuId: string) => {
    if (onMenuChange) {
      onMenuChange(menuId);
    }
  };

  return (
    <div className="sidebar">
      {/* Logo Header */}
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">📍</span>
          <h1 className="logo-text">Townin OS</h1>
        </div>
        <div className="location-selector">
          <button className="location-btn">
            <span className="location-icon">🗺️</span>
            <span>Map vs. Seoul</span>
            <span className="dropdown-arrow">▼</span>
          </button>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeMenu === item.id ? 'active' : ''}`}
            onClick={() => handleMenuClick(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Points Display */}
      <div className="points-section">
        <div className="points-label">CURRENT POINTS</div>
        <div className="points-value">{currentPoints.toLocaleString()}</div>
        <div className="points-streak">
          <span className="streak-icon">🔥</span>
          <span className="streak-text">Your running streak!</span>
        </div>
      </div>

      {/* Filter Categories */}
      <div className="filter-section">
        <h3 className="filter-title">FILTER CATEGORIES</h3>
        <div className="filter-list">
          {filterCategories.map((category) => (
            <button
              key={category.id}
              className={`filter-item ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
