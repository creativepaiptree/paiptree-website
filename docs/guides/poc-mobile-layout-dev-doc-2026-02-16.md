---
title: "개발문서 - PoC 모바일/태블릿 반응형 정렬 개선"
author: ZORO
last_updated: 26.02.16
---

# 개발 문서

## 작업 배경
- 사용자 피드백에서 `체중분포` 및 `CCTV 무게예측` 헤더 영역이 모바일/태블릿에서 좌우 밀림, 줄바꿈 깨짐, 텍스트 누락이 반복적으로 발생.
- 데스크탑 기준은 정상이나 뷰포트가 좁아질수록 `flex` 고정 배치와 요소 고정 폭이 충돌.
- 목표는 기능/로직 변경 없이 UI 레이아웃만 수평 overflow를 제거하는 방식으로 안정화하는 것이었음.

## 변경 대상
- `/Users/zoro/projects/paiptree-website/src/app/PoC/sections/WeightDistribution.tsx`
- `/Users/zoro/projects/paiptree-website/src/app/PoC/sections/ForecastMatrix.tsx`

## 구현 핵심
1. 모바일 우선 레이아웃 전환 원칙
   - 데스크탑(`lg`)에서는 기존 구조 유지
   - 모바일에서는 열(`column`) 중심으로 쌓아 정보 밀도를 확보
2. 폭 제어
   - 버튼/카드에 `w-full` 또는 `flex: 1 1 auto` 적용
   - 최소 폭이 넓어 텍스트가 잘릴 수 있는 요소는 `min-width: 0` 유지
3. 텍스트/입력 크기 하향
   - 모바일에서 `text-[10px]`, `text-[11px]` 수준으로 축소
   - `목표범위` 입력필드 폭을 `w-14`에서 `w-12`로 축소해 밀림 저감
4. 구조 단위 재배치
   - `CCTV 무게예측`의 `accuracy-indicators`를 모바일에서 `flex-direction: column` 처리
   - `D-1/D-2/D-3` 카드를 각 행 1개(`width:100%`)로 표시

## 적용 코드 포인트
- `WeightDistribution.tsx`
  - 헤더 wrapper를 `lg:flex-row` 기반에서 모바일 `flex-col`로 분기
  - 보조 영역을 `sm`/`lg` 반응형 클래스으로 제어해 작은 뷰포트에서 overflow 완화
  - `N=` 라벨은 `whitespace-nowrap`로 줄바꿈 제어
- `ForecastMatrix.tsx`
  - `@media (max-width: 840px)` 내 `.forecast-header-actions`를 `flex-direction: column`, `align-items: stretch`로 변경
  - `.accuracy-indicators`도 `column` + `align-items: stretch`로 변경
  - `.accuracy-item`을 `width:100%`로 설정해 세로 리스트 형태 고정
  - `chart-mode-switch`(정확도 보기) 모바일 전체 폭 처리

## 데이터/상태 영향
- 기능 로직은 변경 없음
- 상태 변수(`showComparison`, `chartMode`, `showAccuracy`) 로직 유지
- API/TypeScript 구조/호출 경로 없음
- 리렌더 패턴은 기존과 동일하며 클래스 조건부 렌더만 추가 변경

## QA 체크 포인트
- [ ] `src/app/PoC/sections/WeightDistribution.tsx`
  - `체중분포` 헤더의 `N=`/입력/버튼이 모바일에서 줄어들 때도 라인에서 깨지지 않는지
  - 폰트 크기 축소 후 라벨이 완전히 보이는지
- [ ] `src/app/PoC/sections/ForecastMatrix.tsx`
  - 모바일에서 D-1/D-2/D-3 카드가 세로로 쌓이는지
  - `정확도 보기` 버튼이 가로 폭을 채우며 클릭 가능한지
- [ ] 폭별 스냅샷
  - 430x932 (iPhone 기준)
  - 768x1024 (태블릿 기준)
  - 1024+ (데스크탑 기준)

## 회고
- Tailwind 유틸만으로 처리 가능한 범위였고, 기존에 `style jsx`에서 이미 관리되는 미디어쿼리와 동시 수정해 충돌을 줄임.
- 텍스트만 줄이는 방식은 일시적 임시조치에 그치므로, 이번엔 `layout direction` 자체를 조정해 구조적 안정성을 확보함.

## 참조
- 작업 근거 로그: `/Users/zoro/Library/Mobile Documents/com~apple~CloudDocs/My_Knowledge_Base/journal/2026-02-16-poc-mobile-layout-refinements.md`
