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
      {/* Palantir-style Dark Overlay */}
      <div className="absolute inset-0 bg-black opacity-60"></div>
      
      {/* Subtle mesh gradient overlay */}
      <div className="absolute inset-0 mesh-gradient"></div>

      {/* Content Container */}
      <div className="relative z-10 container-max px-6 w-full">
        <div className="max-w-4xl">
          <h1 className="heading-xl mb-8 text-white">
            {t('videoHero.title')}
          </h1>
          <p className="body-lg mb-12 max-w-2xl">
            {t('videoHero.description')}
          </p>
          
          {/* Palantir-style CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="btn-primary">
              Get Started
            </button>
            <button className="btn-secondary">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoHeroSection;
