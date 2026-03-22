import Link from 'next/link';
import { fallbackNewsItems } from '@/content/siteContent';
import SectionEyebrow from './SectionEyebrow';

export type MarketingNewsItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  upload_date: string;
  original_url: string;
};

type LatestNewsSectionProps = {
  number?: string;
  heading: string;
  body?: string;
  items?: MarketingNewsItem[];
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const isExternalHref = (href: string) => /^https?:\/\//.test(href) || href.startsWith('mailto:');

export default function LatestNewsSection({
  number = '/07',
  heading,
  body,
  items,
}: LatestNewsSectionProps) {
  const newsItems = items && items.length > 0 ? items : [...fallbackNewsItems];

  return (
    <section
      className="py-24"
      style={{
        background: 'var(--color-bg-surface)',
        borderTop: '1px solid var(--color-line)',
      }}
    >
      <div className="container-max px-6">
        <SectionEyebrow number={number} label="NEWSROOM" tone="accent" className="mb-6" />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start">
          <div>
            <h2
              className="type-heading-l whitespace-pre-line mb-4"
              style={{ color: 'var(--color-text)', maxWidth: '18ch' }}
            >
              {heading}
            </h2>
            {body ? (
              <p
                className="type-body"
                style={{ color: 'var(--color-text-sub)', maxWidth: '34rem' }}
              >
                {body}
              </p>
            ) : null}
          </div>

          <div style={{ borderTop: '1px solid var(--color-line)' }}>
            {newsItems.slice(0, 3).map((item, index) => {
              const content = (
                <>
                  <div className="md:w-40 flex-shrink-0 mb-3 md:mb-0">
                    <p className="type-label mb-1" style={{ color: 'var(--color-text-dim)' }}>
                      {item.category}
                    </p>
                    <p className="type-mono" style={{ color: 'var(--color-text-dim)' }}>
                      {formatDate(item.upload_date)}
                    </p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className="type-heading-s mb-2"
                      style={{ color: 'var(--color-text)' }}
                    >
                      {item.title}
                    </h3>
                    <p className="type-body-s" style={{ color: 'var(--color-text-sub)' }}>
                      {item.description}
                    </p>
                  </div>
                  <div className="hidden md:flex items-start pt-1">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      style={{ color: 'var(--color-text-dim)' }}
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </>
              );

              const className =
                'group flex flex-col gap-4 py-8 md:flex-row md:gap-10 transition-colors duration-200';
              const style = {
                borderBottom:
                  index === newsItems.slice(0, 3).length - 1
                    ? '1px solid var(--color-line)'
                    : '1px solid var(--color-line)',
              };

              if (isExternalHref(item.original_url)) {
                return (
                  <a
                    key={item.id}
                    href={item.original_url}
                    target="_blank"
                    rel="noreferrer"
                    className={className}
                    style={style}
                  >
                    {content}
                  </a>
                );
              }

              return (
                <Link key={item.id} href={item.original_url} className={className} style={style}>
                  {content}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
