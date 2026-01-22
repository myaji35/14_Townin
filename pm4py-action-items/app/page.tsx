'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { M3Button, M3Card, AnimatedList } from '@/components/material-vivid';
import { motion, AnimatePresence } from 'framer-motion';

export default function TowninDashboard() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedHub, setSelectedHub] = useState('Mapo-gu, Seoul');
  const [isMapOpen, setIsMapOpen] = useState(true);

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'food', label: 'Food & Dining' },
    { id: 'retail', label: 'Retail Shopping' },
    { id: 'health', label: 'Health & Wellness' },
    { id: 'life', label: 'Life Services' },
  ];

  const flyers = [
    {
      id: 1,
      store: 'FRESH GREENS MARKET',
      title: '30% OFF Organic Salad Subscription',
      description: 'Exclusive discount based on your recent activity tracking. Perfect for your weekday lunch plan.',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop',
      validUntil: 'Valid until Oct 31',
      aiMatch: 'Health Goal',
      badge: 'AI Recommended',
      category: 'food',
      featured: true
    },
    {
      id: 2,
      store: 'ZEN YOGA STUDIO',
      title: 'Free Trial + 500P Bonus for Joiners',
      description: "Recommended because you searched for 'stress relief' recently.",
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop',
      validUntil: 'Valid: 3 days left',
      aiMatch: 'Wellness',
      badge: 'AI Recommended',
      category: 'health',
      featured: true
    },
    {
      id: 3,
      store: 'STAR COFFEE',
      title: 'Buy 1 Get 1 Free: Autumn Latte',
      description: 'Seasonal special offer for neighborhood residents.',
      image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&auto=format&fit=crop',
      validUntil: 'Valid until Sunday',
      badge: 'HOT DEAL',
      category: 'food',
      featured: true
    },
    {
      id: 4,
      store: 'BURGER KING',
      title: 'Whopper Junior Set $4.99',
      image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop',
      validUntil: 'Ends this week',
      category: 'food',
      featured: false
    },
    {
      id: 5,
      store: 'LOCAL MART',
      title: 'Fresh Fruits 20% Discount',
      image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&auto=format&fit=crop',
      validUntil: 'This weekend',
      category: 'food',
      featured: false
    },
    {
      id: 6,
      store: 'CLEAN & PRESS',
      title: 'Winter Coat Cleaning Special',
      image: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=800&auto=format&fit=crop',
      validUntil: 'Until Nov 15',
      category: 'life',
      featured: false
    },
  ];

  const filteredFlyers = selectedCategory === 'all'
    ? flyers
    : flyers.filter(f => f.category === selectedCategory);

  return (
    <div className="min-h-screen bg-[#0A1612] text-white flex overflow-hidden h-screen">
      {/* Left Sidebar */}
      <aside className="w-[260px] bg-[#0A1612] border-r border-[#2A4C42] flex flex-col h-full shrink-0">
        <div className="p-6">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="bg-[#13ecb6] rounded-lg w-10 h-10 flex items-center justify-center">
              <span className="text-[#0A1612] text-xl font-bold">🏘️</span>
            </div>
            <div>
              <h1 className="text-white text-base font-bold">Townin OS</h1>
              <p className="text-[#7A9B8F] text-xs">Hyper-local Life</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-1 mb-8">
            <a className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#A8C7BC] hover:bg-[#1A3530] transition-colors" href="#">
              <span className="text-lg">🏠</span>
              <span className="text-sm font-medium">홈</span>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#1A3530] text-white" href="#">
              <span className="text-lg">📰</span>
              <span className="text-sm font-medium">디지털 전단지</span>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#A8C7BC] hover:bg-[#1A3530] transition-colors" href="/wallet">
              <span className="text-lg">💰</span>
              <span className="text-sm font-medium">내 지갑</span>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#A8C7BC] hover:bg-[#1A3530] transition-colors" href="/community">
              <span className="text-lg">👥</span>
              <span className="text-sm font-medium">커뮤니티</span>
            </a>
          </nav>
        </div>

        {/* Points Card */}
        <div className="px-6 flex-1 overflow-y-auto">
          <M3Card level={2} hover={false} className="mb-6 bg-gradient-to-br from-[#1A3530] to-[#132822] relative overflow-hidden">
            <div className="absolute top-2 right-2 opacity-10">
              <span className="text-5xl">💰</span>
            </div>
            <div className="p-5 relative z-10">
              <p className="text-[#A8C7BC] text-xs font-bold uppercase tracking-wider mb-2">나의 포인트 현황</p>
              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-3xl font-bold text-white">2,450</span>
                <span className="text-sm text-[#13ecb6] font-bold">P</span>
              </div>
              <div className="w-full bg-[#0A1612] h-1.5 rounded-full mb-2 overflow-hidden">
                <motion.div
                  className="bg-[#13ecb6] h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '65%' }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
              <p className="text-[10px] text-[#A8C7BC] flex items-center gap-1">
                <span className="text-xs text-[#13ecb6]">↑</span>
                이번 주 350P 적립
              </p>
            </div>
          </M3Card>

          {/* Filter Categories */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4 opacity-70">카테고리 필터</h4>
            <div className="flex flex-col gap-1">
              {categories.map((cat) => (
                <label key={cat.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#1A3530] cursor-pointer group transition-colors">
                  <Checkbox
                    checked={selectedCategory === cat.id}
                    onCheckedChange={() => setSelectedCategory(cat.id)}
                  />
                  <span className={`text-sm font-medium ${selectedCategory === cat.id ? 'text-white' : 'text-[#A8C7BC] group-hover:text-white'} transition-colors`}>
                    {cat.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-[#2A4C42]">
          <a href="/settings" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-full bg-[#13ecb6] flex items-center justify-center text-[#0A1612] font-bold text-sm group-hover:ring-2 ring-[#13ecb6]/50 transition-all">
              AJ
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-medium group-hover:text-[#13ecb6] transition-colors">Alex Johnson</p>
              <p className="text-[#7A9B8F] text-xs">프리미엄 멤버</p>
            </div>
            <button className="text-[#A8C7BC] hover:text-white transition-colors">
              <span className="text-lg">⚙️</span>
            </button>
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-[#2A4C42] bg-[#0A1612]/95 backdrop-blur-sm flex items-center justify-between px-8 shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-[#1A3530] px-3 py-2 rounded-lg border border-[#2A4C42]">
              <span className="text-[#13ecb6] text-base">📍</span>
              <span className="text-sm font-medium text-white">{selectedHub}</span>
              <span className="text-xs text-[#A8C7BC]">▼</span>
            </div>
            <div className="h-5 w-px bg-[#2A4C42]"></div>
            <h2 className="text-lg font-bold text-white">🔥🔥🔥 NEW DESIGN TEST 🔥🔥🔥</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-60">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8C7BC]">🔍</span>
              <input
                className="w-full bg-[#1A3530] border-none rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:ring-1 focus:ring-[#13ecb6] placeholder:text-[#5A7A72] outline-none"
                placeholder="상점 또는 상품 검색..."
                type="text"
              />
            </div>
            <button className="relative text-white hover:text-[#13ecb6] transition-colors">
              <span className="text-xl">🔔</span>
              <span className="absolute top-0 right-0 w-2 h-2 bg-[#13ecb6] rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Content Area with Map */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Flyers Content */}
          <div className="flex-1 overflow-y-auto p-8">
            {/* AI GraphRAG Banner */}
            <M3Card level={1} hover={false} className="mb-8 bg-gradient-to-r from-[#13ecb6]/10 via-[#1A3530] to-[#132822] border-[#13ecb6]/30">
              <div className="p-6 flex items-center gap-5">
                <motion.div
                  className="bg-[#13ecb6] p-3 rounded-xl shrink-0"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="text-[#0A1612] text-2xl">🧠</span>
                </motion.div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-lg font-bold text-white">AI GraphRAG 분석 완료</h2>
                    <Badge className="text-[10px] bg-[#13ecb6]/20 text-[#13ecb6] border-[#13ecb6]/40 px-2 py-0.5">
                      BETA
                    </Badge>
                  </div>
                  <p className="text-[#A8C7BC] text-sm">
                    회원님의 라이프스타일 패턴과 지역 서비스를 연결했습니다. 현재 건강 목표와 소비 패턴에 맞는 전단지 12개를 찾았습니다.
                  </p>
                </div>
              </div>
            </M3Card>

            {/* This Week's Recommendations */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="text-[#13ecb6]">✨</span>
                  이번 주 추천 전단지
                </h3>
                <div className="flex gap-2">
                  <M3Button variant="tonal" className="w-9 h-9 rounded-full px-0 py-0">
                    <span className="text-sm">←</span>
                  </M3Button>
                  <M3Button variant="tonal" className="w-9 h-9 rounded-full px-0 py-0">
                    <span className="text-sm">→</span>
                  </M3Button>
                </div>
              </div>

              <AnimatedList className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {filteredFlyers.filter(f => f.featured).map((flyer) => (
                  <M3Card key={flyer.id} level={2} className="flex flex-col overflow-hidden">
                    {/* Image */}
                    <div className="h-56 relative overflow-hidden">
                      <img src={flyer.image} alt={flyer.title} className="w-full h-full object-cover" />
                      {flyer.aiMatch && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 }}
                          className="absolute top-0 left-0"
                        >
                          <Badge className="rounded-br-xl rounded-tl-none rounded-tr-none shadow-[0_0_20px_rgba(19,236,182,0.5)] px-3 py-1.5 text-xs">
                            <span>✨</span> {flyer.badge}
                          </Badge>
                        </motion.div>
                      )}
                      {!flyer.aiMatch && (
                        <div className="absolute top-3 right-3">
                          <Badge variant="secondary" className="text-xs px-2 py-1">
                            {flyer.badge}
                          </Badge>
                        </div>
                      )}
                      {flyer.aiMatch && (
                        <div className="absolute bottom-3 right-3 bg-[#0A1612]/80 backdrop-blur-md text-white text-xs px-2.5 py-1.5 rounded-lg">
                          <span className="font-semibold text-[#13ecb6]">매칭:</span> {flyer.aiMatch}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[#A8C7BC] text-xs font-bold uppercase tracking-wider">{flyer.store}</span>
                        <span className="text-[#7A9B8F] text-xs">{flyer.validUntil}</span>
                      </div>
                      <h4 className="text-white font-bold text-lg leading-tight mb-2">{flyer.title}</h4>
                      <p className="text-[#A8C7BC] text-sm mb-5 line-clamp-2">{flyer.description}</p>
                      <M3Button variant="filled" className="mt-auto w-full gap-2">
                        <span>💰</span>
                        포인트 적립하기
                      </M3Button>
                    </div>
                  </M3Card>
                ))}
              </AnimatedList>
            </div>

            {/* Explore Neighborhood */}
            <div>
              <h3 className="text-xl font-bold text-white mb-5">우리 동네 둘러보기</h3>
              <AnimatedList className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5" staggerDelay={0.05}>
                {filteredFlyers.filter(f => !f.featured).map((flyer) => (
                  <M3Card key={flyer.id} level={1} className="flex flex-col overflow-hidden">
                    <div className="h-40 relative">
                      <img src={flyer.image} alt={flyer.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-[#A8C7BC] uppercase font-semibold">{flyer.store}</span>
                        <span className="text-[#13ecb6]">200m 거리</span>
                      </div>
                      <h4 className="text-white font-bold text-base mb-4">{flyer.title}</h4>
                      <M3Button variant="outlined" className="mt-auto w-full">
                        상세 보기
                      </M3Button>
                    </div>
                  </M3Card>
                ))}
              </AnimatedList>
            </div>
          </div>

          {/* Right Map Panel */}
          <motion.div
            initial={{ width: 400, opacity: 1 }}
            animate={{
              width: isMapOpen ? 400 : 0,
              opacity: isMapOpen ? 1 : 0
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="h-full relative border-l border-[#2A4C42] hidden lg:block shrink-0 overflow-hidden"
          >
            {/* Map Toggle Button (Collapse) */}
            <div className="absolute top-4 left-4 z-50">
              <M3Button
                variant="tonal"
                className="w-8 h-8 rounded-full px-0 py-0 shadow-lg bg-[#0A1612]/80 backdrop-blur-md hover:bg-[#13ecb6] hover:text-[#0A1612] transition-colors"
                onClick={() => setIsMapOpen(false)}
              >
                <span className="text-lg">▶</span>
              </M3Button>
            </div>

            {/* Map Background */}
            <div className="absolute inset-0 bg-[#132822]">
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, #2A4C42 1px, transparent 0)',
                backgroundSize: '40px 40px'
              }}></div>
            </div>

            {/* Map Controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
              <M3Button variant="tonal" className="w-10 h-10 rounded-full px-0 py-0 shadow-lg">
                🎯
              </M3Button>
              <M3Button variant="tonal" className="w-10 h-10 rounded-full px-0 py-0 shadow-lg">
                ➕
              </M3Button>
              <M3Button variant="tonal" className="w-10 h-10 rounded-full px-0 py-0 shadow-lg">
                ➖
              </M3Button>
            </div>

            {/* Map Pins */}
            <div className="absolute top-[30%] left-[40%] group cursor-pointer z-10">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-[#13ecb6] text-4xl drop-shadow-[0_0_15px_rgba(19,236,182,1)]">📍</span>
              </motion.div>
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#0A1612] border border-[#13ecb6] rounded-lg px-3 py-2 shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-xs font-bold">Fresh Greens Market</p>
                <p className="text-[#13ecb6] text-[10px]">AI 추천</p>
              </div>
            </div>

            <div className="absolute top-[50%] left-[60%]">
              <span className="text-[#A8C7BC] text-2xl">📍</span>
            </div>

            <div className="absolute top-[20%] left-[25%]">
              <motion.span
                className="text-[#13ecb6] text-3xl"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{ filter: 'drop-shadow(0 0 10px rgba(19, 236, 182, 0.7))' }}
              >
                📍
              </motion.span>
            </div>

            {/* Map Info Card */}
            <M3Card level={2} hover={false} className="absolute bottom-4 left-4 right-4 backdrop-blur-md">
              <div className="p-3 flex items-start gap-3">
                <span className="text-[#13ecb6] text-lg mt-0.5">✨</span>
                <div>
                  <p className="text-white text-xs font-bold mb-1">개인 맞춤형 지도</p>
                  <p className="text-[#A8C7BC] text-[10px] leading-relaxed">
                    빛나는 핀은 회원님의 GraphRAG 라이프스타일 프로필과 일치하는 상점을 나타냅니다.
                  </p>
                </div>
              </div>
            </M3Card>
          </motion.div>

          {/* Expand Button (Visible when closed) */}
          <AnimatePresence>
            {!isMapOpen && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="absolute top-4 right-4 z-50 hidden lg:block"
              >
                <M3Button
                  variant="filled"
                  className="rounded-full shadow-lg gap-2"
                  onClick={() => setIsMapOpen(true)}
                >
                  <span className="text-lg">◀</span>
                  <span className="text-sm">지도 열기</span>
                </M3Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
