---
title: 데이터 추적성 UI 기획서
author: ZORO
last_updated: 26.02.11
---

# 데이터 추적성 UI 기획서

## 1. 문서 정보
- 문서 목적: PoC 기반 L1→L2→L3 데이터 출처 추적 UI의 제품 기획 기준 정의
- 적용 범위: `src/app/PoC/**` 및 향후 대시보드/리포트/상세화면 공통 추적 UI
- 관련 문서:
  - `docs/pages/poc.page.md`
  - `src/types/traceability.ts`
  - `src/contracts/dashboard-data.ts`

## 2. 목적
- 고아 데이터 금지 원칙을 UI와 API 계약에 반영한다.
- 화면의 모든 핵심 값이 산출 근거와 원본으로 연결되도록 한다.
- 사용자가 Human/Legacy 데이터와 AI 생성 데이터를 혼동하지 않게 한다.

## 3. 화면/기능 구성
- L1 Surface
  - 최종 값 중심 노출 (`82%`, `1,081g` 등)
  - 모든 값은 클릭 가능한 `TraceableValue` 패턴으로 통일하고 출처 정체성은 `AI/H` 배지로 구분
  - 구현 컴포넌트: `TraceableValue`
- L2 Logic
  - 값 선택 시 우측 추적 패널 오픈
  - 패널 탭: `Summary`, `Logic`, `Sources`, `History`
  - 구현 컴포넌트: `TracePanel`
- L3 Source
  - `Sources` 탭에서 원본 목록/상세 분할 표시
  - 원본 링크 새 탭 오픈 + 하이라이트 텍스트/앵커 제공
  - 추적 체인 URL 복사 지원(`trace_id` 기반)

## 4. 핵심 로직
- 진입/종료
  - 기본 진입: 클릭
  - 보조 힌트: hover 스타일
  - 종료: ESC, 오버레이 클릭, 닫기 버튼
- 상태 모델
  - `activeTrace: TraceabilityPayload | null`
  - `isTracePanelOpen: boolean`
  - 패널 내부: `tab`, `selectedSourceIndex`
- 출처 정체성
  - `is_ai_generated=false`: Human/Legacy 배지
  - `is_ai_generated=true`: AI Generated 배지
  - 주의: 좋음/나쁨 성능 색상과 출처 배지는 분리 운영

## 5. 데이터 모델
- 공통 타입: `src/types/traceability.ts`
  - `TraceabilityPayload`
  - `DataSourceReference`
- 핵심 필드
  - `trace_id`: 추적 체인 고유 키
  - `display_value`: L1 표시 값
  - `logic_summary`, `logic_formula`: L2 설명
  - `data_source[]`: L3 원본 목록
  - `is_ai_generated`: AI 여부
  - `source_version`, `snapshot_at`, `confidence`: 재현/신뢰도
- 계약 반영 위치
  - `src/contracts/dashboard-data.ts` (`traceCatalog` optional)
  - `src/contracts/dashboard-data.schema.json` (`traceCatalog`/`traceabilityPayload` 정의)
  - `src/data/dashboard-data.json` (샘플 traceCatalog)

## 6. 인터랙션 규칙
- 값 노출 규칙
  - KPI/핵심 수치값은 `TraceableValue` 적용
  - 텍스트 링크가 아닌 버튼 semantics 사용(접근성)
- 패널 규칙
  - 기본 탭은 `Summary`
  - `version_history` 존재 시 `History` 탭에서 시점 비교(`현재` vs `과거`)를 제공
  - `History` 비교 카드에서 값/신뢰도 변화량을 색상(증가=녹색, 감소=적색)으로 표시
  - `History` 비교 카드에서 source 추가/제거/공통 목록 diff를 제공
  - CCTV trace(`trace_id`가 `cctv:` 접두사)는 `CCTV` 탭(`Frame`/`Pipeline`/`Raw`)을 추가 노출
  - source 선택 시 상세 패널 내용 즉시 갱신
  - 복사 버튼은 성공 시 짧은 피드백(`복사 완료`) 노출
- 네비게이션 규칙
  - 컨텍스트 유지: 원화면 이동 없이 우측 패널에서 추적
  - 외부 원본은 새 탭으로 열기
  - `ForecastMatrix` 차트 툴팁의 `출처 열기` 버튼/포인트 클릭으로 trace 진입

## 7. 예외/에러 처리
- 출처 누락
  - `data_source` 빈 배열이면 `Sources` 탭에서 빈 상태 메시지 표시
- 링크 불가
  - 링크 열기 실패는 브라우저 기본 동작에 위임, 내부 값은 유지
- 클립보드 실패
  - 복사 실패 시 상태 토글 없이 현재 버튼 라벨 유지
- 데이터 미완성
  - `source_version`, `snapshot_at`, `confidence` 미존재 시 `-` 표기

## 8. QA 체크리스트
- [x] `Header` 핵심 값 클릭 시 `TracePanel`이 열린다.
- [x] `WeightDistribution` KPI 값 클릭 시 `TracePanel`이 열린다.
- [x] 패널에서 `Summary/Logic/Sources` 탭 전환이 정상 동작한다.
- [x] `Sources` 탭에서 소스 선택 시 상세 정보가 갱신된다.
- [x] `원본 열기` 링크가 새 탭으로 열린다.
- [x] `출처 체인 링크 복사` 클릭 시 복사 완료 피드백이 표시된다.
- [x] ESC/오버레이 클릭으로 패널이 닫힌다.
- [x] AI/H 배지가 성능 색상과 혼동 없이 노출된다.
- [x] `ForecastMatrix` 차트 툴팁에서 trace 진입이 가능하다.
- [x] CCTV trace에서 `Frame`/`Pipeline`/`Raw` 탭 전환이 가능하다.
- [x] `History` 탭에서 버전/시점 선택 후 값 변화와 요약 변경 여부를 비교할 수 있다.
- [x] `History` 탭에서 source diff(추가/제거/공통)가 표시된다.

## 9. 단계별 적용 계획
1. 1차(완료)
   - `Header`, `WeightDistribution`에 추적 UI 적용
   - 공통 타입/컴포넌트/계약 스키마 반영
2. 2차(완료)
   - `ForecastMatrix` 정확도/예측 카드 추적 연결
   - `RightSidebar` 생존율·도태·센서 최신 KPI 추적 연결
3. 3차(완료)
  - `CCTVMonitor` 프레임 메타데이터(`capturedAt`/`processedAt`/`imageUrl`) L3 소스 연결
  - `TracePanel` CCTV 전용 탭(`Frame`/`Pipeline`/`Raw`) 추가
  - 버전 히스토리/시점 비교 UX 추가

## 10. 업데이트 진행 현황 (26.02.11)
- 범위 기준: 본 문서 2~6장의 설계 원칙(L1/L2/L3, 출처 정체성, 계약 필드)을 완료 기준으로 점검
- 진행 요약
  - 1차/2차/3차 계획 항목 모두 구현 완료
  - PoC 주요 섹션(`Header`, `ForecastMatrix`, `WeightDistribution`, `RightSidebar`, `CCTVMonitor`) 추적 연결 완료
  - 데이터 계약/샘플 데이터/UI 동작 간 필드 정합성 점검 완료

### 10-1. L1 Surface 진행 상세
- 완료
  - KPI/예측/센서/프레임 메타 값을 `TraceableValue`로 통일
  - 값 자체가 버튼 semantics를 가지며 클릭 시 L2 진입되도록 정리
  - AI/H 배지로 Human/AI 정체성을 일관 표시
- 최근 조정(운영 가독성)
  - 값 옆 인포 원형 아이콘 제거
  - 값 옆 `출처` 텍스트 제거
  - 클릭 가능한 패턴(hover/focus, 배지, 값 강조)은 유지

### 10-2. L2 Logic 진행 상세
- 완료
  - 우측 `TracePanel` 단일 진입 구조로 표준화
  - 탭 구조: `Summary` / `Logic` / `Sources` / `History`(+CCTV trace 시 `CCTV`)
  - `ForecastMatrix` 툴팁 버튼/포인트 클릭에서 직접 trace 진입 지원
- 상세 동작
  - 요약/계산식/스냅샷 시각/버전/신뢰도 표시
  - `History`에서 target/base 스냅샷 선택 및 값 변화/신뢰도 변화 계산
  - 요약 텍스트 변경 여부와 source diff(추가/제거/공통) 동시 확인

### 10-3. L3 Source 진행 상세
- 완료
  - `Sources` 탭의 목록-상세 분할 레이아웃 적용
  - source type(file/db/api/slack/email/jira/drive)별 메타 표시 규칙 통일
  - 원본 새 탭 열기 및 하이라이트/앵커 표시 지원
  - trace 체인 URL 복사와 성공 피드백(`복사 완료`) 제공
- CCTV 특화
  - `CCTV` 탭 내 `Frame`/`Pipeline`/`Raw` 전환 지원
  - 프레임 캡처/가공 시각과 원본 링크를 동일 패널에서 검증 가능

### 10-4. 데이터 계약/엔지니어링 진행 상세
- 완료
  - `src/types/traceability.ts`: 공통 타입 고정
  - `src/contracts/dashboard-data.ts`: `traceCatalog` 계약 반영
  - `src/contracts/dashboard-data.schema.json`: 스키마 레벨 검증 항목 반영
  - `src/data/dashboard-data.json` 및 섹션별 샘플 trace 데이터 정합성 동기화
- 필수 필드 운용
  - `display_value`, `logic_summary`, `logic_formula`, `data_source[]`, `is_ai_generated`
  - `source_version`, `snapshot_at`, `confidence`, `version_history`

### 10-5. 안정화/검증 진행 상세
- 완료
  - `WeightDistribution` 차트의 Recharts `width(-1)/height(-1)` 빌드 경고 해소
  - 클라이언트 마운트 후 차트 렌더 + 동일 크기 placeholder로 초기 레이아웃 안정화
  - 린트/빌드 검증 루프 통과로 회귀 여부 확인
