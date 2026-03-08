'use client';

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

const copy = {
  ko: {
    blogLabel: 'Blog',
    links: [
      { label: '회사 소개', href: '/about' },
      { label: '뉴스룸', href: '/newsroom' },
      { label: '채용', href: '/careers' },
    ],
  },
  en: {
    blogLabel: 'Blog',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Newsroom', href: '/newsroom' },
      { label: 'Careers', href: '/careers' },
    ],
  },
} as const;

export default function BlogHeader() {
  const { language, toggleLanguage } = useLanguage();
  const content = copy[language];

  return (
    <header className="blog-header-shell">
      <nav className="container-max px-6">
        <div className="blog-header-inner">
          <div className="blog-header-brand">
            <Link href="/blog" className="blog-header-logo">
              paiptree.
            </Link>
            <span className="blog-header-divider" aria-hidden="true" />
            <span className="blog-header-label">{content.blogLabel}</span>
          </div>

          <div className="blog-header-actions">
            <div className="blog-header-links">
              {content.links.map((item) => (
                <Link key={item.href} href={item.href} className="blog-header-link">
                  {item.label}
                </Link>
              ))}
            </div>
            <button type="button" className="blog-header-lang" onClick={toggleLanguage}>
              {language === 'ko' ? 'EN' : 'KO'}
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
