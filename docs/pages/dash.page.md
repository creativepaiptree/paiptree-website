---
title: "/dash 페이지 운영 문서"
author: ZORO
last_updated: 26.02.15
---
# /dash 페이지 운영 문서

## 1. 문서 정보
- 라우트: `/dash`
- 페이지 파일: `src/app/dash/page.tsx`
- 문서 파일: `docs/pages/dash.page.md`
- 연관 기준: `platform/service/FMS/docs/ems-dashboard-structure.md`, `src/app/PoC/page.tsx`

## 2. 목적
- EMS 운영 대시보드 2.0의 기본 레이아웃 셸을 제공한다.
- PoC의 시각 톤과 3열 구조를 유지하면서 EMS 운영 흐름(이벤트-상태-조치)으로 전환한다.

## 3. 화면/기능 구성 (1차)
- 상단: `DashTopBar` (상태 배지, 수동 새로고침 버튼)
- 상단 하단: `ClusterStatusBar` (정상/주의/경고, 총 마리수, 가동률, 육성률)
- 본문 3열:
  - 좌측 `DrillMenuPanel` (권역 → 농장 → 동 → 포커스 드릴다운, 경로 표시)
  - 중앙 `OperationsPanel` (핵심 KPI, 입추-성장-출하 트랙, 상태/환경 분포 그래프, 농장 목록 정렬/필터)
  - 우측 `SensorPanel` (좌측 선택 경로에 동기화된 온도/습도/사료빈 차트)
- 하단: 1차 스코프 안내 및 `/PoC` 이동 링크

## 4. 데이터/상태
- 현재는 `src/app/dash/mock-data.ts` 샘플 뷰모델 사용
- API 계약 타입:
  - `src/contracts/ems-dashboard.ts`
  - `EmsDataMonitorResponse`
  - `EmsAgeStatResponse`
- 실연동 예정 API:
  - `GET /fms/dash/dataMonitor`
  - `GET /fms/dash/ageStat/{age}`

## 5. 운영 규칙
- 1차는 레이아웃/카드/상태 배지 중심으로 제공한다.
- 이벤트 라벨 계층화, 상세 드릴다운 다이얼로그, 타임축 교차 비교는 2차에서 제공한다.
- 누락 센서값은 `N/A`로 표시하고 화면 렌더를 유지한다.
- 대규모 농장(100+ 동) 기준으로 중앙 영역은 카드 타일 대신 목록형 UI를 우선 적용한다.
- 목록은 상태 필터(전체/경고/주의/정상)와 정렬(위험도/온도/습도/사료빈/이름)을 제공한다.
- 좌측 드릴 메뉴 선택은 중앙 목록/우측 센서 패널/상단 컨텍스트 라벨에 동기화된다.
- 화면 비율은 PoC 기준(좌 280 / 중앙 max 1128 / 우 320, max-width 1760)을 따른다.
- 페이지 자체 스크롤은 사용하지 않고, 필요한 스크롤은 각 패널 내부에서만 허용한다.

## 6. QA 체크리스트
- [ ] `/dash` 진입 시 3열 기본 레이아웃이 깨지지 않는다.
- [ ] 상단 상태바와 KPI 카드가 샘플 데이터로 정상 표시된다.
- [ ] 좌측 이벤트/조치 큐, 우측 센서 패널이 독립적으로 표시된다.
- [ ] 센서 누락값이 `N/A`로 표시되고 크래시가 없다.
- [ ] `/PoC` 이동 링크가 정상 동작한다.
