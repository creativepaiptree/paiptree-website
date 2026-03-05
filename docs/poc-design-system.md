---
title: PoC Design System
author: ZORO
last_updated: 26.03.05
---

# PoC Design System

새 페이지를 PoC 디자인 언어로 구현할 때 참조하는 레퍼런스 가이드.

---

## Quick Reference

가장 자주 쓰는 5가지 패턴 — 복붙 후 수정하여 사용.

```tsx
// 1. 최상위 컨테이너 (다크)
<div className="h-screen flex flex-col overflow-hidden bg-[#0d1117] text-gray-100" data-poc-theme="dark">

// 2. 패널 (surface 레벨)
<div className="bg-[#161b22] border border-[#30363d] p-3">

// 3. 섹션 헤더
<div className="flex items-center justify-between px-4 py-3 border-b border-[#30363d]">

// 4. 상태 배지 (성공)
<span className="text-[#3fb950] bg-[#3fb950]/15 border border-[#3fb950] px-1 py-[1px] text-[10px] font-semibold">OK</span>

// 5. 블록 래퍼
<PoCBlockShell blockId="my-block-id"><MyComponent /></PoCBlockShell>
```

---

## 1. 개요

### 목적

PoC 대시보드(`src/app/PoC/`)의 색상 토큰·레이아웃 패턴·컴포넌트 레시피를 정의한다.
이 문서만 보고 동일한 디자인 언어로 새 페이지를 구현할 수 있어야 한다.

### 원칙

- **다크 우선**: 기본 테마는 다크. 라이트는 추가 클래스(`poc-theme-light`)로 오버라이드.
- **CSS 변수 분리**: 배경·테두리·텍스트는 `--poc-*` CSS 변수 사용. 상태 색상(성공/위험 등)만 THEME 객체로 분기.
- **Tailwind 인라인 허용**: `globals.css`의 `.poc-theme-light` 셀렉터가 Tailwind 하드코딩 값을 오버라이드한다.

### 핵심 파일 경로

| 역할 | 경로 |
|---|---|
| CSS 변수 정의 | `src/app/globals.css` (`:759`~`:794`) |
| 페이지 진입점 | `src/app/PoC/page.tsx` |
| 블록 정책 | `src/app/PoC/blocks/poc-block-policy.ts` |
| 블록 카탈로그 | `src/app/PoC/blocks/poc-block-catalog.tsx` |
| 블록 래퍼 | `src/app/PoC/blocks/PoCBlockShell.tsx` |
| TraceableValue | `src/app/PoC/components/trace/TraceableValue.tsx` |
| Navbar | `src/app/PoC/sections/Navbar.tsx` |
| 중앙 헤더 KPI | `src/app/PoC/sections/Header.tsx` |
| 예측 매트릭스 | `src/app/PoC/sections/ForecastMatrix.tsx` |
| 체중 분포 | `src/app/PoC/sections/WeightDistribution.tsx` |
| CCTV 모니터 | `src/app/PoC/sections/CCTVMonitor.tsx` |
| 좌측 사이드바 | `src/app/PoC/sections/LeftSidebar.tsx` |
| 우측 사이드바 | `src/app/PoC/sections/RightSidebar.tsx` |

---

## 2. 색상 토큰 (Color Tokens)

### CSS 변수 매핑표

`[data-poc-theme="dark"]` 와 `.poc-theme-light` 두 테마의 실제 값 (출처: `globals.css:758-794`).

| 변수명 | 다크 값 | 라이트 값 | 용도 |
|---|---|---|---|
| `--poc-surface` | `#161b22` | `#ffffff` | 주 패널 배경 |
| `--poc-panel` | `#0d1117` | `#f8fafc` | 내부 패널 |
| `--poc-panel-strong` | `#11161d` | `#f1f5f9` | 강조 패널 |
| `--poc-dark-bg` | `#0b1017` | `#e2e8f0` | 극어두운 배경 (영상 프레임 등) |
| `--poc-border` | `#30363d` | `#d1d5db` | 테두리 |
| `--poc-text` | `#c9d1d9` | `#0f172a` | 주 텍스트 |
| `--poc-text-muted` | `#8b949e` | `#64748b` | 보조 텍스트 |
| `--poc-text-dim` | `#6e7681` | `#94a3b8` | 희미한 텍스트 |
| `--poc-segment-bg` | `#21262d` | `#e2e8f0` | 세그먼트 바 기본 배경 |
| `--poc-tooltip-bg` | `rgba(10,10,15,0.96)` | `rgba(248,250,252,0.98)` | 툴팁 배경 |
| `--poc-tooltip-border` | `#2a2a3a` | `#cbd5e1` | 툴팁 테두리 |
| `--poc-modal-bg` | `rgba(0,0,0,0.7)` | `rgba(15,23,42,0.45)` | 모달/오버레이 배경 |
| `--poc-chart-legend-bg` | `rgba(22,27,34,0.85)` | `rgba(248,250,252,0.92)` | 차트 범례 배경 |
| `--poc-overlay-item-bg` | `rgba(0,0,0,0.3)` | `rgba(0,0,0,0.05)` | 오버레이 아이템 배경 |
| `--poc-thumb-overlay` | `rgba(13,17,23,0.85)` | `rgba(15,23,42,0.62)` | 썸네일 오버레이 |

> **주의:** `.poc-theme-light`는 `data-poc-theme="light"` 루트에 **함께** 적용한다.
> CSS 변수는 `data-poc-theme` 속성이 DOM에 있어야 활성화된다.

### 라이트 전용 추가 변수

다크 테마에는 **정의되지 않음**. `.poc-theme-light`에만 존재.

| 변수명 | 라이트 값 | 용도 |
|---|---|---|
| `--poc-bg` | `#f8fafc` | 루트 배경색 (라이트 전용) |
| `--poc-surface-alt` | `#f1f5f9` | 강조 서페이스 대체 배경 |

### 상태 색상 (테마별 분기, Tailwind 인라인)

| 용도 | 다크 | 라이트 |
|---|---|---|
| 성공/OK | `#3fb950` | `#15803d` |
| 위험/오류 | `#f85149` | `#dc2626` |
| 경고 | `#ff7700` | `#b45309` |
| 정보 | `#58a6ff` | `#1d4ed8` |
| AI 추적 (배지) | `#c4b5fd` / bg `#8b5cf6/10` | `#6d28d9` / bg `#8b5cf6/12` |
| Human 추적 (배지) | `#93c5fd` / bg `#4da3ff/10` | `#1d4ed8` / bg `#dbeafe` |

출처: `TraceableValue.tsx:35-43`

---

## 3. 레이아웃 패턴

### 3-1. 최상위 컨테이너

`data-poc-theme` 속성이 있어야 CSS 변수(`--poc-*`)가 활성화된다.

```tsx
// 다크 (기본)
<div
  className="h-screen flex flex-col overflow-hidden bg-[#0d1117] text-gray-100"
  data-poc-theme="dark"
>

// 라이트
<div
  className="h-screen flex flex-col overflow-hidden poc-theme-light bg-[#f8fafc] text-gray-900"
  data-poc-theme="light"
>
```

출처: `page.tsx:53-58`

### 3-2. 중앙 스크롤 영역

```tsx
<div className="flex-1 overflow-x-hidden overflow-y-auto p-4">
  <div className="max-w-[1760px] w-full mx-auto space-y-4">
    <div className="flex flex-col 2xl:flex-row gap-4 w-full">
      {/* 좌측 (2XL 이상만 표시) */}
      <div className="hidden 2xl:block w-[280px] flex-shrink-0">...</div>

      {/* 중앙 (유동) */}
      <div className="w-full flex-1 flex flex-col min-w-0 space-y-4">...</div>

      {/* 우측 (2XL 이상만 표시) */}
      <div className="hidden 2xl:block w-[320px] flex-shrink-0">...</div>
    </div>
  </div>
</div>
```

출처: `page.tsx:61-79`

### 3-3. Breakpoint 규칙

| 화면 | 좌측바 | 우측바 | 비고 |
|---|---|---|---|
| `< 1536px` (2xl 미만) | 숨김 | 숨김 | 중앙만 전체 폭 |
| `≥ 1536px` (2xl 이상) | 표시 (280px) | 표시 (320px) | 3열 레이아웃 |

---

## 4. 컴포넌트 패턴 (재사용 CSS 레시피)

### 4-1. Panel (패널)

```tsx
// CSS 변수 방식 (style jsx)
.panel-base   { background: var(--poc-surface);      border: 1px solid var(--poc-border); }
.panel-inner  { background: var(--poc-panel);        border: 1px solid var(--poc-border); }
.panel-strong { background: var(--poc-panel-strong); border: 1px solid var(--poc-border); }

// Tailwind 방식 (globals.css에서 라이트 오버라이드 처리)
className="bg-[#161b22] border border-[#30363d] p-3"   // surface
className="bg-[#0d1117] border border-[#30363d] p-3"   // panel
className="bg-[#11161d] border border-[#30363d] p-3"   // panel-strong
```

### 4-2. Section 헤더

```tsx
// Tailwind
className="flex items-center justify-between px-4 py-3 border-b border-[#30363d]"

// style jsx
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--poc-border);
}
```

### 4-3. Badge (상태 배지)

```tsx
// 성공
className="text-[#3fb950] bg-[#3fb950]/15 border border-[#3fb950] px-1 py-[1px] text-[10px] font-semibold"

// 위험
className="text-[#f85149] bg-[#f85149]/15 border border-[#f85149] px-1 py-[1px] text-[10px] font-semibold"

// 경고
className="text-[#ff7700] bg-[#ff7700]/15 border border-[#ff7700] px-1 py-[1px] text-[10px] font-semibold"

// 중립 (보조)
className="text-[#8b949e] bg-[#11161d] border border-[#30363d] px-1 py-[1px] text-[10px]"
```

### 4-4. Button

```tsx
// 주요 활성 (녹색)
className="border border-[#3fb950] text-[#3fb950] bg-[#3fb950]/10 px-3 py-1.5 text-xs"

// 보조 (중립)
className="border border-[#30363d] text-gray-400 hover:text-gray-200 px-3 py-1.5 text-xs transition-colors"

// style jsx — 토글 버튼
.mode-switch {
  border: 1px solid var(--poc-border);
  color: var(--poc-text-muted);
  padding: 4px 10px;
  min-height: 30px;
  font-size: 12px;
  transition: all 0.2s;
}
.mode-switch.active {
  background: rgba(63, 185, 80, 0.15);
  color: #3fb950;
  border-color: #3fb950;
}
```

### 4-5. Tooltip

```tsx
// style jsx
.tooltip {
  background: var(--poc-tooltip-bg);
  border: 1px solid var(--poc-tooltip-border);
  color: var(--poc-text);
  font-size: 12px;
  padding: 10px 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);
}
```

### 4-6. Overlay / Modal

```tsx
// 전체화면 오버레이 배경
className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"

// 모달 컨테이너
className="max-w-[480px] w-full bg-[#161b22] border border-[#30363d] p-6"
```

### 4-7. 빈 상태 / 더미

```tsx
// style jsx
.empty {
  border: 1px dashed var(--poc-border);
  color: var(--poc-text-muted);
  text-align: center;
  padding: 16px;
  font-size: 12px;
}
```

---

## 5. 테마 전환 구현 규칙

### 5-1. 원칙 요약

| 색상 유형 | 처리 방법 |
|---|---|
| 배경·테두리·주텍스트 | CSS 변수 (`--poc-*`) — `style jsx` 또는 Tailwind 하드코딩(자동 오버라이드) |
| 상태 색상 (성공/위험/경고/정보) | THEME 객체로 분기 — `style={{ color: theme.textOK }}` |
| Tailwind 하드코딩 값 | `.poc-theme-light` 클래스가 `globals.css`에서 자동 오버라이드 |

---

### 5-2. 최상위 컨테이너 적용 (필수)

```tsx
// 다크 (기본)
<div className="h-screen flex flex-col overflow-hidden bg-[#0d1117] text-gray-100"
     data-poc-theme="dark">

// 라이트 — poc-theme-light + data-poc-theme 둘 다 필수
<div className="h-screen flex flex-col overflow-hidden poc-theme-light bg-[#f8fafc] text-gray-900"
     data-poc-theme="light">
```

> `data-poc-theme` → CSS 변수 활성화
> `poc-theme-light` → Tailwind 하드코딩 값 자동 오버라이드
> **둘 중 하나만 쓰면 테마가 불완전하게 적용된다.**

---

### 5-3. `.poc-theme-light` Tailwind 자동 오버라이드 매핑

`globals.css:796-916` 기준. `poc-theme-light` 클래스가 루트에 있으면 하위 모든 Tailwind 하드코딩 색상이 자동 변환된다.

**배경색**

| 다크 Tailwind 값 | 라이트 변환 값 |
|---|---|
| `bg-[#0d1117]`, `bg-[#11161d]` | `#f8fafc` |
| `bg-[#161b22]`, `bg-[#21262d]` | `#f1f5f9` |
| `bg-[#30363d]`, `bg-[#3d444d]`, `bg-gray-700/800` | `#e2e8f0` |
| `bg-black/60` | `rgb(15 23 42 / 0.35)` |
| `bg-[#3fb950]` | `#dcfce7` |
| `bg-[#30363d]/`(alpha) | `#e2e8f0` |

**텍스트색**

| 다크 Tailwind 값 | 라이트 변환 값 |
|---|---|
| `text-gray-100` | `#020617` |
| `text-gray-200` | `#0f172a` |
| `text-gray-300` | `#1e293b` |
| `text-gray-400`, `text-gray-500` | `#334155` |
| `text-gray-600` | `#475569` |
| `text-gray-700`, `text-gray-800` | `#1e293b` |
| `text-[#c9d1d9]` | `#94a3b8` |
| `text-[#8b949e]`, `text-[#6e7681]`, `text-[#484f58]` | `#64748b` |
| `text-[#3fb950]` | `#15803d` |
| `text-[#58a6ff]`, `text-[#4da3ff]` | `#2563eb` |
| `text-[#f85149]` | `#dc2626` |
| `text-[#ff7700]`, `text-[#ffc107]` | `#d97706` |

**테두리색**

| 다크 Tailwind 값 | 라이트 변환 값 |
|---|---|
| `border-[#30363d]`(+ alpha variants) | `#d1d5db` |
| `border-[#21262d]`, `border-[#3d444d]` | `#d1d5db` |
| `border-[#3fb950]` | `#22c55e` |
| `border-[#58a6ff]`, `border-[#4da3ff]` | `#60a5fa` |
| `border-[#f85149]` | `#ef4444` |

---

### 5-4. THEME 객체 패턴

#### 단순 패턴 (상태 색상 3개 이하)

```tsx
const THEME = {
  dark:  { textOK: '#3fb950', textDanger: '#f85149', textWarn: '#ff7700' },
  light: { textOK: '#15803d', textDanger: '#dc2626', textWarn: '#b45309' },
} as const;
const theme = THEME[themeMode];

<span style={{ color: theme.textOK }}>정상</span>
```

#### 전체 패턴 (출처: `CCTVMonitor.tsx:92`)

복잡한 컴포넌트에서 CSS 변수로 처리할 수 없는 동적 값(shadow, selected 배경 등)에 사용.

```ts
const COMPONENT_THEME = {
  dark: {
    surface: '#161b22',       border: '#30363d',
    panel: '#0d1117',         panelStrong: '#11161d',
    text: '#c9d1d9',          textMuted: '#8b949e',
    textOK: '#3fb950',        textDanger: '#f85149',
    textWarn: '#ff7700',      textInfo: '#58a6ff',
    hover: '#161b22',
    success: '#3fb950',       warning: '#ff7700',       danger: '#f85149',
    neutral: '#8b949e',
    darkBg: '#0b1017',
    modalBg: 'rgba(0,0,0,0.7)',
    overlayBg: 'rgba(0,0,0,0.62)',
    selectedBg: '#3fb95022',  selectedShadow: '#3fb95044',
    inactiveText: '#484f58',
    thumbBg: '#0d1117',       thumbOverlay: 'rgba(13,17,23,0.85)',
  },
  light: {
    surface: '#ffffff',       border: '#d1d5db',
    panel: '#f8fafc',         panelStrong: '#f1f5f9',
    text: '#0f172a',          textMuted: '#64748b',
    textOK: '#15803d',        textDanger: '#dc2626',
    textWarn: '#b45309',      textInfo: '#1d4ed8',
    hover: '#f1f5f9',
    success: '#15803d',       warning: '#b45309',       danger: '#dc2626',
    neutral: '#94a3b8',
    darkBg: 'rgba(15,23,42,0.35)',
    modalBg: 'rgba(15,23,42,0.45)',
    overlayBg: 'rgba(15,23,42,0.75)',
    selectedBg: '#bbf7d0',    selectedShadow: '#22c55e44',
    inactiveText: '#64748b',
    thumbBg: '#f8fafc',       thumbOverlay: 'rgba(15,23,42,0.62)',
  },
} as const;
```

---

### 5-5. 조건부 className 패턴 (Navbar 방식)

CSS 변수 대신 `themeMode` 삼항으로 직접 분기. 자동 오버라이드가 안 되는 복합 조건에 사용.

```tsx
// 출처: Navbar.tsx:501-526
<div className={`border ${themeMode === 'dark' ? 'border-[#30363d]' : 'border-[#cbd5e1]'}`}>
  <span className={`px-2.5 py-1 text-xs cursor-pointer transition-all ${
    themeMode === 'dark'
      ? lang === 'ko' ? 'text-[#c9d1d9]' : 'text-[#6e7681] hover:text-[#c9d1d9]'
      : lang === 'ko' ? 'text-[#0f172a]' : 'text-[#64748b] hover:text-[#334155]'
  }`}>KO</span>
</div>
```

> 단순 색상 전환은 THEME 객체 + CSS 변수로 처리하고,
> 조건이 2개 이상 중첩될 때만 이 패턴을 사용한다.

---

### 5-6. 테마 전환 컨트롤 UI (Navbar 패턴)

```tsx
// D | L 토글 버튼 — 출처: Navbar.tsx:530-556
<div className={`flex items-center border ${themeMode === 'dark' ? 'border-[#30363d]' : 'border-[#cbd5e1]'}`}>
  <button
    onClick={() => setThemeMode('dark')}
    aria-pressed={themeMode === 'dark'}
    className={`px-2.5 py-1 text-[11px] font-medium transition-all ${
      themeMode === 'dark' ? 'text-[#c9d1d9]' : 'text-[#64748b] hover:text-[#334155]'
    }`}
  >D</button>
  <span className={themeMode === 'dark' ? 'text-[#6e7681]' : 'text-[#94a3b8]'}>|</span>
  <button
    onClick={() => setThemeMode('light')}
    aria-pressed={themeMode === 'light'}
    className={`px-2.5 py-1 text-[11px] font-medium transition-all ${
      themeMode === 'light' ? 'text-[#0f172a]' : 'text-[#64748b] hover:text-[#334155]'
    }`}
  >L</button>
</div>
```

---

## 6. 블록 시스템 (Block System)

### 파일 경로

| 역할 | 경로 |
|---|---|
| 정책 정의 | `src/app/PoC/blocks/poc-block-policy.ts` |
| 블록 빌더 | `src/app/PoC/blocks/poc-block-catalog.tsx` |
| 블록 래퍼 | `src/app/PoC/blocks/PoCBlockShell.tsx` |

### PoCBlockShell 사용

```tsx
<PoCBlockShell blockId="my-block-id">
  <MyComponent />
</PoCBlockShell>
// → <section id="poc-block-my-block-id" data-poc-block="my-block-id"
//            data-poc-block-name="블록 이름" aria-label="블록 이름">
```

`blockId`는 `pocBlockPolicies`에 등록된 키여야 `name`이 자동 설정된다.

### 새 블록 정책 추가 (`poc-block-policy.ts`)

```ts
'my-new-block': {
  id: 'my-new-block',
  name: '블록 이름',
  purpose: '이 블록의 역할',
  requiredFields: ['themeMode', 'lang'],
  supportedStates: ['default', 'loading', 'error'],
  constraints: { minHeightPx: 400, allowEmptyData: false },
  prohibitedPatterns: [],
  acceptanceCriteria: [],
},
```

### PoCBlockContext (블록에 전달되는 컨텍스트)

```ts
interface PocBlockContext {
  lang: 'ko' | 'en';
  setLang: (lang: 'ko' | 'en') => void;
  themeMode: 'dark' | 'light';
  setThemeMode: (themeMode: 'dark' | 'light') => void;
  onOpenTrace: (trace: TraceabilityPayload) => void;
  rightSidebarData: PocRightSidebarData;
}
```

---

## 7. TraceableValue 사용 패턴

AI/Human 원본 추적이 필요한 값에 사용. 클릭 시 TracePanel을 연다.

```tsx
import TraceableValue from '../components/trace/TraceableValue';
import type { TraceabilityPayload } from '@/types/traceability';

<TraceableValue
  value="123.4 kg"
  trace={tracePayload}          // TraceabilityPayload
  themeMode={themeMode}
  onOpenTrace={handleOpenTrace}
  align="right"                 // 'left' | 'center' | 'right'
  showOriginBadge={true}        // AI / H 배지 표시 여부
/>
```

### TraceabilityPayload 핵심 필드

```ts
{
  is_ai_generated: boolean;   // true → AI 배지(보라), false → H 배지(파랑)
  display_value: string;      // aria-label에 사용
  // ... 기타 추적 메타데이터
}
```

---

## 8. Typography & Spacing 기준

### 텍스트 크기

| 용도 | Tailwind |
|---|---|
| 섹션 제목 | `text-xs font-semibold` (12px) |
| 레이블 | `text-[11px]` |
| 보조 텍스트 | `text-[10px]` |
| 숫자 강조 | `text-sm font-bold` ~ `text-base font-bold` |
| 모노스페이스 | `font-mono` |

### 간격

| 용도 | 값 |
|---|---|
| 패널 내부 패딩 | `p-3` (12px) |
| 헤더 패딩 | `px-4 py-3` |
| 버튼 패딩 | `px-3 py-1.5` |
| 배지 패딩 | `px-1 py-[1px]` |
| 섹션 간격 | `space-y-4`, `gap-4` |

---

## 9. 최소 높이 기준 (정책 기준)

출처: `poc-block-policy.ts` `constraints.minHeightPx`

| 블록 | ID | 최소 높이 |
|---|---|---|
| 상단 Navbar | `top-navigation` | 56px |
| 좌측 알림 사이드바 | `left-sidebar-alerts` | 600px |
| 헤더 KPI | `header-overview` | 320px |
| 예측 매트릭스 | `forecast-matrix` | 560px |
| 체중 분포 | `weight-distribution` | 500px |
| 우측 KPI 사이드바 | `right-sidebar-overview` | 700px |
| CCTV 모니터 | `cctv-monitor` | 520px |
