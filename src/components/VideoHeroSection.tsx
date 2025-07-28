// src/components/VideoHeroSection.tsx
'use client';

import Button from './ui/Button';
import { useTranslation } from '@/hooks/useTranslation';

const VideoHeroSection = () => {
  const { t } = useTranslation();
  
  return (
    <section className="relative h-screen flex items-center overflow-hidden" 
             style={{
               backgroundImage: 'url("https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=2070&auto=format&fit=crop")',
               backgroundSize: 'cover',
               backgroundPosition: 'center right',
               backgroundRepeat: 'no-repeat'
             }}>
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black opacity-50"></div>

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-semibold leading-tight mb-6 text-white tracking-tight">
            {t('videoHero.title')}
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-10 leading-relaxed max-w-xl">
            {t('videoHero.description')}
          </p>
        </div>
      </div>
    </section>
  );
};

export default VideoHeroSection;
