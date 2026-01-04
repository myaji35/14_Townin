'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Settings, QrCode, Play, Pause, Maximize } from 'lucide-react';

interface Flyer {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    discount: string;
    validUntil: string;
    category: string;
    points: number;
}

export default function DigitalSignboardPage() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [interval, setInterval] = useState(5000); // 5 seconds
    const [showControls, setShowControls] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const flyers: Flyer[] = [
        {
            id: '1',
            title: '유기농 채소 30% 할인',
            description: '건강 목표에 맞춘 특별 할인! 매일매일 신선한 유기농 채소를 만나보세요.',
            imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1920&h=1080&fit=crop',
            discount: '30% OFF',
            validUntil: '2025-12-31',
            category: '식품',
            points: 25,
        },
        {
            id: '2',
            title: '겨울 대특가 세일',
            description: '올 겨울 최고의 혜택! 모든 상품 최대 40% 할인',
            imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1920&h=1080&fit=crop',
            discount: '40% OFF',
            validUntil: '2025-12-25',
            category: '시즌 특가',
            points: 30,
        },
        {
            id: '3',
            title: '웰니스 요가 수업 할인',
            description: '몸과 마음의 건강을 위한 특별 프로모션',
            imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1920&h=1080&fit=crop',
            discount: '20% OFF',
            validUntil: '2026-01-31',
            category: '웰니스',
            points: 20,
        },
        {
            id: '4',
            title: '카페 음료 무료 업그레이드',
            description: '모든 음료 사이즈 무료 업그레이드!',
            imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1920&h=1080&fit=crop',
            discount: 'FREE SIZE UP',
            validUntil: '2025-12-20',
            category: '카페',
            points: 15,
        },
    ];

    const currentFlyer = flyers[currentIndex];

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isPlaying) {
            timer = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % flyers.length);
            }, interval);
        }
        return () => clearInterval(timer);
    }, [isPlaying, interval, flyers.length]);

    useEffect(() => {
        const handleMouseMove = () => {
            setShowControls(true);
            if (isFullscreen) {
                setTimeout(() => {
                    setShowControls(false);
                }, 3000);
            }
        };

        if (isFullscreen) {
            window.addEventListener('mousemove', handleMouseMove);
            return () => window.removeEventListener('mousemove', handleMouseMove);
        }
    }, [isFullscreen]);

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % flyers.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + flyers.length) % flyers.length);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-black overflow-hidden">
            {/* Main Display */}
            <div className="relative w-full h-screen flex items-center justify-center">
                {/* Background Image with Blur */}
                <div
                    className="absolute inset-0 bg-cover bg-center filter blur-sm opacity-30"
                    style={{ backgroundImage: `url(${currentFlyer.imageUrl})` }}
                />

                {/* Content */}
                <div className="relative z-10 w-full h-full flex items-center justify-center p-8">
                    <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        {/* Flyer Image */}
                        <div className="relative">
                            <div className="aspect-[16/10] rounded-3xl overflow-hidden shadow-2xl transform transition-all duration-700 hover:scale-105">
                                <img
                                    src={currentFlyer.imageUrl}
                                    alt={currentFlyer.title}
                                    className="w-full h-full object-cover"
                                />
                                {/* Discount Badge */}
                                {currentFlyer.discount && (
                                    <div className="absolute top-6 right-6 bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-4 rounded-2xl shadow-lg transform rotate-3">
                                        <div className="text-4xl font-black">{currentFlyer.discount}</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Flyer Info */}
                        <div className="text-white space-y-6">
                            <div className="inline-block px-4 py-2 bg-amber-500/20 border border-amber-500 rounded-full text-amber-400 text-sm font-semibold mb-4">
                                {currentFlyer.category}
                            </div>

                            <h1 className="text-6xl font-black leading-tight mb-6 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
                                {currentFlyer.title}
                            </h1>

                            <p className="text-2xl text-gray-300 leading-relaxed">
                                {currentFlyer.description}
                            </p>

                            <div className="flex items-center gap-6 text-lg text-gray-400 border-t border-gray-700 pt-6 mt-6">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">📅</span>
                                    <span>{currentFlyer.validUntil}까지</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">⭐</span>
                                    <span className="text-amber-400 font-semibold">
                                        {currentFlyer.points}P 적립
                                    </span>
                                </div>
                            </div>

                            {/* QR Code Section */}
                            <div className="mt-8 p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                                <div className="flex items-center gap-6">
                                    <div className="w-32 h-32 bg-white rounded-xl p-3 flex items-center justify-center">
                                        <QrCode className="w-full h-full text-black" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-2">모바일로 확인하기</h3>
                                        <p className="text-gray-400">
                                            QR 코드를 스캔하여<br />
                                            스마트폰으로 자세한 내용을 확인하세요
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress Indicators */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
                    {flyers.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex
                                ? 'w-12 bg-amber-500'
                                : 'w-2 bg-white/30 hover:bg-white/50'
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* Controls Overlay */}
            {showControls && (
                <div className={`absolute inset-0 z-30 pointer-events-none transition-opacity duration-300 ${!isFullscreen || showControls ? 'opacity-100' : 'opacity-0'
                    }`}>
                    {/* Top Bar */}
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-6 pointer-events-auto">
                        <div className="flex items-center justify-between max-w-7xl mx-auto">
                            <div>
                                <h2 className="text-white text-2xl font-bold">의정부 신선마트</h2>
                                <p className="text-gray-400 text-sm mt-1">디지털 전단지</p>
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-white/30 text-white bg-black/30 backdrop-blur-sm hover:bg-white/20"
                                    onClick={toggleFullscreen}
                                >
                                    <Maximize className="h-4 w-4 mr-2" />
                                    {isFullscreen ? '전체화면 끄기' : '전체화면'}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-white/30 text-white bg-black/30 backdrop-blur-sm hover:bg-white/20"
                                >
                                    <Settings className="h-4 w-4 mr-2" />
                                    설정
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Arrows */}
                    <button
                        onClick={handlePrev}
                        className="absolute left-6 top-1/2 transform -translate-y-1/2 w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white hover:bg-black/70 transition-all pointer-events-auto"
                    >
                        <ChevronLeft className="w-8 h-8" />
                    </button>

                    <button
                        onClick={handleNext}
                        className="absolute right-6 top-1/2 transform -translate-y-1/2 w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white hover:bg-black/70 transition-all pointer-events-auto"
                    >
                        <ChevronRight className="w-8 h-8" />
                    </button>

                    {/* Bottom Controls */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 pointer-events-auto">
                        <div className="max-w-7xl mx-auto flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsPlaying(!isPlaying)}
                                    className="border-white/30 text-white bg-black/30 backdrop-blur-sm hover:bg-white/20"
                                >
                                    {isPlaying ? (
                                        <>
                                            <Pause className="h-4 w-4 mr-2" />
                                            일시정지
                                        </>
                                    ) : (
                                        <>
                                            <Play className="h-4 w-4 mr-2" />
                                            재생
                                        </>
                                    )}
                                </Button>

                                <div className="text-white text-sm">
                                    <span className="font-semibold">{currentIndex + 1}</span>
                                    <span className="text-gray-400"> / {flyers.length}</span>
                                </div>

                                <select
                                    value={interval}
                                    onChange={(e) => setInterval(Number(e.target.value))}
                                    className="px-3 py-1.5 bg-black/30 backdrop-blur-sm border border-white/30 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                >
                                    <option value={3000}>3초</option>
                                    <option value={5000}>5초</option>
                                    <option value={10000}>10초</option>
                                    <option value={15000}>15초</option>
                                </select>
                            </div>

                            <div className="text-white text-sm">
                                <span className="text-gray-400">현재 시각:</span>{' '}
                                <span className="font-semibold">
                                    {new Date().toLocaleTimeString('ko-KR')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Store Info Overlay */}
            <div className="absolute top-6 left-6 bg-black/50 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/20 z-20">
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-white font-semibold">실시간 업데이트</span>
                </div>
            </div>
        </div>
    );
}
