// src/components/NewsSection.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchLatestNews, NewsItem } from '@/lib/googleSheets';
import { useTranslation } from '@/hooks/useTranslation';
import AboutSectionHeader from '@/components/AboutSectionHeader';
import MarketingSection from '@/components/site/MarketingSection';

const NewsSection = () => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadNews = async () => {
      try {
        setLoading(true);
        const data = await fetchLatestNews();
        setNewsItems(data);
      } catch (error) {
        console.error('Failed to load news:', error);
        // 폴백 데이터
        setNewsItems([
          {
            id: '1',
            title: 'AI 기반 자동화 플랫폼의 미래',
            description: '인공지능 기술을 통한 기업 자동화의 새로운 패러다임을 제시하며, 효율성과 생산성을 극대화하는 솔루션을 개발했습니다.',
            category: 'AI',
            tags: 'AI, 자동화',
            upload_date: '2025-07-25',
            download_count: '0',
            thumbnail_url: '',
            original_url: '/news/ai-automation-platform'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    loadNews();
  }, []);

  useEffect(() => {
    if (newsItems.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % newsItems.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [newsItems.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const current = newsItems[currentIndex];
  const orderedNewsItems = newsItems.length
    ? newsItems.map((_, offset) => {
        const index = (currentIndex + offset) % newsItems.length;
        return {
          item: newsItems[index],
          originalIndex: index,
        };
      })
    : [];
  const visibleNewsItems = orderedNewsItems.slice(0, 4);
  const previewOpacity = [1, 0.72, 0.48, 0.28];

  return (
    <MarketingSection surface="surface">
      <AboutSectionHeader
        number="/06"
        label="NEWSROOM"
        title={t('news.sectionTitle')}
        description={t('news.sectionDescription')}
      />

      <div className="relative">
        <div
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-24 md:block z-10"
          style={{
            background: 'linear-gradient(to right, rgba(15,15,15,0), rgba(15,15,15,0.72) 55%, var(--color-bg-surface) 100%)',
          }}
        />

        <div
          className="overflow-hidden"
          style={{
            maskImage: 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 78%, rgba(0,0,0,0.35) 92%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 78%, rgba(0,0,0,0.35) 92%, rgba(0,0,0,0) 100%)',
          }}
        >
          <div className="flex items-stretch gap-4 md:gap-6">
            {loading ? (
              <div className="marketing-panel-raised w-full max-w-4xl p-8 md:p-12">
                <p className="type-body-s marketing-text-dim">뉴스를 불러오는 중...</p>
              </div>
            ) : !current ? (
              <div className="marketing-panel-raised w-full max-w-4xl p-8 md:p-12">
                <p className="type-body-s marketing-text-dim">뉴스를 불러올 수 없습니다.</p>
              </div>
            ) : (
              visibleNewsItems.map(({ item, originalIndex }, orderedIndex) => {
                const isPrimary = orderedIndex === 0;
                const cardWidthClassName = isPrimary
                  ? 'w-[min(82vw,38rem)] md:w-[38rem] lg:w-[40rem]'
                  : 'w-[min(62vw,20rem)] md:w-[20rem] lg:w-[22rem]';
                const headlineClassName = isPrimary ? 'type-heading-m' : 'type-heading-s';
                const bodyClassName = isPrimary ? 'type-body' : 'type-body-s';
                const cardOpacity = previewOpacity[Math.min(orderedIndex, previewOpacity.length - 1)];

                return (
                  <article
                    key={`${item.id}-${orderedIndex}`}
                    className={`marketing-panel-raised ${cardWidthClassName} flex-shrink-0 p-7 md:p-8 lg:p-10`}
                    style={{ opacity: cardOpacity }}
                  >
                    <div className="flex h-full flex-col">
                      <div className="mb-8">
                        <p className="type-label marketing-text-dim marketing-meta-tight mb-4">
                          {item.category} · {formatDate(item.upload_date)}
                        </p>
                        <h3 className={`${headlineClassName} marketing-text-primary ${isPrimary ? 'mb-5' : 'mb-4'} line-clamp-3`}>
                          {item.title}
                        </h3>
                        <p className={`${bodyClassName} marketing-text-sub ${isPrimary ? 'line-clamp-4' : 'line-clamp-5'}`}>
                          {item.description}
                        </p>
                      </div>

                      <div className="mt-auto flex items-center justify-between gap-4">
                        {isPrimary ? (
                          <Link href={item.original_url} className="btn-site-link marketing-link-subtle">
                            기사 전문 보기
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                          </Link>
                        ) : (
                          <button
                            type="button"
                            onClick={() => goToSlide(originalIndex)}
                            className="btn-site-link marketing-link-subtle"
                          >
                            이 기사 보기
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                          </button>
                        )}

                        <span className="type-mono marketing-text-dim whitespace-nowrap">
                          {String(orderedIndex + 1).padStart(2, '0')}
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>

        <div className="mt-8 flex items-center gap-2">
          {newsItems.map((item, index) => (
            <button
              key={item.id ?? index}
              onClick={() => goToSlide(index)}
              aria-label={`슬라이드 ${index + 1}`}
              className="transition-all duration-300"
              style={{
                width: index === currentIndex ? '24px' : '6px',
                height: '1px',
                background: index === currentIndex ? 'var(--color-accent)' : 'rgba(255,255,255,0.25)',
              }}
            />
          ))}
        </div>
      </div>
    </MarketingSection>
  );
};

export default NewsSection;
