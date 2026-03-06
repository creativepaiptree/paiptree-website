// src/app/services/page.tsx
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { LanguageProvider } from '@/contexts/LanguageContext';

const platforms = [
  {
    num: '/0.1',
    name: 'FarmersMind',
    tagline: 'AI 농장 운영 에이전트',
    description:
      'CCTV·IoT 센서 데이터를 실시간 분석해 체중·건강·환경 지표를 디지털 트윈으로 제공합니다. 이상 감지, 출하 예측, 사료 계획까지 하나의 운영 화면에서 자동화합니다.',
    features: ['실시간 체중·체형 분석', '환경 이상 감지 알림', '출하 일정 자동 예측'],
    href: '/services',
  },
  {
    num: '/0.2',
    name: 'SCM',
    tagline: '공급망 계획 플랫폼',
    description:
      '판매 예측과 사료 입출고 데이터를 기반으로 생산·배송·사료 계획을 자동 제안합니다. 수요 기반 스케줄링으로 재고 낭비와 물류 지연을 줄입니다.',
    features: ['수요 기반 생산 스케줄링', '사료 입출고 최적화', '물류 경로 자동 제안'],
    href: '/services',
  },
  {
    num: '/0.3',
    name: 'TmS',
    tagline: '개체 추적 & ESG 관리',
    description:
      '개체 이력·백신·도계 로그를 통합해 추적성과 ESG·HACCP 보고서를 자동 작성합니다. 글로벌 공급망 파트너와의 데이터 공유도 지원합니다.',
    features: ['개체별 이력 추적', 'ESG·HACCP 자동 보고', '글로벌 파트너 데이터 연동'],
    href: '/tms',
  },
];

export default function ServicesPage() {
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
                <span className="type-label" style={{ color: 'var(--color-text-dim)' }}>PLATFORM</span>
              </div>
              <h1 className="type-display mb-6" style={{ color: 'var(--color-text)', maxWidth: '820px' }}>
                양계 밸류체인을 연결하는<br />AI 운영 플랫폼
              </h1>
              <p className="type-body mb-10" style={{ color: 'var(--color-text-sub)', maxWidth: '480px' }}>
                농장·공급망·품질 관리를 단일 데이터 파이프라인으로 통합합니다.
                Paiptree의 세 가지 플랫폼이 협력해 의사결정을 자동화합니다.
              </p>
              <Link href="/careers" className="btn-site-primary">
                도입 상담 요청
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </section>

          {/* Platform List */}
          <section className="py-24" style={{ background: 'var(--color-light-bg)' }}>
            <div className="container-max px-6">
              <div className="flex items-center gap-3 mb-16">
                <span className="type-label" style={{ color: 'var(--color-light-text-sub)' }}>/01</span>
                <span className="w-6 h-px" style={{ background: 'var(--color-light-line)' }} />
                <span className="type-label" style={{ color: 'var(--color-light-text-sub)' }}>PLATFORMS</span>
              </div>
              <div>
                {platforms.map(({ num, name, tagline, description, features, href }, i) => (
                  <div
                    key={name}
                    className="py-16"
                    style={{
                      borderTop: '1px solid var(--color-light-line)',
                      borderBottom: i === platforms.length - 1 ? '1px solid var(--color-light-line)' : undefined,
                    }}
                  >
                    <div className="flex flex-col lg:flex-row lg:gap-16">
                      <div className="flex-shrink-0 mb-6 lg:mb-0 lg:w-64">
                        <span className="type-mono block mb-3" style={{ color: 'var(--color-light-text-sub)' }}>{num}</span>
                        <h2 className="type-heading-l" style={{ color: 'var(--color-light-text)', letterSpacing: '-0.04em' }}>{name}</h2>
                        <p className="type-label mt-2" style={{ color: 'var(--color-light-text-sub)' }}>{tagline}</p>
                      </div>
                      <div className="flex-1 lg:max-w-xl">
                        <p className="type-body mb-8" style={{ color: 'var(--color-light-text-sub)' }}>{description}</p>
                        <ul className="space-y-3 mb-8">
                          {features.map((f) => (
                            <li key={f} className="flex items-center gap-3">
                              <span className="w-4 h-px flex-shrink-0" style={{ background: 'var(--color-light-line)' }} />
                              <span className="type-body-s" style={{ color: 'var(--color-light-text)' }}>{f}</span>
                            </li>
                          ))}
                        </ul>
                        <Link href={href} className="btn-site-link" style={{ color: 'var(--color-light-text-sub)' }}>
                          자세히 보기
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-24" style={{ background: 'var(--color-bg)' }}>
            <div className="container-max px-6">
              <div className="flex items-center gap-3 mb-12">
                <span className="type-label" style={{ color: 'var(--color-text-dim)' }}>/02</span>
                <span className="w-6 h-px" style={{ background: 'var(--color-line-mid)' }} />
                <span className="type-label" style={{ color: 'var(--color-text-dim)' }}>GET STARTED</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0" style={{ border: '1px solid var(--color-line)' }}>
                <div className="p-10 md:p-14" style={{ borderRight: '1px solid var(--color-line)' }}>
                  <h2 className="type-heading-m mb-4" style={{ color: 'var(--color-text)' }}>도입 상담 요청</h2>
                  <p className="type-body-s mb-8" style={{ color: 'var(--color-text-sub)' }}>
                    전문 팀이 농장 환경에 맞는 최적의 솔루션을 제안합니다.
                  </p>
                  <Link href="/careers" className="btn-site-primary">
                    상담 신청
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
                <div className="p-10 md:p-14">
                  <h2 className="type-heading-m mb-4" style={{ color: 'var(--color-text)' }}>함께 만들어가기</h2>
                  <p className="type-body-s mb-8" style={{ color: 'var(--color-text-sub)' }}>
                    농업 AI의 미래를 함께 만들어갈 인재를 찾고 있습니다.
                  </p>
                  <Link href="/careers" className="btn-site-ghost">
                    채용 공고 보기
                  </Link>
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
