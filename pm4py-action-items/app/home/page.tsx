'use client';

import { useState } from 'react';
import {
    Home as HomeIcon,
    Map as MapIcon,
    Wallet,
    Users,
    MapPin,
    Bell,
    TrendingUp,
    Activity,
    Star,
    ArrowRight,
    Sparkles,
    Coins,
    Building2,
    ChevronDown,
    LogOut,
    Calendar,
    Zap,
    Target,
    Award
} from 'lucide-react';

export default function HomePage() {
    const [selectedHub, setSelectedHub] = useState('home');

    const userHubs = [
        { id: 'home', name: 'Home', location: 'Mapo-gu, Seoul', icon: HomeIcon, color: '#F5A623' },
        { id: 'work', name: 'Work', location: 'Gangnam-gu, Seoul', icon: Building2, color: '#B0B3B8' },
        { id: 'family', name: 'Family', location: 'Seongbuk-gu, Seoul', icon: Users, color: '#6B6F76' }
    ];

    const stats = [
        { label: 'Total Points', value: '2,450', change: '+350 this week', icon: Coins, color: '#F5A623' },
        { label: 'Active Flyers', value: '12', change: '3 new today', icon: Sparkles, color: '#22C55E' },
        { label: 'Hubs Managed', value: '3', change: 'All active', icon: MapPin, color: '#3B82F6' },
        { label: 'Level', value: '7', change: 'Premium', icon: Award, color: '#A855F7' }
    ];

    const recentActivity = [
        { action: 'Earned points from Fresh Greens Market', time: '2 hours ago', points: '+25' },
        { action: 'New flyer matched your health goals', time: '5 hours ago', points: '' },
        { action: 'Completed weekly challenge', time: '1 day ago', points: '+100' },
        { action: 'Updated Work hub location', time: '2 days ago', points: '' }
    ];

    const quickActions = [
        { label: 'View Flyers', icon: MapIcon, href: '/townin-dashboard' },
        { label: 'My Wallet', icon: Wallet, href: '/wallet' },
        { label: 'Community', icon: Users, href: '/community' },
        { label: 'Settings', icon: Target, href: '/settings' }
    ];

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
                        <a href="/home" className="flex items-center gap-3 px-3 py-3 rounded-lg bg-[rgba(245,166,35,0.15)] text-[#F5A623] border border-[rgba(245,166,35,0.2)]">
                            <HomeIcon size={20} />
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
                        <a href="/community" className="flex items-center gap-3 px-3 py-3 rounded-lg text-[#B0B3B8] hover:bg-[#1A1D24] hover:text-white transition-colors">
                            <Users size={20} />
                            <span className="text-sm font-medium">Community</span>
                        </a>
                    </nav>
                </div>

                <div className="px-6 flex-1 overflow-y-auto no-scrollbar">
                    {/* Quick Stats Card */}
                    <div className="bg-gradient-to-br from-[#1A1D24] to-[#14171C] rounded-xl p-5 border border-[rgba(255,255,255,0.05)] mb-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-5">
                            <Zap size={64} className="text-white" strokeWidth={1} />
                        </div>
                        <h3 className="text-[#6B6F76] text-[10px] font-bold uppercase tracking-wider mb-2">This Week</h3>
                        <div className="flex items-baseline gap-1 mb-2">
                            <span className="text-3xl font-bold text-white tracking-tight">350</span>
                            <span className="text-sm text-[#F5A623] font-bold">P</span>
                        </div>
                        <p className="text-[10px] text-[#B0B3B8] flex items-center gap-1 font-medium">
                            <TrendingUp size={12} className="text-[#22C55E]" />
                            <span>+28% from last week</span>
                        </p>
                    </div>
                </div>

                {/* Profile */}
                <div className="p-4 border-t border-[rgba(255,255,255,0.05)] bg-[#0E1014]">
                    <div className="flex items-center gap-3 px-2">
                        <div
                            className="w-9 h-9 rounded-full bg-cover bg-center bg-no-repeat border border-[rgba(255,255,255,0.05)]"
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
                <header className="h-16 border-b border-[rgba(255,255,255,0.05)] bg-[#0B0D10]/90 backdrop-blur-sm flex items-center justify-between px-8 shrink-0 z-10 sticky top-0">
                    <div className="flex items-center gap-6">
                        <h2 className="text-xl font-bold text-white tracking-tight">Welcome Back, Alex!</h2>
                    </div>
                    <div className="flex items-center gap-5">
                        <div className="flex items-center gap-2 text-[#B0B3B8] bg-[#14171C] px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.05)]">
                            <Calendar size={16} />
                            <span className="text-sm font-medium">Dec 29, 2025</span>
                        </div>
                        <button className="relative text-[#B0B3B8] hover:text-white transition-colors p-2 hover:bg-[#14171C] rounded-lg">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-[#F5A623] rounded-full border border-[#0B0D10]"></span>
                        </button>
                    </div>
                </header>

                {/* Content Body */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="bg-[#14171C] rounded-2xl p-6 border border-[rgba(255,255,255,0.05)] hover:border-[rgba(245,166,35,0.2)] transition-all group">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center`} style={{ backgroundColor: `${stat.color}20` }}>
                                        <stat.icon size={24} style={{ color: stat.color }} />
                                    </div>
                                    <span className="text-[10px] text-[#22C55E] bg-[#22C55E]/10 px-2 py-1 rounded-full font-medium">{stat.change}</span>
                                </div>
                                <h3 className="text-[#6B6F76] text-xs uppercase tracking-wider font-bold mb-2">{stat.label}</h3>
                                <p className="text-white text-3xl font-bold tracking-tight">{stat.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* 3-Hub Management */}
                    <div className="mb-8">
                        <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                            <MapPin size={20} className="text-[#F5A623]" />
                            Your 3 Hubs
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {userHubs.map((hub) => {
                                const HubIcon = hub.icon;
                                const isSelected = selectedHub === hub.id;
                                return (
                                    <div
                                        key={hub.id}
                                        onClick={() => setSelectedHub(hub.id)}
                                        className={`bg-[#14171C] rounded-2xl p-6 border cursor-pointer transition-all ${isSelected ? 'border-[#F5A623] shadow-[0_0_20px_rgba(245,166,35,0.2)]' : 'border-[rgba(255,255,255,0.05)] hover:border-[rgba(245,166,35,0.1)]'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center`} style={{ backgroundColor: `${hub.color}20` }}>
                                                <HubIcon size={20} style={{ color: hub.color }} />
                                            </div>
                                            <div>
                                                <h4 className="text-white font-bold text-sm">{hub.name}</h4>
                                                <p className="text-[#6B6F76] text-xs">{hub.location}</p>
                                            </div>
                                        </div>
                                        <button className="w-full py-2 border border-[rgba(255,255,255,0.05)] rounded-lg text-[#B0B3B8] text-xs font-medium hover:bg-[#1A1D24] hover:text-white transition-all">
                                            View Details
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Recent Activity & Quick Actions */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                        {/* Recent Activity */}
                        <div className="bg-[#14171C] rounded-2xl p-6 border border-[rgba(255,255,255,0.05)]">
                            <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                                <Activity size={20} className="text-[#F5A623]" />
                                Recent Activity
                            </h3>
                            <div className="space-y-4">
                                {recentActivity.map((activity, idx) => (
                                    <div key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#1A1D24] transition-colors">
                                        <div className="w-2 h-2 rounded-full bg-[#F5A623] mt-2"></div>
                                        <div className="flex-1">
                                            <p className="text-white text-sm font-medium mb-1">{activity.action}</p>
                                            <p className="text-[#6B6F76] text-xs">{activity.time}</p>
                                        </div>
                                        {activity.points && (
                                            <span className="text-[#22C55E] text-sm font-bold">{activity.points}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-[#14171C] rounded-2xl p-6 border border-[rgba(255,255,255,0.05)]">
                            <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                                <Zap size={20} className="text-[#F5A623]" />
                                Quick Actions
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                {quickActions.map((action, idx) => {
                                    const ActionIcon = action.icon;
                                    return (
                                        <a
                                            key={idx}
                                            href={action.href}
                                            className="flex flex-col items-center justify-center p-6 rounded-xl border border-[rgba(255,255,255,0.05)] hover:border-[#F5A623] hover:bg-[#1A1D24] transition-all group"
                                        >
                                            <ActionIcon size={28} className="text-[#F5A623] mb-3" />
                                            <span className="text-white text-sm font-medium">{action.label}</span>
                                        </a>
                                    );
                                })}
                            </div>
                        </div>

                    </div>

                    {/* Footer space */}
                    <div className="h-10"></div>
                </div>

            </main>
        </div>
    );
}
