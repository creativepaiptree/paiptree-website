// src/components/VideoHeroSection.tsx
'use client';

import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';

const VideoHeroSection = () => {
  const { t } = useTranslation();

  return (
    <section
      className="relative h-screen flex items-center overflow-hidden"
      style={{
        backgroundImage: 'url("https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=2070&auto=format&fit=crop")',
        backgroundSize: 'cover',
        backgroundPosition: 'center right',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/65" />

      {/* Mesh gradient overlay */}
      <div className="absolute inset-0 mesh-gradient" />

      {/* Content */}
      <div className="relative z-10 container-max px-6 w-full">
        <div className="max-w-4xl">
          {/* Eyebrow */}
          <div className="flex items-center gap-2 mb-6">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: 'var(--accent)' }}
            />
            <span className="text-xs font-medium tracking-widest uppercase" style={{ color: 'var(--accent)' }}>
              AI Smart Agriculture Platform
            </span>
          </div>

          <h1 className="heading-xl mb-8 text-white">
            {t('videoHero.title')}
          </h1>
          <p className="body-lg mb-12 max-w-2xl">
            {t('videoHero.description')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/services" className="btn-primary text-center w-full sm:w-auto">
              {t('videoHero.getStarted')}
            </Link>
            <Link href="/about" className="btn-secondary text-center w-full sm:w-auto">
              {t('videoHero.learnMore')}
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40">
        <span className="text-[10px] tracking-widest uppercase">Scroll</span>
        <div className="w-px h-10 bg-gradient-to-b from-white/40 to-transparent" />
      </div>
    </section>
  );
};

export default VideoHeroSection;
