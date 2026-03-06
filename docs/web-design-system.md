---
title: Paiptree Web Design System
version: 1.1.0
author: SYSTEM
last_updated: 26.03.06
status: ACTIVE — 이 문서가 홈페이지 구현의 단일 기준이다
---

# Paiptree Web Design System

> **원칙:** 밀도 있고 에디토리얼하며 기술적 신뢰감을 주는 B2B 기업 사이트.
> 장식보다 구조, 색보다 형태, 움직임보다 텍스트가 앞선다.

---

## 1. 디자인 철학

### 1-1. 핵심 가치 3가지

**Dense & Editorial**
정보는 촘촘하게, 여백은 의도적으로. 큰 타이포와 작은 바디 텍스트의 대비가 리듬을 만든다.
헤딩은 크고 tight하게, 본문은 작고 조용하게.

**Structural Clarity**
수평선(border)이 섹션과 항목을 구분한다. 배경색 변화나 카드 쉐도우 대신 얇은 1px 선으로 구조를 표현한다.
모든 요소는 격자에 정렬되어 있으며, 정렬이 깨지는 것은 의도된 강조다.

**Restrained Color**
흑·백·회색이 기본이고 브랜드 시안(`#00ABE6`)은 인터랙션 상태(hover, active, focus)에만 등장한다.
색이 아닌 크기·굵기·위치로 위계를 만든다.

### 1-2. 금지 사항

- `border-radius` 4px 초과 사용 금지 (카드, 버튼, 인풋 전부 sharp edge)
- 배경 그라디언트 남용 금지 (Hero mesh-gradient 1개만 허용)
- `box-shadow` 장식용 사용 금지 (레이어 구분 목적만 허용)
- `backdrop-filter blur` Header 외 사용 금지
- 이모지, 아이콘 폰트 사용 금지 (SVG 또는 텍스트 기호만)
- 임의 색상 인라인 하드코딩 금지 — 반드시 CSS 변수 사용

---

## 2. 색상 시스템

### 2-1. 기본 팔레트

```css
:root {
  /* Background */
  --color-bg:          #050505;   /* 페이지 기본 배경 */
  --color-bg-surface:  #0f0f0f;   /* 카드/패널 배경 */
  --color-bg-raised:   #1a1a1a;   /* 호버/강조 배경 */

  /* Structural lines */
  --color-line:        rgba(255, 255, 255, 0.07);   /* 기본 구조선 */
  --color-line-mid:    rgba(255, 255, 255, 0.12);   /* 강조 구조선 */
  --color-line-strong: rgba(255, 255, 255, 0.20);   /* 인터랙션 구조선 */

  /* Text */
  --color-text:        #f0f0f0;   /* Primary — 순백 아닌 오프화이트 */
  --color-text-sub:    #888888;   /* Secondary */
  --color-text-dim:    #555555;   /* Tertiary / Disabled */

  /* Brand accent — 인터랙션 전용 */
  --color-accent:      #00ABE6;
  --color-accent-sub:  #2DD4BF;

  /* Light section (PlatformSection, CTASection 등) */
  --color-light-bg:        #ffffff;
  --color-light-bg-alt:    #f5f5f5;
  --color-light-line:      #e5e5e5;
  --color-light-text:      #0a0a0a;
  --color-light-text-sub:  #666666;
}
```

### 2-2. 사용 규칙

| 상황 | 사용 변수 |
|---|---|
| 페이지 배경 | `--color-bg` |
| 구조선 (border) | `--color-line` |
| 주요 텍스트 | `--color-text` |
| 보조 텍스트 (날짜, 메타) | `--color-text-sub` |
| 비활성/플레이스홀더 | `--color-text-dim` |
| 링크 hover, active nav | `--color-accent` |
| 라이트 섹션 배경 | `--color-light-bg` |

### 2-3. 라이트 섹션 규칙

라이트 섹션(`PlatformSection`, `CTASection` 등)은 화이트 배경 위에 다크 텍스트를 쓴다.
동일한 구조선·타이포 규칙을 적용하되 색상만 `--color-light-*` 변수로 전환.

---

## 3. 타이포그래피

### 3-1. 폰트 패밀리

| 역할 | 폰트 | 적용 |
|---|---|---|
| 전체 기본 | **Inter** | `font-family: 'Inter', sans-serif` |
| 로고 | **Gmarket Sans Bold** | `font-gmarket`, weight 700 |
| 숫자·코드·레이블 | **ui-monospace** | `font-family: ui-monospace, 'SF Mono', Menlo, monospace` |

### 3-2. 타입 스케일

```css
/* Display — Hero 전용 */
.type-display {
  font-size: clamp(3.5rem, 7vw, 6rem);  /* 56~96px */
  font-weight: 800;
  line-height: 0.95;
  letter-spacing: -0.05em;
}

/* Heading L — 섹션 대표 제목 */
.type-heading-l {
  font-size: clamp(2.5rem, 4vw, 3.5rem);  /* 40~56px */
  font-weight: 700;
  line-height: 1.0;
  letter-spacing: -0.04em;
}

/* Heading M — 서브 제목, 카드 제목 */
.type-heading-m {
  font-size: clamp(1.75rem, 2.5vw, 2.5rem);  /* 28~40px */
  font-weight: 600;
  line-height: 1.05;
  letter-spacing: -0.03em;
}

/* Heading S — 목록 제목, 작은 섹션 */
.type-heading-s {
  font-size: 1.25rem;  /* 20px */
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

/* Body — 일반 본문 */
.type-body {
  font-size: 0.875rem;  /* 14px */
  font-weight: 400;
  line-height: 1.65;
  letter-spacing: 0;
}

/* Body S — 메타, 설명 */
.type-body-s {
  font-size: 0.8125rem;  /* 13px */
  font-weight: 400;
  line-height: 1.55;
  letter-spacing: 0;
}

/* Label — 섹션 번호, 카테고리, 배지 */
.type-label {
  font-size: 0.6875rem;  /* 11px */
  font-weight: 500;
  line-height: 1.4;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

/* Mono — 숫자, 날짜, 기술 값 */
.type-mono {
  font-family: ui-monospace, 'SF Mono', Menlo, monospace;
  font-size: 0.75rem;  /* 12px */
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: 0.02em;
}
```

### 3-3. 위계 원칙

```
Label (11px uppercase)       ← 섹션 진입 맥락 제공
  ↓
Display / Heading L          ← 핵심 메시지 (1줄~2줄)
  ↓
Body (14px)                  ← 보조 설명 (2~3줄 이내)
  ↓
Label 또는 CTA               ← 행동 유도
```

숫자는 반드시 `type-mono`로 표시 (신뢰감, 데이터 느낌).

---

## 4. 레이아웃

### 4-1. 컨테이너

```css
/* 실제 Tailwind 클래스명: container-max */
.container-max {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;  /* 24px — 항상 px-6 와 함께 사용 */
}
```

모든 섹션에 `container-max px-6` 조합으로 통일.
`max-w-7xl`, `max-w-4xl` 등 임의 max-width 금지.
인라인 `maxWidth` 스타일은 섹션 내부 콘텐츠 폭 제한에만 사용 (예: `maxWidth: '480px'`).

### 4-2. 섹션 패딩

| 섹션 유형 | 패딩 |
|---|---|
| 일반 섹션 | `py-24` (96px) |
| 대형 Hero 후속 섹션 | `py-32` (128px) |
| 컴팩트 섹션 (CTA 등) | `py-16` (64px) |
| Hero | `h-screen` (패딩 없음) |

### 4-3. 그리드 시스템

12컬럼 기준. 주요 레이아웃 패턴:

```
A. 전체폭 (텍스트 중심)
   [  label + heading + body  — 12col  ]

B. 60 / 40 분할 (이미지 + 텍스트)
   [  콘텐츠  —  7col  ] [  이미지  —  5col  ]

C. 목록 분할 (레이블 + 대형 텍스트)
   [ /01  2col ] [  Heading L  —  10col  ]

D. 4컬럼 스탯 그리드
   [ stat ] [ stat ] [ stat ] [ stat ]
```

### 4-4. 구조선 사용 규칙

```
섹션 상단 구분:   border-top: 1px solid var(--color-line)
항목 구분:        border-bottom: 1px solid var(--color-line)
마지막 항목:      border-bottom 추가 (목록 닫기)
세로 구분선:      border-left: 1px solid var(--color-line) (컬럼 분할)
```

배경색이나 여백만으로 구분하지 않는다 — 반드시 선이 함께한다.

---

## 5. 컴포넌트 패턴

### 5-1. 버튼

```css
/* Primary CTA */
.btn-site-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--color-accent);
  color: #ffffff;
  font-size: 0.8125rem;    /* 13px */
  font-weight: 500;
  letter-spacing: 0.02em;
  border: none;
  border-radius: 0;        /* sharp */
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn-site-primary:hover { opacity: 0.85; }

/* Secondary / Ghost */
.btn-site-ghost {
  padding: 0.75rem 1.5rem;
  background: transparent;
  color: var(--color-text);
  font-size: 0.8125rem;
  border: 1px solid var(--color-line-mid);
  border-radius: 0;
  transition: border-color 0.2s, color 0.2s;
}
.btn-site-ghost:hover {
  border-color: var(--color-line-strong);
  color: #ffffff;
}

/* Text link with arrow */
.btn-site-link {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  color: var(--color-text-sub);
  transition: color 0.2s;
}
.btn-site-link:hover { color: var(--color-text); }
```

### 5-2. 섹션 레이블 (Eyebrow)

모든 섹션 진입부에 레이블을 넣는다. 섹션 테마(다크/라이트)에 따라 색상 변수가 달라진다.

**다크 섹션 (기본):**
```tsx
<div className="flex items-center gap-3 mb-6">
  <span className="type-label" style={{ color: 'var(--color-text-dim)' }}>/01</span>
  <span className="w-6 h-px" style={{ background: 'var(--color-line-mid)' }} />
  <span className="type-label" style={{ color: 'var(--color-text-dim)' }}>SECTION NAME</span>
</div>
```

**라이트 섹션 (PlatformSection, CTASection 등):**
```tsx
<div className="flex items-center gap-3 mb-6">
  <span className="type-label" style={{ color: 'var(--color-light-text-sub)' }}>/02</span>
  <span className="w-6 h-px" style={{ background: 'var(--color-light-line)' }} />
  <span className="type-label" style={{ color: 'var(--color-light-text-sub)' }}>SECTION NAME</span>
</div>
```

**페이지 섹션 번호 순서 (홈페이지 기준):**

| 번호 | 섹션 | 테마 |
|---|---|---|
| `/01` | CAPABILITIES (InfiniteCarousel) | 라이트 |
| `/02` | PLATFORM | 라이트 |
| `/03` | MISSION (CaseStudies) | 라이트 |
| `/04` | PARTNERS | 다크 |
| `/05` | NEWSROOM | 다크 |
| `/06` | GET STARTED (CTA) | 라이트 |

Stats 섹션 추가 시 Hero 바로 다음에 삽입, 번호는 기존 순서와 무관하게 페이지 상단부터 재정렬.

**엑센트 색상 Eyebrow (Newsroom 등 강조 섹션):**
```tsx
<span className="type-label" style={{ color: 'var(--color-accent)' }}>/05</span>
<span className="w-6 h-px" style={{ background: 'var(--color-accent)', opacity: 0.4 }} />
<span className="type-label" style={{ color: 'var(--color-text-dim)' }}>NEWSROOM</span>
```

### 5-3. 통계/숫자 블록

```tsx
<div className="border-l-2 pl-4" style={{ borderColor: 'var(--color-accent)' }}>
  <div className="type-display" style={{ color: 'var(--color-text)' }}>75</div>
  <div className="type-label" style={{ color: 'var(--color-text-sub)' }}>
    REPOSITORIES
  </div>
</div>
```

### 5-4. 수평 목록 행 (PlatformSection 패턴)

```tsx
<div className="border-t py-8 flex justify-between items-center
                transition-colors hover:bg-[var(--color-bg-raised)]"
     style={{ borderColor: 'var(--color-line)' }}>
  <span className="type-label" style={{ color: 'var(--color-text-dim)' }}>/0.1</span>
  <span className="type-heading-l" style={{ color: 'var(--color-text)' }}>FarmersMind</span>
  <span className="type-body-s max-w-xs" style={{ color: 'var(--color-text-sub)' }}>
    설명 텍스트
  </span>
</div>
```

### 5-5. 네비게이션 Header

- 배경: `bg-black/60 backdrop-blur-sm`
- 로고: `font-gmarket`, `var(--color-accent)`
- 링크: `type-body-s`, 기본 `color-text-sub`, hover `color-text`
- 활성 링크: `color-accent`, 하단 `1px solid` 언더라인
- border-radius: 0

---

## 6. 섹션별 구현 기준

### Hero Section
```
배경:        실제 농장/제품 사진 또는 순수 다크 배경
오버레이:    bg-black/70 (이미지 있을 때)
레이아웃:   좌정렬, 수직 중앙
구성:        eyebrow label → display heading → body (2줄) → CTA 버튼 2개
스크롤 인디케이터: 하단 중앙, 얇은 선 + "SCROLL" label
```

### Platform List Section (라이트)
```
배경:        var(--color-light-bg)
헤딩:        type-heading-l, --color-light-text
행:          border-top/bottom 1px --color-light-line
             hover: --color-light-bg-alt
구성:        번호(/0.n) + 플랫폼명(대형) + 한줄 설명
```

### Stats / Numbers Section (다크)
```
배경:        var(--color-bg)
구성:        4컬럼 숫자 그리드
             숫자: type-display + type-mono
             레이블: type-label
구분:        border-left (첫 컬럼 제외)
```

### Stats / Numbers Section (다크) — 미구현, 추가 예정
```
배경:        var(--color-bg)
구성:        4컬럼 숫자 그리드
             숫자: type-display (또는 type-heading-l) + type-mono
             레이블: type-label
구분:        border-left (첫 컬럼 제외)
위치:        Hero 바로 아래 (첫 번째 다크 섹션)
예시 데이터: 75+ 농장, 2M+ 분석 데이터 포인트, 99.2% 업타임, 3개 플랫폼
```

### Partners Section (다크)
```
배경:        var(--color-bg)  ← #000000 하드코딩 아님
구성:        eyebrow /04 PARTNERS + 무한 스크롤 로고 띠
로고:        filter: brightness(0) invert(1), opacity 0.4~0.5
엣지:        좌우 maskImage 페이드 (8%~92%)
```

### News / Latest Section (다크)
```
배경:        var(--color-bg) 또는 배경 이미지 + 오버레이
구성:        eyebrow → 큰 제목 슬라이드 → 날짜·카테고리 → CTA
인디케이터:  얇은 선 기반 (점 아닌 숫자 또는 선)
```

### CTA Section
```
배경:        var(--color-light-bg)
구성:        2컬럼 대형 링크 카드
카드:        sharp edge, 호버 시 배경색 전환
텍스트:      type-heading-m, 좌정렬
화살표:      → SVG, 호버 시 translateX(4px)
```

### Footer
```
배경:        var(--color-bg-surface)
구성:        로고+설명 → 4컬럼 링크 → bottom bar
구분:        border-top --color-line
텍스트:      type-body-s
```

---

## 7. 모션·인터랙션

### 7-1. 트랜지션 기준

```css
/* 기본 — 색상/opacity 변화 */
transition: color 0.2s ease, opacity 0.2s ease, border-color 0.2s ease;

/* 이동 — hover translate */
transition: transform 0.2s ease;

/* 느린 전환 — 배경색 */
transition: background-color 0.3s ease;
```

### 7-2. 허용되는 모션

| 인터랙션 | 모션 |
|---|---|
| 링크/버튼 hover | 색상 변화만 (translateY 금지) |
| 화살표 아이콘 hover | `translateX(4px)` |
| 캐러셀 진행 바 | `width 0 → 100%` linear |
| 파트너 로고 띠 | 무한 스크롤 linear |
| 스크롤 인디케이터 | `opacity 페이드` pulse |

### 7-3. 금지되는 모션

- 카드 hover `translateY(-4px)` — 레이아웃 이동 유발
- entrance animation (스크롤 트리거 페이드인) — 현재 단계 불필요
- 배경 particle, gradient shift 등 ambient 애니메이션

---

## 8. 반응형 기준

| 브레이크포인트 | 적용 |
|---|---|
| `< 768px` (mobile) | 단일 컬럼, 헤딩 clamp 최솟값 적용 |
| `768px~` (tablet) | 2컬럼 시작 |
| `1280px~` (desktop) | 풀 레이아웃, container-site 유지 |

모바일 우선으로 작성하되 데스크톱에서 밀도를 높인다.
모바일에서는 type-label의 tracking을 `0.06em`으로 줄인다.

---

## 9. 세부 페이지 적용 기준

홈페이지(`/about`)에서 확정된 스타일이 모든 세부 페이지의 기준이 된다.

| 페이지 | 특이사항 |
|---|---|
| `/services` | 다크 기반, 기능 목록은 수평 행 패턴 |
| `/culture` | 다크 기반, 사진 비중 높음 — 오버레이 규칙 적용 |
| `/blog` | 라이트 기반 별도 타이포 스케일 (가독성 우선) |
| `/newsroom` | 다크 기반, 카드 목록 패턴 |
| `/careers` | 다크 기반, 포지션 목록은 수평 행 패턴 |

---

## 10. 체크리스트 (구현 전 확인)

```
[ ] 모든 색상이 CSS 변수(--color-*)를 통해 적용되는가?
[ ] border-radius가 0 또는 2px 이하인가?
[ ] 모든 섹션에 eyebrow label(/번호 + 구분선 + 섹션명)이 있는가?
[ ] 구조선(border-top/bottom)으로 섹션/항목이 구분되는가?
[ ] CTA 버튼이 btn-site-primary / btn-site-ghost / btn-site-link 중 하나인가?
[ ] 숫자/날짜/코드에 type-mono가 적용되는가?
[ ] 모든 컨테이너가 container-max px-6 조합을 사용하는가?
[ ] hover 시 translateY 이동이 없는가?
[ ] 인라인 하드코딩 색상이 없는가? (--color-* 변수 사용)
[ ] 레거시 토큰(--bg-primary, --accent, --text-primary 등)을 신규 섹션에서 사용하지 않았는가?
[ ] 라이트 섹션에서 --color-light-* 변수를 사용하는가?
[ ] 다크 섹션 eyebrow: --color-text-dim / 라이트 섹션 eyebrow: --color-light-text-sub?
```

---

## 11. 알려진 레거시 잔존 항목

홈페이지 구현 완료 후 정리 대상. PoC/내부 도구는 별도 토큰 체계(`--poc-*`, `--bg-*`)를 유지하므로 건드리지 않는다.

| 파일 | 잔존 내용 | 조치 |
|---|---|---|
| `src/app/about/page.tsx` | `var(--bg-primary)` 레거시 토큰 | `var(--color-bg)` 교체 필요 |
| `src/components/ParticleBackground.tsx` | 구 브랜드색 `#8B5CF6` (보라) 사용 | 제거 또는 색상 업데이트 (결정 대기) |
| `src/app/globals.css` | 레거시 토큰 compat 블록 존재 | PoC 폐기 시 제거 가능 |

---

## 12. 홈페이지 섹션 구성 현황

현재 구현된 페이지 (`/about` = 메인 홈):

```
[Header]               — fixed, blur backdrop, 다크
[VideoHeroSection]     — h-screen, 다크, 배경 이미지
[InfiniteCarouselSection] — 라이트, /01 CAPABILITIES
[PlatformSection]      — 라이트, /02 PLATFORM
[CaseStudiesSection]   — 혼합(이미지+라이트), /03 MISSION
[PartnersSection]      — 다크, /04 PARTNERS, 무한 스크롤
[NewsSection]          — 다크, /05 NEWSROOM, 배경 이미지
[CTACardsSection]      — 라이트, /06 GET STARTED
[Footer]               — 다크 (color-bg-surface)
```

**추가 예정 섹션:**

| 우선순위 | 섹션 | 위치 | 설명 |
|---|---|---|---|
| P0 | Stats/Numbers | Hero 바로 아래 | 숫자로 신뢰감 제공 — 75+ 농장 등 |
