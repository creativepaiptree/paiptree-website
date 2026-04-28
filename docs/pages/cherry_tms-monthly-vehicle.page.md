---
title: "/cherry_tms/monthly-vehicle 페이지 운영 문서"
author: ZORO
last_updated: 26.04.26
---
# /cherry_tms/monthly-vehicle 페이지 운영 문서

## 1. 문서 정보
- 라우트: `/cherry_tms/monthly-vehicle`
- 페이지 파일: `src/app/cherry_tms/monthly-vehicle/page.tsx`
- 문서 파일: `docs/pages/cherry_tms-monthly-vehicle.page.md`

## 2. 목적
- 이 페이지는 `grouping` 실데이터를 정산월과 차량번호 기준으로 다시 묶어 월별 차량 내역을 보는 보조 운영 화면이다.
- 월 전체보기는 원천행을 바로 펼치는 화면이 아니라, **일간 grouping row들의 상위 그룹**으로 동작한다. 즉 `월 그룹 → 일간 그룹 → 원천행`의 2중 그룹 구조를 유지한다.
- settlement-review에서 월 단위 승인/차액을 본 뒤, claim-docs로 넘기기 전에 차량별 월 누계를 점검한다.
- 대시보드가 아니라 월마감용 작업표이며, 월/차량 URL 필터로 선택 상태를 유지한다.

## 3. 화면/기능 구성
- 상단: 정산월, 선택 차량, 월 누계 row, 월 누계 중량, 마감 상태 요약
- 본문: 월/차량 필터, 월별 차량 내역 테이블, 선택 차량 상세 행(`월 그룹 → 일간 그룹 → 원천행`), 다음 연결 지점
- 하단: 월마감 검증 메모

## 4. 데이터/상태
- 주요 데이터 소스:
  - `tbl_tms_cherrybro_grouping_page_v1` 실데이터
  - grouping row를 월 + 차량 축으로 집계한 결과
- 클라이언트 상태:
  - 정산월 선택
  - 차량번호 선택
- 서버/정적 의존성:
  - 공유 TMS DB 직접 연결 금지
  - 별도 정산 DB 구조를 참고한 읽기 전용 집계

## 5. 인터랙션 규칙
- 주요 사용자 액션:
  - 정산월 전환
  - 차량번호 전환
  - 월별 합계와 상세행 비교
- 라우팅/네비게이션:
  - settlement-review와 claim-docs 사이 보조 뷰로 사용
- 예외 동작:
  - 기사 교체, 유류 누락, 회차 누락은 보정 대상

## 6. QA 체크리스트
- [ ] 정산월/차량번호 선택 시 강조 상태가 자연스러운가
- [ ] 월 전체보기에서 월 그룹이 일간 grouping row들을 다시 묶는 2중 그룹으로 보이는가
- [ ] 선택 차량 상세 행에서 일간 그룹 헤더와 원천행이 분리되어 보이는가
- [ ] review/claim-docs 연결 문구가 일관적인가
- [ ] URL 필터를 바꾸면 선택 차량이 유지되는가
