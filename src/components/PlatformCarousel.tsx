'use client';

import { useState, useCallback, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function PlatformCarousel() {
  const { t } = useTranslation();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: false,
    align: 'center',
    skipSnaps: false
  });

  const tabs = [
    { key: 'realtime', image: '/p1.png' },
    { key: 'dispatch', image: '/p2.png' },
    { key: 'temperature', image: '/p3.png' },
    { key: 'analytics', image: '/p4.png' }
  ];

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <section className="bg-[#F4F9FF]">
      <div className="lg:pt-[140px] lg:pb-[160px] pt-[60px] pb-[80px] flex flex-col items-center">
        {/* Header */}
        <div className="text-center mb-8 lg:mb-[60px]">
          <p className="text-sm font-bold tracking-wide uppercase text-gray-500 mb-4">
            {t('tms.platform.badge')}
          </p>
          <h2 className="text-3xl md:text-3xl font-bold text-gray-900">
            {t('tms.platform.title')}
          </h2>
        </div>

        {/* Tabs */}
        <div className="w-full lg:px-0 px-5">
          <div className="flex xl:w-[60%] w-full mx-auto mb-[30px]">
            {tabs.map((tab, index) => (
              <button
                key={tab.key}
                onClick={() => scrollTo(index)}
                className={`h-[48px] flex-1 box-border relative border-b transition-all ${
                  selectedIndex === index
                    ? 'text-[#1C1D23] border-b-[3px] border-[#1C48CD]'
                    : 'text-[#737783] border-[#D5D8E1]'
                }`}
              >
                <p className="xl:text-xl tracking-[-0.32px] text-base font-semibold absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap">
                  {t(`tms.platform.tabs.${tab.key}`)}
                </p>
              </button>
            ))}
          </div>

          {/* Carousel */}
          <div className="relative">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex">
                {tabs.map((tab, index) => (
                  <div
                    key={tab.key}
                    className="xl:basis-[60%] basis-[100%] flex-[0_0_auto] min-w-0"
                  >
                    <div className="xl:h-[600px] xl:aspect-auto aspect-[335/183] flex items-center justify-center">
                      <img
                        alt={t(`tms.platform.tabs.${tab.key}`)}
                        src={tab.image}
                        className="w-full max-w-[996px] object-contain shadow-[10px_10px_30px_0px_rgba(97,121,148,0.1)] rounded-lg"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Arrows */}
            <div className="absolute top-1/2 -translate-y-1/2 w-[75%] left-1/2 -translate-x-1/2 justify-between pointer-events-none xl:flex hidden">
              <button
                onClick={scrollPrev}
                className="w-[42px] h-[42px] rounded-full bg-[#535861B2] flex items-center justify-center pointer-events-auto hover:bg-[#535861] transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="18" viewBox="0 0 10 18" fill="none">
                  <path d="M10 16.5289L8.51275 18L0.412044 9.98258C0.281465 9.85411 0.177836 9.70134 0.107121 9.53307C0.0364052 9.3648 0 9.18434 0 9.00208C0 8.81983 0.0364052 8.63937 0.107121 8.4711C0.177836 8.30282 0.281465 8.15006 0.412044 8.02159L8.51275 0L9.9986 1.47109L2.39552 9L10 16.5289Z" fill="white" />
                </svg>
              </button>
              <button
                onClick={scrollNext}
                className="w-[42px] h-[42px] rounded-full bg-[#535861B2] flex items-center justify-center pointer-events-auto hover:bg-[#535861] transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="18" viewBox="0 0 10 18" fill="none">
                  <path d="M0 16.5289L1.48725 18L9.58796 9.98258C9.71853 9.85411 9.82216 9.70134 9.89288 9.53307C9.96359 9.3648 10 9.18434 10 9.00208C10 8.81983 9.96359 8.63937 9.89288 8.4711C9.82216 8.30282 9.71853 8.15006 9.58796 8.02159L1.48725 0L0.0014019 1.47109L7.60448 9L0 16.5289Z" fill="white" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
