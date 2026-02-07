---
title: ForecastMatrix 설계 문서
author: ZORO
last_updated: 26.02.10
---

# ForecastMatrix 설계 문서

## 1. 문서 정보
- 문서명: `ForecastMatrix Specification`
- 관련 구현:
`/src/app/PoC/sections/ForecastMatrix.tsx`  
`/src/data/dashboard-data.json`  
`/src/contracts/dashboard-data.ts`  
`/src/contracts/dashboard-data.schema.json`  
`/src/lib/forecast-metrics.ts`
- 문서 목적:
`CCTV WEIGHT` 차트와 `ROLLING FORECAST MATRIX` 테이블의 데이터 표현/계산/상호작용 로직을 운영 기준으로 정의

## 2. 컴포넌트 목적
- 닭 체중 데이터를 일령 기준으로 시각화한다.
- 예측(D-1/D-2/D-3)과 실측 간 오차를 즉시 비교할 수 있게 제공한다.
- 차트 호버와 테이블 컬럼 하이라이트를 연동해 해석 흐름을 단일화한다.

## 3. 화면 구성
- 상단: `CCTV WEIGHT`
  - 모드 전환: 메인 차트 <-> 예측 정확도 차트
  - 메인 차트: 라인/막대 혼합 차트 (Chart.js)
  - 정확도 차트: 표준체중/실측/D-1/D-2/D-3 비교 라인 차트
  - D-1/D-2/D-3 정확도 카드 + 카드별 호버 상세
- 하단: `ROLLING FORECAST MATRIX`
  - 전치 테이블(가로=일령, 세로=날짜)
  - `주간보기/전체보기` 전환
  - 주차(25~31, 32~38, 39~45) 네비게이션

## 4. 데이터 모델
- 주요 타입:
  - `Point = { x: number; y: number }`
  - `Cell = prediction | actual | future | empty`
  - `TransposedColumn` (age, xIndex, isTodayAge)
  - `TransposedRow` (date, dateSub, xIndex, isToday, cells)
- 현재 데이터 소스:
  - 단일 원천 JSON: `/src/data/dashboard-data.json`
  - 런타임 계약 검증: `assertDashboardForecastData` (`/src/contracts/dashboard-data.ts`)
  - 스키마 명세: `/src/contracts/dashboard-data.schema.json`
  - 계산 유틸 단일화: `/src/lib/forecast-metrics.ts`
- 핵심 기준값:
  - `BASE_DATE = 2025-12-27`
  - `AGE_OFFSET = 2` (`age = xIndex - 2`)
  - `TODAY_INDEX = 37` (고정)
  - `FORECAST_START_INDEX = 27`
  - 차트 범위: `CHART_MIN_INDEX=10` ~ `CHART_MAX_INDEX=47`
  - 테이블 범위: `TABLE_START_X=24` ~ `TABLE_END_X=47`, `TABLE_START_AGE=25` ~ `TABLE_END_AGE=45`

## 5. CCTV WEIGHT 핵심 로직
- 모드 구성:
  - `main`: 기존 CCTV Weight 혼합 차트
  - `accuracy`: 예측 정확도 비교 차트
- 데이터셋 구성(표시 순서 기준):
  - `main`
    1. 예측 영역(fill)
    2. 표준 체중(파란 선)
    3. 과거 막대
    4. 실측 막대
    5. 예측 막대
    6. 과거 라인
    7. 실측 라인
    8. 예측 라인
  - `accuracy`
    1. 표준 체중
    2. 실측값
    3. D-1
    4. D-2
    5. D-3
- 막대 색 규칙:
  - `xIndex 27~37`(예측 시작~오늘)은 강제 녹색 `#3fb950`
  - 그 외는 시리즈 기본색(회색/민트/노랑)
  - 막대 두께는 고정(`barThickness=6`, `maxBarThickness=6`, `grouped=false`)
- 상단 숫자 오버레이:
  - `todayForwardLabelsPlugin`으로 오늘/오늘+1/오늘+2/오늘+3 값 표시
  - 오늘 값은 녹색/볼드, 나머지는 노랑
- 공통 규칙 적용:
  - 오차 분류(`±3/±5/>±5`), `%` 올림(절댓값 기준 소수 1자리), 색상 매핑은 `forecast-metrics`를 단일 소스로 사용

## 6. 차트 호버 툴팁 로직
- 헤더:
  - `"{일령} {M/D} 22:00"` 형식
- 본문 1줄:
  - `예측무게: {값}` 또는 미래 시점은 `(분석중)`
- 본문 추가 3줄:
  - 도래한 날(`dayIndex <= TODAY_INDEX`): `+1/+2/+3` 대상 일령별 값과 `(Δg, Δ%)` 계산
  - 미도래한 날(`dayIndex > TODAY_INDEX`): `오늘+1일령: -`, `오늘+2일령: -`, `오늘+3일령: -`
- 미래 실측일 셀의 `future label`은 날짜 차에 따라 `D-1/D-2/D-3`로 동적 표기
- `%` 표기는 절댓값 기준 소수 1자리 올림을 사용한다.
- 오차색 규칙(툴팁 라인):
  - `|pct| <= 3`: 녹색
  - `3 < |pct| <= 5`: 노랑(`#ffc107`)
  - `|pct| > 5`: 빨강

## 7. 정확도 카드 로직 (D-1/D-2/D-3)
- 평균 정확도 계산:
  - `accuracy = 100 - mean(abs((pred-actual)/actual)*100)`
  - 표시값은 소수 1자리 올림으로 렌더링한다.
  - 실측값이 존재하는 xIndex만 집계 (`OBSERVED_ACTUAL_POINTS` 기준)
- 카드 색상 톤:
  - `>=97`: good(녹)
  - `>=95 && <97`: medium(오렌지 `#ff7700`)
  - `<95`: bad(빨)
- 카드 호버 상세:
  - `총 N일: ±g (±%)` 요약
  - 일령별 라인 출력 (`"{일령}일령 {N일전}: ±g (±%)"`)
  - `%` 텍스트는 절댓값 기준 소수 1자리 올림을 사용한다.
  - 라인톤은 `|pct|` 기준(`<=3` 녹 / `<=5` 오렌지 / `>5` 빨)

## 8. ROLLING FORECAST MATRIX 핵심 로직
- 구조:
  - X축: 일령 25~45
  - Y축: 날짜(`TABLE_START_X~TABLE_END_X`)
- 셀 타입 판정:
  - `horizon = ageX - dateX`
  - `horizon < 0` -> `empty`
  - `horizon = 0` -> `actual` 또는 `future`
  - `horizon = 1..3` -> `prediction`(D-1/D-2/D-3)
  - `horizon > 3` -> `empty`
- 주간보기 날짜 필터:
  - `getRelevantDateRange(startAge,endAge)`
  - `minDateX = startAge + AGE_OFFSET`
  - `maxDateX = endAge + AGE_OFFSET`
- 표시 모드:
  - `fitAll=true`: 오늘까지 전체 날짜 역순
  - `fitAll=false`: 주차 범위 날짜만 역순
- 초기 상태:
  - `week=2`에서 시작 (`32~38일령` 페이지가 기본)

## 9. 차트-테이블 연동
- 차트 `onHover`에서 `hoveredDay(xIndex)` 업데이트
- `hoveredDay -> hoveredAge -> hoveredColumnAge` 변환
- 테이블에서 해당 일령 열에 하이라이트(`hovered-col`) 적용
- 연동은 `main` 모드 기준으로 동작하며, `accuracy` 모드에서는 별도 포인트 비교 툴팁을 사용

## 10. 스타일/표현 규칙
- 오늘 행 하이라이트:
  - 가로행(`today-row`)만 강조
  - 세로열(`today-col`)은 투명 처리
- 테이블:
  - `thead` sticky
  - `table-layout: fixed`
- 실측 셀:
  - 녹색 배경 + 값 강조
  - 표시 텍스트에서 `✓`, `실측`, 괄호 제거 후 정리 표시
- 범례:
  - 실측/미래예측/오차구간(±3, ±5, >±5) 노출
- 오차 기준 세트(코드 기준):
  - 테이블 prediction 셀 색상: `±3%` / `±5%` / `>±5%` (`calcErrorClass`)
  - 색상 분류 기준은 원본값이 아닌 `%` 소수 1자리 올림 값 기준으로 판정한다.
  - 정확도 카드 바 색상: `>=97` / `>=95` / `<95` (`getAccuracyTone`)
  - 정확도 카드 호버 라인 색상: `<=3%` / `<=5%` / `>5%`
- `medium` 색상은 정확도 카드/호버에서는 오렌지(`#ff7700`), 메인 차트 툴팁에서는 노랑(`#ffc107`)을 사용

## 11. 현재 제한사항
- `todayIndex`가 JSON 고정값이라 운영시간 자동 반영이 안 됨
- 차트 툴팁 DOM(`chartjs-tooltip`)을 `document.body`에 직접 생성하는 구조
- 서버 데이터/API 연동 없이 정적 JSON 기반 렌더링
- 정확도 카드 톤 기준(97/95)과 라인 오차톤 기준(3/5)은 다른 기준을 사용

## 12. 운영 전환 권장사항
- 데이터 외부화:
  - 현재 JSON 계약(`dashboard-data`)을 API 응답 계약으로 승격
- 시간 기준 자동화:
  - `BASE_DATE` + 실시간 날짜로 `TODAY_INDEX` 동적 계산
- 품질 보강:
  - 예측값 누락/지연 시 fallback 정책(분석중/`-`)을 API 계약으로 명시
- 테스트:
  - 셀 타입 판정(`horizon`) 유닛 테스트
  - 툴팁 오차 계산 회귀 테스트
  - 주간/전체보기 필터 경계 테스트

## 13. QA 체크리스트
- `CCTV WEIGHT`의 차트 모드 전환(메인/정확도) 정상 동작
- 차트 hover 시 테이블 대응 일령 열 하이라이트 동작
- `주간보기`에서 3개 페이지(25~31, 32~38, 39~45) 정상 전환
- 최초 진입 시 주간 페이지가 `32~38일령(week=2)`로 시작되는지 확인
- `전체보기` 전환 시 오늘 이전 데이터만 렌더링
- 미래 시점 툴팁에서 `예측무게 (분석중)` 및 `+1/+2/+3 = -` 표기
- 정확도 카드/툴팁 색상 기준 정상 반영
