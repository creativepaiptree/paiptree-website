---
title: WeightDistribution 설계 문서
author: ZORO
last_updated: 26.02.10
---

# WeightDistribution 설계 문서

## 1. 문서 정보
- 문서명: `WeightDistribution Specification`
- 관련 구현:
`/src/app/PoC/sections/WeightDistribution.tsx`
- 노출 페이지:
`/src/app/PoC/page.tsx` (`/PoC`)
- 문서 목적:
체중 분포 히스토그램을 운영 판단용 KPI + 연구용 상세 지표로 분리해 제공

## 2. 컴포넌트 목적
- 현장 담당자가 1차 판단할 수 있는 상단 KPI(6개)를 우선 노출한다.
- 연구/분석 지표는 접이식 영역으로 분리해 인지부하를 낮춘다.
- 전일(D-1) 비교 막대를 통해 분포 변화 방향을 시각적으로 제공한다.

## 3. 화면 구성
- 헤더: 제목 + 표본수(`N`) 칩 + 목표범위 입력(min/max) + 전일 비교 토글
- 상단 KPI(6): 평균체중, CV, 타겟 적합률, Under, 예상 출하 가능, 전일 대비 변화
- 히스토그램: 무게별 마릿수 분포 + 타겟존 음영 + 평균선/표준선 + 전일 ghost bar
- 하단 요약: 규격 미달 예상 마릿수
- 상세(접이식): 연구 지표 KPI(4) + 분포 테이블 + 전체보기 토글
- 측정시각 표시: 차트 하단 우측 고정

## 4. 데이터 모델
- `WeightBin`
  - rangeStart, rangeEnd, rangeLabel, center, count, prevCount, percentage, cumulative, zone
- `Zone`
  - `under | target | over`
- `RawPoint`
  - `x`(무게), `y`(마릿수)
- 입력 데이터
  - `RAW_POINTS`: 실측 분포 포인트 상수 배열 (`2258.8g~3638.2g`)
  - `DISTRIBUTION_STAT_TIME`: 표시용 측정 시각

## 5. 핵심 로직
- 분포 생성:
  - `RAW_POINTS`를 그대로 사용해 무게 축 분포를 렌더
  - `buildRows`에서 구간 경계/비율/누적비율/zone 계산
- 비교 데이터:
  - `prevCount`는 zone별 계수로 생성한 전일 비교용 값
  - under: `+12~18%`, target: `-3~+3%`, over: `-10~16%` 범위 변동
- KPI 계산:
  - `CV = stdDev / meanWeight * 100`
  - `Target Fit = target zone 비율`
  - `Under/Over = zone 비율`
  - `P10/P50/P90`는 가중 분위수(`weightedPercentile`)로 계산
  - 평균체중 카드에 `vs 표준`(타겟 중심값 대비 g 차이) 표시
- 톤 규칙(`getPoultryTone`):
  - CV: `<8` good, `8~12` medium, `>12` bad
  - 타겟적합률: `>75` good, `50~75` medium, `<50` bad
  - Under/Over: `<5` good, `5~15` medium, `>15` bad
- 운영 KPI 튜닝 기준(`OP_THRESHOLDS`):
  - Band Coverage(타겟적합률): `good >= 78`, `medium >= 65`, `bad < 65`
  - CV Grade: `good <= 8.5`, `medium <= 10.5`, `bad > 10.5`
  - P10/P50/P90 폭(`(P90-P10)/mean`): `good <= 18`, `medium <= 24`, `bad > 24`
  - vs D-1 Delta:
    - good: `deltaTarget >= 0` AND `deltaUnder <= 0`
    - medium: `deltaTarget >= -1.5` AND `deltaUnder <= 1.5`
    - bad: 나머지

## 6. 차트 규칙
- 라이브러리: `Recharts ComposedChart`
- 막대 색상:
  - under: `rgba(248, 81, 73, 0.7)`
  - target: `rgba(63, 185, 80, 0.85)`
  - over: `rgba(255, 119, 0, 0.7)`
- 오버레이:
  - `ReferenceArea` 타겟존 음영
  - `ReferenceLine` 평균선(녹색), 표준선(파랑)
- 비교:
  - 토글 ON 시 `prevCount` ghost bar 표시

## 7. 상태/상호작용
- 상태:
  - `showComparison`, `expanded`, `tableExpanded`, `targetMinInput`, `targetMaxInput`
- 상호작용:
  - 비교 토글 ON/OFF
  - 상세 지표 접기/펼치기
  - 테이블 전체보기/접기
  - 목표범위 입력(min/max) 즉시 반영

## 8. 스타일 규칙
- 카드 베이스: `bg-[#161b22] border border-gray-800 rounded-lg p-4`
- 상단 KPI: `grid-cols-2`, `md:grid-cols-6`
- 하단 연구 KPI: `grid-cols-2`, `md:grid-cols-4`
- KPI 텍스트: label(12px) / 설명(10px) / 값(17px or 12px) / sub(10px)
- 테이블: sticky header + zone 배경 약한 음영

## 9. 제한사항
- 현재는 컴포넌트 내부 상수(`RAW_POINTS`) 기반이며 API/DB 미연동
- 측정시각(`DISTRIBUTION_STAT_TIME`)은 고정값
- 전일 비교는 동일 배치 기준이 아닌 생성 규칙 기반

## 10. QA 체크리스트
- 목표범위(min/max) 입력 시 zone 색상/KPI가 즉시 갱신되는지 확인
- 전일 비교 토글 시 ghost bars가 정상 표시/숨김되는지 확인
- 타겟존 음영/평균선/표준선이 항상 표시되는지 확인
- 상세보기 접기/펼치기 동작 확인
- 테이블 `전체보기/접기` 토글 동작 확인
- `/PoC` 경로에서 정상 렌더되는지 확인
- ko/en 전환 시 라벨 정상 변경 확인
