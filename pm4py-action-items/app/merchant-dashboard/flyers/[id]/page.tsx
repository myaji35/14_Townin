'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Upload, MapPin, Calendar, Save, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function EditFlyerPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'food',
        discount: '',
        startDate: '',
        endDate: '',
        location: '',
        imageUrl: '',
        points: 25,
        status: 'pending',
    });

    useEffect(() => {
        // TODO: Fetch flyer data from API
        // Mock data
        setTimeout(() => {
            setFormData({
                title: '유기농 채소 30% 할인',
                description: '건강 목표에 맞춘 특별 할인! 매일매일 신선한 유기농 채소를 만나보세요.',
                category: 'food',
                discount: '30% OFF',
                startDate: '2025-12-01',
                endDate: '2025-12-31',
                location: '의정부동 195-45',
                imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800',
                points: 25,
                status: 'approved',
            });
            setLoading(false);
        }, 500);
    }, [params.id]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: API call to update flyer
        console.log('Updating flyer:', formData);
        router.push('/merchant-dashboard/flyers');
    };

    const handleDelete = () => {
        if (confirm('정말 이 전단지를 삭제하시겠습니까?')) {
            // TODO: API call to delete flyer
            console.log('Deleting flyer:', params.id);
            router.push('/merchant-dashboard/flyers');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-white text-lg">로딩 중...</div>
            </div>
        );
    }

    const getStatusBadge = () => {
        switch (formData.status) {
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
                        <div className="flex items-center gap-4">
                            <Link href="/merchant-dashboard/flyers">
                                <Button variant="ghost" size="sm" className="text-gray-300">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    돌아가기
                                </Button>
                            </Link>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-bold text-white">전단지 수정</h1>
                                    {getStatusBadge()}
                                </div>
                                <p className="text-sm text-gray-400 mt-1">전단지 ID: {params.id}</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="border-red-600 text-red-400 hover:bg-red-900/20"
                                onClick={handleDelete}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                삭제
                            </Button>
                            <Link href={`/merchant-dashboard/flyers/${params.id}/analytics`}>
                                <Button variant="outline" className="border-gray-600 text-gray-300">
                                    <Eye className="mr-2 h-4 w-4" />
                                    분석 보기
                                </Button>
                            </Link>
                            <Button
                                onClick={handleSubmit}
                                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold shadow-lg shadow-amber-500/30"
                            >
                                <Save className="mr-2 h-4 w-4" />
                                저장하기
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Form Section */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Status Info */}
                        {formData.status === 'rejected' && (
                            <Card className="bg-gradient-to-br from-red-900/20 to-red-950/20 border-red-500/50">
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-3">
                                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                                        <div>
                                            <h4 className="text-red-400 font-semibold mb-1">거절 사유</h4>
                                            <p className="text-red-300 text-sm">
                                                전단지 이미지 품질이 기준에 미달합니다. 더 선명한 이미지를 사용해 주세요.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Basic Information */}
                        <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50">
                            <CardHeader>
                                <CardTitle className="text-white">기본 정보</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="title" className="text-gray-300">제목 *</Label>
                                    <input
                                        id="title"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        className="w-full mt-2 px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="description" className="text-gray-300">설명 *</Label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={4}
                                        className="w-full mt-2 px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="category" className="text-gray-300">카테고리 *</Label>
                                        <select
                                            id="category"
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            className="w-full mt-2 px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                        >
                                            <option value="food">🥬 식품</option>
                                            <option value="wellness">🧘 웰니스</option>
                                            <option value="cafe">☕ 카페</option>
                                            <option value="retail">🛍️ 리테일</option>
                                            <option value="service">🔧 서비스</option>
                                            <option value="seasonal">🎄 시즌 특가</option>
                                        </select>
                                    </div>

                                    <div>
                                        <Label htmlFor="discount" className="text-gray-300">할인율</Label>
                                        <input
                                            id="discount"
                                            name="discount"
                                            value={formData.discount}
                                            onChange={handleChange}
                                            className="w-full mt-2 px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Image */}
                        <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50">
                            <CardHeader>
                                <CardTitle className="text-white">이미지</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {formData.imageUrl && (
                                    <div className="relative w-full h-64 bg-gray-700 rounded-lg overflow-hidden">
                                        <img
                                            src={formData.imageUrl}
                                            alt={formData.title}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Button variant="outline" className="border-white text-white">
                                                <Upload className="mr-2 h-4 w-4" />
                                                이미지 변경
                                            </Button>
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <Label htmlFor="imageUrl" className="text-gray-300">이미지 URL</Label>
                                    <input
                                        id="imageUrl"
                                        name="imageUrl"
                                        value={formData.imageUrl}
                                        onChange={handleChange}
                                        className="w-full mt-2 px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Location & Date */}
                        <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50">
                            <CardHeader>
                                <CardTitle className="text-white">위치 및 기간</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="location" className="text-gray-300 flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        위치 *
                                    </Label>
                                    <input
                                        id="location"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        className="w-full mt-2 px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="startDate" className="text-gray-300 flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            시작일 *
                                        </Label>
                                        <input
                                            id="startDate"
                                            name="startDate"
                                            type="date"
                                            value={formData.startDate}
                                            onChange={handleChange}
                                            className="w-full mt-2 px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="endDate" className="text-gray-300 flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            종료일 *
                                        </Label>
                                        <input
                                            id="endDate"
                                            name="endDate"
                                            type="date"
                                            value={formData.endDate}
                                            onChange={handleChange}
                                            className="w-full mt-2 px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                            required
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50">
                            <CardHeader>
                                <CardTitle className="text-white">포인트 설정</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div>
                                    <Label htmlFor="points" className="text-gray-300">적립 포인트</Label>
                                    <input
                                        id="points"
                                        name="points"
                                        type="number"
                                        value={formData.points}
                                        onChange={handleChange}
                                        min="0"
                                        max="1000"
                                        className="w-full mt-2 px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                    />
                                    <p className="text-xs text-gray-400 mt-2">
                                        약 {(formData.points * 100).toLocaleString()}원 상당
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50">
                            <CardHeader>
                                <CardTitle className="text-white">변경 이력</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full mt-1"></div>
                                        <div>
                                            <p className="text-gray-300">전단지 승인됨</p>
                                            <p className="text-xs text-gray-500">2025-12-15 10:30</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                                        <div>
                                            <p className="text-gray-300">전단지 등록</p>
                                            <p className="text-xs text-gray-500">2025-12-15 09:00</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
