---
title: "/cherry_tms/claim-docs 페이지 운영 문서"
author: ZORO
last_updated: 26.04.26
---
# /cherry_tms/claim-docs 페이지 운영 문서

## 1. 문서 정보
- 라우트: `/cherry_tms/claim-docs`
- 페이지 파일: `src/app/cherry_tms/claim-docs/page.tsx`
- 문서 파일: `docs/pages/cherry_tms-claim-docs.page.md`

## 2. 목적
- 이 페이지는 review에서 승인된 결과를 바탕으로 차액청구서와 문서를 출력하는 마지막 단계다.
- 월별 차량 유류와 운임/수당 기준을 함께 본다.
- `monthly-vehicle` 보조 뷰와 연결해 정산월·차량 단위 누계를 먼저 확인한 뒤 청구를 만든다.
- 대시보드가 아니라 청구용 작업표에 가깝다.

## 3. 화면/기능 구성
- 상단: 문서 생성 실행 바, 정산월/운송사/지급 기준 요약
- 본문: 차액청구 집계표, 승인/산출 기준 요약, 월별 차량 청구 연결, 청구 근거 연결
- 하단: 문서 생성 작업행과 출력 실행

## 4. 데이터/상태
- 주요 데이터 소스:
  - `dispatch_settlement` 승인 결과
  - `fuel_settlement` 월별 차량 유류
  - `monthly-vehicle` 보조 뷰의 차량 누계 문맥
- 클라이언트 상태:
- 서버/정적 의존성:
  - 공유 TMS DB 직접 연결 금지
  - 별도 정산 DB 구조를 참고한 읽기 전용 집계

## 5. 인터랙션 규칙
- 주요 사용자 액션:
- 라우팅/네비게이션:
  - `monthly-vehicle`에서 월별 차량 누계를 확인한 뒤 청구로 이동
  - review에서 승인 후 claim-docs로 내려와 문서 생성
- 예외 동작:
  - 기사 교체, 유류 누락, 회차 누락은 보정 대상

## 6. QA 체크리스트
- [ ] 핵심 흐름 진입/이탈
- [ ] 데이터 로딩/에러 상태
- [ ] 반응형/접근성 기본 동작
- [ ] monthly-vehicle와의 연결 문구가 실제 흐름과 맞는가
