'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Upload, MapPin, Calendar, Tag, Percent, Save, Eye } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NewFlyerPage() {
    const router = useRouter();
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
    });

    const [previewMode, setPreviewMode] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: API call to create flyer
        console.log('Creating flyer:', formData);
        router.push('/merchant-dashboard/flyers');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
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
                                <h1 className="text-2xl font-bold text-white">새 전단지 등록</h1>
                                <p className="text-sm text-gray-400 mt-1">전단지 정보를 입력하세요</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="border-gray-600 text-gray-300"
                                onClick={() => setPreviewMode(!previewMode)}
                            >
                                <Eye className="mr-2 h-4 w-4" />
                                {previewMode ? '편집 모드' : '미리보기'}
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold shadow-lg shadow-amber-500/30"
                            >
                                <Save className="mr-2 h-4 w-4" />
                                등록하기
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-8">
                {!previewMode ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Form Section */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Basic Information */}
                            <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50">
                                <CardHeader>
                                    <CardTitle className="text-white">기본 정보</CardTitle>
                                    <CardDescription className="text-gray-400">
                                        전단지의 기본 정보를 입력하세요
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="title" className="text-gray-300">제목 *</Label>
                                        <input
                                            id="title"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            placeholder="예: 유기농 채소 30% 할인"
                                            className="w-full mt-2 px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
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
                                            placeholder="전단지에 대한 상세 설명을 입력하세요"
                                            rows={4}
                                            className="w-full mt-2 px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
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
                                                placeholder="30% OFF"
                                                className="w-full mt-2 px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Image Upload */}
                            <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50">
                                <CardHeader>
                                    <CardTitle className="text-white">이미지</CardTitle>
                                    <CardDescription className="text-gray-400">
                                        전단지에 사용할 이미지를 업로드하세요
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-amber-500/50 transition-colors cursor-pointer">
                                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-300 mb-2">클릭하여 이미지 업로드</p>
                                        <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                // TODO: Handle file upload
                                                console.log('File selected:', e.target.files?.[0]);
                                            }}
                                        />
                                    </div>
                                    <div className="mt-4">
                                        <Label htmlFor="imageUrl" className="text-gray-300">또는 이미지 URL</Label>
                                        <input
                                            id="imageUrl"
                                            name="imageUrl"
                                            value={formData.imageUrl}
                                            onChange={handleChange}
                                            placeholder="https://example.com/image.jpg"
                                            className="w-full mt-2 px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Location & Date */}
                            <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50">
                                <CardHeader>
                                    <CardTitle className="text-white">위치 및 기간</CardTitle>
                                    <CardDescription className="text-gray-400">
                                        전단지 노출 위치와 유효 기간을 설정하세요
                                    </CardDescription>
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
                                            placeholder="의정부동 195-45"
                                            className="w-full mt-2 px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
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

                        {/* Preview Section */}
                        <div className="lg:col-span-1">
                            <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50 sticky top-24">
                                <CardHeader>
                                    <CardTitle className="text-white">포인트 설정</CardTitle>
                                    <CardDescription className="text-gray-400">
                                        사용자가 받을 포인트
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="points" className="text-gray-300 flex items-center gap-2">
                                            <Tag className="h-4 w-4" />
                                            적립 포인트
                                        </Label>
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

                                    <div className="pt-4 border-t border-gray-700">
                                        <h4 className="text-sm font-medium text-gray-300 mb-3">예상 비용</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between text-gray-400">
                                                <span>기본 노출료</span>
                                                <span>무료</span>
                                            </div>
                                            <div className="flex justify-between text-gray-400">
                                                <span>포인트 비용 (예상 100회)</span>
                                                <span>{(formData.points * 100 * 100).toLocaleString()}원</span>
                                            </div>
                                            <div className="flex justify-between text-white font-semibold pt-2 border-t border-gray-700">
                                                <span>예상 총비용</span>
                                                <span>{(formData.points * 100 * 100).toLocaleString()}원</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-700">
                                        <h4 className="text-sm font-medium text-gray-300 mb-3">예상 효과</h4>
                                        <div className="space-y-2 text-sm text-gray-400">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                                <span>예상 조회수: 500-1,000회</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                <span>예상 클릭수: 50-100회</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                                <span>예상 전환율: 3-5%</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                ) : (
                    {/* Preview Mode */ }
                    < div className="max-w-2xl mx-auto">
                <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border-gray-700/50">
                    <CardHeader>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm text-amber-400 font-semibold">AI 추천</span>
                            {formData.discount && (
                                <span className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full">
                                    {formData.discount}
                                </span>
                            )}
                        </div>
                        {formData.imageUrl && (
                            <div className="w-full h-48 bg-gray-700 rounded-lg mb-4 overflow-hidden">
                                <img
                                    src={formData.imageUrl}
                                    alt={formData.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        <CardTitle className="text-white text-xl">{formData.title || '제목을 입력하세요'}</CardTitle>
                        <CardDescription className="text-gray-300 mt-2">
                            {formData.description || '설명을 입력하세요'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">{formData.location || '위치'}</span>
                            <Button className="bg-amber-500 hover:bg-amber-600 text-white">
                                {formData.points}P 받기
                            </Button>
                        </div>
                    </CardContent>
                </Card>
        </div>
    )
}
      </main >
    </div >
  );
}
