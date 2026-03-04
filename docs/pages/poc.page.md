---
title: "/PoC 페이지 운영 문서"
author: ZORO
last_updated: 26.03.05
---
# /PoC 페이지 운영 문서

## 1. 문서 정보
- 라우트: `/PoC`
- 페이지 파일: `src/app/PoC/page.tsx`
- 문서 파일: `docs/pages/poc.page.md`
- 연관 기획서: `docs/guides/p-root-traceability-ui-plan.md`
- 블록 정책: `src/app/PoC/blocks/poc-block-policy.ts`
- 블록 카탈로그: `src/app/PoC/blocks/poc-block-catalog.tsx`
- 블록 운영 가이드: `docs/guides/poc-blockkit-kakao-style-guide.md`
- 스토리북 상태 정의: `docs/guides/poc-blockkit-kakao-style-guide.md`
- 운영 표준 플로우(비개발자용): `docs/guides/poc-operations-playbook-kr.md`
- 스토리북 예시: `src/app/PoC/stories/PoCTracePanel.stories.tsx`, `src/app/PoC/stories/PocCctvMonitor.stories.tsx`

## 2. 목적
- 농장 운영 대시보드 PoC 화면을 제공한다.
- 상단에서 버전 정보/개발 문서 모달을 확인할 수 있는 유일한 페이지다.

## 3. 화면/기능 구성
- 카카오워크 Block Kit 스타일 기준으로 5개 영역과 7개 블록으로 구조화했다.
- 상단 블록: `top-navigation`
- 좌측 블록: `left-sidebar-alerts`
- 중앙 블록: `header-overview`, `forecast-matrix`, `weight-distribution`
- 우측 블록: `right-sidebar-overview`
- 하단 블록: `cctv-monitor`
- 추적 패널: `TracePanel` (값 클릭 시 우측 오버레이)

## 4. 데이터/상태
- 페이지 상태: `lang` (`ko`/`en`)
- 샘플 센서 데이터: `sample-sensor-data.ts`에서 주입
- `totalBirdCount` 고정값(`20500`) 사용
- 블록 렌더링 컨텍스트: `PocBlockContext`

## 5. 인터랙션 규칙
- 언어 상태는 상단과 각 섹션에 전달되어 동기화된다.
- 상단 문서/버전 모달은 `/PoC`에서만 노출한다.
- 각 하위 섹션 컴포넌트는 기존 로직을 유지한다.
- KPI/차트/추적 값은 `TraceableValue`로 통일 렌더링한다.
- 값 클릭 시 L2/L3 정보를 포함한 `TracePanel`이 열린다.
- `TracePanel` 내에서 `Summary`, `Logic`, `Sources` 탭을 전환한다.
- `TracePanel`에서 `History` 탭으로 시점 비교를 제공한다.
- CCTV trace는 `TracePanel`의 `CCTV` 탭(`Frame`, `Pipeline`, `Raw`)을 제공한다.
- `ForecastMatrix` 차트 툴팁의 `출처 열기` 또는 포인트 클릭으로 trace 패널 진입이 가능하다.
- `TracePanel`은 `loading/empty/error` 상태 스냅샷을 별도 관리한다.

## 6. 블록 정책 운영
- 정책 파일: `src/app/PoC/blocks/poc-block-policy.ts`
- 블록 변경은 정책 기반으로 승인한다.
- 정책 위반 여부는 `prohibitedPatterns`와 `acceptanceCriteria`로 판정한다.
- 모든 블록은 `default`, `loading`, `empty`, `error` 상태를 명시한다.
- 페이지는 `buildPocBlockCatalog`가 반환한 블록 사양을 순회해서 조립한다.
- Storybook은 `npm run storybook`로 실행하고, 스토리는 `src/app/PoC/stories/*.stories.tsx`를 사용한다.
- `TracePanel`은 `state` 옵션(`default/loading/empty/error`)으로 상태 스냅샷을 분리한다.

## 7. 스토리북 정합성 점검
- 스토리북 준비 후 블록 단위 스냅샷/상태 스토리를 분리해 관리한다.
- 권장 스토리북 단위: `top`, `left`, `center`, `right`, `bottom` 그룹.
- 각 블록은 정책에 정의된 제약/상태 값을 스토리의 controls로 검증한다.
- 실행 가이드는 `docs/guides/poc-blockkit-kakao-style-guide.md` 참조.
- 추가 점검:
  - CCTV 스토리에서 `loading/empty/error` 상태별 메시지와 빈 상태 전환 확인
  - TracePanel 스토리에서 `loading/empty/error` 상태에서 패널 닫기/오버레이 동작 확인

## 8. QA 체크리스트
- [ ] 상단 모달(업데이트 정보/개발문서) 열기/닫기가 정상 동작한다.
- [ ] 3열 레이아웃과 하단 CCTV 영역이 스크롤 내에서 정상 표시된다.
- [ ] 언어 전환 시 주요 섹션 텍스트가 즉시 반영된다.
- [x] `Header`/`WeightDistribution`/`ForecastMatrix`/`RightSidebar`/`CCTVMonitor` 값이 `TraceableValue`로 렌더링되고 `AI/H` 배지가 노출된다.
- [x] 값 클릭 시 `TracePanel`이 열리고 `ESC`/배경 클릭으로 닫힌다.
- [x] `TracePanel`의 `Sources` 탭에서 출처 선택, 하이라이트, 외부 링크 열기가 동작한다.
- [x] `TracePanel`의 `History` 탭에서 시점 비교(`현재` vs `과거`)가 동작한다.
- [x] `TracePanel`의 `History` 탭에서 source diff가 표시된다.
- [x] `ForecastMatrix` 차트 툴팁 `출처 열기`로 trace 패널이 열린다.
- [x] CCTV trace에서 `CCTV` 탭(`Frame`/`Pipeline`/`Raw`) 전환이 동작한다.
- [x] CCTV Monitor는 `loading/empty/error` 상태를 별도 스토리로 검증할 수 있다.
- [x] TracePanel은 `loading/empty/error` 상태를 별도 스토리로 검증할 수 있다.
- [ ] 블록 정책으로 구성된 상태값(`prohibitedPatterns`) 점검이 완료되었다.
