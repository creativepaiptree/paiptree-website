// src/components/NewsSection.tsx
'use client';

import Button from './ui/Button';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';

const NewsSection = () => {
  const { t } = useTranslation();
  
  const newsItems = [
    {
      key: 'item1',
      title: t('news.items.item1.title'),
      date: t('news.items.item1.date'),
      link: '/news/stable-diffusion-3-5-tensorrt',
    },
    {
      key: 'item2',
      title: t('news.items.item2.title'),
      date: t('news.items.item2.date'),
      link: '/news/stable-video-4d-2-0',
    },
    {
      key: 'item3',
      title: t('news.items.item3.title'),
      date: t('news.items.item3.date'),
      link: '/news/stability-ai-arm-collaboration',
    },
  ];

  return (
    <section className="py-16 bg-black">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-medium tracking-tight">{t('news.title')}</h2>
          <Link href="/news">
            <Button variant="secondary">{t('news.viewAll')}</Button>
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-10">
          {newsItems.map((item, index) => (
            <Link href={item.link} key={item.key} className="group cursor-pointer">
              <div className="border-t border-gray-800 pt-6 hover:border-gray-700 transition-colors duration-300">
                <p className="text-gray-500 text-sm mb-3 font-medium">{item.date}</p>
                <h3 className="text-lg leading-tight group-hover:text-gray-300 transition-colors duration-300">{item.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
