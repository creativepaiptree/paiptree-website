// src/components/VideoHeroSection.tsx
'use client';

import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';

const VideoHeroSection = () => {
  const { t } = useTranslation();

  return (
    <section
      className="relative h-screen flex items-end overflow-hidden"
      style={{
        backgroundImage: 'url("https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=2070&auto=format&fit=crop")',
        backgroundSize: 'cover',
        backgroundPosition: 'center right',
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70" />
      {/* 하단 그라디언트 — 텍스트 가독성 */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(5,5,5,0.95) 0%, rgba(5,5,5,0.4) 50%, transparent 100%)' }} />

      {/* Content — 좌하단 정렬 */}
      <div className="relative z-10 w-full" style={{ paddingBottom: '6rem' }}>
        <div className="container-max px-6">

          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-8">
            <span className="type-label" style={{ color: 'var(--color-accent)' }}>
              AI Smart Agriculture
            </span>
            <span className="w-8 h-px" style={{ background: 'var(--color-accent)' }} />
            <span className="type-label" style={{ color: 'var(--color-text-dim)' }}>
              Since 2021
            </span>
          </div>

          {/* Heading */}
          <h1
            className="type-display mb-6"
            style={{ color: 'var(--color-text)', maxWidth: '820px' }}
          >
            {t('videoHero.title')}
          </h1>

          {/* Description */}
          <p
            className="type-body mb-10"
            style={{ color: 'var(--color-text-sub)', maxWidth: '480px' }}
          >
            {t('videoHero.description')}
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/services" className="btn-site-primary">
              {t('videoHero.getStarted')}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link href="/culture" className="btn-site-ghost">
              {t('videoHero.learnMore')}
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 right-8 flex flex-col items-center gap-2" style={{ color: 'var(--color-text-dim)' }}>
        <div className="w-px h-12 bg-gradient-to-b from-transparent" style={{ background: 'linear-gradient(to bottom, transparent, var(--color-text-dim))' }} />
        <span className="type-label" style={{ writingMode: 'vertical-rl', letterSpacing: '0.12em' }}>SCROLL</span>
      </div>
    </section>
  );
};

export default VideoHeroSection;
