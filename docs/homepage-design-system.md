---
title: 홈페이지 디자인 시스템
author: SYSTEM
last_updated: 26.03.06
status: AUDIT (현황 정리 — 표준 미확정)
---

# 홈페이지 디자인 시스템

> **목적:** 현재 홈페이지(`/about`) 구현 현황을 정리하고, 세부 페이지 전개 전 표준을 정의한다.  
> **범위:** `src/components/` 전체 + `src/app/globals.css` + `src/app/layout.tsx`

---

## 1. 페이지 구조 (섹션 순서)

| # | 컴포넌트 | 배경 | 성격 |
|---|---|---|---|
| 1 | `VideoHeroSection` | `bg-black` + 이미지 오버레이 | 다크, fullscreen |
| 2 | `InfiniteCarouselSection` | `bg-gray-300` | 라이트 |
| 3 | `PlatformSection` | `bg-white` | 라이트 |
| 4 | `CaseStudiesSection` | `bg-gray-300` | 라이트 |
| 5 | `PartnersSection` | `bg-black` | 다크 |
| 6 | `NewsSection` | `#0a1219` + `/news-bg.png` | 다크 |
| 7 | `CTACardsSection` | `bg-white` | 라이트 |
| 8 | `Footer` | `var(--bg-secondary)` = `#1A1A1A` | 다크 |

**전체 리듬:** 다크(Hero) → 라이트 3구간 → 다크 2구간 → 라이트 CTA → 다크 Footer

---

## 2. 현재 상태 & 문제점

### 2-1. 색상 — 불일치 (⚠️ 핵심 이슈)

| 위치 | 현재 값 | 문제 |
|---|---|---|
| `:root --accent-from` | `#8B5CF6` (보라) | v2 브랜드와 불일치 |
| `:root --accent-to` | `#3B82F6` (파랑) | v2 브랜드와 불일치 |
| Header 로고 | `color: '#00ABE6'` (인라인) | CSS 변수 미사용 |
| `nav-link-active` | `var(--accent-from)` → 보라 | 로고 색과 불일치 |
| `btn-primary` | 보라↔파랑 그라디언트 | v2 브랜드와 불일치 |
| `gradient-text` | `var(--accent-from/to)` → 보라 | v2 브랜드와 불일치 |
| `glow-purple/accent` | `#8B5CF6` 하드코딩 | v2 브랜드와 불일치 |

**목표 브랜드 컬러 (v2):**
- Primary accent: `#00ABE6` (시안, 로고 색)
- Sub accent: `#2DD4BF` (틸)

### 2-2. 타이포그래피 — 정의는 있으나 미적용

`globals.css`에 `.heading-xl/lg/md/sm`, `.body-lg/md/sm` 클래스가 정의되어 있지만 대부분의 섹션에서 미사용.

| 컴포넌트 | 현재 | 표준 클래스 |
|---|---|---|
| `VideoHeroSection` | `.heading-xl`, `.body-lg` | ✅ 적용됨 |
| `PlatformSection` | `text-4xl`, `text-9xl`, `text-6xl` (raw) | ❌ 미적용 |
| `CaseStudiesSection` | `text-3xl md:text-4xl` (raw) | ❌ 미적용 |
| `NewsSection` | `text-4xl md:text-5xl` (raw) | ❌ 미적용 |

### 2-3. 레이아웃 — 3가지 컨테이너 패턴 혼용

| 패턴 | 사용 위치 | 실제 max-width |
|---|---|---|
| `container-max` (CSS 클래스) | Header, VideoHeroSection | 1280px |
| `container mx-auto max-w-7xl` | CaseStudiesSection, CTACardsSection, PartnersSection | 1280px |
| `max-w-[1200px] mx-auto` | PlatformSection | 1200px |

섹션 패딩도 혼용: `py-20`, `py-16`, `py-10`, `pt-32 pb-16` — `section-padding` 클래스(`py-24`) 있지만 미사용.

### 2-4. 버튼 — 2가지 시스템 혼용

| 시스템 | 위치 | 스타일 |
|---|---|---|
| CSS 클래스 `.btn-primary/.btn-secondary` | `VideoHeroSection` | 보라 그라디언트 (구형) |
| `<Button>` 컴포넌트 (`src/components/ui/Button.tsx`) | `NewsSection`, `CaseStudiesSection` | variant props |
| raw Tailwind | `CTACardsSection` | `bg-gray-200`, `bg-black` |

### 2-5. 폰트 — Archivo 미사용

`globals.css`에 Archivo 폰트 import가 있으나 어디서도 사용되지 않음. 불필요한 로드.

---

## 3. 색상 토큰 (표준안 — 확정 필요)

### 3-1. 브랜드 컬러

```css
:root {
  /* Brand (v2) */
  --accent: #00ABE6;        /* Primary — 로고 시안 */
  --accent-sub: #2DD4BF;    /* Secondary — 틸 */

  /* 기존 --accent-from/to 교체 대상 */
  --accent-from: #00ABE6;   /* gradient start */
  --accent-to: #2DD4BF;     /* gradient end */
}
```

### 3-2. 배경 & 텍스트 (현재 사용 중, 유지)

```css
:root {
  /* Dark surfaces */
  --bg-primary: #0A0A0A;
  --bg-secondary: #1A1A1A;
  --bg-tertiary: #2A2A2A;

  /* Text */
  --text-primary: #FFFFFF;
  --text-secondary: #A1A1AA;
  --text-muted: #6B7280;

  /* Border */
  --border-subtle: rgba(255, 255, 255, 0.1);
  --border-hover: rgba(255, 255, 255, 0.2);
}
```

### 3-3. 라이트 섹션 색상 (현재 raw Tailwind, 토큰화 필요)

| 용도 | 현재 | 토큰 제안 |
|---|---|---|
| 라이트 섹션 배경 | `bg-white` | `--light-bg: #FFFFFF` |
| 라이트 섹션 배경 2 | `bg-gray-300` = `#D1D5DB` | `--light-bg-alt: #E5E7EB` |
| 라이트 텍스트 | `text-black` | `--light-text: #0A0A0A` |
| 라이트 보조 텍스트 | `text-gray-500` | `--light-text-muted: #6B7280` |
| 라이트 구분선 | `border-gray-300` | `--light-border: #D1D5DB` |

---

## 4. 타이포그래피 시스템 (표준 — 재확인 필요)

### 4-1. 폰트 패밀리

| 역할 | 폰트 | 적용 방법 |
|---|---|---|
| Body (기본) | Inter | `layout.tsx` `next/font` → `className={inter.className}` |
| Logo | Gmarket Sans Bold | `font-gmarket` (tailwind.config 필요 확인) |
| Archivo | **미사용 — 제거 대상** | globals.css import 삭제 |

### 4-2. 헤딩 스케일

| 클래스 | 데스크톱 | 모바일 | 용도 |
|---|---|---|---|
| `.heading-xl` | 80px, w800, lh1.1 | 48px | Hero 대표 제목 |
| `.heading-lg` | 56px, w700, lh1.2 | 40px | 섹션 대표 제목 |
| `.heading-md` | 40px, w600, lh1.3 | 32px | 서브 제목 |
| `.heading-sm` | 30px, w600, lh1.4 | — | 카드 제목 |

### 4-3. 본문 스케일

| 클래스 | 크기 | 용도 |
|---|---|---|
| `.body-lg` | 20px, lh1.6 | Hero 부제목, 중요 설명 |
| `.body-md` | 16px, lh1.6 | 일반 본문 |
| `.body-sm` | 14px, lh1.5 | 보조 설명, 메타 |

---

## 5. 레이아웃 표준 (표준안)

### 5-1. 컨테이너 — 단일 패턴으로 통일

```tsx
// 표준: container-max 클래스 사용
<div className="container-max px-6">...</div>
// == max-width: 1280px; margin: 0 auto;

// 라이트 섹션도 동일 패턴 적용
// ❌ 제거: container mx-auto max-w-7xl, max-w-[1200px] mx-auto
```

### 5-2. 섹션 패딩

```
다크 섹션: py-24 (section-padding)
라이트 섹션: py-20
CTA / 압축 섹션: py-12
Hero: h-screen (패딩 없음)
```

---

## 6. 컴포넌트 시스템 (표준안)

### 6-1. 버튼 — Button 컴포넌트로 통일

`src/components/ui/Button.tsx`의 `variant` props 기준으로 통일.  
`.btn-primary`, `.btn-secondary` CSS 클래스는 폐기 방향.

| variant | 스타일 | 용도 |
|---|---|---|
| `primary` | `bg-[--accent]` 단색 | 주요 CTA |
| `outline` | `border-white/30` | 보조 CTA (다크 배경) |
| `outline-light` | `border-black` | 보조 CTA (라이트 배경) |

### 6-2. 카드

| 클래스 | 배경 | 용도 |
|---|---|---|
| `.glass-card` | `rgba(255,255,255,0.05)` blur | 다크 섹션 카드 |
| `.card-minimal` | `var(--bg-secondary)` | 다크 섹션 리스트 아이템 |
| raw Tailwind | `bg-white` / `bg-gray-200` | 라이트 섹션 CTA 카드 (CTACardsSection) |

---

## 7. 세부 페이지 현황

| 경로 | 파일 | 상태 |
|---|---|---|
| `/about` | `src/app/about/page.tsx` | 메인 홈 (현재 점검 대상) |
| `/services` | `src/app/services/page.tsx` | 미확인 |
| `/culture` | `src/app/culture/page.tsx` | 미확인 |
| `/blog` | `src/app/blog/page.tsx` | 라이트 테마 별도 |
| `/newsroom` | `src/app/newsroom/page.tsx` | 미확인 |
| `/careers` | `src/app/careers/page.tsx` | 미확인 |

---

## 8. 즉시 수정 필요 항목 (우선순위순)

| 우선순위 | 항목 | 작업 |
|---|---|---|
| P0 | 브랜드 컬러 불일치 | `:root --accent-from/to` → `#00ABE6/#2DD4BF` |
| P0 | `nav-link-active` 색상 | `var(--accent-from)` 교체 → `var(--accent)` |
| P1 | 컨테이너 패턴 통일 | `container mx-auto max-w-7xl` → `container-max` |
| P1 | 섹션 패딩 통일 | raw py-N → `section-padding` 또는 기준값 |
| P2 | Archivo 폰트 제거 | globals.css `@import` 삭제 |
| P2 | 타이포 클래스 적용 | PlatformSection 등 raw 클래스 → heading/body 클래스 |
| P3 | 버튼 시스템 통일 | `.btn-primary` 폐기, Button 컴포넌트로 일원화 |
