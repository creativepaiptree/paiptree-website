'use client';

import { useEffect, useState } from 'react';
import Button from './ui/Button';
import Section from './ui/Section';

export default function HeroSection() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <Section 
      className="min-h-screen flex items-center justify-center" 
      background="dark"
      withMeshGradient
      withNoiseOverlay
      padding="lg"
    >
      {/* Mouse follower gradient */}
      <div 
        className="absolute w-96 h-96 rounded-full opacity-20 blur-3xl transition-all duration-1000 ease-out pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%)',
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
        }}
      ></div>
      
      {/* Content - 스크린샷 정확한 레이아웃 */}
      <div className="py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-[80vh]">
          {/* 좌측 텍스트 영역 */}
          <div className="animate-fade-in">
            {/* Main heading - Stability.ai 정확한 스타일 */}
            <h1 className="font-archivo font-normal text-white mb-6" style={{ fontSize: '57.6px', lineHeight: '56.448px' }}>
              <span className="block">We'll help you</span>
              <span className="block">make it like</span>
              <span className="block">nobody's</span>
              <span className="block gradient-text">business.</span>
            </h1>
            
            {/* Subheading - Stability.ai 정확한 텍스트 */}
            <p className="text-xl text-gray-400 mb-10 max-w-lg leading-relaxed">
              No creative challenge too big, no timeline too tight. Get to production with Stability AI, your enterprise-ready creative partner.
            </p>
            
            {/* CTA Button */}
            <div className="mb-16">
              <Button variant="primary" size="lg" className="rounded-xl">
                Let's get started
              </Button>
            </div>

            {/* 이 부분은 Stability.ai에서 제거됨 */}
          </div>

          {/* 우측 이미지 영역 - 스크린샷의 복도/터널 이미지 */}
          <div className="relative">
            <div className="aspect-[4/5] bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 rounded-3xl flex items-center justify-center overflow-hidden">
              {/* 터널/복도 느낌의 그라데이션 */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
              <div className="text-6xl opacity-20">🏢</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating orbs - 더 서브틀하게 */}
      <div className="absolute top-1/4 left-10 w-32 h-32 bg-stability-purple/10 rounded-full blur-2xl float-animation"></div>
      <div className="absolute top-1/3 right-20 w-24 h-24 bg-stability-pink/10 rounded-full blur-2xl float-animation" style={{animationDelay: '2s'}}></div>
      <div className="absolute bottom-1/4 left-1/3 w-40 h-40 bg-stability-blue/10 rounded-full blur-2xl float-animation" style={{animationDelay: '4s'}}></div>
      <div className="absolute bottom-1/3 right-1/4 w-28 h-28 bg-green-600/10 rounded-full blur-2xl float-animation" style={{animationDelay: '6s'}}></div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-600 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </Section>
  );
}