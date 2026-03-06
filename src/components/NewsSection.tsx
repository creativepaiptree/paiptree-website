// src/components/NewsSection.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchLatestNews, NewsItem } from '@/lib/googleSheets';

const sectionStyle = {
  backgroundImage: 'url("/news-bg.png")',
  backgroundColor: '#0a1219',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
} as const;

const NewsSection = () => {
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

  return (
    <section className="pt-24 pb-16 relative overflow-hidden" style={sectionStyle}>
      <div className="absolute inset-0 bg-black/50" />

      <div className="container-max px-6 relative z-10">
        {/* Eyebrow */}
        <div className="flex items-center gap-3 mb-16">
          <span className="type-label" style={{ color: 'var(--color-accent)' }}>/05</span>
          <span className="w-6 h-px" style={{ background: 'var(--color-accent)', opacity: 0.4 }} />
          <span className="type-label" style={{ color: 'var(--color-text-dim)' }}>NEWSROOM</span>
        </div>

        <div className="max-w-3xl">
          {loading ? (
            <p className="type-body-s" style={{ color: 'var(--color-text-dim)' }}>뉴스를 불러오는 중...</p>
          ) : !current ? (
            <p className="type-body-s" style={{ color: 'var(--color-text-dim)' }}>뉴스를 불러올 수 없습니다.</p>
          ) : (
            <>
              {/* Meta */}
              <p className="type-label mb-4" style={{ color: 'var(--color-text-dim)', letterSpacing: '0.1em' }}>
                {current.category} · {formatDate(current.upload_date)}
              </p>

              {/* Headline */}
              <h2 className="type-heading-l mb-6 line-clamp-2" style={{ color: 'var(--color-text)' }}>
                {current.title}
              </h2>

              {/* Description */}
              <p className="type-body mb-10 line-clamp-3" style={{ color: 'var(--color-text-sub)', maxWidth: '560px' }}>
                {current.description}
              </p>

              {/* CTA + Dots row */}
              <div className="flex items-center gap-8">
                <Link href={current.original_url} className="btn-site-link" style={{ color: 'var(--color-text-sub)' }}>
                  기사 전문 보기
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>

                <div className="flex items-center gap-2">
                  {newsItems.map((_, index) => (
                    <button
                      key={index}
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
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
