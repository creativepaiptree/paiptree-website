---
title: "/about 페이지 운영 문서"
author: ZORO
last_updated: 26.03.20
---
# /about 페이지 운영 문서

## 1. 문서 정보
- 라우트: `/about`
- 페이지 파일: `src/app/about/page.tsx`
- 문서 파일: `docs/pages/about.page.md`
- 스타일 기준서: `docs/guides/marketing-page-style-baseline.md`
- 문서 상태: active
- `docs/pages/무제 폴더/**`는 이전 페이지 문서 아카이브이며 현재 기준으로 사용하지 않는다.

## 2. 목적
- 회사/플랫폼 소개를 위한 메인 랜딩 페이지 역할을 수행한다.
- 공통 섹션 컴포넌트를 조합해 브랜드 메시지와 CTA를 일관되게 전달한다.

## 3. 화면/기능 구성
- 상단: `Header`, 배경 효과 `ParticleBackground`
- 본문: `VideoHeroSection` → `StatsSection` → `CommandEcosystemSection` → `InfiniteCarouselSection` → `PlatformSection` → `CaseStudiesSection` → `PartnersSection` → `NewsSection` → `CTACardsSection`
- 하단: `Footer`
- 섹션 역할:
  - `CommandEcosystemSection`: 플랫폼/에이전트가 어떻게 연결되는지 설명하는 구조 섹션
  - `InfiniteCarouselSection`: 예측·최적화·경보·추적 기능을 모듈 단위로 보여주는 적용 섹션
  - `PlatformSection`: 현장 운영, 공급 계획, 추적성 관리 담당자가 실제로 들어가는 워크스페이스 소개 섹션
  - `CaseStudiesSection`: 브랜드 미션과 문제 정의를 전달하는 메시지 섹션
  - `NewsSection`: 대표 기사와 다음 기사 프리뷰를 가로 캐러셀로 보여주며, 인접 섹션 사이의 톤 전환을 만드는 피드 섹션

## 4. 데이터/상태
- 페이지 자체 상태 없음
- 번역/언어 컨텍스트 사용을 위해 `LanguageProvider`로 감싼 구성
- `NewsSection`은 `NEXT_PUBLIC_PAIPTREE_NEWS_API_BASE_URL`을 통해 `paiptree_ds` 뉴스 API를 직접 호출해 렌더링

## 5. 인터랙션 규칙
- 상단 내비게이션 동작은 `Header` 컴포넌트 규칙을 따른다.
- 섹션별 버튼/링크 동작은 각 하위 컴포넌트 책임이다.
- 페이지 레벨에서 별도 이벤트 핸들러는 없다.

## 6. QA 체크리스트
- [ ] `/about` 진입 시 섹션이 지정된 순서로 노출된다.
- [ ] `CommandEcosystemSection` 4개 카드가 서비스 링크(`/services`, `/tms`)로 정상 이동한다.
- [ ] 배경 파티클/헤더/푸터가 정상 렌더링된다.
- [ ] 언어 전환 시(헤더 토글) 섹션 텍스트가 정상 반영된다.
