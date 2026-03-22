---
title: 마케팅 페이지 스타일 기준서
author: ZORO
last_updated: 26.03.20
---

# 마케팅 페이지 스타일 기준서

Status: active marketing baseline  
Scope: 마케팅 페이지 공통 시각 규칙과, 현재 기준 페이지인 `/about` 라우트에서 직접 조합하는 섹션 컴포넌트  
Goal: `/about`을 마케팅 페이지 시각 시스템의 기준 페이지로 고정하고, 이후 `/services`, `/culture`, `/careers`, `/newsroom` 정렬의 기준점으로 사용한다.
Archive note: `docs/guides/old/**`는 이전 스타일 단계 가이드 아카이브이며, 현재 기준으로 사용하지 않는다.

## 1. 적용 범위

- 기준 페이지 파일: `src/app/about/page.tsx`
- 섹션 컴포넌트: `VideoHeroSection`, `StatsSection`, `CommandEcosystemSection`, `InfiniteCarouselSection`, `PlatformSection`, `CaseStudiesSection`, `PartnersSection`, `NewsSection`, `CTACardsSection`
- 공통 섹션 헤더: `src/components/AboutSectionHeader.tsx`
- 섹션 메타행: `src/components/site/SectionEyebrow.tsx`
- 공통 섹션 shell: `src/components/site/MarketingSection.tsx`
- 공통 스타일 utility: `src/app/globals.css` 내 `marketing-*` 클래스

## 2. 페이지 기준 토큰

`/about`은 흰 배경과 검은 배경을 교차하지 않는다. 면 분리는 아래 3단계만 허용한다.

- Base surface: `var(--color-bg)`
- Secondary surface: `var(--color-bg-surface)`
- Raised surface: `var(--color-bg-raised)`

텍스트 계층은 아래 조합만 사용한다.

- Primary heading: `var(--color-text)`
- Secondary body: `var(--color-text-sub)`
- Meta / number / label: `var(--color-text-dim)`
- Accent: `var(--color-accent)` 또는 `var(--color-accent-sub)`는 CTA, 활성 상태, 핵심 강조에만 사용

## 3. 섹션 간격 규칙

### 3.1 페이지 셸

- 페이지 루트: `min-h-screen`, `overflow-x-hidden`, `background: var(--color-bg)`
- 본문 시작: `main.pt-14`
- 공통 컨테이너: `container-max px-6`

### 3.2 기본 섹션 패딩

- Hero 제외 기본 섹션 상하 패딩: `py-24`
- 추가 확장 패딩 사용 금지: `py-20`, `py-28`, `pt-24 pb-16`, `py-0`는 기본값으로 사용하지 않는다.
- 예외는 Hero와 특수 인터랙션 섹션만 허용한다.

### 3.3 섹션 헤더 간격

- 메타행과 섹션 타이틀 사이 간격: `mb-6`
- 섹션 헤더 블록과 본문 사이 간격: 기본 `mb-16`
- 분할 패널 안 compact 헤더는 `mb-10`
- 섹션 헤더 내부 좌우 정렬은 `gap-10`을 기준으로 한다.

## 4. 섹션 헤더 규칙

### 4.1 Hero 메타행

Hero만 별도 규칙을 사용한다.

- 구성: `leading label + short line + trailing meta`
- 예시: `AI Smart Agriculture + line + Since 2021`
- 간격: `gap-3`, 전체 하단 여백 `mb-8`
- 색상: 선행 라벨은 accent, trailing meta는 dim

### 4.2 Standard Section Header

Hero를 제외한 상위 섹션은 모두 `AboutSectionHeader`를 사용한다.

구성:

- 번호
- 짧은 선
- 섹션 라벨
- 메인 타이틀
- 선택적 보조 설명
- 선택적 우측 보조 카피

규칙:

- 번호 형식: `/01`, `/02`처럼 2자리
- 메타행 색상: 기본 `dark` tone
- 메타행 line 길이: `24px`
- 라벨 폰트: `type-label`
- 기본 타이틀 크기: `type-heading-l`
- 보조 설명: `type-body`
- 우측 보조 카피: `type-body-s`, `italic`, `max-w-sm`

### 4.3 Compact Panel Header

분할 레이아웃 내부 패널은 compact variant를 사용한다.

규칙:

- 메타행은 Standard와 동일
- 타이틀 크기: `type-heading-m`
- 설명: `type-body-s`
- 헤더 블록과 본문 간격: `mb-10`

현재 적용 섹션:

- `CaseStudiesSection`

## 5. 타이포 기준

- Hero 선언형 제목: `type-display`
- 일반 섹션 대표 제목: `type-heading-l`
- 패널 내부 섹션 제목: `type-heading-m`
- 카드 제목: `type-heading-s`
- 일반 본문: `type-body`
- 메타, 날짜, 보조 설명: `type-body-s`
- 번호, 섹션 라벨, 카드 CTA 텍스트: `type-label`

추가 규칙:

- 섹션 대표 제목은 임의로 `type-heading-m`로 낮추지 않는다.
- 카드 안에서만 `type-heading-m`을 허용한다.
- 라벨 색상을 섹션마다 따로 바꾸지 않는다. 기본값은 `var(--color-text-dim)`이다.

## 6. 구조 규칙

`/about`에서 허용하는 섹션 구조는 아래 3종으로 제한한다.

### 6.0 중앙 스타일 primitive

Hero를 제외한 일반 섹션은 가능한 한 아래 primitive에서만 레이아웃/스타일 규칙을 가져온다.

- 섹션 shell: `MarketingSection`
- 섹션 헤더: `AboutSectionHeader`
- 메타행: `SectionEyebrow`
- 공통 패널: `marketing-panel`, `marketing-panel-raised`, `marketing-panel-accent`
- 공통 메트릭: `marketing-metric-cell`, `marketing-metric-note`, `marketing-metric-value`
- 공통 분할 패널: `marketing-split-panel-content`, `marketing-split-panel-divider`
- 공통 CTA 카드: `marketing-cta-card`, `marketing-cta-card--surface`, `marketing-cta-card--highlight`

금지:

- 섹션 파일마다 동일 역할의 보더/배경/타이포 값을 인라인으로 다시 선언
- 같은 성격의 카드 제목을 섹션마다 개별 `fontSize`, `fontWeight`, `letterSpacing`로 재정의
- 공통 패널 구조를 새 utility 없이 임시 class 조합으로 복제

### 6.1 Hero

- 대형 미디어
- 선언형 H1
- 짧은 설명
- 1차 / 2차 CTA

### 6.2 Standard Section

- `AboutSectionHeader`
- 메인 컨텐츠 블록 1개

적용 섹션:

- `CommandEcosystemSection`
- `InfiniteCarouselSection`
- `PlatformSection`
- `PartnersSection`
- `NewsSection`
- `CTACardsSection`

### 6.3 Split Panel Section

- 이미지 혹은 미디어 패널
- 우측 또는 하단 정보 패널
- 내부에 compact header 사용

적용 섹션:

- `CaseStudiesSection`

## 7. Accent 사용 규칙

Accent는 기본 텍스트 색이 아니다.

허용:

- Hero 선행 라벨
- 활성 탭 / 선택 상태
- CTA 링크와 CTA 버튼
- 강조 카드 1개

비허용:

- 일반 섹션 메타행 색상 자체를 accent로 변경
- 각 섹션마다 서로 다른 meta 색상 사용

## 8. 현재 섹션 매핑

- `VideoHeroSection`: Hero exception
- `StatsSection`: header 없는 data strip
- `CommandEcosystemSection`: Standard Section
- `InfiniteCarouselSection`: Standard Section
- `PlatformSection`: Standard Section
- `CaseStudiesSection`: Split Panel Section
- `PartnersSection`: Standard Section
- `NewsSection`: Standard Section
- `CTACardsSection`: Standard Section

## 9. QA 체크리스트

- [ ] Hero를 제외한 모든 상위 섹션이 `py-24`를 사용한다.
- [ ] Hero를 제외한 모든 상위 섹션 메타행이 `SectionEyebrow` 기반이다.
- [ ] Hero를 제외한 모든 상위 섹션 shell이 `MarketingSection` 기반이다.
- [ ] 상위 섹션 번호가 `/01`부터 순서대로 이어진다.
- [ ] 일반 섹션 메타행 색상이 `var(--color-text-dim)` 기준으로 통일된다.
- [ ] 일반 섹션 대표 제목이 `type-heading-l` 기준으로 통일된다.
- [ ] split panel 내부 예외는 `CaseStudiesSection` 하나만 유지한다.
- [ ] accent는 CTA, 활성 상태, 강조 카드 외에는 남용하지 않는다.
- [ ] 반복되는 패널/메트릭/CTA 스타일이 `marketing-*` utility에서만 정의된다.
