// src/app/newsroom/page.tsx
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { fetchNewsData } from '@/lib/googleSheets';

const formatDate = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

export default async function NewsroomPage() {
  const newsItems = await fetchNewsData();

  return (
    <LanguageProvider>
      <div className="min-h-screen text-white overflow-x-hidden" style={{ background: 'var(--color-bg)' }}>
        <Header />
        <main className="pt-14">

          {/* Hero */}
          <section className="py-24" style={{ borderBottom: '1px solid var(--color-line)' }}>
            <div className="container-max px-6">
              <div className="flex items-center gap-3 mb-10">
                <span className="type-label" style={{ color: 'var(--color-text-dim)' }}>PAIPTREE</span>
                <span className="w-8 h-px" style={{ background: 'var(--color-line-mid)' }} />
                <span className="type-label" style={{ color: 'var(--color-text-dim)' }}>NEWSROOM</span>
              </div>
              <h1 className="type-display mb-6" style={{ color: 'var(--color-text)', maxWidth: '820px' }}>
                Paiptree 뉴스룸
              </h1>
              <p className="type-body" style={{ color: 'var(--color-text-sub)', maxWidth: '480px' }}>
                Paiptree의 최신 소식, 파트너십, 기술 업데이트를 확인하세요.
              </p>
            </div>
          </section>

          {/* News List */}
          <section className="py-24">
            <div className="container-max px-6">
              <div className="flex items-center gap-3 mb-16">
                <span className="type-label" style={{ color: 'var(--color-text-dim)' }}>/01</span>
                <span className="w-6 h-px" style={{ background: 'var(--color-line-mid)' }} />
                <span className="type-label" style={{ color: 'var(--color-text-dim)' }}>LATEST NEWS</span>
              </div>

              {newsItems.length === 0 ? (
                <p className="type-body-s" style={{ color: 'var(--color-text-dim)' }}>
                  뉴스를 불러올 수 없습니다.
                </p>
              ) : (
                <div>
                  {newsItems.map((item, i) => (
                    <a
                      key={item.id}
                      href={item.original_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col md:flex-row md:items-start md:gap-12 py-8 group"
                      style={{
                        borderTop: '1px solid var(--color-line)',
                        borderBottom: i === newsItems.length - 1 ? '1px solid var(--color-line)' : undefined,
                      }}
                    >
                      {/* Date + Category */}
                      <div className="flex-shrink-0 md:w-48 mb-3 md:mb-0">
                        <p className="type-label mb-1" style={{ color: 'var(--color-text-dim)' }}>
                          {item.category}
                        </p>
                        <p className="type-mono" style={{ color: 'var(--color-text-dim)' }}>
                          {formatDate(item.upload_date)}
                        </p>
                      </div>

                      {/* Title + Description */}
                      <div className="flex-1">
                        <h3
                          className="type-heading-s mb-2 transition-opacity duration-200 group-hover:opacity-60"
                          style={{ color: 'var(--color-text)' }}
                        >
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className="type-body-s line-clamp-2" style={{ color: 'var(--color-text-sub)' }}>
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* Arrow */}
                      <div className="hidden md:block flex-shrink-0 pt-1">
                        <svg
                          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                          className="transition-transform duration-200 group-hover:translate-x-1"
                          style={{ color: 'var(--color-text-dim)' }}
                        >
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Press Contact */}
          <section className="py-24" style={{ background: 'var(--color-bg-surface)', borderTop: '1px solid var(--color-line)' }}>
            <div className="container-max px-6">
              <div className="flex items-center gap-3 mb-12">
                <span className="type-label" style={{ color: 'var(--color-text-dim)' }}>/02</span>
                <span className="w-6 h-px" style={{ background: 'var(--color-line-mid)' }} />
                <span className="type-label" style={{ color: 'var(--color-text-dim)' }}>PRESS CONTACT</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0" style={{ border: '1px solid var(--color-line)' }}>
                <div className="p-10" style={{ borderRight: '1px solid var(--color-line)' }}>
                  <h3 className="type-body-s mb-2" style={{ color: 'var(--color-text)', fontWeight: 600 }}>미디어 문의</h3>
                  <p className="type-body-s mb-6" style={{ color: 'var(--color-text-sub)' }}>
                    보도 자료, 인터뷰 및 미디어 관련 문의
                  </p>
                  <a href="mailto:press@paiptree.com" className="btn-site-link" style={{ color: 'var(--color-text-sub)' }}>
                    press@paiptree.com
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
                <div className="p-10">
                  <h3 className="type-body-s mb-2" style={{ color: 'var(--color-text)', fontWeight: 600 }}>일반 문의</h3>
                  <p className="type-body-s mb-6" style={{ color: 'var(--color-text-sub)' }}>
                    파트너십, 도입 상담 및 기타 문의
                  </p>
                  <a href="mailto:hello@paiptree.com" className="btn-site-link" style={{ color: 'var(--color-text-sub)' }}>
                    hello@paiptree.com
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </section>

        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
}
