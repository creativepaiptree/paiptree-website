// src/components/NewsSection.tsx
'use client';

import { useState, useEffect } from 'react';
import Button from './ui/Button';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { fetchLatestNews, NewsItem } from '@/lib/googleSheets';

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

  if (loading) {
    return (
      <section className="pt-32 pb-16 relative overflow-hidden" 
               style={{
                 backgroundImage: 'url("/news-bg.png")',
                 backgroundColor: '#0a1219',
                 backgroundSize: 'cover',
                 backgroundPosition: 'center',
                 backgroundRepeat: 'no-repeat'
               }}>
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="container mx-auto px-6 max-w-4xl relative z-10">
          <div className="text-center text-white">
            <div className="animate-pulse">뉴스를 불러오는 중...</div>
          </div>
        </div>
      </section>
    );
  }

  if (newsItems.length === 0) {
    return (
      <section className="pt-32 pb-16 relative overflow-hidden" 
               style={{
                 backgroundImage: 'url("/news-bg.png")',
                 backgroundColor: '#0a1219',
                 backgroundSize: 'cover',
                 backgroundPosition: 'center',
                 backgroundRepeat: 'no-repeat'
               }}>
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="container mx-auto px-6 max-w-4xl relative z-10">
          <div className="text-center text-white">
            <div>뉴스를 불러올 수 없습니다.</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-32 pb-16 relative overflow-hidden" 
             style={{
               backgroundImage: 'url("/news-bg.png")',
               backgroundColor: '#0a1219',
               backgroundSize: 'cover',
               backgroundPosition: 'center',
               backgroundRepeat: 'no-repeat'
             }}>
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/40"></div>
      
      <div className="container mx-auto px-6 max-w-4xl relative z-10">
        <div className="text-center">
          {/* Current News Item */}
          <div className="mb-8">
            <h2 className="text-4xl md:text-5xl font-medium text-white mb-4 leading-tight h-16 md:h-20 flex items-center justify-center">
              <span className="line-clamp-2">{newsItems[currentIndex].title}</span>
            </h2>
            <p className="text-lg text-gray-400 mb-6">
              ({newsItems[currentIndex].category}, {formatDate(newsItems[currentIndex].upload_date)})
            </p>
            <p className="text-lg text-gray-300 leading-relaxed max-w-3xl mx-auto mb-4 h-24 flex items-start justify-center">
              <span className="line-clamp-3">{newsItems[currentIndex].description}</span>
            </p>
          </div>

          {/* View Details Button */}
          <Link href={newsItems[currentIndex].original_url}>
            <Button variant="outline" className="mb-6 border-white/30 text-white hover:bg-white/10 text-lg px-8 py-3">
              기사전문보기
            </Button>
          </Link>

          {/* Dot Indicators */}
          <div className="flex justify-center gap-3">
            {newsItems.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-white' 
                    : 'bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
