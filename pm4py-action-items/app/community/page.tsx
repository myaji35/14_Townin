'use client';

import { useState } from 'react';
import {
    Home,
    Map as MapIcon,
    Wallet,
    Users,
    Shield,
    TrendingUp,
    MapPin,
    Bell,
    LogOut,
    Award,
    ThumbsUp,
    MessageCircle,
    Share2,
    Camera,
    AlertTriangle,
    CheckCircle2,
    Star,
    Crown,
    Medal,
    Target,
    Eye,
    Zap,
    Trophy
} from 'lucide-react';

export default function CommunityPage() {
    const [activeTab, setActiveTab] = useState('feed');

    const securityGuards = [
        {
            rank: 1,
            name: 'Jung Min-ho',
            district: 'Mapo-gu',
            earnings: 2450,
            adViews: 489,
            avatar: 'https://i.pravatar.cc/150?img=12',
            badge: 'gold'
        },
        {
            rank: 2,
            name: 'Kim Soo-jin',
            district: 'Gangnam-gu',
            earnings: 2180,
            adViews: 436,
            avatar: 'https://i.pravatar.cc/150?img=45',
            badge: 'silver'
        },
        {
            rank: 3,
            name: 'Park Jae-sung',
            district: 'Seongbuk-gu',
            earnings: 1920,
            adViews: 384,
            avatar: 'https://i.pravatar.cc/150?img=33',
            badge: 'bronze'
        },
        {
            rank: 4,
            name: 'Lee Hye-won',
            district: 'Songpa-gu',
            earnings: 1650,
            adViews: 330,
            avatar: 'https://i.pravatar.cc/150?img=26'
        },
        {
            rank: 5,
            name: 'Choi Dong-wook',
            district: 'Mapo-gu',
            earnings: 1420,
            adViews: 284,
            avatar: 'https://i.pravatar.cc/150?img=52'
        },
    ];

    const communityPosts = [
        {
            id: 1,
            author: 'Jung Min-ho',
            role: 'Security Guard',
            avatar: 'https://i.pravatar.cc/150?img=12',
            time: '2 hours ago',
            content: 'New safety cameras installed near Mapo Elementary School. Our neighborhood is getting safer! 🎉',
            image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800',
            likes: 42,
            comments: 8,
            type: 'update'
        },
        {
            id: 2,
            author: 'Kim Soo-jin',
            role: 'Security Guard',
            avatar: 'https://i.pravatar.cc/150?img=45',
            time: '5 hours ago',
            content: 'Just helped an elderly resident find their lost cat. Community spirit at its best! 🐱',
            likes: 67,
            comments: 12,
            type: 'story'
        },
        {
            id: 3,
            author: 'Alex Johnson',
            role: 'Premium Member',
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD7wZTvAZC5Ja_qOEbbPM44CjlkbtRTc7N1GsOZY4bX6h0yuznwe-DAtt0q59b5BVKrQ7pFcrnyeUTc_0icVuOffnbDFbH5XoiZ7yr5vxV5s3rG-bcK0bsDrb2xTfqHJ9RVyFctxjTeK744kmYxU6JPr6kXH1k5RX5msXgtARREcbNYrUqi3L4IIjjJtWcVLX8oj-mBVTIuA5yvxY_-EpdoHRpgHrtP0crc21Y41NBnd8E37F29MxcApw3JzPPSXs0oEQef76DH7A8',
            time: '1 day ago',
            content: 'Shoutout to the local Fresh Greens Market for amazing organic produce! Loving my neighborhood.',
            image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
            likes: 34,
            comments: 5,
            type: 'review'
        },
    ];

    const safetyStats = [
        { label: 'Active Guards', value: '24', change: '+3 this week', icon: Shield, color: '#F5A623' },
        { label: 'Safety Reports', value: '156', change: '8 resolved today', icon: AlertTriangle, color: '#22C55E' },
        { label: 'Community Members', value: '2,847', change: '+127 this month', icon: Users, color: '#3B82F6' },
        { label: 'Safe Areas', value: '93%', change: '+5% improved', icon: CheckCircle2, color: '#A855F7' },
    ];

    const getBadgeIcon = (badge: string) => {
        switch (badge) {
            case 'gold': return <Crown size={20} className="text-[#F5A623]" />;
            case 'silver': return <Medal size={20} className="text-[#B0B3B8]" />;
            case 'bronze': return <Award size={20} className="text-[#CD7F32]" />;
            default: return <Star size={20} className="text-[#6B6F76]" />;
        }
    };

    return (
        <div className="bg-[#0B0D10] min-h-screen flex">

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
                            <span className="text-sm font-medium">Home</span>
                        </a>
                        <a href="/townin-dashboard" className="flex items-center gap-3 px-3 py-3 rounded-lg text-[#B0B3B8] hover:bg-[#1A1D24] hover:text-white transition-colors">
                            <MapIcon size={20} />
                            <span className="text-sm font-medium">Digital Flyers</span>
                        </a>
                        <a href="/wallet" className="flex items-center gap-3 px-3 py-3 rounded-lg text-[#B0B3B8] hover:bg-[#1A1D24] hover:text-white transition-colors">
                            <Wallet size={20} />
                            <span className="text-sm font-medium">My Wallet</span>
                        </a>
                        <a href="/community" className="flex items-center gap-3 px-3 py-3 rounded-lg bg-[rgba(245,166,35,0.15)] text-[#F5A623] border border-[rgba(245,166,35,0.2)]">
                            <Users size={20} />
                            <span className="text-sm font-medium">Community</span>
                        </a>
                    </nav>
                </div>

                <div className="px-6 flex-1 overflow-y-auto no-scrollbar">
                    {/* Top Guard Card */}
                    <div className="bg-gradient-to-br from-[#1A1D24] to-[#14171C] rounded-xl p-5 border border-[rgba(255,255,255,0.05)] mb-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-5">
                            <Shield size={64} className="text-white" strokeWidth={1} />
                        </div>
                        <h3 className="text-[#6B6F76] text-[10px] font-bold uppercase tracking-wider mb-3">Top Guard</h3>
                        <div className="flex items-center gap-3 mb-2">
                            <div
                                className="w-10 h-10 rounded-full bg-cover bg-center border-2 border-[#F5A623]"
                                style={{ backgroundImage: `url("${securityGuards[0].avatar}")` }}
                            ></div>
                            <div>
                                <p className="text-white text-sm font-bold">{securityGuards[0].name}</p>
                                <p className="text-[#6B6F76] text-xs">{securityGuards[0].district}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                            <span className="text-[#F5A623] text-sm font-bold">{securityGuards[0].earnings}P</span>
                            <span className="text-[#B0B3B8] text-xs">{securityGuards[0].adViews} views</span>
                        </div>
                    </div>
                </div>

                {/* Profile */}
                <div className="p-4 border-t border-[rgba(255,255,255,0.05)] bg-[#0E1014]">
                    <div className="flex items-center gap-3 px-2">
                        <div
                            className="w-9 h-9 rounded-full bg-cover bg-center border border-[rgba(255,255,255,0.05)]"
                            style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuD7wZTvAZC5Ja_qOEbbPM44CjlkbtRTc7N1GsOZY4bX6h0yuznwe-DAtt0q59b5BVKrQ7pFcrnyeUTc_0icVuOffnbDFbH5XoiZ7yr5vxV5s3rG-bcK0bsDrb2xTfqHJ9RVyFctxjTeK744kmYxU6JPr6kXH1k5RX5msXgtARREcbNYrUqi3L4IIjjJtWcVLX8oj-mBVTIuA5yvxY_-EpdoHRpgHrtP0crc21Y41NBnd8E37F29MxcApw3JzPPSXs0oEQef76DH7A8")' }}
                        ></div>
                        <div className="flex flex-col">
                            <p className="text-white text-sm font-bold leading-none">Alex Johnson</p>
                            <p className="text-[#6B6F76] text-[10px] mt-1 font-medium">Premium Member</p>
                        </div>
                        <button className="ml-auto text-[#6B6F76] hover:text-white transition-colors p-2 hover:bg-[#1A1D24] rounded-lg">
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">

                {/* Header */}
                <header className="h-16 border-b border-[rgba(255,255,255,0.05)] bg-[#0B0D10]/90 backdrop-blur-sm flex items-center justify-between px-8 shrink-0 z-10">
                    <div className="flex items-center gap-6">
                        <h2 className="text-xl font-bold text-white tracking-tight">Community</h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setActiveTab('feed')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'feed'
                                    ? 'bg-[rgba(245,166,35,0.15)] text-[#F5A623] border border-[rgba(245,166,35,0.2)]'
                                    : 'bg-[#14171C] text-[#B0B3B8] hover:text-white'
                                    }`}
                            >
                                Feed
                            </button>
                            <button
                                onClick={() => setActiveTab('leaderboard')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'leaderboard'
                                    ? 'bg-[rgba(245,166,35,0.15)] text-[#F5A623] border border-[rgba(245,166,35,0.2)]'
                                    : 'bg-[#14171C] text-[#B0B3B8] hover:text-white'
                                    }`}
                            >
                                Leaderboard
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="relative text-[#B0B3B8] hover:text-white transition-colors p-2 hover:bg-[#14171C] rounded-lg">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-[#F5A623] rounded-full border border-[#0B0D10]"></span>
                        </button>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">

                    {/* Safety Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                        {safetyStats.map((stat, idx) => (
                            <div key={idx} className="bg-[#14171C] rounded-2xl p-6 border border-[rgba(255,255,255,0.05)] hover:border-[rgba(245,166,35,0.2)] transition-all">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${stat.color}20` }}>
                                        <stat.icon size={24} style={{ color: stat.color }} />
                                    </div>
                                    <span className="text-[10px] text-[#22C55E] bg-[#22C55E]/10 px-2 py-1 rounded-full font-medium">{stat.change}</span>
                                </div>
                                <h3 className="text-[#6B6F76] text-xs uppercase tracking-wider font-bold mb-2">{stat.label}</h3>
                                <p className="text-white text-3xl font-bold tracking-tight">{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    {activeTab === 'feed' ? (
                        /* Community Feed */
                        <div className="max-w-3xl mx-auto">
                            <div className="space-y-6">
                                {communityPosts.map((post) => (
                                    <div key={post.id} className="bg-[#14171C] rounded-2xl border border-[rgba(255,255,255,0.05)] overflow-hidden hover:border-[rgba(245,166,35,0.1)] transition-all">
                                        {/* Post Header */}
                                        <div className="p-6 pb-4">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div
                                                    className="w-12 h-12 rounded-full bg-cover bg-center border border-[rgba(255,255,255,0.05)]"
                                                    style={{ backgroundImage: `url("${post.avatar}")` }}
                                                ></div>
                                                <div className="flex-1">
                                                    <h4 className="text-white font-bold text-sm">{post.author}</h4>
                                                    <p className="text-[#6B6F76] text-xs">{post.role} · {post.time}</p>
                                                </div>
                                                <button className="text-[#6B6F76] hover:text-white p-2">
                                                    <Share2 size={18} />
                                                </button>
                                            </div>
                                            <p className="text-white text-sm leading-relaxed mb-4">{post.content}</p>
                                        </div>

                                        {/* Post Image */}
                                        {post.image && (
                                            <div
                                                className="h-64 bg-cover bg-center"
                                                style={{ backgroundImage: `url("${post.image}")` }}
                                            ></div>
                                        )}

                                        {/* Post Actions */}
                                        <div className="p-4 border-t border-[rgba(255,255,255,0.05)] flex items-center gap-6">
                                            <button className="flex items-center gap-2 text-[#B0B3B8] hover:text-[#F5A623] transition-colors">
                                                <ThumbsUp size={18} />
                                                <span className="text-sm font-medium">{post.likes}</span>
                                            </button>
                                            <button className="flex items-center gap-2 text-[#B0B3B8] hover:text-white transition-colors">
                                                <MessageCircle size={18} />
                                                <span className="text-sm font-medium">{post.comments}</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* Security Guard Leaderboard */
                        <div className="max-w-4xl mx-auto">
                            <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                                <Trophy size={20} className="text-[#F5A623]" />
                                Security Guard Rankings
                            </h3>
                            <div className="bg-[#14171C] rounded-2xl border border-[rgba(255,255,255,0.05)] overflow-hidden">
                                {securityGuards.map((guard, idx) => (
                                    <div
                                        key={guard.rank}
                                        className={`flex items-center gap-4 p-6 hover:bg-[#1A1D24] transition-colors ${idx !== securityGuards.length - 1 ? 'border-b border-[rgba(255,255,255,0.05)]' : ''}`}
                                    >
                                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#1A1D24] font-bold text-xl">
                                            {guard.badge ? getBadgeIcon(guard.badge) : <span className="text-[#6B6F76]">{guard.rank}</span>}
                                        </div>
                                        <div
                                            className="w-14 h-14 rounded-full bg-cover bg-center border-2"
                                            style={{
                                                backgroundImage: `url("${guard.avatar}")`,
                                                borderColor: guard.badge === 'gold' ? '#F5A623' : guard.badge === 'silver' ? '#B0B3B8' : guard.badge === 'bronze' ? '#CD7F32' : 'rgba(255,255,255,0.05)'
                                            }}
                                        ></div>
                                        <div className="flex-1">
                                            <h4 className="text-white font-bold text-base">{guard.name}</h4>
                                            <p className="text-[#6B6F76] text-sm flex items-center gap-1">
                                                <MapPin size={14} />
                                                {guard.district}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[#F5A623] font-bold text-xl">{guard.earnings}P</p>
                                            <p className="text-[#6B6F76] text-xs flex items-center gap-1 justify-end">
                                                <Eye size={12} />
                                                {guard.adViews} views
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="h-10"></div>
                </div>

            </main>
        </div>
    );
}
