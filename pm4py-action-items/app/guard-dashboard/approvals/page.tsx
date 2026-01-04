'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle, XCircle, AlertCircle, Clock, Eye, FileText, Shield } from 'lucide-react';
import Link from 'next/link';

interface PendingFlyer {
    id: string;
    merchantName: string;
    storeName: string;
    title: string;
    description: string;
    category: string;
    imageUrl: string;
    discount: string;
    submittedAt: string;
    priority: 'high' | 'normal' | 'low';
    validUntil: string;
    points: number;
}

export default function GuardApprovalsPage() {
    const [selectedFlyer, setSelectedFlyer] = useState<PendingFlyer | null>(null);
    const [rejectReason, setRejectReason] = useState('');

    const [pendingFlyers] = useState<PendingFlyer[]>([
        {
            id: '3',
            merchantName: '김철수',
            storeName: '의정부 신선마트',
            title: '신규 상품 런칭 기념',
            description: '새로운 유기농 상품 출시를 기념하여 특별 할인 행사를 진행합니다.',
            category: 'food',
            imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800',
            discount: '20% OFF',
            submittedAt: '2026-01-04 08:15',
            priority: 'high',
            validUntil: '2026-01-15',
            points: 20,
        },
        {
            id: '4',
            merchantName: '박영희',
            storeName: '힐링 요가센터',
            title: '신년 맞이 요가 수업',
            description: '새해를 건강하게 시작하는 특별 요가 프로그램',
            category: 'wellness',
            imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
            discount: '15% OFF',
            submittedAt: '2026-01-04 07:30',
            priority: 'normal',
            validUntil: '2026-01-20',
            points: 15,
        },
        {
            id: '5',
            merchantName: '이민수',
            storeName: '의정부 카페 로스터',
            title: '겨울 시즌 음료 특가',
            description: '따뜻한 겨울 음료 전 메뉴 할인',
            category: 'cafe',
            imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
            discount: '2+1',
            submittedAt: '2026-01-03 18:20',
            priority: 'normal',
            validUntil: '2026-02-28',
            points: 10,
        },
    ]);

    const [recentActions] = useState([
        { id: '1', action: '유기농 채소 30% 할인', status: 'approved', time: '1시간 전' },
        { id: '2', action: '겨울 대특가 세일', status: 'approved', time: '3시간 전' },
        { id: '6', action: '구정 맞이 대할인', status: 'rejected', time: '5시간 전' },
    ]);

    const handleApprove = (flyerId: string) => {
        if (confirm('이 전단지를 승인하시겠습니까?')) {
            console.log('Approving flyer:', flyerId);
            // TODO: API call
            alert('전단지가 승인되었습니다!');
            setSelectedFlyer(null);
        }
    };

    const handleReject = (flyerId: string) => {
        if (!rejectReason.trim()) {
            alert('거절 사유를 입력해주세요.');
            return;
        }
        if (confirm('이 전단지를 거절하시겠습니까?')) {
            console.log('Rejecting flyer:', flyerId, 'Reason:', rejectReason);
            // TODO: API call
            alert('전단지가 거절되었습니다.');
            setSelectedFlyer(null);
            setRejectReason('');
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'high':
                return <Badge className="bg-red-500/20 text-red-400 border-red-500/50">긴급</Badge>;
            case 'normal':
                return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">일반</Badge>;
            case 'low':
                return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/50">낮음</Badge>;
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
                        <div className="flex items-center gap-4">
                            <Link href="/guard-dashboard">
                                <Button variant="ghost" size="sm" className="text-gray-300">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    대시보드
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <Shield className="h-6 w-6 text-blue-500" />
                                    전단지 승인 관리
                                </h1>
                                <p className="text-sm text-gray-400 mt-1">승인 대기 중인 전단지 검토</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50 text-base px-4 py-2">
                                대기: {pendingFlyers.length}건
                            </Badge>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Pending Queue */}
                    <div className="lg:col-span-1 space-y-4">
                        <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50">
                            <CardHeader>
                                <CardTitle className="text-white">승인 대기 목록</CardTitle>
                                <CardDescription className="text-gray-400">
                                    우선순위 순으로 정렬
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {pendingFlyers.map((flyer) => (
                                    <button
                                        key={flyer.id}
                                        onClick={() => setSelectedFlyer(flyer)}
                                        className={`w-full p-4 rounded-lg border transition-all text-left ${selectedFlyer?.id === flyer.id
                                                ? 'bg-amber-900/30 border-amber-500'
                                                : 'bg-gray-700/30 border-gray-600 hover:border-gray-500'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                                <h4 className="text-white font-semibold text-sm line-clamp-1">
                                                    {flyer.title}
                                                </h4>
                                                <p className="text-xs text-gray-400 mt-1">{flyer.storeName}</p>
                                            </div>
                                            {getPriorityBadge(flyer.priority)}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <Clock className="h-3 w-3" />
                                            {flyer.submittedAt}
                                        </div>
                                    </button>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Recent Actions */}
                        <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50">
                            <CardHeader>
                                <CardTitle className="text-white text-sm">최근 처리</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {recentActions.map((action) => (
                                    <div key={action.id} className="flex items-start gap-2 text-xs">
                                        {action.status === 'approved' ? (
                                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                                        ) : (
                                            <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                                        )}
                                        <div className="flex-1">
                                            <p className="text-gray-300 line-clamp-1">{action.action}</p>
                                            <p className="text-gray-500">{action.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Review Panel */}
                    <div className="lg:col-span-2">
                        {selectedFlyer ? (
                            <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-white text-xl">{selectedFlyer.title}</CardTitle>
                                            <CardDescription className="text-gray-400 mt-2">
                                                {selectedFlyer.storeName} • {selectedFlyer.merchantName}
                                            </CardDescription>
                                        </div>
                                        {getPriorityBadge(selectedFlyer.priority)}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Flyer Preview */}
                                    <div className="aspect-video rounded-lg overflow-hidden bg-gray-700">
                                        <img
                                            src={selectedFlyer.imageUrl}
                                            alt={selectedFlyer.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Details */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-gray-400">카테고리</label>
                                            <p className="text-white mt-1">{selectedFlyer.category}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400">할인율</label>
                                            <p className="text-white mt-1">{selectedFlyer.discount}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400">유효기간</label>
                                            <p className="text-white mt-1">{selectedFlyer.validUntil}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400">적립 포인트</label>
                                            <p className="text-white mt-1">{selectedFlyer.points}P</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs text-gray-400">설명</label>
                                        <p className="text-gray-300 mt-2">{selectedFlyer.description}</p>
                                    </div>

                                    {/* Review Checklist */}
                                    <Card className="bg-gray-700/30 border-gray-600">
                                        <CardHeader>
                                            <CardTitle className="text-white text-sm flex items-center gap-2">
                                                <FileText className="h-4 w-4" />
                                                검토 체크리스트
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            {[
                                                '부적절한 내용 없음',
                                                '이미지 품질 양호',
                                                '할인율 적정',
                                                '상품/서비스 정보 명확',
                                                '유효기간 적정',
                                            ].map((item, index) => (
                                                <label key={index} className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="rounded border-gray-600 bg-gray-700 text-amber-500 focus:ring-amber-500"
                                                    />
                                                    {item}
                                                </label>
                                            ))}
                                        </CardContent>
                                    </Card>

                                    {/* Reject Reason */}
                                    <div>
                                        <label className="text-sm text-gray-300 mb-2 block">거절 사유 (선택)</label>
                                        <textarea
                                            value={rejectReason}
                                            onChange={(e) => setRejectReason(e.target.value)}
                                            placeholder="거절할 경우 사유를 입력하세요..."
                                            rows={3}
                                            className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                        />
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3 pt-4 border-t border-gray-700">
                                        <Button
                                            onClick={() => handleApprove(selectedFlyer.id)}
                                            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold"
                                        >
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            승인
                                        </Button>
                                        <Button
                                            onClick={() => handleReject(selectedFlyer.id)}
                                            variant="outline"
                                            className="flex-1 border-red-600 text-red-400 hover:bg-red-900/20"
                                        >
                                            <XCircle className="mr-2 h-4 w-4" />
                                            거절
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50">
                                <CardContent className="py-24 text-center">
                                    <AlertCircle className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                                    <p className="text-gray-400 text-lg">좌측에서 검토할 전단지를 선택하세요</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
