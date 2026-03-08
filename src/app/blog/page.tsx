'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import BlogHeader from '@/components/BlogHeader';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';

type BlogCategory = 'all' | 'brand' | 'development' | 'design' | 'business' | 'culture';
type PostCategory = Exclude<BlogCategory, 'all'>;

type BlogPost = {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  category: PostCategory;
  tags: string[];
  readTime: number;
  link?: string;
  thumbnail?: string;
  series?: string;
  highlight: string;
};

const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: '체리부로 TMS 도입 현황 및 서비스 방안',
    excerpt:
      '도입 범위, 운영 흐름, 현장 정착 포인트를 한 화면에서 정리한 문서형 아티클입니다. 파트너 온보딩 관점에서 어떤 정보 구조가 필요한지 함께 풀었습니다.',
    date: '2025-12-12',
    author: 'ZORO',
    category: 'business',
    tags: ['체리부로', 'TMS', '기술 검토'],
    readTime: 7,
    link: '/blog/1/cheriburo_tms_template.html',
    thumbnail: '/blog/1/frame-1.png',
    series: '파트너 온보딩',
    highlight: 'Field rollout',
  },
  {
    id: 2,
    title: '확장 가능한 농장 관리 플랫폼 구축하기',
    excerpt:
      '단일 대시보드에서 농장, 공급망, 운영 이벤트를 함께 다루기 위해 어떤 화면 계층과 데이터 경계를 잡았는지 정리합니다.',
    date: '2024-03-12',
    author: '이지은',
    category: 'development',
    tags: ['인프라', '확장성', '개발'],
    readTime: 6,
    highlight: 'Platform systems',
  },
  {
    id: 3,
    title: 'Paiptree 브랜드 리뉴얼 스토리',
    excerpt:
      '브랜드 메시지와 제품 UI를 같은 언어로 묶기 위해 바뀐 톤, 레이아웃, 타이포 시스템을 사례 중심으로 풀어낸 기록입니다.',
    date: '2024-03-10',
    author: '박서연',
    category: 'brand',
    tags: ['브랜딩', 'UX', '디자인'],
    readTime: 5,
    series: '브랜드 시스템',
    highlight: 'Brand refresh',
  },
  {
    id: 4,
    title: '데이터 기반 양계 농장 최적화',
    excerpt:
      '체중, 환경, 작업 이벤트를 한데 묶어 농장 운영의 병목을 발견하는 접근을 제품 관점과 현장 관점에서 함께 정리했습니다.',
    date: '2024-03-08',
    author: '정우진',
    category: 'business',
    tags: ['데이터', '최적화', '비즈니스'],
    readTime: 8,
    highlight: 'Operations intelligence',
  },
  {
    id: 5,
    title: '사용자 중심의 디자인 시스템 구축',
    excerpt:
      '마케팅 페이지와 운영 화면이 서로 다른 톤을 가져도 일관된 경험을 유지하게 만드는 디자인 토큰 구조를 설명합니다.',
    date: '2024-03-05',
    author: '조영연',
    category: 'design',
    tags: ['디자인시스템', 'UI/UX', '디자인'],
    readTime: 4,
    series: '디자인 시스템',
    highlight: 'Design language',
  },
  {
    id: 6,
    title: 'Paiptree의 성장 여정',
    excerpt:
      '도메인 이해, 빠른 실행, 현장 피드백이 어떤 방식으로 팀의 일하는 문화를 만들었는지 팀 관점에서 정리했습니다.',
    date: '2024-03-01',
    author: '최현우',
    category: 'culture',
    tags: ['스타트업', '성장', '문화'],
    readTime: 5,
    highlight: 'Team culture',
  },
];

const categoryOrder: BlogCategory[] = ['all', 'brand', 'development', 'design', 'business', 'culture'];

const copy = {
  ko: {
    blogLabel: 'Blog',
    introKicker: 'INSIGHTS',
    introTitle: '현장의 문제와 제품의 답을 기록합니다',
    introDescription:
      'Paiptree 팀이 농장 운영, 제품 설계, 브랜드 정리 과정에서 쌓아온 판단과 시행착오를 아카이브합니다.',
    showingLabel: '보이는 글',
    activeTagLabel: '선택한 태그',
    reset: '필터 초기화',
    aboutTitle: '블로그 소개',
    aboutDescription:
      '제품, 운영, 브랜딩, 문화까지 공개 사이트에 필요한 맥락을 문서처럼 읽히는 형태로 정리합니다.',
    aboutStats: [
      { label: '글 수', value: '6' },
      { label: '주제', value: '5' },
      { label: '라이브 링크', value: '1' },
    ],
    collectionTitle: '컬렉션',
    collectionDescription: '반복해서 다루는 주제를 묶어 빠르게 탐색할 수 있게 정리했습니다.',
    quickLinksTitle: '바로가기',
    tagsTitle: '태그',
    openPost: '글 열기',
    preparingPost: '발행 준비 중',
    readTimeUnit: '분 읽기',
    metaSeparator: '·',
    noResultTitle: '조건에 맞는 글이 없습니다.',
    noResultDescription: '카테고리 또는 태그를 초기화하면 전체 글 목록으로 돌아갑니다.',
    categories: {
      all: '전체',
      brand: '브랜드',
      development: '개발',
      design: '디자인',
      business: '비즈니스',
      culture: '문화',
    },
    collections: [
      { title: '파트너 온보딩', note: '도입 문서와 운영 정착 기록' },
      { title: '디자인 시스템', note: '마케팅과 제품 UI의 공통 규칙' },
      { title: '현장 운영 인텔리전스', note: '농장 데이터와 의사결정 구조' },
    ],
    quickLinks: [
      { label: '회사 소개', href: '/about' },
      { label: '서비스 보기', href: '/services' },
      { label: '뉴스룸', href: '/newsroom' },
      { label: '채용 정보', href: '/careers' },
    ],
  },
  en: {
    blogLabel: 'Blog',
    introKicker: 'INSIGHTS',
    introTitle: 'Writing down field problems and product answers',
    introDescription:
      'The Paiptree team archives decisions, tradeoffs, and operating context from farm operations, product work, and brand building.',
    showingLabel: 'Showing',
    activeTagLabel: 'Active tag',
    reset: 'Reset filters',
    aboutTitle: 'About this blog',
    aboutDescription:
      'We document product, operations, brand, and team context in long-form posts that support the public site.',
    aboutStats: [
      { label: 'Published', value: '6' },
      { label: 'Themes', value: '5' },
      { label: 'Live post', value: '1' },
    ],
    collectionTitle: 'Collections',
    collectionDescription: 'Recurring topics grouped into tracks for faster browsing.',
    quickLinksTitle: 'Quick links',
    tagsTitle: 'Tags',
    openPost: 'Open post',
    preparingPost: 'Preparing',
    readTimeUnit: 'min read',
    metaSeparator: '·',
    noResultTitle: 'No posts match the current filters.',
    noResultDescription: 'Reset the category or tag filter to return to the full list.',
    categories: {
      all: 'All',
      brand: 'Brand',
      development: 'Development',
      design: 'Design',
      business: 'Business',
      culture: 'Culture',
    },
    collections: [
      { title: 'Partner onboarding', note: 'Rollout docs and adoption notes' },
      { title: 'Design systems', note: 'Shared rules across marketing and product' },
      { title: 'Operational intelligence', note: 'Farm data and decision models' },
    ],
    quickLinks: [
      { label: 'About', href: '/about' },
      { label: 'Services', href: '/services' },
      { label: 'Newsroom', href: '/newsroom' },
      { label: 'Careers', href: '/careers' },
    ],
  },
} as const;

const formatDate = (date: string, locale: 'ko' | 'en') => {
  const formatter = new Intl.DateTimeFormat(locale === 'ko' ? 'ko-KR' : 'en-US', {
    year: 'numeric',
    month: locale === 'ko' ? 'long' : 'short',
    day: 'numeric',
  });

  return formatter.format(new Date(date));
};

export default function BlogPage() {
  const { language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<BlogCategory>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const content = copy[language];
  const filteredPosts = blogPosts.filter((post) => {
    const categoryMatch = selectedCategory === 'all' || post.category === selectedCategory;
    const tagMatch = !selectedTag || post.tags.includes(selectedTag);

    return categoryMatch && tagMatch;
  });

  const popularTags = Array.from(new Set(blogPosts.flatMap((post) => post.tags))).sort((left, right) =>
    left.localeCompare(right, language === 'ko' ? 'ko' : 'en'),
  );

  return (
    <div className="min-h-screen overflow-x-hidden blog-light-theme">
      <BlogHeader />

      <main className="blog-index-main">
        <section className="blog-index-categories">
          <div className="container-max px-6">
            <div className="blog-index-categories-row">
              {categoryOrder.map((category) => {
                const categoryCount =
                  category === 'all'
                    ? blogPosts.length
                    : blogPosts.filter((post) => post.category === category).length;
                const isActive = category === selectedCategory;

                return (
                  <button
                    key={category}
                    type="button"
                    className={`blog-index-category-pill ${isActive ? 'is-active' : ''}`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    <span>{content.categories[category]}</span>
                    <span className="blog-index-category-count">{categoryCount}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="blog-index-hero-section">
          <div className="container-max px-6">
            <div className="blog-index-intro">
              <div>
                <div className="blog-index-lead">
                  <span className="type-label blog-index-lead-number">/04</span>
                  <span className="blog-index-lead-line" aria-hidden="true" />
                  <span className="type-label blog-index-lead-kicker">{content.introKicker}</span>
                </div>
                <h1 className="blog-index-title">{content.introTitle}</h1>
                <p className="blog-index-description">{content.introDescription}</p>
              </div>
              <div className="blog-index-status">
                <div className="blog-index-status-card">
                  <span className="blog-index-status-label">{content.showingLabel}</span>
                  <strong>{filteredPosts.length}</strong>
                </div>
                <div className="blog-index-status-card">
                  <span className="blog-index-status-label">{content.activeTagLabel}</span>
                  <strong>{selectedTag ?? '-'}</strong>
                </div>
                {(selectedCategory !== 'all' || selectedTag) && (
                  <button
                    type="button"
                    className="blog-index-reset"
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedTag(null);
                    }}
                  >
                    {content.reset}
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="blog-index-shell">
          <div className="container-max px-6">
            <div className="blog-index-grid">
              <div className="blog-index-column">
                <div className="blog-index-list">
                  {filteredPosts.length === 0 ? (
                    <div className="blog-index-empty">
                      <h2>{content.noResultTitle}</h2>
                      <p>{content.noResultDescription}</p>
                    </div>
                  ) : (
                    filteredPosts.map((post) => {
                      const hasLink = Boolean(post.link);

                      return (
                        <article key={post.id} className="blog-index-card">
                          <div className="blog-index-card-copy">
                            <div className="blog-index-card-topline">
                              <span className="blog-index-card-category">
                                {content.categories[post.category]}
                              </span>
                              {post.series && (
                                <span className="blog-index-card-series">{post.series}</span>
                              )}
                              {!hasLink && (
                                <span className="blog-index-card-draft">{content.preparingPost}</span>
                              )}
                            </div>

                            <div className="blog-index-card-tags">
                              {post.tags.map((tag) => (
                                <button
                                  key={tag}
                                  type="button"
                                  className={`blog-index-tag ${selectedTag === tag ? 'is-active' : ''}`}
                                  onClick={() => setSelectedTag((current) => (current === tag ? null : tag))}
                                >
                                  #{tag}
                                </button>
                              ))}
                            </div>

                            <h2 className="blog-index-card-title">{post.title}</h2>
                            <p className="blog-index-card-excerpt">{post.excerpt}</p>

                            <div className="blog-index-card-meta">
                              <span>{post.author}</span>
                              <span>{content.metaSeparator}</span>
                              <time dateTime={post.date}>{formatDate(post.date, language)}</time>
                              <span>{content.metaSeparator}</span>
                              <span>
                                {post.readTime} {content.readTimeUnit}
                              </span>
                            </div>

                            {hasLink ? (
                              <a
                                href={post.link}
                                className="blog-index-card-cta"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {content.openPost}
                                <span aria-hidden="true">↗</span>
                              </a>
                            ) : (
                              <span className="blog-index-card-cta is-muted">{content.preparingPost}</span>
                            )}
                          </div>

                          <div className="blog-index-card-visual">
                            {post.thumbnail ? (
                              <div className="blog-index-card-media-frame">
                                <Image
                                  src={post.thumbnail}
                                  alt={`${post.title} thumbnail`}
                                  fill
                                  className="blog-index-card-image"
                                  sizes="(max-width: 900px) 100vw, 280px"
                                />
                              </div>
                            ) : (
                              <div className="blog-index-card-placeholder">
                                <span className="blog-index-card-highlight">{post.highlight}</span>
                                <p>{content.categories[post.category]}</p>
                              </div>
                            )}
                          </div>
                        </article>
                      );
                    })
                  )}
                </div>
              </div>

              <aside className="blog-index-aside">
                <div className="blog-index-aside-card">
                  <p className="blog-index-aside-kicker">{content.blogLabel}</p>
                  <h2>{content.aboutTitle}</h2>
                  <p>{content.aboutDescription}</p>
                  <div className="blog-index-stats">
                    {content.aboutStats.map((stat) => (
                      <div key={stat.label} className="blog-index-stat">
                        <span>{stat.label}</span>
                        <strong>{stat.value}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="blog-index-aside-card">
                  <h2>{content.collectionTitle}</h2>
                  <p>{content.collectionDescription}</p>
                  <div className="blog-index-collections">
                    {content.collections.map((collection) => (
                      <div key={collection.title} className="blog-index-collection-item">
                        <strong>{collection.title}</strong>
                        <span>{collection.note}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="blog-index-aside-card">
                  <h2>{content.tagsTitle}</h2>
                  <div className="blog-index-tag-cloud">
                    {popularTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        className={`blog-index-tag ${selectedTag === tag ? 'is-active' : ''}`}
                        onClick={() => setSelectedTag((current) => (current === tag ? null : tag))}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="blog-index-aside-card">
                  <h2>{content.quickLinksTitle}</h2>
                  <div className="blog-index-quick-links">
                    {content.quickLinks.map((item) => (
                      <Link key={item.href} href={item.href} className="blog-index-quick-link">
                        <span>{item.label}</span>
                        <span aria-hidden="true">→</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
