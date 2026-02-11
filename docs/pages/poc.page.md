---
title: "/PoC 페이지 운영 문서"
author: ZORO
last_updated: 26.02.11
---

# /PoC 페이지 운영 문서

## 1. 문서 정보
- 라우트: `/PoC`
- 페이지 파일: `src/app/PoC/page.tsx`
- 문서 파일: `docs/pages/poc.page.md`

## 2. 목적
- 농장 운영 대시보드 PoC 화면을 제공한다.
- 상단에서 버전 정보/개발 문서 모달을 확인할 수 있는 유일한 페이지다.

## 3. 화면/기능 구성
- 상단: `Navbar` (버전/문서 모달 포함)
- 본문 3열:
  - 좌측 `LeftSidebar`
  - 중앙 `Header` + `ForecastMatrix` + `WeightDistribution`
  - 우측 `RightSidebar`
- 하단: `CCTVMonitor` 전체폭 영역

## 4. 데이터/상태
- 페이지 상태: `lang` (`ko`/`en`)
- 샘플 센서 데이터: `sample-sensor-data.ts`에서 주입
- `totalBirdCount` 고정값(`20500`) 사용

## 5. 인터랙션 규칙
- 언어 상태는 상단과 각 섹션에 전달되어 동기화된다.
- 상단 문서/버전 모달은 `/PoC`에서만 노출한다.
- 각 세부 차트/패널의 상세 로직은 하위 섹션 컴포넌트 책임이다.

## 6. QA 체크리스트
- [ ] 상단 모달(업데이트 정보/개발문서) 열기/닫기가 정상 동작한다.
- [ ] 3열 레이아웃과 하단 CCTV 영역이 스크롤 내에서 정상 표시된다.
- [ ] 언어 전환 시 주요 섹션 텍스트가 즉시 반영된다.
