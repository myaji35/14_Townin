'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Trash2, Copy, BarChart3, Plus Circle, Filter, Search } from 'lucide-react';
import Link from 'next/link';

interface Flyer {
    id: string;
    title: string;
    status: 'approved' | 'pending' | 'rejected';
    views: number;
    clicks: number;
    period: string;
    category: string;
    discount: string;
}

export default function FlyersPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    const [flyers] = useState<Flyer[]>([
        {
            id: '1',
            title: '유기농 채소 30% 할인',
            status: 'approved',
            views: 1240,
            clicks: 87,
            period: '2025-12-31까지',
            category: 'food',
            discount: '30% OFF',
        },
        {
            id: '2',
            title: '겨울 대특가 세일',
            status: 'approved',
            views: 856,
            clicks: 42,
            period: '2025-12-25까지',
            category: 'seasonal',
            discount: '40% OFF',
        },
        {
            id: '3',
            title: '신규 상품 런칭 기념',
            status: 'pending',
            views: 0,
            clicks: 0,
            period: '2026-01-15까지',
            category: 'new',
            discount: '20% OFF',
        },
        {
            id: '4',
            title: '구정 맞이 대할인',
            status: 'rejected',
            views: 0,
            clicks: 0,
            period: '2026-02-10까지',
            category: 'seasonal',
            discount: '50% OFF',
        },
    ]);

    const filteredFlyers = flyers.filter((flyer) => {
        const matchesSearch = flyer.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' || flyer.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50">승인됨</Badge>;
            case 'pending':
                return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50">승인 대기</Badge>;
            case 'rejected':
                return <Badge className="bg-red-500/20 text-red-400 border-red-500/50">거절됨</Badge>;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            {/* Header */}
            <header className="border-b border-gray-700/50 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-white">전단지 관리</h1>
                            <p className="text-sm text-gray-400 mt-1">등록된 전단지를 관리하세요</p>
                        </div>
                        <Link href="/merchant-dashboard/flyers/new">
                            <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold shadow-lg shadow-amber-500/30">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                새 전단지 등록
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8">
                {/* Search & Filter */}
                <Card className="mb-6 bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50">
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="전단지 제목으로 검색..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                />
                            </div>

                            {/* Filter */}
                            <div className="flex gap-2">
                                {['all', 'approved', 'pending', 'rejected'].map((status) => (
                                    <Button
                                        key={status}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setFilterStatus(status)}
                                        className={`${filterStatus === status
                                                ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                                                : 'border-gray-600 text-gray-300'
                                            }`}
                                    >
                                        {status === 'all' && '전체'}
                                        {status === 'approved' && '승인됨'}
                                        {status === 'pending' && '승인 대기'}
                                        {status === 'rejected' && '거절됨'}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50">
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-white">{flyers.length}</div>
                            <p className="text-sm text-gray-400">총 전단지</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-emerald-900/20 to-emerald-950/20 border-emerald-500/50">
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-emerald-400">
                                {flyers.filter(f => f.status === 'approved').length}
                            </div>
                            <p className="text-sm text-emerald-300">승인됨</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-amber-900/20 to-amber-950/20 border-amber-500/50">
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-amber-400">
                                {flyers.filter(f => f.status === 'pending').length}
                            </div>
                            <p className="text-sm text-amber-300">승인 대기</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-red-900/20 to-red-950/20 border-red-500/50">
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-red-400">
                                {flyers.filter(f => f.status === 'rejected').length}
                            </div>
                            <p className="text-sm text-red-300">거절됨</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Flyers List */}
                <div className="space-y-4">
                    {filteredFlyers.map((flyer) => (
                        <Card key={flyer.id} className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50 hover:border-amber-500/50 transition-all">
                            <CardContent className="pt-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-white">{flyer.title}</h3>
                                            {getStatusBadge(flyer.status)}
                                            <Badge variant="outline" className="border-amber-500/50 text-amber-400">
                                                {flyer.discount}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-6 text-sm text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <Eye className="h-4 w-4" />
                                                {flyer.views.toLocaleString()} 조회
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <BarChart3 className="h-4 w-4" />
                                                {flyer.clicks} 클릭
                                            </span>
                                            <span>📅 {flyer.period}</span>
                                            <span>🏷️ {flyer.category}</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <Link href={`/merchant-dashboard/flyers/${flyer.id}/analytics`}>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                                            >
                                                <BarChart3 className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Link href={`/merchant-dashboard/flyers/${flyer.id}`}>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-gray-600 text-gray-300 hover:bg-gray-700"
                                            onClick={() => {/* Copy flyer */ }}
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-red-600 text-red-400 hover:bg-red-900/20"
                                            onClick={() => {/* Delete flyer */ }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Empty State */}
                {filteredFlyers.length === 0 && (
                    <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50">
                        <CardContent className="py-12 text-center">
                            <p className="text-gray-400 mb-4">검색 결과가 없습니다</p>
                            <Button
                                variant="outline"
                                className="border-gray-600 text-gray-300"
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilterStatus('all');
                                }}
                            >
                                필터 초기화
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>
    );
}
