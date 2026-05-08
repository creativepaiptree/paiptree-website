---
title: "/cctvup 페이지 운영 문서"
author: ZORO
last_updated: 26.05.07
---

# /cctvup 페이지 운영 문서

## 1. 문서 정보
- 라우트: `/cctvup`
- 페이지 파일: `src/app/cctvup/page.tsx`
- 클라이언트 파일: `src/app/cctvup/CctvUpClient.tsx`
- 문서 파일: `docs/pages/cctvup.page.md`
- 전체 가이드: `docs/pages/cctvup.service-manual.md`

## 2. 목적
- 농장별 5분 CCTV 데이터가 DB에 제때 들어오는지 한 화면에서 감시한다.
- CCTV 이미지를 AI 중량예측의 원천 입력으로 보고, 수신 지연/누락이 예측 공백이나 신뢰도 저하로 이어질 수 있음을 운영자가 확인하게 한다.
- `/cctvup`은 무게예측 입력 관제로 확장하되, 무게예측 결과 대시보드로 바꾸지 않는다.
- 누락/지연/장기중단을 즉시 구분해 아침 수동 점검 전 리스크를 줄인다.
- Uptime Kuma식 상태 가시성을 참고하되, 실제 업무 기준은 FMS 수신 데이터와 알람 정책에 둔다.

## 3. 화면/기능 구성
- 상단: `CCTVUP - AI 중량예측 입력 관제` 타이틀, Supabase 진단 버튼, 지금 체크 버튼, 테마 토글, 초기화, 등록값 초기화 버튼
- 본문 상단: `운영 상태` 한 줄 요약. 기본 화면은 문제확정/회복/관찰/정상 수와 상태머신/자동 체크만 보여주고, `상세 보기`를 눌렀을 때 현재 목록, 상태머신, 히스토리, 5분 루프, 최근 check run, 상태 근거를 펼쳐 보여준다.
- 본문 좌측: 농장 그룹 리스트, 전체/정상/문제 필터, 카테고리 다중 필터, 감시범위 다중 필터, 정렬 선택(문제농장 우선/심각도별/카테고리별/가나다순), 검색 입력. 기본값은 `전체 농장` + 모든 카테고리 + 모든 감시범위 + `카테고리별`이며 카테고리 순서는 해외, 신우, 체리부로, 기타다.
- 농장 row: 농장 대표 상태, 농장명 옆 카테고리 버튼, 원본 소속(`affiliates/country`), 카메라 수, 문제/정상 대수, 최신 수신 시각을 표시한다.
- 하위 카메라 row: 농장 row를 펼치면 표시하며, 카메라별 상태/최신수신/지연/누락/에너지바를 유지한다.
- 본문 우측: 선택 카메라 상세, 최근 1시간 5분 슬롯, 카메라별 무게예측 입력 자동 진단표, 표시명/메모 registry 편집, 스냅샷/히스토리 요약, Supabase 30일 문제로그, 최근 상태전환 로그, 알람 정책
- 오른쪽 기본 리스크 패널은 `지금 확인할 입력 공백`, `최근 상태전환 로그`, `장기 문제 보기`를 접기/펼치기 가능한 영역으로 나누고, 각 목록은 약 6개 항목 높이까지만 보이게 내부 스크롤로 제한한다.
- 데스크톱 화면에서는 헤더 아래 본문을 좌우 독립 스크롤 구조로 둔다. 좌측 농장 목록은 좌측 패널 안에서만 스크롤되고, 우측 상세/로그 영역은 우측 패널 안에서만 스크롤된다.

## 4. 데이터/상태
- 주요 데이터 소스: `/api/cctvup` 읽기 전용 API
- 현재 화면 데이터는 운영 DB를 직접 조회하며, Supabase 최신 payload fallback을 기본 경로로 쓰지 않는다.
- 분석 상세 API: `/api/cctvup/analysis`는 선택한 카메라 1대에 대해서만 `tbl_farm_image_analysis_weight_v2`를 최근 2시간 기준으로 읽어 분석 결과 근거를 반환한다.
- 기록 API: `/api/cctvup/history`는 Supabase history 읽기/적재용 보조 API로 사용한다.
- history 조회는 화면의 보조 정보이며 `/api/cctvup` 현재 상태 렌더링을 막지 않는다.
- history 기본 조회량은 `check_runs` 5건, `issue_events` 50건, 활성 `camera_states` 최대 1000건이다.
- history는 정상/해결 전체 state 5000건이나 정상 카메라 snapshot 전체를 기본 조회하지 않는다.
- Supabase history 읽기 timeout 기본값은 800ms이며, 초과 시 `unavailable` 또는 부분 응답으로 빠르게 내려 화면을 유지한다.
- checker API: `/api/cctvup/check`는 운영 DB 최신 상태를 읽고 history를 적재하는 서버용 트리거 엔드포인트다.
- 화면의 `지금 체크` 버튼은 `x-cctvup-cron-secret`으로 `/api/cctvup/check/`를 즉시 실행하고, 성공하면 `/api/cctvup`와 `/api/cctvup/history`를 다시 읽어 현재 목록과 로그를 갱신한다.
- 진단 API: `/api/cctvup/health`는 `x-cctvup-cron-secret`으로 보호하며 운영 DB 연결/쿼리 상태와 안전한 에러 코드만 반환한다.
- Supabase 진단 API: `/api/cctvup/supabase-diagnose`는 `x-cctvup-cron-secret`으로 보호하며 Supabase 환경변수, DNS, TCP 443, REST 핵심 테이블 응답 시간을 확인한다. service key 원문은 반환하지 않는다.
- 기준 테이블: `paip.tbl_farm_image`를 1차 수신 원본으로 사용한다.
- 무게예측 확장 기준: 이미지 수신 여부는 `paip.tbl_farm_image`, 분석 결과 여부는 `tbl_farm_image_analysis_weight_v2` 분석 테이블로 분리해 판단한다.
- 분석 테이블은 수신감시의 1차 기준으로 쓰지 않는다.
- 분석 결과는 선택 카메라 상세에서만 실시간 조회하며, 전체 농장 목록에는 기본으로 붙이지 않는다.
- 분석 결과 조회는 원본 DB 읽기 전용이고, Phase 3에서는 Supabase에 분석 문제를 저장하지 않는다.
- 보정 상태, 예측 안정성, 1시간 대표 중량은 실제 데이터 위치와 카메라 키 매칭이 확인된 뒤 읽기 전용으로만 붙인다.
- 원본 운영 DB는 읽기 전용으로만 사용하며, `/cctvup`의 MySQL 연결은 `SELECT/WITH` 조회만 허용한다.
- 원본 운영 DB에는 registry, 로그, 보정, 메모 데이터를 쓰지 않는다.
- 감시 대상 기준: 운영 DB의 `tbl_farm_cctv` 활성 CCTV 농장 전체를 기준으로 한다.
- 감시범위 기준: 운영 DB의 `tbl_farm_gateway.install_status`와 `tbl_farm_house_breed_hist.in_date/out_date`를 읽어 `감시중/휴지기/대상확인/미설치`로 분리한다.
- `감시중`은 gateway 설치 + 현재 사육중인 카메라다. `휴지기`는 gateway 설치 + 출하 후 35일 이내다. `대상확인`은 사육정보 없음, 출하 후 35일 초과, 입추 예정, 판정 불명이다. `미설치`는 설치 gateway가 없는 농장이다.
- `휴지기/대상확인/미설치`는 화면 목록에는 남기지만 `paused`로 표시하고 상태머신 문제확정/issue event 저장 대상에서 제외한다.
- 한 농장 안에 `감시중` 카메라와 비감시범위 카메라가 섞이면 농장 대표 상태는 `감시중` 카메라 상태를 우선한다.
- 소속 기준: 운영 DB의 `tbl_farm_service.affiliates`와 `country`를 우선 사용해 신우/체리부로/해외/기타 기본 분류를 잡고, 사용자가 화면에서 바꾼 Supabase registry 값을 최종 override로 사용한다.
- 카메라 기준: 운영 DB의 `tbl_farm_cctv` 활성 CCTV 목록을 먼저 조회하고, `tbl_farm_image`는 최근 이미지 저장 증거로 `LEFT JOIN`한다.
- 기록층(별도 Supabase): 운영 DB가 아니라 별도 Supabase 테이블에 `/cctvup` 전용 상태와 이벤트를 저장한다.
- 상태머신 기록층(권장): `tbl_cctvup_camera_states`는 카메라별 현재 상태 1행만 upsert하고, `tbl_cctvup_issue_events`는 `opened/recovering/resolved/reopened` 상태 전환만 append한다.
- 상태머신 저장 범위: `/api/cctvup/check`는 `감시중` 카메라만 `tbl_cctvup_camera_states`에 upsert한다. 기존에 남아 있는 stale state도 현재 row가 감시중이 아니면 화면에 반영하지 않는다.
- 상태머신 조회 timeout은 history와 분리한다. `CCTVUP_SUPABASE_STATE_FETCH_TIMEOUT_MS` 기본값은 1500ms이고, 실패 시 화면에는 `상태머신 미반영`으로 표시한다.
- 레거시 기록층: `tbl_cctvup_camera_snapshots`, `tbl_cctvup_incident_logs`, `tbl_cctvup_current_issues`는 compatibility 용도로만 남기고 기본 확장 경로로 삼지 않는다.
- 기록 정책: 1~2회 미수집은 `watching`으로 두고 로그를 남기지 않으며, 3회 연속 미수집(약 15분)부터 `open` 문제로 확정해 issue event를 저장한다.
- 회복 정책: `open` 이후 이미지가 다시 들어오면 즉시 정상 삭제하지 않고 `recovering`으로 두며, 최근 12회 슬롯이 정상으로 밀려 채워진 뒤 `resolved` 처리한다.
- check run의 `payload` JSON은 빈 객체 또는 최소 summary만 사용해 Supabase 저장량을 제한한다.
- 문제로그 기준: 오른쪽 문제로그는 `tbl_cctvup_issue_events`의 상태전환 기록을 우선 표시한다.
- current issue 규칙: 화면의 1차 기준은 `/api/cctvup` 현재 row와 Supabase `tbl_cctvup_camera_states` 병합 결과이며, 레거시 `tbl_cctvup_current_issues`는 compatibility 보조 정보로만 본다.
- 보관 정책: 스냅샷과 문제로그는 생성 후 30일 보관을 기본값으로 둔다.
- 체크 주기: 24시간 로컬 PC에서는 `ops/launchd/com.paiptree.website-dev.plist`로 `localhost:3002` Next 서버를 유지하고, `ops/launchd/com.paiptree.cctvup-check.plist`로 `scripts/cctvup-check-local.mjs`를 5분마다 실행하는 구성을 1차 권장한다. 외부 배포가 안정화되면 GitHub Actions cron 또는 서버 cron으로 옮긴다.
- 체크/관리 보안: `CCTVUP_CRON_TRIGGER_SECRET`는 필수이며, `x-cctvup-cron-secret` 헤더와 일치해야 checker 적재와 history 쓰기를 허용한다. registry 쓰기는 배포 환경에서 `x-cctvup-admin-secret` 또는 `x-cctvup-cron-secret`을 요구하고, 로컬 개발 환경의 localhost 요청은 분류 편집을 막지 않도록 허용한다.
- API 환경변수: `CCTVUP_DB_HOST`, `CCTVUP_DB_PORT`, `CCTVUP_DB_USER`, `CCTVUP_DB_PASSWORD`, `CCTVUP_DB_DATABASE`
- cron 환경변수: `CCTVUP_CRON_TRIGGER_SECRET`
- 개발 환경에서 DB 환경변수가 없으면 mock payload를 표시할 수 있지만, 운영 환경에서 DB 환경변수가 없거나 DB 조회가 실패하면 실제 목록 대신 `unavailable` 빈 응답을 반환한다.
- 클라이언트 상태: 테마, 검색어, 문제/전체 필터, 농장 정렬 모드, 펼친 농장 ID, 선택된 카메라 ID, API payload/loading/error, 5분 폴링 refresh
- 서버 의존성: Next.js App Router Route Handler, Node runtime, `mysql2`
- 배포 주의: `/api/cctvup`는 서버 런타임이 필요하므로 기본 빌드는 runtime server 기준이며, 정적 export가 필요하면 `PAIPTREE_STATIC_EXPORT=1`로 명시한다.

## 5. 무게예측 입력 관제 전환 단계
- Phase 0: 현재 기준을 문서화한다. 수신 기준과 분석 기준을 분리하고, 원본 DB 읽기 전용 경계를 고정한다.
- Phase 1: 페이지 제목/설명/문제 로그 문구를 AI 중량예측 입력 관제 관점으로 정리한다. 현재 반영 완료.
- Phase 2: 선택 카메라 상세에 이미지 수신, 분석 결과, 카메라 보정, 예측 안정성, 운영 판단 가능 여부를 자동 진단표로 표시한다. 현재 반영 완료.
- Phase 3: 분석 테이블을 읽기 전용으로 연결해 "이미지는 있음 / 분석 없음" 상태를 수신 상태와 분리해 보여준다. 현재 선택 카메라 상세에 반영 완료.
- Phase 3.5: Supabase history를 경량/보조 조회로 정리한다. 현재 반영 완료. 화면은 `/api/cctvup` 현재 상태를 먼저 렌더링하고, history는 800ms 기본 timeout 안에서 check run 5건, issue event 50건, 활성 camera state만 읽는다.
- Phase 3.6: 상태머신 운영 루프를 안정화한다. 현재 반영 완료. state 조회 timeout을 history와 분리하고, 화면에 상태머신 반영/미반영 여부를 표시하며, 로컬 5분 체크 스크립트를 기준 실행 경로로 둔다.
- Phase 3.7: 운영 진단과 화면 사용성을 보강한다. 현재 반영 완료. Supabase 진단 버튼/API를 추가하고, 데스크톱에서 좌측 목록과 우측 결과창을 독립 스크롤 구조로 분리한다.
- Phase 3.8: 수동 체크와 루프 리허설을 보강한다. 현재 반영 완료. `지금 체크` 버튼으로 상태머신을 즉시 실행하고, 상단에 마지막 check run 시각을 계속 표시한다.
- Phase 3.9: 로컬 24시간 운영을 고정한다. 현재 반영 완료. launchd로 로컬 Next 서버와 5분 체크를 등록하고, 화면 상단에 자동 체크 정상/지연/멈춤 의심 상태와 최근 상태전환 이벤트 요약을 표시한다.
- Phase 3.10: 운영 안정성 폴리싱을 진행한다. 현재 반영 완료. 상태 정보는 본문 상단 `운영 상태` 한 줄 요약으로 통합하고, `상세 보기`를 눌렀을 때 현재 목록, 상태머신, 히스토리, 5분 루프와 최근 check run을 펼친다. 최근 check run 간격은 정상 루프/수동·재기동 추정/지연으로 구분하며, 4분 미만은 수동/재기동 추정으로 본다. 최근 check run 행의 맨왼쪽 배지는 `정상`, `수동`, `지연`, `기준`처럼 두 글자 표기로 고정한다.
- Phase 3.11: 감시대상 전수조사 리포트를 생성한다. 현재 리포트 기준을 화면 판정에 반영 완료. `scripts/cctvup-monitor-scope-audit.mjs`가 원본 DB를 읽기 전용으로 조회해 gateway 설치 여부, 사육/휴지 판정, 최근 이미지, 최근 센서 기준으로 `감시중/휴지기/대상확인/미설치`를 분리한다. raw 리포트는 민감 산출물로 보고 `/Users/zoro/company-ops/.hermes-sensitive/farm-ops/reports/*.sensitive.json` 암호화 bundle에만 저장한다.
- Phase 3.12: 농장 소속 분류를 정리한다. 현재 반영 완료. 원본 DB `affiliates/country` 자동분류를 기본값으로 사용하고, 기존 Supabase registry의 대량 `other` 값은 legacy로 취급해 자동분류를 덮지 못하게 한다. 사용자가 버튼으로 바꾼 분류는 `category_source = manual`일 때 override로 본다.
- Phase 3.13: 감시범위 로직을 실제 화면/상태머신에 적용한다. 현재 반영 완료. `/api/cctvup`는 gateway/사육 이력 기반 감시범위를 row에 포함하고, 좌측 목록은 감시범위 필터를 제공한다. `/api/cctvup/check`는 `감시중` 카메라만 상태머신에 저장한다.
- Phase 3.14: 운영 안정화 리포트를 생성한다. 현재 반영 완료. `scripts/cctvup-stability-report.mjs`가 로컬 `/api/cctvup`와 Supabase REST를 읽기 전용으로 비교해 5분 루프 간격, stale camera_state, 대상확인 목록을 암호화 bundle로 남긴다. plaintext `docs/reports` 저장은 금지한다.
- Phase 4: 문제 유형을 이미지 수신 문제와 분석 파이프라인 문제로 확장하되, Supabase 저장은 문제 중심으로 제한한다.
- Phase 5: 농장 단위 무게예측 운영 가능 상태를 요약한다.

상세 전환 기준은 `docs/plans/2026-05-06-cctvup-weight-input-control.md`를 따른다.
현재 구축된 백엔드/프론트/운영 매뉴얼은 `docs/pages/cctvup.service-manual.md`를 기준 문서로 삼는다.

## 6. 인터랙션 규칙
- 주요 사용자 액션: 지금 체크, Supabase 진단, 테마 전환, 전체/정상/문제 농장 필터링, 카테고리 다중 필터링, 감시범위 다중 필터링, 농장 정렬 변경, 검색, 농장 펼침/접힘, 카메라 행 선택, 초기화, 자동 5분 재조회
- 라우팅/네비게이션: 현재는 페이지 내부 상태 전환 중심
- 예외 동작: 필터 결과가 비면 빈 상태 대신 표가 비어 보이도록 유지하고, 실제 운영 버전에서 빈 상태 문구를 추가할 수 있다

## 7. QA 체크리스트
- [x] 핵심 흐름 진입/이탈
- [x] 데이터 로딩/에러 상태
- [x] 반응형/접근성 기본 동작
- [ ] 실제 DB 연결 후 누락 판정 정확도 확인
- [ ] 알람 정책(grace window) 서버 기준 고정
- [x] 분석 테이블을 붙인 뒤에도 수신 기준이 `paip.tbl_farm_image`로 유지되는지 확인
- [x] Phase 1 문구와 선택 상세의 `AI 중량예측 입력 상태` placeholder 표시 확인
- [x] Phase 2 선택 카메라 상세의 5단계 자동 진단표 표시 확인
- [x] Phase 3 선택 카메라 상세의 분석 결과 실제 조회와 근거 표시 확인
- [x] Phase 3.5 history 조회가 느리거나 실패해도 메인 목록 로딩을 막지 않는지 확인
- [x] Phase 3.6 상태머신 반영/미반영 상태가 화면에 표시되는지 확인
- [x] 감시범위 필터가 감시중/휴지기/대상확인/미설치 목록을 분리해 보여주는지 확인
- [x] 휴지기/대상확인/미설치 카메라가 상태머신 문제로 새로 저장되지 않는지 확인
- [x] 운영 안정화 리포트가 stale state와 대상확인 목록을 생성하는지 확인
- [x] Supabase 진단 버튼이 관리 secret으로 보호된 API를 호출하고 결과를 화면에 표시하는지 확인
- [x] 데스크톱에서 좌측 농장 목록과 우측 상세/로그 영역이 독립 스크롤되는지 확인
- [x] `지금 체크` 버튼이 `/api/cctvup/check/`를 실행하고 성공 후 현재 목록/history를 재조회하는지 확인
- [x] `/api/cctvup/check/`가 Supabase에 1회 적재되는지 확인
- [x] `/api/cctvup/check/`가 `check_runs.note`에 호출자 지문을 남기는지 확인
- [x] 자동 체크 최근 실행 상태가 정상/지연/멈춤 의심으로 표시되는지 확인
- [x] 최근 상태전환 로그가 issue_events 기준으로 표시되는지 확인
- [x] 현재 목록, 상태머신, 히스토리, 5분 루프가 `운영 상태` 상세 펼침 안에서 분리 표시되는지 확인
- [x] 최근 check run 6회가 issue/open/recovering 흐름과 함께 표시되는지 확인
- [x] 최근 check run 간격이 정상 루프, 수동/재기동 추정, 루프 지연으로 구분되고 맨왼쪽 배지가 두 글자 표기로 표시되는지 확인
- [ ] 3회 연속 미수집 전까지 issue event가 생성되지 않는지 확인
- [ ] 회복 중 빨간 슬롯이 즉시 사라지지 않고 최근 12회 슬롯에서 밀려 사라지는지 확인
