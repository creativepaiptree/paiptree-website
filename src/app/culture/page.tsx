// src/app/culture/page.tsx
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { LanguageProvider } from '@/contexts/LanguageContext';

const values = [
  {
    num: '/01',
    title: '혁신',
    description: '지속적인 혁신과 창의적인 문제 해결을 통해 가능성의 경계를 넓혀갑니다.',
  },
  {
    num: '/02',
    title: '협업',
    description: '다양한 관점과 열린 협업이 혁신적인 솔루션으로 이어진다고 믿습니다.',
  },
  {
    num: '/03',
    title: '성장',
    description: '개인과 조직 모두의 지속적인 학습과 발전을 장려합니다.',
  },
  {
    num: '/04',
    title: '임팩트',
    description: '농업 현장에서 실질적인 변화를 만드는 것이 우리의 가장 큰 목표입니다.',
  },
];

const benefits = [
  { category: '건강 & 웰니스', items: ['종합 건강 보험', '정신 건강 지원', '웰니스 지원금'] },
  { category: '워라밸', items: ['유연 근무제', '재택 근무 옵션', '자율 출퇴근'] },
  { category: '성장 & 개발', items: ['학습·개발 예산', '컨퍼런스 참가 지원', '사내 멘토링'] },
  { category: '금융 혜택', items: ['경쟁력 있는 급여', '스톡옵션', '성과 보너스'] },
];

const stories = [
  {
    name: '김서연',
    role: 'AI 연구 엔지니어',
    quote:
      '농장 데이터가 실제 의사결정으로 이어지는 순간을 직접 설계할 수 있습니다. 팀의 협업 문화가 탁월합니다.',
  },
  {
    name: '이준호',
    role: '프로덕트 매니저',
    quote:
      '혁신의 문화와 빠른 실행력 덕분에 아이디어가 실제 제품이 되는 속도를 직접 느낄 수 있습니다.',
  },
  {
    name: '박지민',
    role: '백엔드 엔지니어',
    quote:
      '복잡한 농업 도메인 문제를 기술로 풀어가는 과정이 매일 도전적이고 의미 있습니다.',
  },
];

export default function CulturePage() {
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
                <span className="type-label" style={{ color: 'var(--color-text-dim)' }}>CULTURE</span>
              </div>
              <h1 className="type-display mb-6" style={{ color: 'var(--color-text)', maxWidth: '820px' }}>
                함께 성장하는<br />문화를 만듭니다
              </h1>
              <p className="type-body" style={{ color: 'var(--color-text-sub)', maxWidth: '480px' }}>
                Paiptree는 위대한 기술은 위대한 사람들로부터 나온다고 믿습니다.
                혁신·협업·임팩트라는 공동의 미션 위에 문화를 세워갑니다.
              </p>
            </div>
          </section>

          {/* Values */}
          <section className="py-24" style={{ background: 'var(--color-light-bg)' }}>
            <div className="container-max px-6">
              <div className="flex items-center gap-3 mb-16">
                <span className="type-label" style={{ color: 'var(--color-light-text-sub)' }}>/01</span>
                <span className="w-6 h-px" style={{ background: 'var(--color-light-line)' }} />
                <span className="type-label" style={{ color: 'var(--color-light-text-sub)' }}>VALUES</span>
              </div>
              <div>
                {values.map(({ num, title, description }, i) => (
                  <div
                    key={num}
                    className="flex flex-col md:flex-row md:items-start md:gap-16 py-10"
                    style={{
                      borderTop: '1px solid var(--color-light-line)',
                      borderBottom: i === values.length - 1 ? '1px solid var(--color-light-line)' : undefined,
                    }}
                  >
                    <div className="flex-shrink-0 md:w-24 mb-3 md:mb-0">
                      <span className="type-mono" style={{ color: 'var(--color-light-text-sub)' }}>{num}</span>
                    </div>
                    <div className="flex-shrink-0 md:w-32 mb-3 md:mb-0">
                      <span className="type-heading-s" style={{ color: 'var(--color-light-text)' }}>{title}</span>
                    </div>
                    <div className="flex-1">
                      <p className="type-body" style={{ color: 'var(--color-light-text-sub)' }}>{description}</p>
                    </div>
                  </div>
                ))}
              </div>
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-0" style={{ border: '1px solid var(--color-line)' }}>
                {benefits.map(({ category, items }, i) => (
                  <div
                    key={category}
                    className="p-8"
                    style={{ borderLeft: i > 0 ? '1px solid var(--color-line)' : undefined }}
                  >
                    <h3 className="type-label mb-6" style={{ color: 'var(--color-text-dim)', letterSpacing: '0.1em' }}>{category}</h3>
                    <ul className="space-y-3">
                      {items.map((item) => (
                        <li key={item} className="type-body-s" style={{ color: 'var(--color-text-sub)' }}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Stories */}
          <section className="py-24" style={{ background: 'var(--color-bg-surface)', borderTop: '1px solid var(--color-line)', borderBottom: '1px solid var(--color-line)' }}>
            <div className="container-max px-6">
              <div className="flex items-center gap-3 mb-16">
                <span className="type-label" style={{ color: 'var(--color-text-dim)' }}>/03</span>
                <span className="w-6 h-px" style={{ background: 'var(--color-line-mid)' }} />
                <span className="type-label" style={{ color: 'var(--color-text-dim)' }}>TEAM VOICES</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-0" style={{ border: '1px solid var(--color-line)' }}>
                {stories.map(({ name, role, quote }, i) => (
                  <div
                    key={name}
                    className="p-10"
                    style={{ borderLeft: i > 0 ? '1px solid var(--color-line)' : undefined }}
                  >
                    <blockquote className="type-body mb-8" style={{ color: 'var(--color-text-sub)', fontStyle: 'normal' }}>
                      &ldquo;{quote}&rdquo;
                    </blockquote>
                    <div>
                      <p className="type-body-s" style={{ color: 'var(--color-text)' }}>{name}</p>
                      <p className="type-label mt-1" style={{ color: 'var(--color-text-dim)' }}>{role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-24" style={{ background: 'var(--color-bg)' }}>
            <div className="container-max px-6">
              <h2 className="type-heading-l mb-4" style={{ color: 'var(--color-text)', maxWidth: '560px' }}>
                이 문화 안에서 함께하시겠습니까?
              </h2>
              <p className="type-body mb-10" style={{ color: 'var(--color-text-sub)', maxWidth: '400px' }}>
                농업 AI의 미래를 만들어갈 팀에 합류하세요.
              </p>
              <Link href="/careers" className="btn-site-primary">
                채용 공고 보기
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </section>

        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
}
