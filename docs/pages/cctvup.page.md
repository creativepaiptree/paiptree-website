---
title: "/cctvup 페이지 운영 문서"
author: ZORO
last_updated: 26.05.04
---

# /cctvup 페이지 운영 문서

## 1. 문서 정보
- 라우트: `/cctvup`
- 페이지 파일: `src/app/cctvup/page.tsx`
- 클라이언트 파일: `src/app/cctvup/CctvUpClient.tsx`
- 문서 파일: `docs/pages/cctvup.page.md`

## 2. 목적
- 농장별 5분 CCTV 데이터가 DB에 제때 들어오는지 한 화면에서 감시한다.
- 누락/지연/장기중단을 즉시 구분해 아침 수동 점검 전 리스크를 줄인다.
- Uptime Kuma식 상태 가시성을 참고하되, 실제 업무 기준은 FMS 수신 데이터와 알람 정책에 둔다.

## 3. 화면/기능 구성
- 상단: 페이지 타이틀, 테마 토글, 초기화, 등록값 초기화 버튼
- 본문 좌측: 농장 그룹 리스트, 문제/전체 필터, 정렬 선택(문제농장 우선/심각도별/카테고리별/가나다순), 검색 입력
- 농장 row: 농장 대표 상태, 농장명 옆 카테고리 버튼, 원본 소속(`affiliates/country`), 카메라 수, 문제/정상 대수, 최신 수신 시각을 표시한다.
- 하위 카메라 row: 농장 row를 펼치면 표시하며, 카메라별 상태/최신수신/지연/누락/에너지바를 유지한다.
- 본문 우측: 상태 요약, 선택 카메라 상세, 최근 1시간 5분 슬롯, 표시명/메모 registry 편집, 스냅샷/히스토리 요약, Supabase 30일 문제로그, 알람 정책

## 4. 데이터/상태
- 주요 데이터 소스: `/api/cctvup` 읽기 전용 API
- 현재 화면 데이터는 운영 DB를 직접 조회하며, Supabase 최신 payload fallback을 기본 경로로 쓰지 않는다.
- 기록 API: `/api/cctvup/history`는 Supabase history 읽기/적재용 보조 API로 사용한다.
- checker API: `/api/cctvup/check`는 운영 DB 최신 상태를 읽고 history를 적재하는 서버용 트리거 엔드포인트다.
- 기준 테이블: `paip.tbl_farm_image`를 1차 수신 원본으로 사용한다.
- 감시 대상 기준: 운영 DB의 `tbl_farm_cctv` 활성 CCTV 농장 전체를 기준으로 한다.
- 소속 기준: 운영 DB의 `tbl_farm_service.affiliates`와 `country`를 우선 사용해 신우/체리부로/해외/기타 기본 분류를 잡고, 사용자가 화면에서 바꾼 Supabase registry 값을 최종 override로 사용한다.
- 카메라 기준: 운영 DB의 `tbl_farm_cctv` 활성 CCTV 목록을 먼저 조회하고, `tbl_farm_image`는 최근 이미지 저장 증거로 `LEFT JOIN`한다.
- 기록층(별도 Supabase): 문제로그와 에너지바 스냅샷은 운영 DB가 아니라 별도 Supabase 테이블(`tbl_cctvup_check_runs`, `tbl_cctvup_camera_snapshots`, `tbl_cctvup_incident_logs`, `tbl_cctvup_current_issues`)에 적재한다.
- 기록 정책: 정상/1회 지연 카메라는 Supabase에 개별 로그를 남기지 않고, 2회 이상 미수집(`missing`) 또는 장기중단(`critical`) 상태만 issue/log로 저장한다.
- check run의 `payload` JSON도 전체 정상 row가 아니라 문제 row만 보관해 Supabase 저장량을 제한한다.
- 문제로그 기준: 오른쪽 문제로그는 `tbl_cctvup_incident_logs`의 최근 30일 기록을 보여주는 것이 기준이며, `tbl_cctvup_current_issues`는 열린 issue 보조 표시용이다.
- current issue 규칙: 화면의 1차 기준은 `tbl_cctvup_current_issues`의 `issue_status = 'open'` 이며, 정상은 기본값으로 간주한다.
- 보관 정책: 스냅샷과 문제로그는 생성 후 30일 보관을 기본값으로 둔다.
- 체크 주기: GitHub Actions cron 또는 동일한 5분 스케줄러가 `/api/cctvup/check`를 호출해 history를 누적하는 구성을 권장한다.
- 체크/관리 보안: `CCTVUP_CRON_TRIGGER_SECRET`는 필수이며, `x-cctvup-cron-secret` 헤더와 일치해야 checker 적재, history/registry 쓰기를 허용한다.
- API 환경변수: `CCTVUP_DB_HOST`, `CCTVUP_DB_PORT`, `CCTVUP_DB_USER`, `CCTVUP_DB_PASSWORD`, `CCTVUP_DB_DATABASE`
- cron 환경변수: `CCTVUP_CRON_TRIGGER_SECRET`
- 개발 환경에서 DB 환경변수가 없으면 mock payload를 표시할 수 있지만, 운영 환경에서 DB 환경변수가 없거나 DB 조회가 실패하면 실제 목록 대신 `unavailable` 빈 응답을 반환한다.
- 클라이언트 상태: 테마, 검색어, 문제/전체 필터, 농장 정렬 모드, 펼친 농장 ID, 선택된 카메라 ID, API payload/loading/error, 5분 폴링 refresh
- 서버 의존성: Next.js App Router Route Handler, Node runtime, `mysql2`
- 배포 주의: `/api/cctvup`는 서버 런타임이 필요하므로 기본 빌드는 runtime server 기준이며, 정적 export가 필요하면 `PAIPTREE_STATIC_EXPORT=1`로 명시한다.

## 5. 인터랙션 규칙
- 주요 사용자 액션: 테마 전환, 문제/전체 농장 필터링, 농장 정렬 변경, 검색, 농장 펼침/접힘, 카메라 행 선택, 초기화, 자동 5분 재조회
- 라우팅/네비게이션: 현재는 페이지 내부 상태 전환 중심
- 예외 동작: 필터 결과가 비면 빈 상태 대신 표가 비어 보이도록 유지하고, 실제 운영 버전에서 빈 상태 문구를 추가할 수 있다

## 6. QA 체크리스트
- [x] 핵심 흐름 진입/이탈
- [x] 데이터 로딩/에러 상태
- [x] 반응형/접근성 기본 동작
- [ ] 실제 DB 연결 후 누락 판정 정확도 확인
- [ ] 알람 정책(grace window) 서버 기준 고정
