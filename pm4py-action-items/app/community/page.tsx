'use client';

import { useState } from 'react';
import {
    Home,
    Map as MapIcon,
    Wallet,
    Users,
    Search,
    PenSquare,
    MessageSquare,
    Heart,
    Share2,
    Calendar,
    Users2,
    Trophy,
    Shield,
    Siren,
    MoreHorizontal,
    Bell,
    LogOut,
    ThumbsUp,
    MapPin,
    AlertTriangle,
    CheckCircle2,
    Filter,
    Settings
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from "framer-motion";

export default function CommunityPage() {
    const [selectedTab, setSelectedTab] = useState('popular');

    const posts = [
        {
            id: 1,
            author: "김지민",
            role: "지역 보안관",
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
            time: "2시간 전",
            content: "어제 서교동 골목길 순찰 중에 가로등 고장 신고했습니다. 구청에서 바로 수리해주신다고 하네요! 모두 안전한 귀갓길 되세요. 🔦",
            images: ["https://images.unsplash.com/photo-1542662565-7e4b66bae529?w=800"],
            likes: 45,
            comments: 12,
            type: "report",
            location: "Seogyo-dong"
        },
        {
            id: 2,
            author: "이준호",
            role: "주민",
            avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop",
            time: "4시간 전",
            content: "주말에 홍대입구역 근처 플리마켓 열린대요! 셀러로 참여하시는 분 계신가요? 구경 가보려고 하는데 추천해주세요!",
            likes: 28,
            comments: 8,
            type: "event",
            location: "Hongdae Station"
        },
        {
            id: 3,
            author: "박서연",
            role: "상점 주인",
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
            time: "5시간 전",
            content: "Fresh Greens 마켓 신선한 샐러드 재료 입고되었습니다~ 🥗 Townin 회원분들께는 포인트 추가 적립해드려요!",
            likes: 56,
            comments: 4,
            type: "promotion",
            location: "Fresh Greens Market"
        }
    ];

    const guardians = [
        { id: 1, name: "강현우", points: 1250, badge: "Gold", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" },
        { id: 2, name: "김지민", points: 980, badge: "Silver", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" },
        { id: 3, name: "최민수", points: 850, badge: "Bronze", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100" },
    ];

    return (
        <div className="bg-[#0B0D10] min-h-screen flex font-sans">

            {/* LEFT SIDEBAR */}
            <aside className="w-[280px] bg-[#0E1014] border-r border-[rgba(255,255,255,0.05)] flex flex-col h-screen shrink-0 z-20">
                <div className="p-6 pb-2">
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-8 h-8 rounded-lg bg-[#5D5FEF] flex items-center justify-center">
                            <span className="text-white text-lg font-bold">👥</span>
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
                        <a href="/wallet" className="flex items-center gap-3 px-3 py-3 rounded-lg text-[#B0B3B8] hover:bg-[#1A1D24] hover:text-white transition-colors">
                            <Wallet size={20} />
                            <span className="text-sm font-medium">내 지갑</span>
                        </a>
                        <a href="/community" className="flex items-center gap-3 px-3 py-3 rounded-lg bg-[rgba(93,95,239,0.15)] text-[#5D5FEF] border border-[rgba(93,95,239,0.2)]">
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

                <div className="p-4 border-t border-[rgba(255,255,255,0.05)] bg-[#0E1014] mt-auto">
                    <a href="/settings" className="flex items-center gap-3 px-2 group">
                        <div
                            className="w-9 h-9 rounded-full bg-cover bg-center border border-[rgba(255,255,255,0.05)] group-hover:border-[#5D5FEF] transition-colors"
                            style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuD7wZTvAZC5Ja_qOEbbPM44CjlkbtRTc7N1GsOZY4bX6h0yuznwe-DAtt0q59b5BVKrQ7pFcrnyeUTc_0icVuOffnbDFbH5XoiZ7yr5vxV5s3rG-bcK0bsDrb2xTfqHJ9RVyFctxjTeK744kmYxU6JPr6kXH1k5RX5msXgtARREcbNYrUqi3L4IIjjJtWcVLX8oj-mBVTIuA5yvxY_-EpdoHRpgHrtP0crc21Y41NBnd8E37F29MxcApw3JzPPSXs0oEQef76DH7A8")' }}
                        ></div>
                        <div className="flex flex-col">
                            <p className="text-white text-sm font-bold leading-none group-hover:text-[#5D5FEF] transition-colors">Alex Johnson</p>
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
                        <h2 className="text-xl font-bold text-white tracking-tight">커뮤니티</h2>
                        <div className="flex gap-2 bg-[#14171C] p-1 rounded-lg border border-[rgba(255,255,255,0.05)]">
                            <button
                                onClick={() => setSelectedTab('popular')}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${selectedTab === 'popular' ? 'bg-[#5D5FEF] text-white shadow-lg' : 'text-[#6B6F76] hover:text-white'}`}
                            >
                                인기 게시글
                            </button>
                            <button
                                onClick={() => setSelectedTab('recent')}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${selectedTab === 'recent' ? 'bg-[#5D5FEF] text-white shadow-lg' : 'text-[#6B6F76] hover:text-white'}`}
                            >
                                최신순
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative w-64">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6F76]" />
                            <input
                                type="text"
                                placeholder="게시글 검색..."
                                className="w-full bg-[#14171C] border border-[rgba(255,255,255,0.05)] rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#5D5FEF] placeholder:text-[#383B42]"
                            />
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-[#5D5FEF] text-white rounded-lg font-bold hover:bg-[#4C4ED0] transition-colors shadow-[0_0_20px_rgba(93,95,239,0.3)]">
                            <PenSquare size={16} />
                            <span>글쓰기</span>
                        </button>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar flex">

                    {/* Feed Section */}
                    <div className="flex-1 p-8">
                        <div className="max-w-3xl mx-auto space-y-6">
                            {posts.map(post => (
                                <motion.div
                                    key={post.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-[#14171C] rounded-2xl border border-[rgba(255,255,255,0.05)] p-6 hover:border-[rgba(93,95,239,0.3)] transition-all"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-10 h-10 rounded-full bg-cover bg-center border border-[rgba(255,255,255,0.1)]"
                                                style={{ backgroundImage: `url("${post.avatar}")` }}
                                            ></div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-white font-bold">{post.author}</span>
                                                    <Badge variant="outline" className={`text-[10px] px-2 py-0 h-5 ${post.role === "지역 보안관" ? "text-[#5D5FEF] border-[#5D5FEF]/30 bg-[#5D5FEF]/10" : "text-[#6B6F76] border-[#6B6F76]/30"
                                                        }`}>
                                                        {post.role}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-[#6B6F76] mt-0.5">
                                                    <span>{post.time}</span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">
                                                        <MapPin size={10} />
                                                        {post.location}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <button className="text-[#6B6F76] hover:text-white">
                                            <MoreHorizontal size={20} />
                                        </button>
                                    </div>

                                    <p className="text-white mb-4 leading-relaxed whitespace-pre-line">{post.content}</p>

                                    {post.images && post.images.length > 0 && (
                                        <div className="mb-4 rounded-xl overflow-hidden">
                                            <img src={post.images[0]} alt="Post content" className="w-full object-cover max-h-96" />
                                        </div>
                                    )}

                                    <div className="flex items-center gap-6 pt-4 border-t border-[rgba(255,255,255,0.05)]">
                                        <button className="flex items-center gap-2 text-[#6B6F76] hover:text-[#5D5FEF] transition-colors group">
                                            <Heart size={18} className="group-hover:scale-110 transition-transform" />
                                            <span className="text-sm">{post.likes}</span>
                                        </button>
                                        <button className="flex items-center gap-2 text-[#6B6F76] hover:text-[#5D5FEF] transition-colors group">
                                            <MessageSquare size={18} className="group-hover:scale-110 transition-transform" />
                                            <span className="text-sm">{post.comments}</span>
                                        </button>
                                        <button className="flex items-center gap-2 text-[#6B6F76] hover:text-[#5D5FEF] transition-colors ml-auto">
                                            <Share2 size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Right Info Section (Leaderboard & Stats) */}
                    <div className="w-[340px] border-l border-[rgba(255,255,255,0.05)] bg-[#0E1014] p-6 hidden xl:block overflow-y-auto">

                        {/* Guardian Leaderboard */}
                        <div className="mb-8">
                            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                <Trophy size={18} className="text-[#FFD700]" />
                                보안관 랭킹
                            </h3>
                            <div className="bg-[#14171C] rounded-xl border border-[rgba(255,255,255,0.05)] p-4">
                                <p className="text-[#6B6F76] text-xs mb-3">이번 달 활약한 보안관</p>
                                <div className="space-y-4">
                                    {guardians.map((guardian, idx) => (
                                        <div key={guardian.id} className="flex items-center gap-3">
                                            <span className={`text-sm font-bold w-4 text-center ${idx === 0 ? "text-[#FFD700]" : idx === 1 ? "text-[#C0C0C0]" : "text-[#CD7F32]"
                                                }`}>{idx + 1}</span>
                                            <div
                                                className="w-8 h-8 rounded-full bg-cover bg-center"
                                                style={{ backgroundImage: `url("${guardian.avatar}")` }}
                                            ></div>
                                            <div className="flex-1">
                                                <p className="text-white text-sm font-bold">{guardian.name}</p>
                                                <p className="text-[#6B6F76] text-[10px]">{guardian.points} 점</p>
                                            </div>
                                            {idx === 0 && <span className="text-lg">👑</span>}
                                        </div>
                                    ))}
                                </div>
                                <button className="w-full mt-4 py-2 text-xs text-[#5D5FEF] font-bold hover:bg-[#5D5FEF]/10 rounded-lg transition-colors">
                                    전체 순위 보기
                                </button>
                            </div>
                        </div>

                        {/* Safety Status */}
                        <div>
                            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                                <Shield size={18} className="text-[#22C55E]" />
                                지역 안전 현황
                            </h3>
                            <div className="bg-[#14171C] rounded-xl border border-[rgba(255,255,255,0.05)] p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E] animate-pulse"></div>
                                        <span className="text-white text-sm font-bold">안전함</span>
                                    </div>
                                    <span className="text-[#6B6F76] text-xs">Mapo-gu</span>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-[#B0B3B8]">최근 순찰 활동</span>
                                        <span className="text-white font-medium">12분 전</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-[#B0B3B8]">신고 처리율</span>
                                        <span className="text-[#22C55E] font-medium">98%</span>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.05)]">
                                    <div className="flex items-center gap-3 p-2 rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/20">
                                        <CheckCircle2 size={16} className="text-[#22C55E]" />
                                        <p className="text-[#22C55E] text-xs font-medium">현재 특이사항 없습니다.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>

            </main>
        </div>
    );
}
