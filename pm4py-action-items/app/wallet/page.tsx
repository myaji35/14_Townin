'use client';

import { useState } from 'react';
import {
    Home,
    Map as MapIcon,
    Wallet as WalletIcon,
    Users,
    ArrowUpRight,
    ArrowDownRight,
    TrendingUp,
    Gift,
    Star,
    Calendar,
    Filter,
    Download,
    Bell,
    LogOut,
    Coins,
    Award,
    Target,
    Zap,
    ShoppingBag,
    Coffee,
    Heart,
    Sparkles,
    Settings
} from 'lucide-react';

export default function WalletPage() {
    const [filterPeriod, setFilterPeriod] = useState('all');

    const transactions = [
        { id: 1, type: 'earn', title: 'Fresh Greens Market - 샐러드 광고 시청', points: 25, date: '2시간 전', category: 'flyer', icon: ShoppingBag },
        { id: 2, type: 'earn', title: '주간 챌린지 완료', points: 100, date: '1일 전', category: 'bonus', icon: Award },
        { id: 3, type: 'earn', title: 'Zen Yoga Studio - 무료 체험 광고', points: 25, date: '2일 전', category: 'flyer', icon: Heart },
        { id: 4, type: 'spend', title: '교환: Star Coffee 기프트 카드', points: 500, date: '3일 전', category: 'reward', icon: Coffee },
        { id: 5, type: 'earn', title: '지역 보안관 활동 보너스', points: 5, date: '3일 전', category: 'bonus', icon: Star },
        { id: 6, type: 'earn', title: 'Burger King 프로모션 확인', points: 25, date: '4일 전', category: 'flyer', icon: ShoppingBag },
        { id: 7, type: 'earn', title: '초대 보너스', points: 200, date: '5일 전', category: 'bonus', icon: Gift },
        { id: 8, type: 'earn', title: 'Local Mart 신선 식품 제안', points: 25, date: '6일 전', category: 'flyer', icon: ShoppingBag },
    ];

    const rewards = [
        { id: 1, name: 'Star Coffee ₩5,000', points: 500, image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400' },
        { id: 2, name: 'Burger King 세트 교환권', points: 800, image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400' },
        { id: 3, name: 'Fresh Greens 할인 쿠폰', points: 300, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400' },
        { id: 4, name: '요가 클래스 1회 이용권', points: 1000, image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400' },
    ];

    const stats = {
        totalEarned: 2850,
        totalSpent: 500,
        currentBalance: 2450,
        thisWeek: 350
    };

    const levelProgress = {
        current: 7,
        next: 8,
        pointsToNext: 550,
        currentPoints: 2450
    };

    return (
        <div className="bg-[#0B0D10] min-h-screen flex font-sans">

            {/* LEFT SIDEBAR */}
            <aside className="w-[280px] bg-[#0E1014] border-r border-[rgba(255,255,255,0.05)] flex flex-col h-screen shrink-0 z-20">
                <div className="p-6 pb-2">
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-8 h-8 rounded-lg bg-[#F5A623] flex items-center justify-center">
                            <div className="w-3 h-3 bg-[#0B0D10] rounded-sm"></div>
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-white text-lg font-bold leading-none">Townin OS</h1>
                            <p className="text-[#6B6F76] text-[10px] font-medium mt-1 tracking-wide">Hyper-local Life</p>
                        </div>
                    </div>

                    {/* Nav Menu */}
                    <nav className="flex flex-col gap-2 mb-8">
                        <a href="/home" className="flex items-center gap-3 px-3 py-3 rounded-lg text-[#B0B3B8] hover:bg-[#1A1D24] hover:text-white transition-colors">
                            <Home size={20} />
                            <span className="text-sm font-medium">홈</span>
                        </a>
                        <a href="/townin-dashboard" className="flex items-center gap-3 px-3 py-3 rounded-lg text-[#B0B3B8] hover:bg-[#1A1D24] hover:text-white transition-colors">
                            <MapIcon size={20} />
                            <span className="text-sm font-medium">디지털 전단지</span>
                        </a>
                        <a href="/wallet" className="flex items-center gap-3 px-3 py-3 rounded-lg bg-[rgba(245,166,35,0.15)] text-[#F5A623] border border-[rgba(245,166,35,0.2)]">
                            <WalletIcon size={20} />
                            <span className="text-sm font-medium">내 지갑</span>
                        </a>
                        <a href="/community" className="flex items-center gap-3 px-3 py-3 rounded-lg text-[#B0B3B8] hover:bg-[#1A1D24] hover:text-white transition-colors">
                            <Users size={20} />
                            <span className="text-sm font-medium">커뮤니티</span>
                        </a>
                    </nav>

                    <div className="px-3 py-2">
                        <p className="text-[#6B6F76] text-xs font-bold uppercase tracking-wider mb-2 px-2">설정</p>
                        <a href="/settings" className="flex items-center gap-3 px-3 py-3 rounded-lg text-[#B0B3B8] hover:bg-[#1A1D24] hover:text-white transition-colors">
                            <Settings size={20} />
                            <span className="text-sm font-medium">프로필 설정</span>
                        </a>
                    </div>
                </div>

                <div className="px-6 flex-1 overflow-y-auto no-scrollbar">
                    {/* Balance Card */}
                    <div className="bg-gradient-to-br from-[#F5A623] to-[#D4861A] rounded-xl p-5 mb-6 relative overflow-hidden shadow-[0_0_30px_rgba(245,166,35,0.3)]">
                        <div className="absolute top-0 right-0 p-3 opacity-10">
                            <Coins size={80} className="text-white" strokeWidth={1} />
                        </div>
                        <h3 className="text-[#0B0D10]/70 text-[10px] font-bold uppercase tracking-wider mb-2">총 보유 포인트</h3>
                        <div className="flex items-baseline gap-1 mb-4">
                            <span className="text-4xl font-bold text-white tracking-tight">{stats.currentBalance.toLocaleString()}</span>
                            <span className="text-lg text-white/90 font-bold">P</span>
                        </div>
                        <div className="flex items-center justify-between text-white/90 text-xs">
                            <span>레벨 {levelProgress.current}</span>
                            <span>레벨 {levelProgress.next}까지 {levelProgress.pointsToNext}P</span>
                        </div>
                        <div className="w-full bg-white/20 h-1.5 rounded-full mt-2 overflow-hidden">
                            <div
                                className="bg-white h-full rounded-full transition-all"
                                style={{ width: `${(levelProgress.currentPoints % 1000) / 10}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Profile */}
                <div className="p-4 border-t border-[rgba(255,255,255,0.05)] bg-[#0E1014]">
                    <a href="/settings" className="flex items-center gap-3 px-2 group">
                        <div
                            className="w-9 h-9 rounded-full bg-cover bg-center border border-[rgba(255,255,255,0.05)] group-hover:border-[#F5A623] transition-colors"
                            style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuD7wZTvAZC5Ja_qOEbbPM44CjlkbtRTc7N1GsOZY4bX6h0yuznwe-DAtt0q59b5BVKrQ7pFcrnyeUTc_0icVuOffnbDFbH5XoiZ7yr5vxV5s3rG-bcK0bsDrb2xTfqHJ9RVyFctxjTeK744kmYxU6JPr6kXH1k5RX5msXgtARREcbNYrUqi3L4IIjjJtWcVLX8oj-mBVTIuA5yvxY_-EpdoHRpgHrtP0crc21Y41NBnd8E37F29MxcApw3JzPPSXs0oEQef76DH7A8")' }}
                        ></div>
                        <div className="flex flex-col">
                            <p className="text-white text-sm font-bold leading-none group-hover:text-[#F5A623] transition-colors">Alex Johnson</p>
                            <p className="text-[#6B6F76] text-[10px] mt-1 font-medium">프리미엄 멤버</p>
                        </div>
                        <button className="ml-auto text-[#6B6F76] hover:text-white transition-colors p-2 hover:bg-[#1A1D24] rounded-lg">
                            <LogOut size={16} />
                        </button>
                    </a>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">

                {/* Header */}
                <header className="h-16 border-b border-[rgba(255,255,255,0.05)] bg-[#0B0D10]/90 backdrop-blur-sm flex items-center justify-between px-8 shrink-0 z-10">
                    <div className="flex items-center gap-6">
                        <h2 className="text-xl font-bold text-white tracking-tight">내 지갑</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-[#14171C] border border-[rgba(255,255,255,0.05)] rounded-lg text-[#B0B3B8] hover:text-white transition-colors">
                            <Download size={16} />
                            <span className="text-sm font-medium">내보내기</span>
                        </button>
                        <button className="relative text-[#B0B3B8] hover:text-white transition-colors p-2 hover:bg-[#14171C] rounded-lg">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-[#F5A623] rounded-full border border-[#0B0D10]"></span>
                        </button>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-[#14171C] rounded-2xl p-6 border border-[rgba(255,255,255,0.05)]">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-[#22C55E]/20 flex items-center justify-center">
                                    <ArrowUpRight size={24} className="text-[#22C55E]" />
                                </div>
                                <div>
                                    <h3 className="text-[#6B6F76] text-xs uppercase tracking-wider font-bold">총 적립 포인트</h3>
                                    <p className="text-white text-2xl font-bold">{stats.totalEarned.toLocaleString()}P</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#14171C] rounded-2xl p-6 border border-[rgba(255,255,255,0.05)]">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-[#EF4444]/20 flex items-center justify-center">
                                    <ArrowDownRight size={24} className="text-[#EF4444]" />
                                </div>
                                <div>
                                    <h3 className="text-[#6B6F76] text-xs uppercase tracking-wider font-bold">총 사용 포인트</h3>
                                    <p className="text-white text-2xl font-bold">{stats.totalSpent.toLocaleString()}P</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#14171C] rounded-2xl p-6 border border-[rgba(255,166,35,0.2)]">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-[#F5A623]/20 flex items-center justify-center">
                                    <TrendingUp size={24} className="text-[#F5A623]" />
                                </div>
                                <div>
                                    <h3 className="text-[#6B6F76] text-xs uppercase tracking-wider font-bold">이번 주 변동</h3>
                                    <p className="text-white text-2xl font-bold">+{stats.thisWeek}P</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Two Column Layout */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                        {/* Transaction History */}
                        <div className="xl:col-span-2">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Calendar size={20} className="text-[#F5A623]" />
                                    거래 내역
                                </h3>
                                <select
                                    value={filterPeriod}
                                    onChange={(e) => setFilterPeriod(e.target.value)}
                                    className="bg-[#14171C] border border-[rgba(255,255,255,0.05)] rounded-lg px-3 py-2 text-sm text-white outline-none cursor-pointer"
                                >
                                    <option value="all">전체 기간</option>
                                    <option value="week">이번 주</option>
                                    <option value="month">이번 달</option>
                                </select>
                            </div>

                            <div className="bg-[#14171C] rounded-2xl border border-[rgba(255,255,255,0.05)] overflow-hidden">
                                {transactions.map((transaction, idx) => {
                                    const TransactionIcon = transaction.icon;
                                    return (
                                        <div
                                            key={transaction.id}
                                            className={`flex items-center gap-4 p-4 hover:bg-[#1A1D24] transition-colors ${idx !== transactions.length - 1 ? 'border-b border-[rgba(255,255,255,0.05)]' : ''}`}
                                        >
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${transaction.type === 'earn' ? 'bg-[#22C55E]/20' : 'bg-[#EF4444]/20'
                                                }`}>
                                                <TransactionIcon size={20} className={transaction.type === 'earn' ? 'text-[#22C55E]' : 'text-[#EF4444]'} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-white text-sm font-medium mb-1">{transaction.title}</p>
                                                <p className="text-[#6B6F76] text-xs">{transaction.date}</p>
                                            </div>
                                            <span className={`text-lg font-bold ${transaction.type === 'earn' ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                                                {transaction.type === 'earn' ? '+' : '-'}{transaction.points}P
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Available Rewards */}
                        <div>
                            <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                                <Gift size={20} className="text-[#F5A623]" />
                                교환 가능 리워드
                            </h3>
                            <div className="space-y-4">
                                {rewards.map((reward) => (
                                    <div key={reward.id} className="bg-[#14171C] rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.05)] hover:border-[rgba(245,166,35,0.2)] transition-all group">
                                        <div
                                            className="h-32 bg-cover bg-center"
                                            style={{ backgroundImage: `url("${reward.image}")` }}
                                        ></div>
                                        <div className="p-4">
                                            <h4 className="text-white font-bold text-sm mb-3">{reward.name}</h4>
                                            <button
                                                className={`w-full py-2.5 rounded-lg font-bold text-sm transition-all ${stats.currentBalance >= reward.points
                                                    ? 'bg-[#F5A623] text-[#0B0D10] hover:bg-[#D4861A]'
                                                    : 'bg-[#1A1D24] text-[#6B6F76] cursor-not-allowed'
                                                    }`}
                                                disabled={stats.currentBalance < reward.points}
                                            >
                                                {reward.points}P로 교환
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    <div className="h-10"></div>
                </div>

            </main>
        </div>
    );
}
