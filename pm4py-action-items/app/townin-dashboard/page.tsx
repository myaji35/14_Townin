'use client';

import { useState } from 'react';
import {
  Home,
  Map as MapIcon,
  Wallet,
  Users,
  MapPin,
  Search,
  Bell,
  Brain,
  ArrowLeft,
  ArrowRight,
  LogOut,
  ChevronDown,
  Plus,
  Minus,
  Crosshair,
  Sparkles,
  ArrowUp,
  Circle,
  Coins,
  Cpu
} from 'lucide-react';

export default function TowninDashboard() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedHub, setSelectedHub] = useState('Mapo-gu, Seoul');

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
      featured: true,
      hot: true
    },
    {
      id: 4,
      store: 'BURGER KING',
      title: 'Whopper Junior Set $4.99',
      image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop',
      validUntil: 'Ends this week',
      distance: '200m away',
      category: 'food',
      featured: false
    },
    {
      id: 5,
      store: 'LOCAL MART',
      title: 'Fresh Fruits 20% Discount',
      image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&auto=format&fit=crop',
      validUntil: 'This weekend',
      distance: '150m away',
      category: 'food',
      featured: false
    },
    {
      id: 6,
      store: 'CLEAN & PRESS',
      title: 'Winter Coat Cleaning Special',
      image: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=800&auto=format&fit=crop',
      validUntil: 'Until Nov 15',
      distance: '400m away',
      category: 'life',
      featured: false
    },
  ];

  const filteredFlyers = selectedCategory === 'all'
    ? flyers
    : flyers.filter(f => f.category === selectedCategory);

  return (
    // Main Container
    <div className="bg-[#11221e] font-display text-white overflow-hidden h-screen flex">

      {/* 1. LEFT SIDEBAR */}
      <aside className="w-[280px] bg-[#0d1f1b] border-r border-[#23483f] flex flex-col h-full shrink-0 z-20">
        <div className="p-6 pb-2">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-full bg-[#13ecb6] flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-[#11221e] rounded-sm transform rotate-45"></div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-white text-lg font-bold leading-none">Townin OS</h1>
              <p className="text-[#5a7a72] text-[10px] font-medium mt-1 tracking-wide">Hyper-local Life</p>
            </div>
          </div>

          {/* Nav Menu */}
          <nav className="flex flex-col gap-2 mb-8">
            <a href="#" className="flex items-center gap-3 px-3 py-3 rounded-lg text-[#92c9bb] hover:bg-[#1d3632] hover:text-white transition-colors">
              <Home size={20} />
              <span className="text-sm font-medium">Home</span>
            </a>
            {/* Active Item: Digital Flyers */}
            <a href="#" className="flex items-center gap-3 px-3 py-3 rounded-lg bg-[#23483f] text-white shadow-lg shadow-[#13ecb6]/5 border border-[#32675a]">
              <MapIcon size={20} className="fill-current" />
              <span className="text-sm font-medium">Digital Flyers</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-3 rounded-lg text-[#92c9bb] hover:bg-[#1d3632] hover:text-white transition-colors">
              <Wallet size={20} />
              <span className="text-sm font-medium">My Wallet</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-3 rounded-lg text-[#92c9bb] hover:bg-[#1d3632] hover:text-white transition-colors">
              <Users size={20} />
              <span className="text-sm font-medium">Community</span>
            </a>
          </nav>
        </div>

        <div className="px-6 flex-1 overflow-y-auto no-scrollbar">
          {/* Points Card */}
          <div className="bg-gradient-to-br from-[#1d3632] to-[#162b27] rounded-xl p-5 border border-[#23483f] mb-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              {/* Piggy Bank Icon (simulated with Wallet for now, as Lucide doesn't have PiggyBank, using Wallet as placeholder but cleaner) */}
              <Wallet size={64} className="text-white" strokeWidth={1} />
            </div>
            <h3 className="text-[#92c9bb] text-[10px] font-bold uppercase tracking-wider mb-2 opacity-70">My Points Status</h3>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-3xl font-bold text-white tracking-tight">2,450</span>
              <span className="text-sm text-[#13ecb6] font-bold">P</span>
            </div>
            <div className="w-full bg-[#11221e] h-1.5 rounded-full mb-3 overflow-hidden border border-[#23483f]/50">
              <div className="bg-[#13ecb6] h-full rounded-full w-[65%] shadow-[0_0_10px_#13ecb6]"></div>
            </div>
            <p className="text-[10px] text-[#92c9bb] flex items-center gap-1 font-medium">
              <ArrowUp size={12} className="text-[#13ecb6]" />
              <span className="underline decoration-[#13ecb6]/30 decoration-2 underline-offset-2">350P earned this week</span>
            </p>
          </div>

          {/* Filter Categories */}
          <div>
            <h4 className="text-[#5a7a72] text-[10px] font-bold uppercase tracking-wider mb-4 pl-1">Filter Categories</h4>
            <div className="flex flex-col gap-1">
              {categories.map((cat) => (
                <label key={cat.id} className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[#1d3632] cursor-pointer group transition-colors">
                  <div className="relative flex items-center justify-center w-5 h-5">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === cat.id}
                      onChange={() => setSelectedCategory(cat.id)}
                      className="peer appearance-none w-4 h-4 rounded-full border border-[#5a7a72] bg-transparent checked:bg-[#13ecb6] checked:border-[#13ecb6] transition-all cursor-pointer"
                    />
                    {/* Inner white dot for radio */}
                    <div className="absolute w-1.5 h-1.5 bg-[#11221e] rounded-full opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity"></div>
                  </div>
                  <span className={`text-sm ${selectedCategory === cat.id ? 'text-white' : 'text-[#92c9bb]'} group-hover:text-white transition-colors font-medium`}>
                    {cat.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Profile */}
        <div className="p-4 border-t border-[#23483f] bg-[#0d1f1b]">
          <div className="flex items-center gap-3 px-2">
            <div
              className="w-9 h-9 rounded-full bg-cover bg-center bg-no-repeat border border-[#23483f]"
              style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuD7wZTvAZC5Ja_qOEbbPM44CjlkbtRTc7N1GsOZY4bX6h0yuznwe-DAtt0q59b5BVKrQ7pFcrnyeUTc_0icVuOffnbDFbH5XoiZ7yr5vxV5s3rG-bcK0bsDrb2xTfqHJ9RVyFctxjTeK744kmYxU6JPr6kXH1k5RX5msXgtARREcbNYrUqi3L4IIjjJtWcVLX8oj-mBVTIuA5yvxY_-EpdoHRpgHrtP0crc21Y41NBnd8E37F29MxcApw3JzPPSXs0oEQef76DH7A8")' }}
            ></div>
            <div className="flex flex-col">
              <p className="text-white text-sm font-bold leading-none">Alex Johnson</p>
              <p className="text-[#5a7a72] text-[10px] mt-1 font-medium">Premium Member</p>
            </div>
            <button className="ml-auto text-[#5a7a72] hover:text-white transition-colors p-2 hover:bg-[#1d3632] rounded-lg">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#11221e]">

        {/* Header */}
        <header className="h-16 border-b border-[#23483f] bg-[#11221e]/90 backdrop-blur-sm flex items-center justify-between px-8 shrink-0 z-10 sticky top-0">
          <div className="flex items-center gap-6">
            {/* Location Pill */}
            <div className="flex items-center gap-2 text-white bg-[#23483f] pl-3 pr-2 py-1.5 rounded-lg border border-[#32675a] hover:bg-[#2a554a] transition-colors cursor-pointer group shadow-sm">
              <MapPin size={16} className="text-[#13ecb6] fill-[#13ecb6]" />
              <span className="text-sm font-bold tracking-wide">{selectedHub}</span>
              <ChevronDown size={14} className="text-[#92c9bb] group-hover:text-white transition-colors" />
            </div>
            <div className="h-5 w-px bg-[#23483f]"></div>
            <h2 className="text-lg font-bold text-white tracking-tight">Personalized Flyers</h2>
          </div>
          <div className="flex items-center gap-5">
            <div className="relative w-72 group">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5a7a72] group-focus-within:text-[#13ecb6] transition-colors" />
              <input
                className="w-full bg-[#0d1f1b] border border-[#23483f] rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:ring-1 focus:ring-[#13ecb6] focus:border-[#13ecb6] placeholder:text-[#3a5a52] outline-none transition-all shadow-inner"
                placeholder="Search shops or items..."
                type="text"
              />
            </div>
            <button className="relative text-[#92c9bb] hover:text-white transition-colors p-2 hover:bg-[#23483f] rounded-lg">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-[#11221e]"></span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 flex overflow-hidden">

          {/* Scrollable Feed */}
          <div className="flex-1 overflow-y-auto p-8 relative custom-scrollbar bg-[#11221e]">

            {/* AI Banner */}
            <div className="mb-8 bg-[#1d3632] p-1 rounded-2xl border border-[#23483f] shadow-2xl relative overflow-hidden group">
              {/* Inner Card */}
              <div className="bg-gradient-to-r from-[#1d3632] to-[#162b27] p-6 rounded-[14px] relative border border-[#32675a]/30">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
                <div className="flex items-center gap-5 relative z-10">
                  <div className="w-12 h-12 bg-[#13ecb6] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(19,236,182,0.2)] shrink-0">
                    <Brain size={24} className="text-[#0d1f1b]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-lg font-bold text-white">AI GraphRAG Analysis Complete</h2>
                      <span className="text-[9px] bg-[#23483f] text-[#13ecb6] px-1.5 py-0.5 rounded border border-[#13ecb6]/30 uppercase tracking-wider font-bold">Beta</span>
                    </div>
                    <p className="text-[#92c9bb] text-sm leading-relaxed max-w-2xl font-medium">
                      We've connected your lifestyle context with local services. Found 12 flyers matching your current health goals and shopping patterns.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations Section */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <div className="bg-[#13ecb6] w-6 h-6 rounded-full flex items-center justify-center">
                    <Sparkles size={14} className="text-[#11221e] fill-[#11221e]" />
                  </div>
                  This Week's Recommendations
                </h3>
                <div className="flex gap-2">
                  <button className="w-8 h-8 rounded-full bg-[#1d3632] border border-[#23483f] flex items-center justify-center text-[#92c9bb] hover:text-white hover:bg-[#23483f] hover:border-[#32675a] transition-all">
                    <ArrowLeft size={14} />
                  </button>
                  <button className="w-8 h-8 rounded-full bg-[#1d3632] border border-[#23483f] flex items-center justify-center text-[#92c9bb] hover:text-white hover:bg-[#23483f] hover:border-[#32675a] transition-all">
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {filteredFlyers.filter(f => f.featured).map((flyer) => (
                  <div key={flyer.id} className="flex flex-col bg-[#1d3632] rounded-2xl overflow-hidden border border-[#23483f] hover:border-[#13ecb6] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] group h-full">
                    {/* Image Header */}
                    <div
                      className="h-56 bg-cover bg-center relative"
                      style={{ backgroundImage: `url("${flyer.image}")` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1d3632] via-transparent to-transparent opacity-80"></div>

                      {flyer.aiMatch ? (
                        <>
                          <div className="absolute top-4 left-4 bg-[#13ecb6] text-[#0d1f1b] text-[10px] font-extrabold px-2.5 py-1 rounded-md z-10 flex items-center gap-1.5 shadow-lg shadow-[#13ecb6]/20 tracking-wide uppercase">
                            <Sparkles size={10} className="fill-[#0d1f1b]" /> AI Recommended
                          </div>
                          <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded border border-white/10 shadow-lg">
                            <span className="font-bold text-[#13ecb6] mr-1">Match:</span> {flyer.aiMatch}
                          </div>
                        </>
                      ) : (
                        <div className="absolute top-4 right-4 bg-[#23483f] border border-[#32675a] text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-lg tracking-wide">
                          HOT DEAL
                        </div>
                      )}
                    </div>

                    {/* Card Body */}
                    <div className="p-6 flex flex-col flex-1 relative -mt-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[#5a7a72] text-[10px] font-bold uppercase tracking-widest">{flyer.store}</span>
                        <span className="text-[#92c9bb] text-[10px] font-medium bg-[#23483f] px-2 py-0.5 rounded-full">{flyer.validUntil}</span>
                      </div>
                      <h4 className="text-white font-bold text-xl leading-tight mb-3">{flyer.title}</h4>
                      <p className="text-[#92c9bb] text-xs font-medium leading-relaxed mb-6 line-clamp-2">{flyer.description}</p>

                      {/* Action Button */}
                      {flyer.aiMatch ? (
                        <button className="mt-auto w-full bg-[#13ecb6] hover:bg-[#10cfa0] text-[#0d1f1b] font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_4px_20px_-4px_rgba(19,236,182,0.4)] hover:shadow-[0_8px_25px_-5px_rgba(19,236,182,0.5)] group-hover:translate-y-0.5">
                          <div className="w-5 h-5 rounded-full border-2 border-[#0d1f1b] flex items-center justify-center font-serif font-black italic text-xs">$</div>
                          Earn Points
                        </button>
                      ) : (
                        <button className="mt-auto w-full bg-[#23483f] border border-[#32675a] hover:bg-[#13ecb6] hover:text-[#0d1f1b] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all">
                          <div className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center font-serif font-black italic text-xs">$</div>
                          Earn Points
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Neighborhood Grid */}
            <div>
              <h3 className="text-lg font-bold text-white mb-5">Explore Neighborhood</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {filteredFlyers.filter(f => !f.featured).map((flyer) => (
                  <div key={flyer.id} className="flex flex-col bg-[#1d3632] rounded-xl overflow-hidden border border-[#23483f] hover:border-[#13ecb6]/50 transition-all duration-300 group shadow-lg">
                    <div className="h-40 bg-cover bg-center relative" style={{ backgroundImage: `url("${flyer.image}")` }}>
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-[#5a7a72] uppercase font-bold tracking-wider text-[10px]">{flyer.store}</span>
                        <span className="text-[#13ecb6] font-bold text-[10px] bg-[#13ecb6]/10 px-1.5 py-0.5 rounded">{flyer.distance}</span>
                      </div>
                      <h4 className="text-white font-bold text-sm mb-4 line-clamp-1">{flyer.title}</h4>
                      <button className="mt-auto w-full py-2.5 border border-[#23483f] rounded-lg text-[#92c9bb] text-xs font-bold hover:text-white hover:bg-[#23483f] hover:border-[#32675a] transition-all">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer space */}
            <div className="h-10"></div>
          </div>

          {/* 3. RIGHT MAP PANEL */}
          <div className="w-[320px] xl:w-[400px] h-full relative border-l border-[#23483f] bg-[#162b27] hidden lg:block shrink-0">

            {/* Map Layer */}
            <div
              className="absolute inset-0 bg-cover bg-center z-0"
              style={{
                backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB2gOW1725ijy5UmBEj78roBNIHkQLoyJB-n0PbP-ST7buuIFzhpir2oLUbOac9ey96AoutD4edb0aR8858T3nhRW3FyJrYiaiAlB-rOySyzZTx0LKBxkRqRikxVXTgTO7voQBbRQB3EBGp79pg9Q9fvkitjsNmVsYxMlHXPDDlyPtZDkNydHqYtIbeCUCu27_6cXOnyRAtEfGbQTJLPZwi6FBpIfNgkockbwTbQ-vTPcgmIDES-cScnn7AD6yBRkBtTScBAIRLt5U")',
                filter: 'brightness(0.7) contrast(1.2)'
              }}
            ></div>

            {/* Map Controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
              <button className="w-9 h-9 bg-[#1d3632] text-white rounded-full shadow-xl flex items-center justify-center hover:bg-[#23483f] transition-all border border-[#32675a]">
                <Crosshair size={18} />
              </button>
              <button className="w-9 h-9 bg-[#1d3632] text-white rounded-full shadow-xl flex items-center justify-center hover:bg-[#23483f] transition-all border border-[#32675a]">
                <Plus size={18} />
              </button>
              <button className="w-9 h-9 bg-[#1d3632] text-white rounded-full shadow-xl flex items-center justify-center hover:bg-[#23483f] transition-all border border-[#32675a]">
                <Minus size={18} />
              </button>
            </div>

            {/* Map Pins */}
            <div className="absolute top-[35%] left-[45%] group cursor-pointer z-20">
              <div className="relative flex items-center justify-center">
                <div className="absolute -inset-4 bg-[#13ecb6] rounded-full opacity-20 animate-ping"></div>
                <div className="relative">
                  <MapPin size={40} className="text-[#13ecb6] fill-[#13ecb6] drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]" />
                  <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-black/50 to-transparent rounded-full blur-[2px]"></div>
                </div>

                {/* Tooltip */}
                <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-[#1d3632] border border-[#13ecb6]/50 rounded-lg px-3 py-2 shadow-2xl whitespace-nowrap opacity-100 transition-opacity z-30 flex flex-col items-center">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Sparkles size={10} className="text-[#13ecb6] fill-[#13ecb6]" />
                    <p className="text-[#13ecb6] text-[9px] font-bold uppercase tracking-wider">Top Match</p>
                  </div>
                  <p className="text-white text-xs font-bold">Fresh Greens Market</p>
                  {/* Triangle Pointer */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#1d3632]"></div>
                </div>
              </div>
            </div>

            <div className="absolute top-[55%] left-[65%] group cursor-pointer z-10 opacity-70 hover:opacity-100 transition-opacity">
              <MapPin size={32} className="text-[#5a7a72] fill-[#1d3632] drop-shadow-md" />
            </div>

            <div className="absolute top-[25%] left-[25%] group cursor-pointer z-10 opacity-70 hover:opacity-100 transition-opacity">
              <MapPin size={32} className="text-[#92c9bb] fill-[#92c9bb]/20 drop-shadow-md" />
            </div>

            {/* Bottom Info Card */}
            <div className="absolute bottom-6 left-6 right-6 z-20">
              <div className="bg-[#1d3632]/95 backdrop-blur-xl p-4 rounded-xl border border-[#32675a] shadow-2xl flex items-start gap-3">
                <div className="mt-0.5">
                  <Sparkles size={16} className="text-[#13ecb6] fill-[#13ecb6]" />
                </div>
                <div>
                  <p className="text-white text-xs font-bold mb-1">Personalized Map</p>
                  <p className="text-[#92c9bb] text-[10px] leading-relaxed">
                    Glowing pins indicate shops matching your GraphRAG lifestyle profile.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
