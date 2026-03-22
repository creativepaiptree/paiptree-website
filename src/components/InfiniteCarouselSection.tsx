'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import AboutSectionHeader from '@/components/AboutSectionHeader';
import MarketingSection from '@/components/site/MarketingSection';

interface CarouselCard {
  id: string;
  title: string;
  subtitle?: string;
  backgroundImage: string;
}

const carouselData: CarouselCard[] = [
  {
    id: '1',
    title: 'CYBERNETIC ENTERPRISE',
    subtitle: 'Building Future Digital Infrastructure',
    backgroundImage: '/p1.png',
  },
  {
    id: '2',
    title: 'AUTOMATION CORE',
    subtitle: 'Driving Automation Into Every Core Function',
    backgroundImage: '/p2.png',
  },
  {
    id: '3',
    title: 'AI TRANSFORMATION',
    subtitle: 'AI is Transforming the Enterprise',
    backgroundImage: '/p3.png',
  },
  {
    id: '4',
    title: 'DATA INTELLIGENCE',
    subtitle: 'Smart Analytics for Better Decisions',
    backgroundImage: '/p4.png',
  },
  {
    id: '5',
    title: 'DIGITAL WORKFLOW',
    subtitle: 'Streamlined Processes for Maximum Efficiency',
    backgroundImage: '/p5.png',
  }
];

export default function InfiniteCarouselSection() {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-advance carousel every 6 seconds
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % carouselData.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [isPaused]);

  return (
    <MarketingSection surface="surface" withContainer={false}>
      {/* Top Navigation Buttons */}
      <div className="container-max px-6 mb-8 relative z-10">
        <AboutSectionHeader
          number="/02"
          label="CAPABILITIES"
          title={t('infiniteCarousel.sectionTitle')}
          description={t('infiniteCarousel.sectionDescription')}
        />
        <div className="flex gap-2 flex-wrap">
          {carouselData.map((card, index) => (
            <button
              key={card.id}
              className={[
                'marketing-tab',
                'marketing-interactive',
                index === currentIndex ? 'marketing-tab--active' : '',
              ].filter(Boolean).join(' ')}
              onClick={() => setCurrentIndex(index)}
            >
              {/* Background fill animation */}
              <div
                className={`absolute inset-0 ${
                  index === currentIndex && !isPaused
                    ? 'animate-[fillProgress_6s_linear_infinite]'
                    : 'w-0'
                }`}
                style={{ backgroundColor: 'var(--color-accent)', opacity: 0.08 }}
              />
              {/* Button text */}
              <span className="relative z-10">{t(`infiniteCarousel.cards.${card.id}.title`)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Carousel */}
      <div className="relative overflow-hidden z-10">
        <div
          className="flex gap-4 transition-transform duration-500 ease-in-out"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          style={{
            transform: `translateX(calc(50vw - 480px - ${currentIndex * 984}px))`
          }}
        >
          {carouselData.map((card) => (
            <div
              key={card.id}
              className="marketing-panel-raised flex-shrink-0 w-[960px] h-[560px] relative overflow-hidden group cursor-pointer"
            >
              {/* Background image */}
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url(${card.backgroundImage})`
                }}
              ></div>

              {/* Background pattern/mockup */}
              <div className="absolute inset-0 opacity-20">
                {card.id === '1' && (
                  <div className="absolute bottom-10 left-6 right-6 h-32 flex items-end justify-center">
                    <div className="grid grid-cols-4 gap-2 p-4 w-full">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-8 bg-white/20"></div>
                      ))}
                    </div>
                  </div>
                )}
                {card.id === '2' && (
                  <div className="absolute inset-6 border border-white/20">
                    <div className="absolute inset-4 grid grid-cols-4 gap-4">
                      <div className="bg-white/10 flex items-center justify-center text-xs text-white/60">QUERY</div>
                      <div className="bg-white/10 flex items-center justify-center text-xs text-white/60">EXPLORE</div>
                      <div className="bg-white/10 flex items-center justify-center text-xs text-white/60">COMPILE</div>
                      <div className="bg-white/10 flex items-center justify-center text-xs text-white/60">EXECUTE</div>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 h-20" style={{ background: 'linear-gradient(to right, rgba(0,171,230,0.2), rgba(45,212,191,0.2))' }} />
                  </div>
                )}
                {card.id === '3' && (
                  <div className="absolute inset-6">
                    <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, rgba(0,171,230,0.15) 0%, transparent 50%, rgba(45,212,191,0.15) 100%)' }} />
                  </div>
                )}
                {(card.id === '4' || card.id === '5') && (
                  <div className="absolute inset-6 border border-white/10 flex items-center justify-center">
                    <div className="w-20 h-20 border-2 border-white/20 flex items-center justify-center">
                      <div className="w-10 h-10 bg-white/10"></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/45 group-hover:bg-black/30 transition-colors duration-300"></div>

              {/* Label */}
              <div className="absolute bottom-0 left-0 right-0 p-6" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.94) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)' }}>
                <p className="type-label marketing-text-dim mb-2">{t(`infiniteCarousel.cards.${card.id}.title`)}</p>
                <h3 className="type-heading-s marketing-text-primary">{t(`infiniteCarousel.cards.${card.id}.subtitle`)}</h3>
              </div>

              {/* Hover glow effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(to top, rgba(0,171,230,0.15), transparent)' }} />
            </div>
          ))}
        </div>
      </div>
    </MarketingSection>
  );
}
