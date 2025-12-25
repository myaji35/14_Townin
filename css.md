:root {
    /* Design Tokens from Mevolut Spec */
    --bg-app: #0B0D10;
    --bg-sidebar: #0E1014;
    --bg-card: #14171C;
    --bg-card-hover: #1A1D24;
    
    --accent-gold: #F5A623;
    --accent-gold-dim: rgba(245, 166, 35, 0.15);
    --accent-gold-glow: rgba(245, 166, 35, 0.4);

    --text-primary: #FFFFFF;
    --text-secondary: #B0B3B8;
    --text-muted: #6B6F76;

    --border-subtle: rgba(255, 255, 255, 0.05);
    --shadow-card: 0 20px 40px rgba(0,0,0,0.4);
    --shadow-inner: inset 0 2px 4px rgba(0,0,0,0.5);

    --radius-lg: 24px;
    --radius-md: 16px;
    --radius-sm: 8px;
    --radius-pill: 999px;

    --font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
    background-color: var(--bg-app);
    color: var(--text-primary);
    font-family: var(--font-family);
    height: 100vh;
    overflow: hidden;
}

/* --- Layout Grid --- */
.app-container {
    display: grid;
    grid-template-columns: 260px 1fr 400px; /* Sidebar | Main | Map */
    height: 100vh;
}

/* --- 1. Sidebar --- */
.sidebar {
    background-color: var(--bg-sidebar);
    padding: 32px 24px;
    display: flex;
    flex-direction: column;
    border-right: 1px solid var(--border-subtle);
}

.brand {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 40px;
}
.logo-icon {
    width: 32px; height: 32px;
    background: var(--accent-gold);
    color: var(--bg-app);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-weight: bold;
}
.brand-text h1 { font-size: 16px; font-weight: 700; letter-spacing: 0.5px; }
.brand-text span { font-size: 11px; color: var(--text-muted); display: block; }

.nav-menu { display: flex; flex-direction: column; gap: 8px; margin-bottom: 30px; }
.nav-item {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 16px;
    text-decoration: none;
    color: var(--text-secondary);
    border-radius: var(--radius-md);
    transition: all 0.2s;
    font-size: 14px;
}
.nav-item:hover { color: var(--text-primary); background: rgba(255,255,255,0.03); }
.nav-item.active {
    background: var(--accent-gold-dim);
    color: var(--accent-gold);
    font-weight: 600;
}

.points-card {
    background: linear-gradient(145deg, #1a1d23, #14161b);
    padding: 20px;
    border-radius: var(--radius-md);
    position: relative;
    overflow: hidden;
    margin-bottom: 30px;
    box-shadow: var(--shadow-inner);
    border: 1px solid rgba(255,255,255,0.02);
}
.points-card .label { font-size: 10px; color: var(--text-muted); letter-spacing: 1px; }
.points-card .points-value { font-size: 32px; font-weight: 700; color: var(--text-primary); margin: 8px 0; }
.points-card .unit { font-size: 16px; color: var(--accent-gold); }
.points-card .points-trend { font-size: 11px; color: #22C55E; display: flex; align-items: center; gap: 4px; }
.background-icon { position: absolute; right: -10px; bottom: -10px; font-size: 80px; color: rgba(255,255,255,0.02); }

.filters { display: flex; flex-direction: column; gap: 12px; flex: 1; }
.filter-item {
    display: flex; align-items: center; gap: 10px;
    color: var(--text-secondary); cursor: pointer; font-size: 13px;
}
.filter-item input { display: none; }
.checkmark {
    width: 18px; height: 18px;
    border: 2px solid var(--text-muted);
    border-radius: 50%;
    display: inline-block;
    position: relative;
}
.filter-item input:checked + .checkmark { border-color: var(--accent-gold); }
.filter-item input:checked + .checkmark::after {
    content: ''; position: absolute;
    top: 3px; left: 3px; width: 8px; height: 8px;
    background: var(--accent-gold); border-radius: 50%;
}
.filter-item input:checked ~ span { color: var(--text-primary); }

.user-profile {
    display: flex; align-items: center; gap: 12px;
    padding-top: 20px; border-top: 1px solid var(--border-subtle);
}
.avatar { width: 36px; height: 36px; background-color: #333; border-radius: 50%; background-image: url('https://i.pravatar.cc/150?img=11'); background-size: cover; }
.user-profile .info { flex: 1; }
.user-profile .name { font-size: 13px; font-weight: 600; }
.user-profile .role { font-size: 11px; color: var(--accent-gold); }
.logout-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; }

/* --- 2. Main Content --- */
.main-content {
    padding: 30px 40px;
    overflow-y: auto;
}

.top-header {
    display: flex; align-items: center; gap: 20px; margin-bottom: 30px;
}
.location-selector {
    background: var(--bg-card);
    padding: 8px 16px;
    border-radius: var(--radius-pill);
    font-size: 13px;
    display: flex; align-items: center; gap: 8px;
    color: var(--text-primary);
    border: 1px solid var(--border-subtle);
}
.page-title { font-size: 20px; font-weight: 600; margin-left: auto; display: none; } /* Hidden as per image flow */

.hero-card {
    background: linear-gradient(135deg, #1c2026, #111316);
    border-radius: var(--radius-lg);
    padding: 30px;
    display: flex; gap: 24px;
    margin-bottom: 40px;
    box-shadow: var(--shadow-card);
    border: 1px solid rgba(255,255,255,0.05);
    position: relative;
}
.hero-card::before { /* Top glow */
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, var(--accent-gold-glow), transparent);
}
.icon-box {
    width: 48px; height: 48px;
    background: var(--accent-gold-dim);
    color: var(--accent-gold);
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center; font-size: 24px;
}
.hero-card h3 { font-size: 18px; margin-bottom: 8px; display: flex; align-items: center; gap: 10px; }
.badge { background: rgba(34, 197, 94, 0.2); color: #22C55E; font-size: 10px; padding: 2px 6px; border-radius: 4px; }
.hero-card p { font-size: 14px; color: var(--text-secondary); line-height: 1.5; max-width: 500px; }

.section-header {
    display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;
}
.section-header h3 { font-size: 16px; display: flex; gap: 8px; align-items: center; }
.section-header h3 i { color: var(--accent-gold); }
.arrows .arrow-btn {
    width: 32px; height: 32px; border-radius: 50%;
    background: var(--bg-card); border: none; color: var(--text-secondary);
    cursor: pointer; margin-left: 8px;
}
.arrows .arrow-btn:hover { background: var(--text-primary); color: var(--bg-app); }

.cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
}

.item-card {
    background: var(--bg-card);
    border-radius: var(--radius-md);
    overflow: hidden;
    box-shadow: var(--shadow-card);
    border: 1px solid transparent;
    transition: transform 0.2s, border-color 0.2s;
}
.item-card:hover {
    transform: translateY(-5px);
    border-color: var(--accent-gold-dim);
}
.card-image {
    height: 180px;
    background-size: cover; background-position: center;
    position: relative; padding: 16px;
}
.ai-tag, .match-tag {
    position: absolute;
    padding: 4px 10px; border-radius: var(--radius-pill);
    font-size: 11px; font-weight: 600;
    backdrop-filter: blur(4px);
}
.ai-tag { top: 12px; left: 12px; background: var(--accent-gold); color: #000; }
.match-tag { bottom: 12px; right: 12px; background: rgba(0,0,0,0.6); color: white; border: 1px solid rgba(255,255,255,0.2); }

.card-body { padding: 20px; }
.meta { display: flex; justify-content: space-between; font-size: 11px; color: var(--text-muted); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
.item-card h4 { font-size: 16px; margin-bottom: 8px; line-height: 1.4; }
.item-card .desc { font-size: 13px; color: var(--text-secondary); margin-bottom: 20px; line-height: 1.5; }
.action-btn {
    width: 100%;
    padding: 12px;
    background: var(--accent-gold);
    color: #0B0D10;
    border: none; border-radius: var(--radius-pill);
    font-weight: 600; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 8px;
    transition: filter 0.2s;
}
.action-btn:hover { filter: brightness(1.1); }

/* --- 3. Right Map Panel --- */
.map-panel {
    position: relative;
    background-color: #1a1c22; /* Dark map placeholder */
    background-image: 
        linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
    background-size: 40px 40px;
    overflow: hidden;
}

.map-background { width: 100%; height: 100%; position: relative; }
.map-pin {
    width: 16px; height: 16px;
    background: var(--accent-gold);
    border: 3px solid rgba(245, 166, 35, 0.3);
    box-shadow: 0 0 15px var(--accent-gold);
    border-radius: 50%;
    position: absolute; transform: translate(-50%, -50%);
}
.map-pin.active { width: 20px; height: 20px; border-color: white; z-index: 10; }

.search-bar-floating {
    position: absolute; top: 30px; left: 24px; right: 24px;
    background: rgba(20, 23, 28, 0.85);
    backdrop-filter: blur(10px);
    padding: 12px 20px;
    border-radius: var(--radius-md);
    display: flex; align-items: center; gap: 12px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    border: 1px solid rgba(255,255,255,0.1);
}
.search-bar-floating input {
    background: none; border: none; outline: none;
    color: white; flex: 1;
}

.map-controls {
    position: absolute; top: 100px; right: 24px;
    display: flex; flex-direction: column; gap: 8px;
}
.map-controls button {
    width: 36px; height: 36px;
    background: rgba(20, 23, 28, 0.9);
    border: 1px solid rgba(255,255,255,0.1);
    color: var(--text-primary);
    border-radius: 8px;
    cursor: pointer;
}

.map-widget {
    position: absolute; bottom: 30px; left: 24px; right: 24px;
    background: rgba(20, 23, 28, 0.85);
    backdrop-filter: blur(12px);
    padding: 16px;
    border-radius: var(--radius-md);
    display: flex; gap: 16px; align-items: center;
    border: 1px solid rgba(255,255,255,0.05);
    box-shadow: 0 20px 40px rgba(0,0,0,0.6);
}
.widget-icon { color: var(--accent-gold); font-size: 20px; }
.widget-content h4 { font-size: 14px; margin-bottom: 4px; }
.widget-content p { font-size: 11px; color: var(--text-secondary); }