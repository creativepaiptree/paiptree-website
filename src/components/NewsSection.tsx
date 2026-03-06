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
    <section className="pt-32 pb-16 relative overflow-hidden" style={sectionStyle}>
      <div className="absolute inset-0 bg-black/40" />

      <div className="container-max px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {loading ? (
            <p className="text-white/50 animate-pulse">뉴스를 불러오는 중...</p>
          ) : !current ? (
            <p className="text-white/50">뉴스를 불러올 수 없습니다.</p>
          ) : (
            <>
              {/* Current News Item */}
              <div className="mb-8">
                <h2 className="text-4xl md:text-5xl font-medium text-white mb-4 leading-tight min-h-[4rem] flex items-center justify-center">
                  <span className="line-clamp-2">{current.title}</span>
                </h2>
                <p className="text-sm text-white/40 mb-6 tracking-wide uppercase">
                  {current.category} · {formatDate(current.upload_date)}
                </p>
                <p className="text-lg text-white/70 leading-relaxed max-w-3xl mx-auto line-clamp-3">
                  {current.description}
                </p>
              </div>

              {/* CTA */}
              <Link
                href={current.original_url}
                className="inline-block mb-8 border border-white/30 text-white text-sm px-8 py-3 hover:bg-white/10 transition-colors duration-200"
              >
                기사 전문 보기
              </Link>

              {/* Dot Indicators */}
              <div className="flex justify-center gap-3">
                {newsItems.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    aria-label={`슬라이드 ${index + 1}`}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      index === currentIndex ? 'bg-white scale-125' : 'bg-white/30 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
