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
- 연관 기획서: `docs/guides/p-root-traceability-ui-plan.md`

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
- 추적 패널: `TracePanel` (L1 값 클릭 시 우측 오버레이)

## 4. 데이터/상태
- 페이지 상태: `lang` (`ko`/`en`)
- 샘플 센서 데이터: `sample-sensor-data.ts`에서 주입
- `totalBirdCount` 고정값(`20500`) 사용

## 5. 인터랙션 규칙
- 언어 상태는 상단과 각 섹션에 전달되어 동기화된다.
- 상단 문서/버전 모달은 `/PoC`에서만 노출한다.
- 각 세부 차트/패널의 상세 로직은 하위 섹션 컴포넌트 책임이다.
- `Header`/`WeightDistribution`/`ForecastMatrix`/`RightSidebar`/`CCTVMonitor`의 핵심 값은 `TraceableValue`로 렌더링한다.
- 값 클릭 시 L2/L3 정보를 포함한 `TracePanel`이 우측에서 열린다.
- `TracePanel` 내에서 `Summary`, `Logic`, `Sources` 탭을 전환할 수 있다.
- `TracePanel`에서 `History` 탭을 통해 버전 히스토리와 시점 비교를 제공한다.
- `History` 탭은 값/신뢰도 변화량 색상 표시와 source diff(추가/제거/공통)를 제공한다.
- CCTV 계열 trace는 `TracePanel`에서 `CCTV` 탭(`Frame`, `Pipeline`, `Raw`)을 추가로 제공한다.
- `Sources` 탭은 출처 목록과 상세 미리보기를 분할 표시하며 새 탭 원본 열기를 지원한다.
- `ForecastMatrix` 차트 툴팁의 `출처 열기` 버튼 또는 포인트 클릭으로 trace 패널 진입이 가능하다.

## 6. QA 체크리스트
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
