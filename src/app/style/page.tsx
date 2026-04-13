import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MarketingSection from '@/components/site/MarketingSection';
import SectionEyebrow from '@/components/site/SectionEyebrow';

export const metadata: Metadata = {
  title: 'Paiptree — Style System',
  description: 'Company-scale visual system for the new Paiptree main page.',
};

const colorTokens = [
  { label: 'Background / base', value: '#020202', variable: '--color-bg' },
  { label: 'Surface / elevated', value: '#090909', variable: '--color-bg-surface' },
  { label: 'Surface / soft', value: '#121212', variable: '--color-bg-raised' },
  { label: 'Text / primary', value: '#F5F7FB', variable: '--color-text' },
  { label: 'Text / secondary', value: '#A3ADBD', variable: '--color-text-sub' },
  { label: 'Accent / electric blue', value: '#4D7CFF', variable: '--color-accent' },
];

const typeScale = [
  { name: 'company-display', sample: 'Company hero headline', className: 'company-display' },
  { name: 'company-section-title', sample: 'Section title for company narrative', className: 'company-section-title' },
  { name: 'type-heading-s', sample: 'Card and module heading', className: 'type-heading-s' },
  { name: 'company-lead', sample: 'Lead paragraph for the hero and section intros', className: 'company-lead' },
  { name: 'type-body', sample: 'Operational company body copy with calm readability', className: 'type-body' },
  { name: 'type-label', sample: 'EYEBROW / LABEL', className: 'type-label' },
  { name: 'type-mono', sample: '04.03-09 / WEEKLY / 01', className: 'type-mono' },
];

const principles = [
  {
    title: 'Company first, service second',
    body: '메인 홈은 회사 서사와 문제의식으로 시작하고 서비스는 그 비전을 구현하는 capability layer로 연결한다.',
  },
  {
    title: 'Black and white with precise blue accents',
    body: '배경과 텍스트는 흑백 기반으로 유지하고, 포인트는 링크·버튼·active 상태에만 electric blue를 사용한다.',
  },
  {
    title: 'Scale-like visual calm',
    body: '넓은 여백, 큰 타이포, 절제된 카드, 명확한 구분선으로 시각적 긴장감을 낮추고 세련됨을 유지한다.',
  },
  {
    title: 'Samsara-like message flow',
    body: '문제 제시 → 접근 방식 → 역량 레이어 → 운영 흐름 → 신뢰 포인트 순으로 읽히게 한다.',
  },
];

function ColorSwatch({ label, value, variable }: { label: string; value: string; variable: string }) {
  return (
    <div className="company-card p-5">
      <div className="mb-5 h-28 w-full" style={{ background: value }} />
      <p className="type-heading-s mb-2 marketing-text-primary">{label}</p>
      <p className="type-mono marketing-text-sub mb-1">{value}</p>
      <p className="type-body-s marketing-text-dim">{variable}</p>
    </div>
  );
}

export default function StylePage() {
  return (
    <div data-theme="company-scale" className="company-shell overflow-x-hidden">
      <Header />
      <main>
        <MarketingSection surface="base" className="pt-28 md:pt-36" containerClassName="pb-8 md:pb-12">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:items-end">
            <div>
              <div className="company-kicker mb-6">Company scale system</div>
              <h1 className="company-display max-w-[11ch] mb-6">/m 메인페이지를 위한 visual system</h1>
              <p className="company-lead mb-8">
                이 페이지는 새 메인페이지에 적용한 company-scale 디자인 기준을 정리한 문서형 페이지다.
                Scale AI의 시각 톤을 참고하되, 회사 사이트 원칙과 파이프트리의 서사 구조에 맞게 재구성했다.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/m" className="company-button-primary">/m 보기</Link>
                <Link href="/services" className="company-button-secondary">서비스 페이지 보기</Link>
              </div>
            </div>
            <div className="company-grid-panel p-6 md:p-8">
              <p className="type-label marketing-text-accent mb-5">Reference synthesis</p>
              <div className="space-y-5">
                {[
                  'Visual tone → Scale AI',
                  'Message flow → Samsara',
                  'Company-first discipline → IBM (selectively)',
                ].map((item) => (
                  <div key={item} className="border-b pb-5" style={{ borderColor: 'var(--color-line)' }}>
                    <p className="type-heading-s marketing-text-primary">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </MarketingSection>

        <MarketingSection surface="surface">
          <SectionEyebrow number="/01" label="FOUNDATION" tone="accent" className="mb-6" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {principles.map((principle) => (
              <article key={principle.title} className="company-card p-6 md:p-7">
                <h2 className="type-heading-s mb-3 marketing-text-primary">{principle.title}</h2>
                <p className="type-body marketing-text-sub">{principle.body}</p>
              </article>
            ))}
          </div>
        </MarketingSection>

        <MarketingSection surface="base">
          <SectionEyebrow number="/02" label="COLOR TOKENS" tone="accent" className="mb-6" />
          <div className="max-w-[720px] mb-10">
            <h2 className="company-section-title mb-5">흑백 기반 위에 electric blue만 정밀하게 사용합니다</h2>
            <p className="type-body marketing-text-sub">
              포인트 컬러는 메인 배경이 아니라 active state와 버튼, 링크, 흐름선 같은 곳에만 사용합니다.
              이것이 회사 사이트의 신뢰감과 세련됨을 동시에 유지하는 핵심입니다.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {colorTokens.map((token) => (
              <ColorSwatch key={token.variable} {...token} />
            ))}
          </div>
        </MarketingSection>

        <MarketingSection surface="surface">
          <SectionEyebrow number="/03" label="TYPOGRAPHY" tone="accent" className="mb-6" />
          <div className="space-y-4">
            {typeScale.map((type) => (
              <div key={type.name} className="company-card p-6 md:p-8 grid gap-4 md:grid-cols-[220px_minmax(0,1fr)] md:items-start">
                <div>
                  <p className="type-label marketing-text-dim mb-2">{type.name}</p>
                  <p className="type-body-s marketing-text-sub">Usage sample</p>
                </div>
                <div className={type.className}>{type.sample}</div>
              </div>
            ))}
          </div>
        </MarketingSection>

        <MarketingSection surface="base">
          <SectionEyebrow number="/04" label="COMPONENTS" tone="accent" className="mb-6" />
          <div className="grid gap-6 xl:grid-cols-2">
            <article className="company-card p-6 md:p-8">
              <p className="type-label marketing-text-accent mb-5">Buttons</p>
              <div className="flex flex-wrap gap-3 mb-6">
                <button className="company-button-primary">Primary action</button>
                <button className="company-button-secondary">Secondary action</button>
              </div>
              <p className="type-body marketing-text-sub">
                Primary는 강한 다음 행동, Secondary는 탐색/보조 행동에 사용합니다. 파란색은 Primary에만 강하게 줍니다.
              </p>
            </article>

            <article className="company-card p-6 md:p-8">
              <p className="type-label marketing-text-accent mb-5">Tabs / Labels</p>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="marketing-tab marketing-tab--active">EMS</span>
                <span className="marketing-tab">AI</span>
                <span className="marketing-tab">ERP</span>
                <span className="marketing-tab">TMS</span>
              </div>
              <p className="type-body marketing-text-sub">
                레이어나 capability 태그는 작은 탭 형태로 표현하고, active 상태만 accent로 강조합니다.
              </p>
            </article>

            <article className="company-card p-6 md:p-8">
              <p className="type-label marketing-text-accent mb-5">Cards</p>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="company-card p-5">
                  <p className="type-label marketing-text-dim mb-3">Default</p>
                  <h3 className="type-heading-s mb-2">Neutral information card</h3>
                  <p className="type-body marketing-text-sub">흑백 기반의 기본 카드. 대부분의 설명형 모듈은 이 패턴을 사용합니다.</p>
                </div>
                <div className="company-card company-card-accent p-5">
                  <p className="type-label marketing-label-on-accent mb-3">Accent</p>
                  <h3 className="type-heading-s mb-2 marketing-text-on-accent">Highlighted narrative card</h3>
                  <p className="type-body marketing-text-on-accent-subtle">비전, 선언, CTA처럼 집중도를 높이고 싶은 카드에만 사용합니다.</p>
                </div>
              </div>
            </article>

            <article className="company-card p-6 md:p-8">
              <p className="type-label marketing-text-accent mb-5">Lines / Structure</p>
              <div className="space-y-6">
                <div>
                  <p className="type-body-s marketing-text-sub mb-2">Accent line</p>
                  <div className="company-accent-line" />
                </div>
                <div>
                  <p className="type-body-s marketing-text-sub mb-2">Flow line</p>
                  <div className="company-flow-line" />
                </div>
              </div>
            </article>
          </div>
        </MarketingSection>

        <MarketingSection surface="surface">
          <SectionEyebrow number="/05" label="PAGE BLUEPRINT" tone="accent" className="mb-6" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              ['Hero', '회사 비전과 태도를 가장 먼저 전달'],
              ['Problem / Vision', '산업 문제와 회사 방향을 설명'],
              ['Approach / Capability', '회사 방식과 서비스 레이어 연결'],
              ['Flow / Trust / Updates', '운영 흐름, 신뢰 포인트, 최신 움직임으로 마무리'],
            ].map(([title, body], index) => (
              <article key={title} className="company-card p-6 md:p-7">
                <p className="type-label marketing-text-dim mb-4">0{index + 1}</p>
                <h3 className="type-heading-s mb-3 marketing-text-primary">{title}</h3>
                <p className="type-body marketing-text-sub">{body}</p>
              </article>
            ))}
          </div>
        </MarketingSection>

        <MarketingSection surface="base">
          <SectionEyebrow number="/06" label="DO / DON'T" tone="accent" className="mb-6" />
          <div className="grid gap-6 lg:grid-cols-2">
            <article className="company-card p-6 md:p-8">
              <p className="type-label marketing-text-accent mb-4">Do</p>
              <ul className="space-y-3 type-body marketing-text-sub">
                <li>• 회사 서사부터 시작하고 서비스는 capability layer로 연결한다.</li>
                <li>• 넓은 여백과 큰 타이포로 calm한 인상을 유지한다.</li>
                <li>• electric blue는 중요한 action과 active 상태에만 쓴다.</li>
                <li>• 문제 → 접근 → 구조 → 신뢰 포인트 순으로 메시지를 정리한다.</li>
              </ul>
            </article>
            <article className="company-card p-6 md:p-8">
              <p className="type-label marketing-text-accent mb-4">Don&apos;t</p>
              <ul className="space-y-3 type-body marketing-text-sub">
                <li>• 첫 화면부터 제품 카탈로그처럼 보이게 만들지 않는다.</li>
                <li>• 블루를 전체 배경이나 큰 면적에 남발하지 않는다.</li>
                <li>• 지나치게 화려한 스타트업식 motion이나 gradient를 남발하지 않는다.</li>
                <li>• 내부 운영 화면처럼 복잡한 데이터 시각을 메인 홈에 바로 배치하지 않는다.</li>
              </ul>
            </article>
          </div>
        </MarketingSection>
      </main>
      <Footer />
    </div>
  );
}
