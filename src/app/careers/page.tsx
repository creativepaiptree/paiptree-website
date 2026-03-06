// src/app/careers/page.tsx
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { LanguageProvider } from '@/contexts/LanguageContext';

const jobOpenings = [
  {
    title: 'AI 연구 엔지니어',
    department: 'Research',
    location: '서울',
    type: '정규직',
    description: '양계 데이터 기반 예측 모델 연구 및 FarmersMind 고도화를 담당합니다.',
  },
  {
    title: '백엔드 엔지니어',
    department: 'Engineering',
    location: '서울',
    type: '정규직',
    description: '농장 데이터 수집·처리 파이프라인과 API 플랫폼을 개발합니다.',
  },
  {
    title: '프로덕트 매니저',
    department: 'Product',
    location: '서울',
    type: '정규직',
    description: 'FarmersMind 플랫폼의 로드맵과 고객 경험을 주도합니다.',
  },
  {
    title: '농업 도메인 전문가',
    department: 'Domain',
    location: '서울·현장',
    type: '정규직',
    description: '양계 농가와의 협업을 통해 현장 데이터와 제품 방향을 연결합니다.',
  },
  {
    title: '프론트엔드 엔지니어',
    department: 'Engineering',
    location: '서울',
    type: '정규직',
    description: '농장 운영자가 사용하는 대시보드와 모바일 인터페이스를 개발합니다.',
  },
];

const benefits = [
  { label: '경쟁력 있는 급여', note: '스톡옵션 포함' },
  { label: '유연 근무제', note: '자율 출퇴근' },
  { label: '학습·개발 지원', note: '컨퍼런스·도서 지원' },
  { label: '건강 보험', note: '본인·가족 포함' },
  { label: '성과 보너스', note: '반기 지급' },
  { label: '최신 장비 지원', note: '맥북·모니터' },
];

const steps = [
  { num: '01', title: '서류 지원', desc: '이력서와 포트폴리오를 제출합니다.' },
  { num: '02', title: '1차 인터뷰', desc: '팀 리드와 30분 화상 미팅을 진행합니다.' },
  { num: '03', title: '과제·기술 인터뷰', desc: '직무 관련 과제 또는 기술 면접을 진행합니다.' },
  { num: '04', title: '최종 합류', desc: '오퍼 수락 후 온보딩을 시작합니다.' },
];

export default function CareersPage() {
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
                <span className="type-label" style={{ color: 'var(--color-text-dim)' }}>CAREERS</span>
              </div>
              <h1 className="type-display mb-6" style={{ color: 'var(--color-text)', maxWidth: '820px' }}>
                농업의 미래를<br />함께 만들어갑니다
              </h1>
              <p className="type-body" style={{ color: 'var(--color-text-sub)', maxWidth: '480px' }}>
                Paiptree는 AI와 데이터로 양계 산업의 구조적 문제를 해결합니다.
                함께할 사람을 찾고 있습니다.
              </p>
            </div>
          </section>

          {/* Job Openings */}
          <section className="py-24" style={{ background: 'var(--color-light-bg)' }}>
            <div className="container-max px-6">
              <div className="flex items-center gap-3 mb-16">
                <span className="type-label" style={{ color: 'var(--color-light-text-sub)' }}>/01</span>
                <span className="w-6 h-px" style={{ background: 'var(--color-light-line)' }} />
                <span className="type-label" style={{ color: 'var(--color-light-text-sub)' }}>OPEN POSITIONS</span>
              </div>
              <div>
                {jobOpenings.map(({ title, department, location, type, description }, i) => (
                  <div
                    key={title}
                    className="flex flex-col md:flex-row md:items-center md:gap-12 py-8 group"
                    style={{
                      borderTop: '1px solid var(--color-light-line)',
                      borderBottom: i === jobOpenings.length - 1 ? '1px solid var(--color-light-line)' : undefined,
                    }}
                  >
                    <div className="md:w-48 flex-shrink-0 mb-3 md:mb-0">
                      <span className="type-label" style={{ color: 'var(--color-light-text-sub)' }}>{department}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="type-heading-s mb-1" style={{ color: 'var(--color-light-text)' }}>{title}</h3>
                      <p className="type-body-s" style={{ color: 'var(--color-light-text-sub)' }}>{description}</p>
                    </div>
                    <div className="md:w-40 flex-shrink-0 mt-3 md:mt-0 flex md:flex-col items-center md:items-end gap-2">
                      <span className="type-label" style={{ color: 'var(--color-light-text-sub)' }}>{location}</span>
                      <span className="type-label" style={{ color: 'var(--color-light-text-sub)' }}>{type}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="type-body-s mt-8" style={{ color: 'var(--color-light-text-sub)' }}>
                원하는 포지션이 없으신가요?{' '}
                <a href="mailto:team@paiptree.com" className="underline" style={{ color: 'var(--color-light-text)' }}>
                  이력서를 보내주세요
                </a>
              </p>
            </div>
          </section>

          {/* Benefits */}
          <section className="py-24" style={{ background: 'var(--color-bg)' }}>
            <div className="container-max px-6">
              <div className="flex items-center gap-3 mb-16">
                <span className="type-label" style={{ color: 'var(--color-text-dim)' }}>/02</span>
                <span className="w-6 h-px" style={{ background: 'var(--color-line-mid)' }} />
                <span className="type-label" style={{ color: 'var(--color-text-dim)' }}>BENEFITS</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-0" style={{ border: '1px solid var(--color-line)' }}>
                {benefits.map(({ label, note }, i) => (
                  <div
                    key={label}
                    className="p-8"
                    style={{
                      borderRight: (i + 1) % 3 !== 0 ? '1px solid var(--color-line)' : undefined,
                      borderBottom: i < 3 ? '1px solid var(--color-line)' : undefined,
                    }}
                  >
                    <p className="type-body-s mb-1" style={{ color: 'var(--color-text)' }}>{label}</p>
                    <p className="type-label" style={{ color: 'var(--color-text-dim)' }}>{note}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Process */}
          <section className="py-24" style={{ background: 'var(--color-bg-surface)', borderTop: '1px solid var(--color-line)', borderBottom: '1px solid var(--color-line)' }}>
            <div className="container-max px-6">
              <div className="flex items-center gap-3 mb-16">
                <span className="type-label" style={{ color: 'var(--color-text-dim)' }}>/03</span>
                <span className="w-6 h-px" style={{ background: 'var(--color-line-mid)' }} />
                <span className="type-label" style={{ color: 'var(--color-text-dim)' }}>PROCESS</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
                {steps.map(({ num, title, desc }, i) => (
                  <div
                    key={num}
                    className="p-6"
                    style={{ borderLeft: i > 0 ? '1px solid var(--color-line)' : undefined }}
                  >
                    <span className="type-mono block mb-4" style={{ color: 'var(--color-accent)' }}>{num}</span>
                    <h3 className="type-body-s font-semibold mb-2" style={{ color: 'var(--color-text)' }}>{title}</h3>
                    <p className="type-body-s" style={{ color: 'var(--color-text-sub)' }}>{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-24" style={{ background: 'var(--color-bg)' }}>
            <div className="container-max px-6">
              <h2 className="type-heading-l mb-4" style={{ color: 'var(--color-text)', maxWidth: '560px' }}>
                함께 농업의 미래를 만들어갈 준비가 되셨나요?
              </h2>
              <p className="type-body mb-10" style={{ color: 'var(--color-text-sub)', maxWidth: '400px' }}>
                열린 포지션이 없더라도 언제든 연락 주세요.
              </p>
              <div className="flex gap-3">
                <a href="mailto:team@paiptree.com" className="btn-site-primary">
                  이력서 보내기
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </a>
                <Link href="/culture" className="btn-site-ghost">
                  컬처 보기
                </Link>
              </div>
            </div>
          </section>

        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
}
