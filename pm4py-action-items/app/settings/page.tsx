'use client';

import { useState } from 'react';
import {
    Home,
    Map as MapIcon,
    Wallet,
    Users,
    Settings,
    User,
    MapPin,
    Calendar,
    Briefcase,
    Save,
    Camera,
    LogOut,
    Bell,
    Check,
    Plus,
    Trash2,
    Heart
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface FamilyMember {
    id: number;
    nickname: string;
    relationship: string;
    birthYear: string;
    gender: string;
}

export default function SettingsPage() {
    const [isLoading, setIsLoading] = useState(false);

    // User Profile Data State
    const [profile, setProfile] = useState({
        name: 'Alex Johnson',
        role: 'Premium Member',
        email: 'alex.j@townin.com',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD7wZTvAZC5Ja_qOEbbPM44CjlkbtRTc7N1GsOZY4bX6h0yuznwe-DAtt0q59b5BVKrQ7pFcrnyeUTc_0icVuOffnbDFbH5XoiZ7yr5vxV5s3rG-bcK0bsDrb2xTfqHJ9RVyFctxjTeK744kmYxU6JPr6kXH1k5RX5msXgtARREcbNYrUqi3L4IIjjJtWcVLX8oj-mBVTIuA5yvxY_-EpdoHRpgHrtP0crc21Y41NBnd8E37F29MxcApw3JzPPSXs0oEQef76DH7A8',
        district: 'Mapo-gu',
        neighborhood: 'Seogyo-dong',
        birthYear: '1995',
        gender: 'male',
        interests: ['Food & Dining', 'Health', 'Tech']
    });

    const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([
        { id: 1, nickname: '첫째', relationship: 'child', birthYear: '2018', gender: 'female' }
    ]);

    const [newMember, setNewMember] = useState<Omit<FamilyMember, 'id'>>({
        nickname: '',
        relationship: 'spouse',
        birthYear: '',
        gender: 'male'
    });

    const [isAddingFamily, setIsAddingFamily] = useState(false);

    const districts = ['Mapo-gu', 'Gangnam-gu', 'Seongbuk-gu', 'Songpa-gu', 'Yongsan-gu'];
    const interestsList = ['Food & Dining', 'Retail Shopping', 'Health', 'Life Services', 'Tech', 'Arts', 'Education', 'Travel'];

    const handleSave = () => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            alert('설정이 성공적으로 저장되었습니다!');
        }, 1000);
    };

    const toggleInterest = (interest: string) => {
        if (profile.interests.includes(interest)) {
            setProfile({ ...profile, interests: profile.interests.filter(i => i !== interest) });
        } else {
            setProfile({ ...profile, interests: [...profile.interests, interest] });
        }
    };

    const addFamilyMember = () => {
        if (!newMember.nickname || !newMember.birthYear) {
            alert('별칭과 출생년도를 입력해주세요.');
            return;
        }
        setFamilyMembers([...familyMembers, { ...newMember, id: Date.now() }]);
        setNewMember({ nickname: '', relationship: 'spouse', birthYear: '', gender: 'male' });
        setIsAddingFamily(false);
    };

    const removeFamilyMember = (id: number) => {
        setFamilyMembers(familyMembers.filter(m => m.id !== id));
    };

    const relationshipOptions = [
        { value: 'spouse', label: '배우자' },
        { value: 'child', label: '자녀' },
        { value: 'parent', label: '부모님' },
        { value: 'sibling', label: '형제/자매' },
        { value: 'other', label: '기타' }
    ];

    return (
        <div className="bg-[#0B0D10] min-h-screen flex text-white font-sans">

            {/* LEFT SIDEBAR */}
            <aside className="w-[280px] bg-[#0E1014] border-r border-[rgba(255,255,255,0.05)] flex flex-col h-screen shrink-0 z-20">
                <div className="p-6 pb-2">
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-8 h-8 rounded-lg bg-[#13ecb6] flex items-center justify-center">
                            <span className="text-[#0A1612] text-xl font-bold">🏘️</span>
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
                        <a href="/community" className="flex items-center gap-3 px-3 py-3 rounded-lg text-[#B0B3B8] hover:bg-[#1A1D24] hover:text-white transition-colors">
                            <Users size={20} />
                            <span className="text-sm font-medium">커뮤니티</span>
                        </a>
                    </nav>

                    <div className="px-3 py-2">
                        <p className="text-[#6B6F76] text-xs font-bold uppercase tracking-wider mb-2 px-2">설정</p>
                        <a href="/settings" className="flex items-center gap-3 px-3 py-3 rounded-lg bg-[#1A1D24] text-white border border-[rgba(255,255,255,0.1)]">
                            <Settings size={20} className="text-[#13ecb6]" />
                            <span className="text-sm font-medium">프로필 설정</span>
                        </a>
                    </div>
                </div>

                {/* Profile Link (Bottom) */}
                <div className="mt-auto p-4 border-t border-[rgba(255,255,255,0.05)] bg-[#0E1014]">
                    <div className="flex items-center gap-3 px-2">
                        <div
                            className="w-9 h-9 rounded-full bg-cover bg-center border border-[rgba(255,255,255,0.1)]"
                            style={{ backgroundImage: `url("${profile.avatar}")` }}
                        ></div>
                        <div className="flex flex-col">
                            <p className="text-white text-sm font-bold leading-none">{profile.name}</p>
                            <p className="text-[#6B6F76] text-[10px] mt-1 font-medium">{profile.role}</p>
                        </div>
                        <button className="ml-auto text-[#6B6F76] hover:text-white transition-colors p-2 hover:bg-[#1A1D24] rounded-lg">
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#0A1612]">
                {/* Header */}
                <header className="h-16 border-b border-[rgba(255,255,255,0.05)] bg-[#0B0D10]/90 backdrop-blur-sm flex items-center justify-between px-8 shrink-0 z-10">
                    <h2 className="text-xl font-bold text-white tracking-tight">프로필 설정</h2>
                    <div className="flex items-center gap-3">
                        <button className="p-2 text-[#B0B3B8] hover:text-white hover:bg-[#1A1D24] rounded-full transition-colors relative">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-[#F5A623] rounded-full"></span>
                        </button>
                    </div>
                </header>

                {/* Settings Content */}
                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                    <div className="max-w-4xl mx-auto space-y-8">

                        {/* 1. Basic Information */}
                        <section>
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <User size={20} className="text-[#13ecb6]" />
                                기본 정보
                            </h3>
                            <div className="bg-[#14171C] rounded-2xl border border-[rgba(255,255,255,0.05)] p-6 flex items-start gap-8">
                                <div className="relative group cursor-pointer">
                                    <div
                                        className="w-24 h-24 rounded-full bg-cover bg-center border-2 border-[rgba(255,255,255,0.1)] group-hover:border-[#13ecb6] transition-colors"
                                        style={{ backgroundImage: `url("${profile.avatar}")` }}
                                    ></div>
                                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera size={24} className="text-white" />
                                    </div>
                                </div>
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-[#6B6F76] uppercase tracking-wider">닉네임</label>
                                        <input
                                            type="text"
                                            value={profile.name}
                                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                            className="w-full bg-[#1A1D24] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#13ecb6] transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-[#6B6F76] uppercase tracking-wider">이메일 주소</label>
                                        <input
                                            type="email"
                                            value={profile.email}
                                            disabled
                                            className="w-full bg-[#1A1D24]/50 border border-[rgba(255,255,255,0.05)] rounded-lg px-4 py-2.5 text-[#6B6F76] cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 2. Demographics & Location */}
                        <section>
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <MapPin size={20} className="text-[#13ecb6]" />
                                지역 및 인구 통계
                            </h3>
                            <div className="bg-[#14171C] rounded-2xl border border-[rgba(255,255,255,0.05)] p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-[#6B6F76] uppercase tracking-wider">자치구 (Gu)</label>
                                        <select
                                            value={profile.district}
                                            onChange={(e) => setProfile({ ...profile, district: e.target.value })}
                                            className="w-full bg-[#1A1D24] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#13ecb6]"
                                        >
                                            {districts.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-[#6B6F76] uppercase tracking-wider">동네 (Dong)</label>
                                        <input
                                            type="text"
                                            value={profile.neighborhood}
                                            onChange={(e) => setProfile({ ...profile, neighborhood: e.target.value })}
                                            className="w-full bg-[#1A1D24] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#13ecb6]"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-[#6B6F76] uppercase tracking-wider">출생년도</label>
                                        <div className="relative">
                                            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6F76]" />
                                            <input
                                                type="number"
                                                value={profile.birthYear}
                                                onChange={(e) => setProfile({ ...profile, birthYear: e.target.value })}
                                                className="w-full bg-[#1A1D24] border border-[rgba(255,255,255,0.1)] rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-[#13ecb6]"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-[#6B6F76] uppercase tracking-wider">성별</label>
                                        <div className="flex gap-4">
                                            {['Male', 'Female', 'Other'].map((g) => (
                                                <label key={g} className="flex items-center gap-2 cursor-pointer group">
                                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${profile.gender.toLowerCase() === g.toLowerCase() ? 'border-[#13ecb6] bg-[#13ecb6]/20' : 'border-[#6B6F76] bg-transparent'}`}>
                                                        {profile.gender.toLowerCase() === g.toLowerCase() && <div className="w-2.5 h-2.5 rounded-full bg-[#13ecb6]"></div>}
                                                    </div>
                                                    <input
                                                        type="radio"
                                                        name="gender"
                                                        value={g.toLowerCase()}
                                                        checked={profile.gender.toLowerCase() === g.toLowerCase()}
                                                        onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                                                        className="hidden"
                                                    />
                                                    <span className={`text-sm font-medium transition-colors ${profile.gender.toLowerCase() === g.toLowerCase() ? 'text-white' : 'text-[#6B6F76] group-hover:text-white'}`}>{g === 'Male' ? '남성' : g === 'Female' ? '여성' : '기타'}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 4. Family Members (New Feature) */}
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Heart size={20} className="text-[#13ecb6]" />
                                    가족 구성원 관리
                                </h3>
                                <button
                                    onClick={() => setIsAddingFamily(true)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1A1D24] border border-[rgba(255,255,255,0.1)] rounded-lg text-sm text-[#13ecb6] font-bold hover:bg-[#13ecb6]/10 transition-colors"
                                >
                                    <Plus size={16} />
                                    가족 추가
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Family List */}
                                {familyMembers.map((member) => (
                                    <div key={member.id} className="bg-[#14171C] rounded-xl border border-[rgba(255,255,255,0.05)] p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-[#1A1D24] flex items-center justify-center border border-[rgba(255,255,255,0.1)]">
                                                <User size={20} className="text-[#6B6F76]" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-white font-bold">{member.nickname}</span>
                                                    <Badge variant="outline" className="text-[10px] text-[#A8C7BC] border-[#A8C7BC]/30">
                                                        {relationshipOptions.find(opt => opt.value === member.relationship)?.label || member.relationship}
                                                    </Badge>
                                                </div>
                                                <div className="text-xs text-[#6B6F76] flex items-center gap-2">
                                                    <span>{member.birthYear}년생</span>
                                                    <span>•</span>
                                                    <span>{member.gender === 'male' ? '남성' : '여성'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeFamilyMember(member.id)}
                                            className="p-2 text-[#6B6F76] hover:text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}

                                {familyMembers.length === 0 && !isAddingFamily && (
                                    <div className="text-center py-8 border border-dashed border-[rgba(255,255,255,0.1)] rounded-xl">
                                        <p className="text-[#6B6F76] text-sm">등록된 가족 구성원이 없습니다.</p>
                                    </div>
                                )}

                                {/* Add Family Form */}
                                {isAddingFamily && (
                                    <div className="bg-[#1A1D24] rounded-xl border border-[#13ecb6]/30 p-5 animate-in fade-in zoom-in-95 duration-200">
                                        <h4 className="text-white text-sm font-bold mb-4">새 가족 구성원 추가</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-[#6B6F76] uppercase">관계</label>
                                                <select
                                                    value={newMember.relationship}
                                                    onChange={(e) => setNewMember({ ...newMember, relationship: e.target.value })}
                                                    className="w-full bg-[#0B0D10] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2 text-sm text-white focus:border-[#13ecb6] outline-none"
                                                >
                                                    {relationshipOptions.map(opt => (
                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-[#6B6F76] uppercase">별칭 (호칭)</label>
                                                <input
                                                    type="text"
                                                    placeholder="예: 첫째, 어머니"
                                                    value={newMember.nickname}
                                                    onChange={(e) => setNewMember({ ...newMember, nickname: e.target.value })}
                                                    className="w-full bg-[#0B0D10] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2 text-sm text-white focus:border-[#13ecb6] outline-none placeholder:text-[#383B42]"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-[#6B6F76] uppercase">출생년도</label>
                                                <input
                                                    type="number"
                                                    placeholder="YYYY"
                                                    value={newMember.birthYear}
                                                    onChange={(e) => setNewMember({ ...newMember, birthYear: e.target.value })}
                                                    className="w-full bg-[#0B0D10] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2 text-sm text-white focus:border-[#13ecb6] outline-none placeholder:text-[#383B42]"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-[#6B6F76] uppercase">성별</label>
                                                <div className="flex gap-2">
                                                    {['male', 'female'].map((g) => (
                                                        <button
                                                            key={g}
                                                            onClick={() => setNewMember({ ...newMember, gender: g })}
                                                            className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${newMember.gender === g
                                                                    ? 'bg-[#13ecb6]/20 border-[#13ecb6] text-white'
                                                                    : 'bg-[#0B0D10] border-[rgba(255,255,255,0.1)] text-[#6B6F76] hover:bg-[#1A1D24]'
                                                                }`}
                                                        >
                                                            {g === 'male' ? '남성' : '여성'}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => setIsAddingFamily(false)}
                                                className="px-4 py-2 text-xs font-bold text-[#6B6F76] hover:text-white transition-colors"
                                            >
                                                취소
                                            </button>
                                            <button
                                                onClick={addFamilyMember}
                                                className="px-4 py-2 bg-[#13ecb6] text-[#0A1612] rounded-lg text-xs font-bold hover:bg-[#10d4a3] transition-colors"
                                            >
                                                추가하기
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <p className="text-[#6B6F76] text-xs leading-relaxed bg-[#1A1D24]/50 p-3 rounded-lg border border-[rgba(255,255,255,0.05)]">
                                    ⓘ 가족 구성원 정보는 <strong>실명을 수집하지 않으며</strong>, 오직 생애주기별 맞춤형 서비스(육아 용품, 실버 케어 등) 추천을 위해서만 사용됩니다.
                                </p>
                            </div>
                        </section>

                        {/* 3. Interests & GraphRAG Data */}
                        <section>
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Briefcase size={20} className="text-[#13ecb6]" />
                                라이프스타일 관심사 (GraphRAG)
                            </h3>
                            <div className="bg-[#14171C] rounded-2xl border border-[rgba(255,255,255,0.05)] p-6">
                                <p className="text-[#6B6F76] text-sm mb-4">관심 있는 주제를 선택하세요. AI GraphRAG가 이를 바탕으로 맞춤형 지역 이벤트와 쿠폰을 추천해 드립니다.</p>
                                <div className="flex flex-wrap gap-2">
                                    {interestsList.map(interest => (
                                        <button
                                            key={interest}
                                            onClick={() => toggleInterest(interest)}
                                            className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${profile.interests.includes(interest)
                                                    ? 'bg-[#13ecb6] text-[#0A1612] border-[#13ecb6]'
                                                    : 'bg-[#1A1D24] text-[#B0B3B8] border-[rgba(255,255,255,0.1)] hover:bg-[#2A2E35] hover:text-white'
                                                }`}
                                        >
                                            {interest}
                                            {profile.interests.includes(interest) && <Check size={14} className="inline ml-1.5" strokeWidth={3} />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Save Button */}
                        <div className="flex justify-end pt-4 pb-10">
                            <button
                                onClick={handleSave}
                                disabled={isLoading}
                                className="flex items-center gap-2 bg-[#13ecb6] text-[#0A1612] px-8 py-3 rounded-xl font-bold hover:bg-[#10d4a3] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-[#0A1612] border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <Save size={20} />
                                )}
                                <span>변경 사항 저장</span>
                            </button>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
