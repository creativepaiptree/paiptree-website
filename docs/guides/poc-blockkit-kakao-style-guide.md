---
title: PoC 카카오워크 Block Kit 스타일 가이드
author: ZORO
last_updated: 26.03.06
---

# PoC 카카오워크 Block Kit 스타일 실행 가이드

## 0. 왜 이 방식인지
- PoC에서 가장 먼저 필요한 것은 즉시 사용 가능한 UI 조립.
- 카카오워크 Block Kit의 장점은 `블록 + 정책`이 하나의 운영 규칙으로 묶여 있다는 점.
- `/PoC`는 현재 `Navbar`, `Sidebar`, `차트`, `모니터`처럼 영역 구분이 명확해 블록 구조 적용 비용이 낮다.

## 1. 적용 전제
- 블록 정의: `src/app/PoC/blocks/poc-block-policy.ts`
- 블록 카탈로그: `src/app/PoC/blocks/poc-block-catalog.tsx`
- 페이지 조립: `src/app/PoC/page.tsx`
- 공통 트레이스: `src/app/PoC/components/trace/*`

## 2. 블록 우선순위 규칙
- 1순위: 기능 단위(상단/좌측/중앙/우측/하단)로 나눈다.
- 2순위: 각 블록은 `prohibitedPatterns`를 먼저 확인한다.
- 3순위: 정책에서 허용한 상태(`default/loading/empty/error`)만 노출한다.
- 4순위: UI가 바뀌면 먼저 정책을 고치고, 그다음 컴포넌트를 바꾼다.

## 3. 현재 블록 표준
- `top-navigation`: 글로벌 액션 모음 (현재 `Navbar`)
- `left-sidebar-alerts`: 알림/운영 상태 (`LeftSidebar`)
- `header-overview`: 핵심 KPI (`Header`)
- `forecast-matrix`: 예측 차트+표 (`ForecastMatrix`)
- `weight-distribution`: 체중 분포 분석 (`WeightDistribution`)
- `right-sidebar-overview`: 센서·생존율/지표 (`RightSidebar`)
- `cctv-monitor`: 라이브/보관 영상 (`CCTVMonitor`)

## 4. 코드 구조 반영 체크리스트
- `src/app/PoC/blocks/poc-block-policy.ts`에 정책 항목이 먼저 반영되어 있는지 확인.
- `src/app/PoC/blocks/poc-block-catalog.tsx`에서 신규/변경 블록이 맵핑되어 있는지 확인.
- `src/app/PoC/page.tsx`에서 `buildPocBlockCatalog(...)`로만 조립하고 있는지 확인.
- 기존 개별 섹션 컴포넌트는 기능만 유지하고 레이아웃 책임은 페이지에서 분리했는지 확인.

## 5. Storybook 적용 방법(이미 구성 완료)
- 실행용 스크립트:
  - `npm run storybook`
  - `npm run build-storybook`
- 최초 실행 전에 Storybook 의존성을 한 번만 설치:
  - `npm i -D @storybook/nextjs @storybook/react @storybook/blocks @storybook/addon-essentials @storybook/addon-a11y @storybook/addon-designs`
- Story 단위(현재 구현된 목록):
  - `PoC/Blocks/Top Navigation`
  - `PoC/Blocks/Left Sidebar`
  - `PoC/Blocks/Center Blocks`
  - `PoC/Blocks/Right Sidebar`
  - `PoC/Blocks/Bottom CCTV Monitor`
  - `PoC/Trace/TracePanel`
  - `PoC/Blocks/BlockShell`
  - `PoC/Page`
- 블록 정책(`poc-block-policy.ts`)은 각 스토리 `docs` 설명에 policy-id로 노출되며, 추적 가능한 변경점만 확인한다.
- CCTV/TracePanel는 상태 스냅샷을 `default/loading/empty/error`로 분리한다.
- 추천 정합성 체크:
  - 언어 전환(ko/en)
  - `Top Navigation`의 버튼/드롭다운 렌더
  - `ForecastMatrix`와 `Header`의 트레이스 링크 동작
  - `RightSidebar`의 센서 그래프 렌더
  - `CCTVMonitor`의 탭 전환과 프레임 카드 렌더
  - `TracePanel`의 Summary/Logic/Sources 탭 렌더

## 6. 운영 절차
- PR 올리기 전 블록 5개 영역이 모두 렌더되는지 육안 점검.
- 블록 정책 텍스트와 실제 UI가 일치하는지 체크.
- 언어 변경, 트레이스 열기, 닫기, 값 클릭 동작은 필수 테스트.
- 정책 파일은 "실행 기준"이므로 임시로 무시하지 않고, 변경 시 문서부터 먼저 수정.

## 7. 상태 스냅샷 기준(운영형 체크리스트)
- `cctv-monitor` 정책 검증
  - [ ] `loading`: live/archive 모두 로딩 문구 노출
  - [ ] `empty`: noFrame 상태로 빈 데이터 처리
  - [ ] `error`: live/archive 에러 문구 노출
  - [ ] 정책 ID/스토리명/검증 항목 정합성
- `trace-panel` 정책 검증
  - [ ] `loading`: 추적 패널 대기 상태 메시지 표시
  - [ ] `empty`: 추적 데이터 없음 메시지 표시
  - [ ] `error`: 조회 실패 메시지 표시
  - [ ] default 상태에서 History/CCTV 탭 접근이 가능한지 기본 동작 확인

## 8. 다음 작업 제안
- 다음에 할 일: TracePanel까지 블록화해 정책 기반 탭 정책(`summary/logic/sources/history/cctv`)도 같은 방식으로 문서화.
- 장기: 블록별 API 타입을 API 응답 스키마로 추출해 `trace`와 연동.
