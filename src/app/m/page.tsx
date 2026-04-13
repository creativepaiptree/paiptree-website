import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MarketingSection from '@/components/site/MarketingSection';
import SectionEyebrow from '@/components/site/SectionEyebrow';
import LatestNewsSection from '@/components/site/LatestNewsSection';

export const metadata: Metadata = {
  title: 'Paiptree — Company Main',
  description:
    'Paiptree company main page: company vision first, connected naturally to services, operations, and recent updates.',
};

type Capability = {
  name: string;
  summary: string;
  body: string;
  href: string;
};

type CapabilityCardProps = {
  capability: Capability;
  compact?: boolean;
};

type FlowStep = {
  title: string;
  description: string;
  tags: string[];
};

const capabilities: Capability[] = [
  {
    name: 'EMS',
    summary: '현장 상태와 운영 지표를 연결하는 관제 레이어',
    body: '현장 데이터와 운영 신호를 하나의 시야로 묶어 더 빠른 판단과 대응이 가능하도록 설계합니다.',
    href: '/services',
  },
  {
    name: 'AI',
    summary: '데이터를 해석하고 판단을 돕는 intelligence 레이어',
    body: '실시간 상태와 누적 데이터를 함께 읽어 예측과 해석, 의사결정 보조까지 이어지는 구조를 만듭니다.',
    href: '/services',
  },
  {
    name: 'ERP',
    summary: '운영 결과를 실제 업무 처리로 연결하는 execution 레이어',
    body: '현장과 본사의 운영 판단이 출하, 등록, 관리, 정산 등 실무 흐름으로 이어지게 연결합니다.',
    href: '/services',
  },
  {
    name: 'TMS',
    summary: '이동과 관리 흐름을 정리하는 operation control 레이어',
    body: '복잡한 이동 실행과 관리 구조를 정리해 공급망의 실행 밀도를 높입니다.',
    href: '/tms',
  },
  {
    name: 'Mobile',
    summary: '현장 접점과 입력 경험을 연결하는 field interface 레이어',
    body: '현장의 입력과 확인, 작업 흐름이 전체 운영 구조와 단절되지 않도록 모바일 경험을 정리합니다.',
    href: '/services',
  },
];

const flowSteps: FlowStep[] = [
  {
    title: '현장 입력',
    description: '농장과 작업 현장에서 발생하는 상태와 이벤트를 직접 수집합니다.',
    tags: ['Mobile'],
  },
  {
    title: '데이터 수집',
    description: '센서, 영상, 운영 데이터가 흩어지지 않고 같은 구조로 연결됩니다.',
    tags: ['EMS'],
  },
  {
    title: '분석·예측',
    description: '실시간 상태를 해석 가능한 맥락으로 바꾸고 예측 흐름까지 확장합니다.',
    tags: ['AI'],
  },
  {
    title: '운영 판단',
    description: '운영자와 본사가 같은 기준으로 상태를 보고 더 빠르게 결정합니다.',
    tags: ['EMS', 'AI'],
  },
  {
    title: '업무 처리',
    description: '판단 결과가 등록, 처리, 이동 실행 같은 실제 업무로 이어집니다.',
    tags: ['ERP', 'TMS'],
  },
  {
    title: '결과 추적',
    description: '변경 이력과 운영 흐름을 다시 확인하며 다음 개선으로 연결합니다.',
    tags: ['EMS', 'ERP', 'TMS'],
  },
];

const trustPoints = [
  {
    title: '현장 중심 관점',
    body: '기술을 먼저 보여주기보다 실제 운영이 어떻게 움직이는지를 먼저 관찰하고 구조를 설계합니다.',
  },
  {
    title: '연결된 시스템 사고',
    body: '데이터, 분석, 업무 처리를 따로 보지 않고 하나의 운영 흐름으로 묶습니다.',
  },
  {
    title: '실행 가능한 AI',
    body: 'AI를 기능 데모가 아니라 현장을 돕는 운영 체계 안에 배치합니다.',
  },
  {
    title: '지속적인 개선',
    body: '서비스를 완성품이 아니라 계속 진화하는 운영 구조로 보고 업데이트를 축적합니다.',
  },
];

function CapabilityCard({ capability, compact = false }: CapabilityCardProps) {
  return (
    <article className={`company-card ${compact ? 'p-5 md:p-6' : 'p-7 md:p-9'}`}>
      <div className={`flex items-center justify-between gap-4 ${compact ? 'mb-4' : 'mb-8'}`}>
        <span className="type-label marketing-text-accent">{capability.name}</span>
        <span className="type-mono marketing-text-dim">Capability layer</span>
      </div>
      <h3 className={`${compact ? 'type-heading-s' : 'type-heading-m'} mb-3 marketing-text-primary`}>{capability.summary}</h3>
      <p className={`type-body marketing-text-sub ${compact ? 'mb-5' : 'mb-8'} max-w-[38rem]`}>{capability.body}</p>
      <Link href={capability.href} className="marketing-card-link type-body-s marketing-link-accent">
        자세히 보기
        <span aria-hidden>→</span>
      </Link>
    </article>
  );
}

function FlowCard({ step, index }: { step: FlowStep; index: number }) {
  return (
    <article className="company-card p-5 md:p-6 h-full">
      <div className="flex items-start justify-between gap-4 mb-8">
        <span className="type-label marketing-text-dim">0{index + 1}</span>
        <div className="flex flex-wrap justify-end gap-2">
          {step.tags.map((tag) => (
            <span key={tag} className="marketing-tab marketing-tab--active !py-1 !px-2.5">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <h3 className="type-heading-s mb-3 marketing-text-primary">{step.title}</h3>
      <p className="type-body marketing-text-sub">{step.description}</p>
    </article>
  );
}

function HeroBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 opacity-90">
      <svg viewBox="0 0 1600 680" className="h-full w-full" aria-hidden>
        <defs>
          <radialGradient id="heroBgGlowA" cx="18%" cy="8%" r="38%">
            <stop offset="0%" stopColor="#2f63ff" stopOpacity="0.42" />
            <stop offset="100%" stopColor="#2f63ff" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="heroBgGlowB" cx="84%" cy="26%" r="28%">
            <stop offset="0%" stopColor="#3f71ff" stopOpacity="0.24" />
            <stop offset="100%" stopColor="#3f71ff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1600" height="680" fill="transparent" />
        <circle cx="280" cy="40" r="320" fill="url(#heroBgGlowA)" />
        <circle cx="1330" cy="180" r="250" fill="url(#heroBgGlowB)" />
        <g opacity="0.12" stroke="#ffffff">
          <path d="M0 84 H1600" /><path d="M0 194 H1600" /><path d="M0 304 H1600" /><path d="M0 414 H1600" /><path d="M0 524 H1600" />
          <path d="M120 0 V680" /><path d="M320 0 V680" /><path d="M520 0 V680" /><path d="M720 0 V680" /><path d="M920 0 V680" /><path d="M1120 0 V680" /><path d="M1320 0 V680" /><path d="M1520 0 V680" />
        </g>
        <g fill="none" stroke="#3f71ff" strokeOpacity="0.8" strokeWidth="2.5">
          <path d="M80 468 C262 454, 362 304, 510 302 S802 418, 958 274 1270 120, 1514 156" />
          <path d="M110 548 C280 566, 420 434, 566 410 S894 338, 1032 402 1288 522, 1498 470" opacity="0.78" />
          <path d="M132 172 C292 142, 454 180, 618 262 S952 432, 1116 372 1322 224, 1488 238" opacity="0.5" />
        </g>
      </svg>
    </div>
  );
}

function CapabilityVisual() {
  const items = [
    { label: 'EMS', x: 116, y: 112 },
    { label: 'AI', x: 370, y: 88 },
    { label: 'ERP', x: 612, y: 152 },
    { label: 'TMS', x: 544, y: 352 },
    { label: 'MOBILE', x: 202, y: 332 },
  ];

  return (
    <div className="mt-8 overflow-hidden border company-card" style={{ borderColor: 'var(--color-line)' }}>
      <svg viewBox="0 0 720 500" className="h-auto w-full" role="img" aria-label="Paiptree capability map visual">
        <defs>
          <radialGradient id="capGlow" cx="50%" cy="50%" r="65%">
            <stop offset="0%" stopColor="#4d7cff" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#4d7cff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="720" height="500" fill="#05070b" />
        <circle cx="360" cy="250" r="188" fill="url(#capGlow)" />
        <g fill="none" stroke="rgba(255,255,255,0.12)">
          <circle cx="360" cy="250" r="152" />
          <circle cx="360" cy="250" r="92" />
        </g>
        <g stroke="#4d7cff" strokeOpacity="0.35" strokeWidth="1.6">
          <path d="M116 112 L360 250" />
          <path d="M370 88 L360 250" />
          <path d="M612 152 L360 250" />
          <path d="M544 352 L360 250" />
          <path d="M202 332 L360 250" />
          <path d="M116 112 L370 88" opacity="0.5" />
          <path d="M612 152 L544 352" opacity="0.5" />
          <path d="M202 332 L544 352" opacity="0.35" />
        </g>
        <g>
          <circle cx="360" cy="250" r="44" fill="#0d1422" stroke="#4d7cff" strokeOpacity="0.45" />
          <text x="360" y="246" textAnchor="middle" fill="#f5f7fb" fontSize="15" fontWeight="600">PAIPTREE</text>
          <text x="360" y="267" textAnchor="middle" fill="#a3adbd" fontSize="11">OPERATING CORE</text>
        </g>
        {items.map((item) => (
          <g key={item.label} transform={`translate(${item.x}, ${item.y})`}>
            <circle r="34" fill="#0c111c" stroke="#4d7cff" strokeOpacity="0.42" />
            <text y="4" textAnchor="middle" fill="#f5f7fb" fontSize="12" fontWeight="600">{item.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function FlowBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-90">
      <svg viewBox="0 0 980 320" className="h-full w-full" aria-hidden>
        <defs>
          <radialGradient id="flowBgGlow" cx="24%" cy="26%" r="42%">
            <stop offset="0%" stopColor="#3f71ff" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3f71ff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="980" height="320" fill="transparent" />
        <circle cx="210" cy="88" r="180" fill="url(#flowBgGlow)" />
        <g opacity="0.12" stroke="#ffffff">
          <path d="M0 60 H980" /><path d="M0 130 H980" /><path d="M0 200 H980" /><path d="M0 270 H980" />
          <path d="M70 0 V320" /><path d="M210 0 V320" /><path d="M350 0 V320" /><path d="M490 0 V320" /><path d="M630 0 V320" /><path d="M770 0 V320" /><path d="M910 0 V320" />
        </g>
        <path d="M60 210 C180 174, 268 130, 408 138 S660 222, 920 128" stroke="#3f71ff" strokeOpacity="0.65" strokeWidth="3" fill="none" />
      </svg>
    </div>
  );
}

function FlowVisual() {
  const steps = [
    { label: 'FIELD', x: 86 },
    { label: 'SENSE', x: 210 },
    { label: 'ANALYZE', x: 342 },
    { label: 'DECIDE', x: 474 },
    { label: 'EXECUTE', x: 606 },
  ];

  return (
    <div className="overflow-hidden border company-card" style={{ borderColor: 'var(--color-line)' }}>
      <svg viewBox="0 0 720 360" className="h-auto w-full" role="img" aria-label="Paiptree operation flow visual">
        <defs>
          <linearGradient id="flowStroke" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4d7cff" stopOpacity="0.12" />
            <stop offset="50%" stopColor="#4d7cff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#8fb2ff" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <rect width="720" height="360" fill="#06080d" />
        <g opacity="0.13" stroke="#ffffff">
          <path d="M0 90 H720" />
          <path d="M0 180 H720" />
          <path d="M0 270 H720" />
        </g>
        <path d="M82 182 H638" stroke="url(#flowStroke)" strokeWidth="3" fill="none" />
        {steps.map((step, index) => (
          <g key={step.label} transform={`translate(${step.x}, 182)`}>
            <circle r="24" fill="#0d1422" stroke="#4d7cff" strokeOpacity={index === 2 ? '0.85' : '0.45'} />
            <circle r="8" fill="#8fb2ff" opacity={index === 2 ? '1' : '0.75'} />
            <text y="58" textAnchor="middle" fill="#f5f7fb" fontSize="11" fontWeight="600">{step.label}</text>
          </g>
        ))}
        <g fill="#a3adbd" fontSize="10">
          <text x="86" y="106">현장 입력</text>
          <text x="188" y="286">데이터 연결</text>
          <text x="317" y="106">판단 구조</text>
          <text x="454" y="286">운영 결정</text>
          <text x="580" y="106">실행과 추적</text>
        </g>
      </svg>
    </div>
  );
}

export default function MainCompanyPage() {
  return (
    <div data-theme="company-scale" className="company-shell overflow-x-hidden">
      <Header />
      <main>
        <MarketingSection surface="base" className="pt-28 md:pt-36" containerClassName="pb-10 md:pb-16">
          <div className="relative overflow-hidden">
            <HeroBackdrop />
          <div className="company-hero-grid relative z-10">
            <div className="pt-6 md:pt-12 pb-4">
              <div className="company-kicker mb-6">Paiptree company main</div>
              <h1 className="company-display max-w-[12ch] mb-6">
                현장과 데이터를 연결해 더 나은 운영을 만드는 회사
              </h1>
              <p className="company-lead mb-10">
                파이프트리는 현장 데이터, 운영 로직, 업무 시스템을 연결해 산업 현장의 더 나은 판단과
                실행을 돕는 회사를 지향합니다. 서비스는 그 자체가 목적이 아니라, 더 나은 운영 구조를
                구현하는 레이어로 설계됩니다.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/about" className="company-button-primary">
                  회사 소개 보기
                </Link>
                <Link href="/services" className="company-button-secondary">
                  서비스 보기
                </Link>
              </div>
            </div>
          </div>
          </div>
        </MarketingSection>

        <MarketingSection surface="surface">
          <SectionEyebrow number="/01" label="PROBLEM · VISION" tone="accent" className="mb-6" />
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="company-card p-8 md:p-10">
              <h2 className="company-section-title mb-5 max-w-[10ch]">연결이 운영을 바꿉니다</h2>
              <p className="type-body marketing-text-sub max-w-[34rem]">
                현장에는 수많은 데이터와 시스템이 있지만, 실제 운영에서는 여전히 정보의 단절과 늦은
                판단이 반복됩니다. 현장 상태, 본사 운영, 이동 실행, 업무 처리가 따로 흘러가면 전체
                운영 효율은 구조적으로 떨어질 수밖에 없습니다.
              </p>
            </div>
            <div className="company-card-accent p-8 md:p-10">
              <p className="type-label marketing-label-on-accent mb-5">Our vision</p>
              <h2 className="company-section-title mb-5 max-w-[10ch] marketing-text-on-accent">
                우리는 운영 구조를 만듭니다
              </h2>
              <p className="type-body marketing-text-on-accent-subtle max-w-[34rem]">
                우리는 데이터를 수집하는 데서 멈추지 않고, 그 데이터가 해석되고 판단되고 실제 업무와
                실행으로 이어지는 전체 흐름을 설계합니다. 서비스는 이 비전을 구현하는 역량의 층입니다.
              </p>
            </div>
          </div>
        </MarketingSection>

        <MarketingSection surface="base">
          <SectionEyebrow number="/02" label="OUR APPROACH" tone="accent" className="mb-6" />
          <div className="max-w-[760px] mb-12">
            <h2 className="company-section-title mb-5">우리는 흐름을 설계합니다</h2>
            <p className="type-body marketing-text-sub">
              파이프트리의 접근은 단순한 서비스 나열이 아닙니다. 현장, 데이터, AI, 운영을 하나의
              판단 구조로 엮는 방식이 핵심입니다.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: 'Connect',
                body: '현장, 데이터, 시스템을 하나의 구조로 연결합니다.',
              },
              {
                title: 'Understand',
                body: '수집된 정보를 단순한 수치가 아니라 맥락과 판단의 재료로 바꿉니다.',
              },
              {
                title: 'Operate',
                body: '분석과 인사이트가 실제 운영, 업무 처리, 실행 흐름으로 이어지도록 설계합니다.',
              },
            ].map((item) => (
              <article key={item.title} className="company-card p-6 md:p-8">
                <p className="type-label marketing-text-accent mb-4">{item.title}</p>
                <h3 className="type-heading-s mb-3 marketing-text-primary">{item.body}</h3>
              </article>
            ))}
          </div>
        </MarketingSection>

        <MarketingSection surface="surface">
          <SectionEyebrow number="/03" label="CAPABILITY LAYERS" tone="accent" className="mb-6" />
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)]">
            <div>
              <h2 className="company-section-title mb-5 max-w-[10ch]">역량의 층으로 연결합니다</h2>
              <p className="type-body marketing-text-sub max-w-[34rem]">
                파이프트리는 개별 서비스 카탈로그가 아니라, 하나의 운영 구조를 구성하는 capability
                layer를 만듭니다. 각 서비스는 현장과 데이터, 분석과 실행을 연결하는 서로 다른 역할을
                맡습니다.
              </p>
              <CapabilityVisual />
            </div>
            <div className="space-y-5">
              <div className="grid gap-5 xl:grid-cols-2">
                <CapabilityCard capability={capabilities[0]} />
                <CapabilityCard capability={capabilities[1]} />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <CapabilityCard capability={capabilities[2]} compact />
                <CapabilityCard capability={capabilities[3]} compact />
                <CapabilityCard capability={capabilities[4]} compact />
              </div>
            </div>
          </div>
        </MarketingSection>

        <MarketingSection surface="base">
          <SectionEyebrow number="/04" label="UNIFIED FLOW" tone="accent" className="mb-6" />
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.86fr)_minmax(320px,0.54fr)] lg:items-start mb-12">
            <div className="relative overflow-hidden border company-card p-8 md:p-10 min-h-[280px]" style={{ borderColor: 'var(--color-line)' }}>
              <FlowBackdrop />
              <div className="relative z-10 max-w-[52rem]">
                <h2 className="company-section-title mb-5">하나의 운영 흐름</h2>
                <p className="type-body marketing-text-sub max-w-[52rem]">
                  현장에서 발생한 입력이 데이터 수집과 분석을 거쳐 운영 판단으로 이어지고, 다시 실제 업무
                  처리와 결과 추적으로 연결되는 구조. 파이프트리는 이 전체 흐름을 설계하는 회사를 지향합니다.
                </p>
              </div>
            </div>
            <FlowVisual />
          </div>
          <div className="grid gap-5 lg:grid-cols-6">
            {flowSteps.map((step, index) => (
              <div key={step.title} className="flex flex-col gap-5">
                <FlowCard step={step} index={index} />
                {index !== flowSteps.length - 1 ? <div className="company-flow-line hidden lg:block" /> : null}
              </div>
            ))}
          </div>
        </MarketingSection>

        <MarketingSection surface="surface">
          <SectionEyebrow number="/05" label="WHY PAIPTREE" tone="accent" className="mb-6" />
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
            <div>
              <h2 className="company-section-title mb-5 max-w-[10ch]">왜 파이프트리인가</h2>
              <p className="type-body marketing-text-sub max-w-[30rem]">
                기술을 보여주기보다 실제 운영 문제를 어떻게 구조적으로 풀 것인지에 집중하는 태도가
                우리의 출발점입니다.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {trustPoints.map((point) => (
                <article key={point.title} className="company-card p-6 md:p-7">
                  <h3 className="type-heading-s mb-3 marketing-text-primary">{point.title}</h3>
                  <p className="type-body marketing-text-sub">{point.body}</p>
                </article>
              ))}
            </div>
          </div>
        </MarketingSection>

        <LatestNewsSection
          number="/06"
          heading={'우리는 지금도\n계속 움직이고 있습니다'}
          body="최근 업데이트와 회사의 움직임을 통해 파이프트리가 어떤 방향으로 진화하고 있는지 확인할 수 있습니다."
        />

        <MarketingSection surface="base">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="marketing-cta-card company-card company-card-accent">
              <div>
                <p className="type-label marketing-label-on-accent mb-3">Next step</p>
                <h2 className="type-heading-m marketing-text-on-accent mb-3">회사 이야기와 서비스 구조를 더 보세요</h2>
                <p className="type-body marketing-text-on-accent-subtle max-w-[28rem]">
                  메인 홈은 방향을 보여주는 페이지입니다. 더 깊은 회사 이야기와 서비스 구조는 각 상세
                  페이지에서 이어집니다.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/about" className="company-button-primary">회사 소개</Link>
                <Link href="/services" className="company-button-secondary">서비스 보기</Link>
              </div>
            </div>
            <div className="marketing-cta-card company-card">
              <div>
                <p className="type-label marketing-text-dim mb-3">Design system</p>
                <h2 className="type-heading-m marketing-text-primary mb-3">이번 메인에 적용한 visual system은 /style 에서 볼 수 있습니다</h2>
                <p className="type-body marketing-text-sub max-w-[28rem]">
                  컬러, 타이포, 카드, 버튼, 섹션 패턴을 문서형 페이지로 정리해 다음 페이지 확장에도 같은
                  기준을 유지할 수 있게 했습니다.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/style" className="company-button-secondary">/style 보기</Link>
              </div>
            </div>
          </div>
        </MarketingSection>
      </main>
      <Footer />
    </div>
  );
}
