---
title: CCTVUP 서비스 전체 가이드 매뉴얼
author: ZORO
last_updated: 26.05.07
---

# CCTVUP 서비스 전체 가이드 매뉴얼

## 1. 한 줄 정의
`/cctvup`은 농장 CCTV 이미지가 5분 주기로 정상 저장되는지 감시하고, 15분 이상 이미지 수집이 멈춘 카메라만 확정 문제로 남기는 AI 중량예측 입력 관제 페이지다.

## 2. 서비스 목표
- 지정된 활성 CCTV 카메라가 5분마다 이미지를 저장하는지 확인한다.
- 원본 DB의 gateway 설치 여부와 사육 이력을 읽어 실제 감시 대상, 휴지기, 대상확인, 미설치를 분리한다.
- 1~2회 미수집은 일시 지연으로 보고 바로 문제로그를 만들지 않는다.
- 3회 연속 미수집, 약 15분 이후에도 이미지가 없으면 `문제확정`으로 판단한다.
- 확정 문제만 Supabase에 이벤트 로그로 남긴다.
- 이미지가 다시 들어와도 즉시 정상으로 지우지 않고 `회복중`으로 둔다.
- 최근 12회 5분 슬롯, 약 1시간이 모두 정상으로 채워진 뒤 `해결` 처리한다.
- 원본 CCTV 운영 DB는 절대 수정하지 않고 읽기 전용으로만 사용한다.
- CCTV 이미지는 무게예측 AI의 원천 입력이므로, 이 페이지는 장기적으로 무게예측 입력 품질 관제로 확장한다.

## 3. 하지 않는 것
- 원본 운영 DB에 registry, 메모, 로그, 상태, 보정값을 쓰지 않는다.
- 정상 카메라 전체 스냅샷을 5분마다 Supabase에 누적하지 않는다.
- 이미지 수신감시의 1차 기준을 분석 테이블로 바꾸지 않는다.
- 5분 raw 중량 예측값을 운영 판단용 최종값처럼 표시하지 않는다.
- 보정 상태가 확인되지 않았는데 예측 신뢰도를 확정처럼 표시하지 않는다.

## 4. 전체 구조
- 원본 CCTV 운영 DB는 `/api/cctvup`과 `/api/cctvup/check`에서 읽기 전용으로 조회한다.
- `/api/cctvup/check`는 5분마다 원본 DB 최신 상태를 읽고 Supabase에 상태머신 결과를 저장한다.
- 화면 상단의 `지금 체크` 버튼은 같은 `/api/cctvup/check/` 경로를 즉시 실행해 수동 운영 리허설과 긴급 확인에 사용한다.
- Supabase `tbl_cctvup_camera_states`는 카메라별 현재 상태를 1행 upsert로 유지한다.
- Supabase `tbl_cctvup_issue_events`는 확정/회복/해결 전환 이벤트만 append한다.
- Supabase `tbl_cctvup_check_runs`는 체크 실행 요약만 저장한다.
- Supabase `tbl_cctvup_farm_registry`는 사용자가 바꾼 농장 표시명, 카테고리, 메모를 저장한다.
- `/cctvup` 프론트는 `/api/cctvup`, `/api/cctvup/history`, `/api/cctvup/registry`를 조합해 화면을 만든다.
- `/api/cctvup/history`는 보조 정보다. 느리거나 실패해도 `/api/cctvup` 현재 목록 렌더링을 막지 않는다.
- `/api/cctvup`의 camera_state 병합은 history보다 중요하므로 별도 timeout을 사용하고, 실패하면 화면에 `상태머신 미반영`으로 표시한다.
- Supabase REST 장애가 의심될 때는 화면 상단의 `Supabase 진단` 버튼 또는 `scripts/cctvup-supabase-diagnose.mjs`로 환경, DNS, TCP 443, 핵심 REST 테이블 응답 시간을 확인한다.

## 5. 데이터 소스와 책임
### 원본 운영 DB
- 역할: 활성 농장/카메라 목록과 최근 이미지 저장 여부를 읽는다.
- 접근 원칙: `SELECT/WITH` 조회만 허용한다.
- 주요 테이블:
  - `tbl_farm_cctv`: 활성 CCTV 기준
  - `tbl_farm_image`: 5분 이미지 수신 여부의 1차 기준
  - `tbl_farm_service`: 농장명, 소속, 국가 등 표시 정보
  - `tbl_farm_house`: 동/축사 표시 정보
  - `tbl_farm_gateway`: gateway 설치 여부와 설치 상태 확인
  - `tbl_farm_house_breed_hist`: 입추/출하 이력 기반 휴지기 판정
- 절대 하지 않는 것: insert, update, delete, schema 변경, registry 저장, 로그 저장

### Supabase
- 역할: `/cctvup` 전용 운영 상태와 사용자 편집값을 저장한다.
- 현재 핵심 테이블:
  - `tbl_cctvup_camera_states`: 카메라별 현재 상태 1행
  - `tbl_cctvup_issue_events`: 상태 전환 이벤트
  - `tbl_cctvup_check_runs`: 5분 체크 요약
  - `tbl_cctvup_farm_registry`: 농장 표시명, 카테고리, 메모, 태그
- 레거시/보조 테이블:
  - `tbl_cctvup_camera_snapshots`
  - `tbl_cctvup_incident_logs`
  - `tbl_cctvup_current_issues`
- 현재 권장 경로는 `camera_states + issue_events` 중심이다.
- history 기본 조회는 `check_runs` 5건, `issue_events` 50건, 활성 `camera_states` 최대 1000건으로 제한한다.
- history는 정상/해결 state 전체나 정상 카메라 snapshot 전체를 기본으로 읽지 않는다.
- 상태머신 저장과 화면 반영은 현재 `감시중` 카메라에 한정한다. `휴지기`, `대상확인`, `미설치` 카메라는 목록에는 남기되 문제로그 저장 대상에서 제외한다.
- Supabase history 읽기 timeout 기본값은 800ms다. timeout이 나면 부분 응답 또는 `unavailable`로 빠르게 내려 화면을 유지한다.
- Supabase camera_state 읽기 timeout 기본값은 1500ms다. timeout이 나면 운영 DB live 목록은 유지하고 상태머신만 미반영으로 표시한다.

## 6. 상태머신 기준
### 상태 정의
- `ok`: 이미지 수신이 정상이다.
- `watching`: 1~2회 미수집이다. 아직 문제로그를 남기지 않는다.
- `open`: 3회 이상 미수집이다. 문제로 확정하고 이벤트를 남긴다.
- `recovering`: `open` 이후 이미지가 다시 들어왔지만 최근 1시간 슬롯에 문제 흔적이 남아 있다.
- `resolved`: 최근 12회 슬롯이 모두 정상으로 채워져 해결 처리됐다.

### 판정 상수
- 체크 주기: 5분
- 정상 grace: 최근 이미지가 약 7분 이내면 정상 슬롯으로 본다.
- 문제 확정: 3회 연속 미수집
- 회복 확인: 최근 12회 슬롯이 모두 정상
- 최근 슬롯 길이: 12개, 즉 약 1시간

### 전환 규칙
- 최초 정상 상태는 `ok`다.
- `ok`에서 1회 미수집이 발생하면 `watching`으로 간다.
- `watching`에서 2회까지는 계속 관찰한다.
- 3회 미수집이 되면 `open`으로 전환한다.
- `open` 이후 이미지가 다시 들어오면 `recovering`으로 간다.
- `recovering`에서 최근 12슬롯이 모두 정상이 되면 `resolved`로 간다.
- `resolved` 이후 다시 미수집이 시작되면 `watching`부터 다시 시작한다.
- `recovering` 중 다시 미수집이 누적되면 `open`으로 재전환한다.

### 이벤트 저장 규칙
- `opened`: `open`으로 처음 확정될 때 저장한다.
- `recovering`: `open`에서 이미지가 다시 들어왔을 때 저장한다.
- `resolved`: 최근 12슬롯이 모두 정상으로 채워졌을 때 저장한다.
- `reopened`: 회복/해결 흐름 이후 다시 `open`으로 확정될 때 저장한다.
- `watching`은 이벤트로 저장하지 않는다.

## 7. 백엔드 파일 구조
- `src/app/api/cctvup/route.ts`
  - 현재 화면용 payload를 반환한다.
  - 원본 DB 최신값을 읽고 Supabase `camera_states`를 병합한다.
- `src/app/api/cctvup/check/route.ts`
  - 5분마다 호출되는 보호된 checker다.
  - 원본 DB를 읽고 Supabase 상태머신 테이블에 저장한다.
  - 화면의 `지금 체크` 버튼도 이 API를 `POST`로 호출한다.
- `src/app/api/cctvup/history/route.ts`
  - check run, camera state, issue event를 읽어 우측 로그 패널에 제공한다.
- `src/app/api/cctvup/registry/route.ts`
  - 농장 표시명/카테고리/메모 변경을 Supabase registry에 저장한다.
- `src/app/api/cctvup/health/route.ts`
  - 운영 DB 연결과 쿼리 가능 여부를 진단한다.
- `src/app/api/cctvup/supabase-diagnose/route.ts`
  - Supabase 환경, DNS, TCP 443, 핵심 REST 테이블 응답 가능 여부를 진단한다.
  - `x-cctvup-cron-secret`으로 보호하며 secret 원문과 service key 원문은 반환하지 않는다.
- `src/lib/cctvup-current.ts`
  - 원본 DB read-only 조회, mock/unavailable fallback, persisted state 병합을 담당한다.
  - `tbl_farm_gateway`와 `tbl_farm_house_breed_hist`를 함께 읽어 감시범위를 계산한다.
- `src/lib/cctvup-state.ts`
  - 상태머신 계산, Supabase state/event 저장, state 병합을 담당한다.
  - `감시중` 카메라만 상태머신 저장 대상으로 보고, 휴지기/대상확인/미설치 row에는 과거 state를 반영하지 않는다.
- `scripts/cctvup-check-local.mjs`
  - 로컬 24시간 PC에서 `/api/cctvup/check/`를 1회 호출하는 스케줄러용 실행 스크립트다.
  - 기본 호출 대상은 `http://localhost:3002/api/cctvup/check/`이며, 웹 배포 URL은 기본값으로 사용하지 않는다.
- `scripts/cctvup-supabase-diagnose.mjs`
  - 로컬 환경에서 Supabase URL/key 매칭, DNS, TCP 443, REST 핵심 테이블 응답 시간을 확인하는 진단 스크립트다.
- `scripts/cctvup-stability-report.mjs`
  - 로컬 `/api/cctvup` 현재 목록과 Supabase `camera_states/check_runs`를 읽기 전용으로 비교해 운영 안정화, stale state, 대상확인 목록 리포트를 생성한다.
  - 생성물은 `/Users/zoro/company-ops/.hermes-sensitive/farm-ops/reports/cctvup-stability-YYYY-MM-DD.sensitive.json` 암호화 bundle이다.
  - 실행 시 `PAIPTREE_SENSITIVE_EXPORT_PASSPHRASE`가 필요하며, plaintext `docs/reports` 저장은 금지한다.
- `ops/launchd/com.paiptree.website-dev.plist`
  - macOS launchd에서 로컬 Next 개발 서버를 `localhost:3002`로 유지하기 위한 LaunchAgent 템플릿이다.
- `ops/launchd/com.paiptree.cctvup-check.plist`
  - macOS launchd에서 위 스크립트를 5분마다 실행하기 위한 LaunchAgent 템플릿이다.
- `src/lib/cctvup-history.ts`
  - history API용 Supabase 조회와 레거시 compatibility 변환을 담당한다.
- `src/lib/cctvup-registry.ts`
  - farm registry 조회/저장을 담당한다.
- `src/lib/cctvup-farm-groups.js`
  - 농장 그룹, 카테고리, 정렬 기준을 만든다.
- `src/lib/cctvup.ts`
  - 공통 타입, 상태 라벨, payload builder, mock row를 관리한다.

## 8. API 매뉴얼
### `GET /api/cctvup`
- 목적: 프론트 메인 목록용 현재 상태 반환
- 읽는 곳: 원본 운영 DB, Supabase `tbl_cctvup_camera_states`
- 쓰는 곳: 없음
- 성공 메시지 예: `source: db`, `message: Supabase camera_state 기준으로 15분 확정 장애와 회복 상태를 반영했습니다.`
- 상태 표시: `stateSync.status = applied`이면 상태머신이 반영된 화면이고, `unavailable`이면 운영 DB live 기준 화면이다.
- 감시범위: row별 `monitorScopeCode`, `monitorScopeLabel`, `cycleBucketCode`, `cycleBucketLabel`, `gatewayInstalledCount`를 내려준다.
- 상태머신 병합: Supabase camera_state는 현재 `감시중` row에 매칭되는 것만 반영하고 `stateSync.stateCount`도 그 기준으로 센다.

### `GET 또는 POST /api/cctvup/check/`
- 목적: 5분 주기 상태머신 실행
- 인증: `x-cctvup-cron-secret` 헤더 필수
- 읽는 곳: 원본 운영 DB, Supabase 현재 states
- 쓰는 곳: Supabase `check_runs`, `camera_states`, `issue_events`
- 원본 운영 DB 쓰기: 없음
- 정상 응답 핵심: `ok: true`, `stateCount`, `eventCount`, `openedCount`, `currentIssueCount`

### `GET /api/cctvup/history/?limit=50`
- 목적: 우측 문제로그와 히스토리 표시
- 읽는 곳: Supabase `check_runs`, `camera_states`, `issue_events`
- 쓰는 곳: 없음
- 기본 조회량: check run 5건, issue event 50건, 활성 camera state 최대 1000건
- 장애 동작: Supabase 일부 조회가 timeout/실패하면 가능한 부분만 반환하고, 전부 실패하면 `source: unavailable`로 반환한다.

### `GET /api/cctvup/registry/`
- 목적: 농장 표시명, 카테고리, 태그, 메모 읽기
- 읽는 곳: Supabase `tbl_cctvup_farm_registry`

### `POST /api/cctvup/registry/`
- 목적: 농장 표시명, 카테고리, 태그, 메모 저장
- 인증: 배포 환경에서는 `x-cctvup-admin-secret` 또는 `x-cctvup-cron-secret` 헤더 필수. 로컬 개발 환경의 localhost 요청은 운영 편집을 막지 않도록 `local-registry` 모드로 허용한다.
- 쓰는 곳: Supabase `tbl_cctvup_farm_registry`
- 원본 운영 DB 쓰기: 없음

### `GET /api/cctvup/health`
- 목적: 원본 운영 DB 연결 진단
- 인증: `x-cctvup-cron-secret` 헤더 필수
- 쓰는 곳: 없음

### `GET /api/cctvup/supabase-diagnose/`
- 목적: Supabase REST timeout, 환경변수 불일치, 네트워크 차단 여부 진단
- 인증: `x-cctvup-cron-secret` 헤더 필수
- 확인 항목: 환경 URL/key ref 매칭, DNS lookup, TCP 443, HTTPS reachability, `check_runs`, `camera_states`, `issue_events`, `farm_registry` REST 조회
- 쓰는 곳: 없음
- 보안: service key 원문은 반환하지 않고 role/ref/만료 시각과 단계별 응답 시간만 반환한다.

## 9. Supabase 스키마 매뉴얼
### `tbl_cctvup_camera_states`
- 카메라별 현재 상태를 1행으로 유지한다.
- `camera_key`는 unique다.
- 5분 체크마다 `감시중` 카메라만 upsert한다.
- `휴지기`, `대상확인`, `미설치` 카메라는 문제확정 상태를 새로 만들지 않는다.
- 주요 컬럼:
  - `camera_key`
  - `farm_id`
  - `house_id`
  - `module_id`
  - `status`
  - `latest_image_at`
  - `last_checked_at`
  - `miss_count`
  - `first_missed_at`
  - `opened_at`
  - `resolved_at`
  - `recent_slots`
  - `run_id`
  - `message`

### `tbl_cctvup_issue_events`
- 상태 전환만 append한다.
- 정상 체크마다 쓰지 않는다.
- 주요 컬럼:
  - `camera_key`
  - `event_kind`
  - `previous_status`
  - `next_status`
  - `event_at`
  - `latest_image_at`
  - `miss_count`
  - `message`

### `tbl_cctvup_check_runs`
- 체크 실행 요약만 저장한다.
- `payload`는 빈 객체 또는 최소 summary만 허용한다.
- 전체 row payload를 저장하면 Supabase Free 용량을 빠르게 소모하므로 금지한다.

### `tbl_cctvup_farm_registry`
- 화면에서 사용자가 바꾸는 농장 표시 정보를 저장한다.
- 원본 DB의 소속/국가 정보는 기본값이다.
- registry의 `category_source = manual`만 최종 override로 본다.
- 기존 일괄 registry 값은 `legacy`로 보고, 원본 DB 자동분류가 `신우/체리부로/해외`로 명확하면 legacy category가 덮지 못하게 한다.
- 카테고리 예: `신우`, `체리부로`, `해외`, `기타`

## 10. 프론트엔드 구조
### 화면 구성
- 상단 헤더
  - 서비스명, `지금 체크`, `Supabase 진단`, 테마 토글
- 본문 상단 운영 상태
  - 기본 화면에는 문제확정, 회복, 관찰, 정상 수와 상태머신/자동 체크 상태만 한 줄로 표시한다.
  - `상세 보기`를 누르면 현재 목록, 상태머신, 히스토리, 5분 루프, 최근 check run, 상태 근거를 펼쳐 보여준다.
- 좌측 패널
  - 농장 그룹 목록
  - 상태 필터: 전체 농장, 정상 농장, 문제 농장
  - 카테고리 필터: 해외, 신우, 체리부로, 기타 다중 선택. 초기값은 모두 선택이며, 모두 선택된 상태에서 특정 카테고리를 누르면 해당 카테고리만 단독 선택한다.
  - 감시범위 필터: 감시중, 휴지기, 대상확인, 미설치 다중 선택. 초기값은 모두 선택이며, 특정 범위만 단독으로 볼 수 있다.
  - 정렬: 문제농장 우선, 심각도별, 카테고리별, 가나다순
  - 기본 표시: `전체 농장` 필터와 `카테고리별` 정렬
  - 카테고리별 정렬 순서: 해외, 신우, 체리부로, 기타
  - 검색
  - 농장 row와 카메라 row
- 우측 패널
  - 선택 카메라 상세
  - 최근 1시간 5분 슬롯
  - 상태머신 설명
  - 최근 문제로그
  - 최근 상태전환 로그
  - registry 편집 영역

### 프론트 주요 상태
- `payload`: `/api/cctvup` 응답
- `historyPayload`: `/api/cctvup/history` 응답
- `registry`: `/api/cctvup/registry` 응답과 로컬 편집값
- `selectedCameraId`: 선택된 카메라
- `expandedFarmIds`: 펼친 농장
- `searchTerm`: 검색어
- `farmStatusFilter`: 문제/전체 필터
- `farmCategoryFilters`: 카테고리 다중 필터
- `monitorScopeFilters`: 감시범위 다중 필터
- `farmSortMode`: 정렬 모드
- `theme`: light/dark
- `adminSecret`: registry 저장에 쓰는 sessionStorage secret
- `manualCheck`: `지금 체크` 실행 상태, run id, state/event 반영 건수
- `checkLoopHealth`: 최신 `check_runs.checkedAt`과 source를 기준으로 한 자동 체크 정상/지연/멈춤 의심 상태
- `currentSourceHealth`: `/api/cctvup` 운영 DB live 조회 상태
- `stateMachineHealth`: Supabase `camera_states` 병합 상태
- `historyHealth`: Supabase `check_runs`와 `issue_events` 조회 상태
- `recentCheckRuns`: 최근 check run 6회
- `recentIssueEvents`: Supabase `tbl_cctvup_issue_events` 최근 상태전환 이벤트

### 표시 원칙
- 왼쪽 목록은 빠른 문제 발견이 목적이다.
- 농장 카테고리는 상태 색상과 섞지 않고 별도 버튼으로 표시한다.
- 감시범위는 카테고리와 별개다. `감시중`은 상태머신 문제 판정 대상이고, `휴지기/대상확인/미설치`는 회색 계열의 보조 범위로 표시한다.
- 한 농장 안에 `감시중` 카메라와 휴지기/미설치 카메라가 섞이면 농장 대표 상태는 `감시중` 카메라 상태를 우선한다.
- `휴지기/대상확인/미설치`는 목록에는 남기되, 문제 농장 수와 issue event 저장 대상에서는 제외한다.
- 자동 체크는 10분 미만이면 정상, 10분 이상이면 지연 주의, 15분 이상이면 멈춤 의심으로 표시한다.
- 상태 정보는 본문 상단 `운영 상태`로 통합한다. 평소에는 한 줄 요약만 보이고, 현재 목록, 상태머신, 히스토리, 5분 루프는 상세 펼침 안에서 별도 상태로 보여준다.
- Supabase history timeout은 현재 목록 실패로 오해하지 않게 `히스토리 부분 지연`으로 분리 표시한다.
- 최근 check run 6회는 issue, ok, watch, open, recovering 숫자와 함께 이전 run 대비 간격을 보여준다.
- 최근 check run 간격은 4분 미만이면 `수동/재기동 추정`, 4~7분이면 `정상 루프`, 7분 초과면 `루프 지연`으로 표시한다.
- 최근 check run 행의 맨왼쪽 배지는 화면 판독용으로 `정상`, `수동`, `지연`, `기준` 두 글자만 표시하고, 전체 판정 사유는 툴팁과 상세 문구에 남긴다.
- 오른쪽 기본 패널의 최근 상태전환 로그는 실제 Supabase issue_events 기준이며, opened/reopened, recovering, resolved 이벤트를 구분해 보여준다.
- 오른쪽 기본 패널의 `지금 확인할 입력 공백`, `최근 상태전환 로그`, `장기 문제 보기`는 각각 접기/펼치기 가능해야 하며, 목록은 약 6개 항목 높이에서 내부 스크롤로 제한한다.
- 장기 문제 목록은 기본 접힘 상태로 두어 현재 확인할 리스크와 최근 상태전환 로그가 먼저 보이게 한다.
- `문제확정`과 `회복중`은 정상 목록에서 사라지지 않아야 한다.
- `회복중`은 최근 슬롯의 빨간 칸이 밀려 사라지는 동안 유지한다.
- 오른쪽 로그는 `issue_events`의 상태 전환 기록을 보여준다.

## 11. 운영 절차
### 최초 구축
1. 원본 DB 환경변수를 설정한다.
2. Supabase 환경변수를 설정한다.
3. Supabase migration을 적용한다.
4. `/api/cctvup/check/`를 1회 실행해 `camera_states`를 seed한다.
5. `/api/cctvup`가 `Supabase camera_state 기준` 메시지를 반환하는지 확인한다.
6. `/cctvup` 화면에서 카메라 수, 문제 수, 로그 수를 확인한다.

### migration 적용
표준 migration 파일 위치는 `supabase/migrations/20260506145200_cctvup_state_machine.sql`이다.

적용 전 dry-run은 `supabase db push --dry-run --linked`로 확인한다.

실제 적용은 `supabase db push --linked --yes`로 진행한다.

### 5분 체크 실행
로컬에서 수동 실행할 때는 `curl -sS -H "x-cctvup-cron-secret: ${CCTVUP_CRON_TRIGGER_SECRET}" http://localhost:3002/api/cctvup/check/`를 사용한다.

로컬 24시간 PC에서는 `localhost:3002`의 Next 서버와 `node scripts/cctvup-check-local.mjs` 5분 실행을 한 세트로 둔다. 체크 스크립트는 서버를 직접 띄우지 않고 이미 떠 있는 `/api/cctvup/check/`를 호출한다.

이 스크립트는 `.env.local`의 `CCTVUP_CRON_TRIGGER_SECRET`을 읽고 `CCTVUP_LOCAL_CHECK_URL` 또는 기본값 `http://localhost:3002/api/cctvup/check/`를 호출한다. `CCTVUP_CHECK_URL`은 GitHub Actions용 값이므로 로컬 스크립트의 기본 호출 대상으로 쓰지 않는다.

2026-05-08 기준 공식 5분 체크 주체는 `com.paiptree.cctvup-check` launchd 하나다. Hermes company의 과거 `paiptree-cctvup-5min-history-checker` 크론은 중복 호출 원인으로 확인해 active job과 전용 스크립트를 삭제했다. 같은 이름의 Hermes job이 다시 보이면 새 기능이 아니라 잔여/중복 자동화로 보고 제거한다.

반복 실행은 macOS `launchd`의 `StartInterval=300` 또는 서버 cron `*/5 * * * *`로 구성한다. 외부 배포가 안정화된 뒤에는 GitHub Actions cron이나 서버 cron으로 옮긴다.

macOS launchd 템플릿은 두 개를 함께 사용한다. `ops/launchd/com.paiptree.website-dev.plist`는 로컬 Next 서버를 유지하고, `ops/launchd/com.paiptree.cctvup-check.plist`는 5분마다 상태머신 체크를 실행한다. 실제 등록은 `website-dev`를 먼저 등록한 뒤 `cctvup-check`를 등록한다.

등록 순서:
1. `cp ops/launchd/com.paiptree.website-dev.plist ~/Library/LaunchAgents/`
2. `cp ops/launchd/com.paiptree.cctvup-check.plist ~/Library/LaunchAgents/`
3. `launchctl bootstrap "gui/$(id -u)" ~/Library/LaunchAgents/com.paiptree.website-dev.plist`
4. `launchctl bootstrap "gui/$(id -u)" ~/Library/LaunchAgents/com.paiptree.cctvup-check.plist`
5. `launchctl kickstart -k "gui/$(id -u)/com.paiptree.website-dev"`
6. `launchctl kickstart -k "gui/$(id -u)/com.paiptree.cctvup-check"`

로그 위치:
- Next 서버: `/tmp/paiptree-website-dev.out.log`, `/tmp/paiptree-website-dev.err.log`
- 5분 체크: `/tmp/paiptree-cctvup-check.out.log`, `/tmp/paiptree-cctvup-check.err.log`

화면에서 수동으로 확인할 때는 상단 `관리 secret`에 `CCTVUP_CRON_TRIGGER_SECRET` 값을 넣고 `지금 체크`를 누른다. 성공하면 체크 결과 패널에 `state`, `event`, `opened`, `recovering`, `resolved` 건수가 표시되고 현재 목록/history를 다시 읽는다. 로컬 개발 환경에서는 농장 분류/registry 저장이 secret 입력 없이도 서버 registry까지 저장되어야 한다.

GitHub Actions의 `CCTVUP Check`는 현재 `workflow_dispatch` 수동 실행만 유지한다. GitHub-hosted runner 또는 웹 배포 서버가 원본 CCTV DB를 읽지 못하는 상태에서 schedule을 켜면 `/api/cctvup/check/`가 503을 반환하고 실패 메일이 반복된다. 웹 배포 서버에서 `/api/cctvup`가 `source: db`를 반환하고 `/api/cctvup/check/`가 성공하는 것이 확인된 뒤에만 schedule을 다시 켠다.

### 정상 동작 확인
- `curl -sS http://localhost:3002/api/cctvup/`
- `curl -sS 'http://localhost:3002/api/cctvup/history/?limit=50'`
- `curl -I http://localhost:3002/cctvup/`
- 화면 상단 `지금 체크`

확인할 값:
- `/api/cctvup`의 `message`가 `Supabase camera_state 기준`인지
- `summary.cameras`가 활성 카메라 수와 맞는지
- `summary.monitorActive`, `summary.monitorResting`, `summary.monitorNeedsReview`, `summary.monitorUninstalled`가 감시범위 분포를 보여주는지
- `summary.open`, `summary.recovering`, `summary.watching`이 상태머신 기준으로 나오는지
- `summary.issueCount`가 `감시중` 카메라의 문제만 세는지
- Supabase가 응답 가능하면 history 응답에 활성 `cameraStates`와 최근 `issueEvents`가 채워지는지
- Supabase가 느리거나 응답하지 않으면 history가 약 800ms 전후로 `unavailable` 또는 부분 응답을 반환하고 화면 목록은 유지되는지
- `지금 체크` 성공 후 상단 체크 루프 시각과 history의 최근 check run이 갱신되는지
- 운영 안정화 리포트가 필요하면 `node scripts/cctvup-stability-report.mjs`를 실행해 5분 루프 간격, stale state, 대상확인 목록을 한 번에 확인한다.

## 12. 환경변수
### 원본 운영 DB
- `CCTVUP_DB_HOST`
- `CCTVUP_DB_PORT`
- `CCTVUP_DB_USER`
- `CCTVUP_DB_PASSWORD`
- `CCTVUP_DB_DATABASE`

### Supabase
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`

### 보호 secret
- `CCTVUP_CRON_TRIGGER_SECRET`

### 선택 설정
- `CCTVUP_DB_QUERY_TIMEOUT_MS`
- `CCTVUP_SUPABASE_FETCH_TIMEOUT_MS`: Supabase 읽기 timeout. 기본값 800ms
- `CCTVUP_SUPABASE_STATE_FETCH_TIMEOUT_MS`: Supabase camera_state 읽기 timeout. 기본값 1500ms
- `CCTVUP_SUPABASE_DIAG_TIMEOUT_MS`: Supabase 진단 단계별 timeout. 기본값 5000ms
- `CCTVUP_SUPABASE_WRITE_TIMEOUT_MS`: Supabase 쓰기 timeout. 기본값 8000ms
- `CCTVUP_LOCAL_CHECK_URL`: 로컬 체크 스크립트가 호출할 URL. 기본값 `http://localhost:3002/api/cctvup/check/`
- `CCTVUP_LOCAL_CHECK_TIMEOUT_MS`: 로컬 체크 스크립트 timeout. 기본값 120000ms
- `CCTVUP_CHECK_URL`: GitHub Actions 수동 workflow에서만 사용하는 웹 check URL. 로컬 24시간 PC의 기본 체크 경로로 쓰지 않는다.
- `CCTVUP_ALLOW_MOCK_FALLBACK`

## 13. 보안 원칙
- `SUPABASE_SERVICE_KEY`는 서버에서만 사용한다.
- `CCTVUP_CRON_TRIGGER_SECRET`도 서버/관리자 호출에만 사용한다.
- registry 저장은 배포 환경에서 secret 없이 열면 안 된다. 로컬 개발 환경의 localhost registry 저장만 `local-registry` 모드로 허용한다.
- check 실행, history 쓰기, health 진단은 로컬/배포 모두 secret 없이 열면 안 된다.
- Supabase 진단도 service key 상태를 간접 확인하므로 secret 없이 열면 안 된다.
- 프론트에 secret 값을 하드코딩하지 않는다.
- 원본 운영 DB 계정은 가능하면 read-only 권한으로 제한한다.
- API 코드에서도 원본 DB 쿼리가 `SELECT/WITH`로 시작하는지 검사한다.

## 14. 장애 대응
### 화면이 갑자기 all green처럼 보임
- 원인 후보:
  - `tbl_cctvup_camera_states`가 비어 있음
  - `/api/cctvup/check/`가 5분마다 돌지 않음
  - `/api/cctvup`가 persisted state 병합에 실패해 live fallback만 반환함
- 확인:
  - `/api/cctvup`의 `message`
  - `/api/cctvup/history/?limit=50`의 `cameraStates`
  - 최근 `checkRuns` 시간

### `/api/cctvup/check/`가 401
- `x-cctvup-cron-secret` 헤더가 없거나 다르다.
- `CCTVUP_CRON_TRIGGER_SECRET` 환경변수가 서버에 없을 수 있다.

### 로컬 5분 체크가 `fetch failed`
- `scripts/cctvup-check-local.mjs`는 기본적으로 `http://localhost:3002/api/cctvup/check/`를 호출한다.
- 이 오류는 대부분 로컬 Next 서버가 꺼져 있거나 `localhost:3002`가 다른 프로세스와 충돌할 때 발생한다.
- 확인 순서:
  - `launchctl print "gui/$(id -u)/com.paiptree.website-dev"`
  - `curl -I http://localhost:3002/cctvup/`
  - `tail -n 80 /tmp/paiptree-website-dev.err.log`
  - `tail -n 80 /tmp/paiptree-cctvup-check.err.log`

### `npm run build` 이후 로컬 API가 500
- `next dev`가 떠 있는 상태에서 `npm run build`를 실행하면 `.next` 산출물이 바뀌면서 dev 서버의 모듈 캐시가 꼬일 수 있다.
- 증상 예: `/api/cctvup`에서 `Cannot find module './####.js'` 500이 발생한다.
- 권장 검증 순서:
  - `launchctl bootout "gui/$(id -u)/com.paiptree.cctvup-check"`
  - `launchctl bootout "gui/$(id -u)/com.paiptree.website-dev"`
  - `npm run build`
  - `launchctl bootstrap "gui/$(id -u)" ~/Library/LaunchAgents/com.paiptree.website-dev.plist`
  - `launchctl bootstrap "gui/$(id -u)" ~/Library/LaunchAgents/com.paiptree.cctvup-check.plist`
  - `launchctl kickstart -k "gui/$(id -u)/com.paiptree.website-dev"`
  - `launchctl kickstart -k "gui/$(id -u)/com.paiptree.cctvup-check"`
- 이미 500이 난 경우에도 `launchctl kickstart -k "gui/$(id -u)/com.paiptree.website-dev"`로 로컬 Next 서버를 재시작한다.
- 재확인:
  - `curl -I http://localhost:3002/cctvup/`
  - `node scripts/cctvup-check-local.mjs`

### `tbl_cctvup_camera_states 조회에 실패`
- Supabase migration이 적용되지 않았거나 service key가 잘못됐다.
- `supabase db push --linked --yes` 적용 여부를 확인한다.
- `/cctvup` 상단이 `상태머신 미반영`이면 운영 DB live 값만 표시 중이라는 뜻이다.
- 이 상태에서는 3회 미수집, 회복중, 12슬롯 해결 흐름을 신뢰하면 안 된다.

### `/api/cctvup/history`가 `unavailable`
- Supabase REST 연결이 800ms 안에 끝나지 않았거나 일부 테이블 조회가 실패했다.
- 이 상태는 우측 로그/히스토리 보조 정보의 문제이며, `/api/cctvup`의 현재 목록 조회와 원본 DB read-only 원칙은 유지된다.
- 반복되면 `/cctvup` 상단의 `Supabase 진단` 버튼이나 `node scripts/cctvup-supabase-diagnose.mjs`로 `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, Supabase 프로젝트 상태, 네트워크 상태를 확인한다.
- 운영상 문제가 계속되면 timeout을 소폭 늘리기보다 history 조회량과 Supabase 상태를 먼저 확인한다.
- 로컬 개발 서버가 샌드박스 네트워크 안에서 실행되면 서버사이드 fetch가 Supabase DNS를 못 풀 수 있다. 이때는 개발 서버를 외부 네트워크 권한으로 재실행하고 진단 버튼을 다시 누른다.

### 원본 DB 조회 실패
- `/api/cctvup/health`로 연결 상태를 확인한다.
- 운영에서는 DB 실패 payload를 정상 체크로 저장하지 않는다.
- 원본 DB가 죽은 상태를 Supabase 최신 payload로 덮어 정상처럼 보이게 만들면 안 된다.

### GitHub Actions `CCTVUP Check` 실패 메일 반복
- 원인: GitHub Actions가 웹 서버의 `/api/cctvup/check/`를 호출했지만, 웹 서버가 원본 CCTV 운영 DB를 읽지 못해 503을 반환한다.
- 현재 기준: 로컬 24시간 PC가 원본 DB에 접근 가능한 체크 실행 위치다.
- 즉시 조치: `.github/workflows/cctvup-check.yml`의 schedule은 꺼두고 `workflow_dispatch`만 유지한다.
- 재개 조건: 웹 배포 서버에서 `/api/cctvup`가 `source: db`를 반환하고, 보호 secret으로 `/api/cctvup/check/`가 `ok: true`를 반환해야 한다.
- 재개 전에는 GitHub cron을 켜지 않는다.

### 로그가 너무 많이 쌓임
- `watching`을 이벤트로 저장하고 있는지 확인한다.
- `check_runs.payload`에 전체 rows를 저장하고 있는지 확인한다.
- 정상 카메라 snapshot 누적 경로를 다시 켜지 않았는지 확인한다.

### 최근 check run에 0~1분 간격 실행이 섞임
- 정상 launchd 루프는 `StartInterval=300` 기준 5분 내외다.
- `scripts/cctvup-stability-report.mjs`의 최근 간격 판정에서 `수동/재기동`이 보이면, 5분 루프 외에 수동 버튼, launchd kickstart, 별도 자동화, 이전 검증 명령 중 하나가 추가로 `/api/cctvup/check/`를 호출한 것이다.
- GitHub Actions schedule은 꺼져 있어야 하며, 현재 repository 기준 `.github/workflows/cctvup-check.yml`은 `workflow_dispatch`만 유지한다.
- launchd stdout 로그의 성공 간격이 5분이고 check_runs에만 0~1분 간격이 보이면 로컬 launchd 자체 중복보다는 별도 호출 주체를 의심한다.
- `/api/cctvup/check/`는 `tbl_cctvup_check_runs.note`에 `caller`, `method`, `host`, `ua`, `xff`를 함께 남긴다. 로컬 launchd 표준 스크립트는 `caller=local-launchd`, 화면 수동 체크는 `caller=browser-manual`로 기록된다.
- 2026-05-08 중복 원인은 Hermes company의 `paiptree-cctvup-5min-history-checker`였고, 삭제 후 다음 예정 시각에 새 실행 파일이 생기지 않는 것을 확인했다.
- 원인 확정 전에는 중복 run을 삭제하지 않고, 다음 30~60분 동안 손대지 않은 상태에서 리포트를 다시 생성해 자연 발생 여부를 확인한다.

## 15. QA 체크리스트
- `/api/cctvup/check/` secret 없는 호출이 401을 반환한다.
- `/api/cctvup/check/` secret 있는 호출이 `ok: true`를 반환한다.
- 원본 DB에는 어떤 write도 발생하지 않는다.
- `휴지기/대상확인/미설치` row는 `paused`로 표시되고 새로운 `opened` event를 만들지 않는다.
- Supabase camera_state 병합은 현재 `감시중` row에 매칭되는 state만 반영한다.
- 1~2회 미수집은 `watching`이고 `issue_events`에 기록되지 않는다.
- 3회 미수집 이후 `opened` 이벤트가 1회만 생긴다.
- 이미지 재수신 후 `recovering` 이벤트가 생긴다.
- 최근 12슬롯 정상 후 `resolved` 이벤트가 생긴다.
- `/api/cctvup`가 `camera_states`를 병합한 상태를 반환한다.
- `/api/cctvup` 응답의 `stateSync.status`가 상태머신 반영 여부를 알려준다.
- `/api/cctvup/history`가 `cameraStates`, `issueEvents`, `currentIssues`를 반환한다.
- Supabase history가 timeout되어도 `/cctvup` 메인 목록이 계속 렌더링된다.
- `/cctvup` 좌측 목록에서 문제확정/회복중 카메라가 사라지지 않는다.
- registry 카테고리 변경이 Supabase에 저장되고 새로고침 후 유지된다.
- 관리 secret 입력 후 `Supabase 진단` 버튼이 DNS/TCP/REST 상태를 화면에 표시한다.
- 데스크톱에서 좌측 농장 목록과 우측 상세/로그 영역이 서로 독립적으로 스크롤된다.
- 관리 secret 입력 후 `지금 체크` 버튼이 check run을 만들고 화면을 재조회한다.

## 16. 단계별 로드맵
### Phase 0 - 기준 고정과 문서화
- 목표: `/cctvup`의 1차 목적을 5분 CCTV 이미지 수신감시로 고정하고, 무게예측 입력 관제는 그 위에 붙는 확장 방향으로 정의한다.
- 현재 상태: 완료.
- 완료 기준:
  - 원본 운영 DB는 읽기 전용이라는 원칙이 문서에 명시되어 있다.
  - 이미지 수신 기준은 `tbl_farm_image`이고, 분석 결과 기준은 별도 분석 테이블이라는 분리가 문서에 명시되어 있다.
  - Supabase 저장은 `camera_states` 1행 upsert와 `issue_events` 전환 이벤트 append 중심으로 정리되어 있다.
  - 1~2회 미수집은 관찰, 3회 미수집부터 문제확정, 회복은 최근 12슬롯 정상 이후 해결이라는 상태머신 기준이 고정되어 있다.

### Phase 1 - 문구와 정보 구조 정리
- 목표: 사용자가 `/cctvup`을 단순 CCTV 화면이 아니라 AI 중량예측 입력 관제 화면으로 이해하게 한다.
- 현재 상태: 완료.
- 화면 변경:
  - 페이지 제목과 설명에 `AI 중량예측 입력 관제` 맥락을 반영한다.
  - 이미지 누락이 예측 공백이나 신뢰도 저하로 이어질 수 있음을 설명한다.
  - 문제로그 문구를 `중량예측에 영향을 줄 수 있는 수신 문제` 관점으로 정리한다.
  - 선택 카메라 상세에 `무게예측 입력 상태` 섹션을 추가하되, 실제 분석 데이터는 아직 깊게 붙이지 않는다.
- 구현 결과:
  - 상단 제목은 `CCTVUP - AI 중량예측 입력 관제`로 표시한다.
  - 우측 기본 패널은 `최근 입력 리스크`로 표시한다.
  - 선택 카메라 상세에는 `AI 중량예측 입력 상태` 섹션을 둔다.
  - `이미지 수신`만 현재 상태머신 실제값을 사용한다.
  - `분석 결과`, `카메라 보정`, `예측 안정성`, `운영 판단`은 후속 단계 전까지 placeholder 또는 이미지 입력 기준으로만 표시한다.
- 데이터 변경: 없음. 기존 수신 상태와 Supabase 상태머신만 사용한다.
- 주의점: 이 단계에서 `/cctvup`을 무게예측 결과 대시보드로 바꾸지 않는다.

### Phase 2 - 선택 카메라 상세 체크리스트
- 목표: 카메라 하나를 선택했을 때, 이 카메라가 무게예측 입력으로 쓸 수 있는 상태인지 단계별로 보이게 한다.
- 현재 상태: 완료.
- 상세 패널 항목:
  - 이미지 수신: 최근 수신 시각, 5분 주기 기준, 최근 1시간 수신 슬롯
  - 분석 결과: 최근 분석 시각, 이미지 있음/분석 없음 여부
  - 카메라 보정: A4 calibration, pixel resolution, correction ratio 연동 상태
  - 예측 안정성: 5분 raw prediction 변동성, 최근 데이터 부족 여부
  - 운영 판단 가능 여부: 사용 가능, 제한적, 불가
- 초기 구현 기준:
  - 이미지 수신은 현재 상태머신 값을 실제로 연결한다.
  - 분석 결과, 보정, 예측 안정성은 데이터 위치와 키 매칭이 확정되기 전까지 `미연동` 또는 `확인 필요`로 표시한다.
- 구현 결과:
  - 선택 카메라 상세에 `카메라별 무게예측 입력 자동 진단표`를 표시한다.
  - 사용자가 체크하는 UI가 아니라 현재 row와 Supabase camera_state 값으로 자동 분기한다.
  - 1단계 `이미지 수신`은 상태머신 상태, 최근 수신, 지연 시간, 미수집 카운트, 최근 1시간 슬롯, 마지막 체크, 최초 미수집, 문제 확정 시각을 보여준다.
  - 2단계 `분석 결과`, 3단계 `카메라 보정`, 4단계 `예측 안정성`은 미연동/확인 필요 상태와 후속 Phase를 명시한다.
  - 5단계 `운영 판단`은 `이미지 입력 기준`으로만 수신 기준 가능, 관찰 필요, 제한적, 불가, 점검제외를 표시한다.
- 주의점: placeholder를 확정값처럼 보이게 만들지 않는다.

### Phase 3 - 분석 결과 읽기 연동
- 목표: 이미지가 들어오는 문제와 중량 분석 결과가 생성되지 않는 문제를 분리한다.
- 현재 상태: 완료. 선택한 카메라 상세에서만 읽기 전용으로 조회한다.
- 추가 데이터 후보:
  - `tbl_farm_image_analysis_weight_v2`: 이미지 분석/중량 예측 결과 최신성 확인
  - 필요 시 센서/라벨 맥락 확인용 테이블: `tbl_farm_sensor`
  - 필요 시 설치/카메라 매칭 확인용 테이블: `tbl_farm_module_mac`
- 구현 결과:
  - `/api/cctvup/analysis`는 `farmId`, `houseId`, `moduleId`, `latestImageAt`을 받아 선택 카메라의 최근 2시간 분석 기록만 조회한다.
  - 조회 SQL은 `SELECT`만 허용하고 원본 DB에는 어떤 쓰기도 하지 않는다.
  - 자동 진단표의 2단계 `분석 결과`는 최근 분석 시각, 분석 지연, 이미지-분석 차이, 최근 상태, success/비정상 건수, 분석 개체 수, 모델 원천값을 근거로 표시한다.
  - `success`는 분석 정상, `blackout/fail/srvFail` 등은 분석 비정상, 이미지가 있는데 최근 분석 기록이 없으면 `이미지 있음 / 분석 없음`으로 표시한다.
  - Phase 3에서는 분석 문제를 Supabase `issue_events`에 저장하지 않는다.
- 표시 상태:
  - 분석 정상
  - 분석 지연
  - 이미지 있음 / 분석 없음
  - 분석 결과 오래됨
- 원인 분리:
  - 이미지 없음: 카메라 또는 수신 문제
  - 이미지는 있음, 분석 없음: 분석 파이프라인 문제
  - 분석은 있음, 값이 흔들림: 모델, 품질, smoothing 문제
- 주의점: 분석 테이블을 이미지 수신감시의 1차 기준으로 쓰지 않는다. 수신 기준은 계속 `tbl_farm_image`다.

### Phase 3.5 - Supabase history 경량화
- 목표: Supabase history가 느리거나 실패해도 `/cctvup` 현재 목록과 선택 카메라 상세가 멈추지 않게 한다.
- 현재 상태: 완료.
- 구현 결과:
  - 프론트는 `/api/cctvup` 메인 현재 상태를 먼저 렌더링하고, `/api/cctvup/history`는 별도 background fetch로 읽는다.
  - `/api/cctvup/history` 기본 limit은 50이며 내부적으로 check run은 5건, issue event는 50건만 읽는다.
  - `camera_states`는 `watching/open/recovering` 활성 상태만 최대 1000건 읽는다.
  - 정상/해결 state 전체 5000건과 정상 카메라 snapshot 전체 조회는 기본 경로에서 제외한다.
  - Supabase 읽기 timeout 기본값은 800ms이고, 일부 실패는 가능한 부분 응답으로 유지한다.
- 기대 효과:
  - Supabase REST가 느려도 화면 상단이 `운영 DB와 history를 함께 읽는 중` 상태로 묶이지 않는다.
  - 무료 Supabase 사용량을 정상 카메라 전체 조회/저장 중심으로 낭비하지 않는다.
  - 우측 로그는 보조 정보로 남고, 현재 상태 판정은 원본 DB와 활성 camera state 병합에 집중한다.

### Phase 3.6 - 상태머신 운영 루프 안정화
- 목표: `/api/cctvup` 화면이 지금 어떤 기준으로 보이는지 명확히 하고, 5분 체크 실행 경로를 로컬 운영 기준으로 고정한다.
- 현재 상태: 완료. Supabase 응답 가능 여부에 따라 실제 적재 검증은 별도로 확인한다.
- 구현 결과:
  - history timeout과 state timeout을 분리했다.
  - history 읽기는 기본 800ms, camera_state 읽기는 기본 1500ms다.
  - `/api/cctvup` payload에 `stateSync`를 포함한다.
  - 화면 상단에 `상태머신 반영`, `상태머신 미반영`, `상태머신 미설정` 중 하나를 표시한다.
  - `scripts/cctvup-check-local.mjs`를 로컬 5분 체크 실행 표준 스크립트로 추가했다.
- 운영 판단:
  - `상태머신 반영`이면 3회 미수집, 회복중, 12슬롯 해결 흐름을 화면 판단 기준으로 삼을 수 있다.
  - `상태머신 미반영`이면 운영 DB live 수신 상태만 보고 있는 것이므로 상태머신 로그/회복 판단은 보류한다.
  - 로컬 PC가 24시간 켜져 있으면 launchd 또는 cron으로 `node scripts/cctvup-check-local.mjs`를 5분마다 실행한다.

### Phase 3.7 - 운영 진단과 화면 사용성 보강
- 목표: Supabase timeout 원인을 운영자가 화면에서 직접 구분하고, 긴 목록에서도 좌우 패널을 안정적으로 탐색하게 한다.
- 현재 상태: 완료.
- 구현 결과:
  - `/api/cctvup/supabase-diagnose/`를 추가했다.
  - 화면 상단에 `Supabase 진단` 버튼을 추가했다.
  - 버튼은 관리 secret을 요구하고, 서버에서 환경 URL/key ref, DNS, TCP 443, REST 핵심 테이블 응답 시간을 확인한다.
  - 진단 결과는 정상/확인 필요와 단계별 응답 시간으로만 표시하며 secret 원문은 노출하지 않는다.
  - 데스크톱 `xl` 이상에서는 헤더 아래 본문을 고정 높이로 두고, 좌측 농장 목록과 우측 결과창을 독립 스크롤 영역으로 분리했다.

### Phase 3.8 - 수동 체크와 루프 리허설
- 목표: 운영자가 화면에서 직접 상태머신을 한 번 실행하고, 5분 자동 체크 루프가 갱신되는지 즉시 확인하게 한다.
- 현재 상태: 완료.
- 구현 결과:
  - 화면 상단에 `지금 체크` 버튼을 추가했다.
  - 버튼은 관리 secret을 요구하고 `/api/cctvup/check/`를 `POST`로 호출한다.
  - 성공하면 check run id, state 반영 건수, event 반영 건수, opened/recovering/resolved 건수를 표시한다.
  - 성공 후 `/api/cctvup`와 `/api/cctvup/history`를 다시 읽어 현재 목록과 최근 check run을 갱신한다.
  - 상단 상태줄에 최근 체크 루프 시각을 계속 표시한다.

### Phase 3.11 - 감시대상 전수조사 리포트
- 목표: `tbl_farm_gateway.install_status`, `tbl_farm_house_breed_hist.in_date/out_date`, `tbl_farm_image`, `tbl_farm_sensor`를 읽어 실제 감시 대상과 휴지기/대상확인 후보를 분리한다.
- 현재 상태: 완료. 리포트 기준을 `/cctvup` 판정 로직에 적용했다.
- 실행 스크립트: `node scripts/cctvup-monitor-scope-audit.mjs`
- 생성 파일:
  - `/Users/zoro/company-ops/.hermes-sensitive/farm-ops/reports/cctvup-monitor-scope-audit-YYYY-MM-DD.sensitive.json`
  - bundle 내부에는 markdown, csv, summary json이 들어가지만 AES-256-GCM으로 암호화한다.
  - 실행 시 `PAIPTREE_SENSITIVE_EXPORT_PASSPHRASE`가 필요하며, passphrase는 repo, `.env`, Company feed, shell history에 남기지 않는다.
- 판정 기준:
  - `감시중`: gateway 설치 + 현재 사육중
  - `휴지기`: gateway 설치 + 출하 후 35일 이내
  - `대상확인`: gateway 설치 + 사육정보 없음/출하 후 35일 초과/판정 불명
  - `미설치`: gateway 설치 상태가 `설치`가 아님
- 적용 전 원칙:
  - 리포트는 원본 DB `SELECT/WITH/SHOW`만 사용한다.
  - 휴지기/대상확인/미설치 항목은 문제로그 저장 대상이 아니다.
  - 기존 opened issue가 휴지기/대상확인으로 빠질 때는 `resolved`로 자동 처리하지 않는다.
- 적용 결과:
  - `/api/cctvup`는 gateway 설치 여부와 최신 사육 이력을 함께 읽어 row별 감시범위를 계산한다.
  - `감시중` row만 상태머신 저장/문제확정 대상으로 유지한다.
  - `휴지기/대상확인/미설치` row는 `paused`로 표시하고, 기존 stale camera_state가 있더라도 현재 화면에 문제로 반영하지 않는다.
  - 좌측 목록에는 감시범위 필터를 추가해 전체, 감시중, 휴지기, 대상확인, 미설치 범위를 빠르게 분리해 볼 수 있다.

### Phase 3.12 - 농장 소속 분류 정리
- 목표: 농장 그룹의 `신우/체리부로/해외/기타` 분류를 원본 DB 소속 기준으로 복구한다.
- 현재 상태: 완료. 화면 분류는 원본 DB `tbl_farm_service.affiliates`와 `country` 자동분류를 기본값으로 사용한다.
- 기존 Supabase registry의 대량 `other` 값은 `legacy`로 취급한다. `legacy` category는 원본 DB 자동분류가 명확한 경우 덮어쓰지 않는다.
- 새 Supabase migration: `supabase/migrations/20260507072000_cctvup_farm_registry_category_source.sql`
- SQL 문서: `docs/sql/supabase/021_cctvup_farm_registry_category_source.sql`
- migration 적용 전에도 화면은 legacy registry를 약한 값으로 처리해 분류를 복구한다. migration 적용 후에는 버튼으로 바꾼 값이 `manual` override로 저장된다.

### Phase 4 - 문제 유형 확장
- 목표: 문제로그를 이미지 수신 문제뿐 아니라 무게예측 파이프라인 리스크까지 확장한다.
- 확장할 issue type 후보:
  - `image_late`: 이미지 수신 지연
  - `image_missing`: 이미지 수신 누락
  - `analysis_missing`: 이미지 있음 / 분석 없음
  - `analysis_late`: 분석 결과 지연
  - `calibration_unknown`: 보정 상태 미확인
  - `prediction_unstable`: 예측값 변동 큼
  - `representative_value_unavailable`: 1시간 대표값 생성 불가
- 저장 원칙:
  - Supabase 저장은 계속 문제 중심으로 제한한다.
  - 정상 카메라 전체 snapshot을 매 5분 누적하지 않는다.
  - 확정 문제 또는 의미 있는 상태 전환만 event로 남긴다.
- 주의점: issue 종류가 늘어나도 화면 왼쪽 목록은 수신 상태 우선으로 유지한다.

### Phase 5 - 농장 단위 운영 가능 상태
- 목표: 운영자가 농장 단위로 무게예측 결과를 판단에 써도 되는지 빠르게 확인하게 한다.
- 농장 row 요약 후보:
  - 이미지 정상 카메라 수
  - 분석 정상 카메라 수
  - 보정 확인 카메라 수
  - 1시간 대표 중량 생성 여부
  - 운영 판단 상태: 사용 가능, 제한적, 불가
- 농장 상세 후보:
  - 이미지 수신 준비도
  - 분석 결과 준비도
  - 보정 준비도
  - 대표값 생성 상태
  - 출하/운영 판단 데이터 사용 가능 여부
- 주의점: 이 단계는 최종 운영판에 가깝다. Phase 1~4가 안정화되기 전에는 서두르지 않는다.

## 17. 변경 시 지켜야 할 기준
- 변경 전 이 문서와 `docs/pages/cctvup.page.md`를 먼저 확인한다.
- 원본 운영 DB write가 생기는 변경은 금지한다.
- Supabase 저장량을 늘리는 변경은 먼저 저장량 계산을 한다.
- 화면 색상/카테고리 UI는 상태 색상과 섞지 않는다.
- 문제로그는 확정 문제 중심으로 유지한다.
- 수신감시와 무게예측 분석 상태를 같은 값으로 합치지 않는다.
