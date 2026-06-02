---
title: CCTVUP 서비스 전체 가이드 매뉴얼
author: ZORO
last_updated: 26.05.29
---

# CCTVUP 서비스 전체 가이드 매뉴얼

## 1. 한 줄 정의
`/cctvup`은 농장 CCTV 이미지가 5분 주기로 정상 저장되는지 감시하고, 15분 이상 이미지 수집이 멈춘 카메라만 확정 문제로 남기는 AI 중량예측 입력 관제 페이지다.

## 2. 서비스 목표
- 지정된 활성 CCTV 카메라가 5분마다 이미지를 저장하는지 확인한다.
- 원본 DB의 gateway 설치 여부와 사육 이력을 읽어 실제 감시 대상, 휴지기, 대상확인, 미설치를 분리한다.
- `/cctvup`에 표시되는 농장은 기본적으로 정상 운영 농장으로 본다. 화면에서 분리하는 것은 농장 운영 여부가 아니라 현재 CCTV 5분 저장 감시 대상 여부다.
- `휴지기`는 이미지가 들어오지 않아도 CCTV 장애로 보지 않는다. 휴지기 판정은 이미지 공백 시간이 아니라 원본 DB 사육 이력의 출하일 기준으로 한다.
- `대상확인`은 장애가 아니라 사육 이력/설치 기준 데이터 확인 필요 상태다.
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
- 내부 테스트 농장 `FA0000`(테스트농장), `FA0001`(테스트[스테이징])은 원본 DB에 활성 CCTV가 있더라도 운영 감시 대상에서 제외한다.
- 체리부로 `FA0014`(하니농장)는 활성 분석 CCTV 2대가 있으므로 운영 감시 대상에 포함한다.
- `/api/cctvup/check`는 5분마다 원본 DB 최신 상태를 읽고 Supabase에 상태머신 결과를 저장한다.
- 화면 상단의 `지금 체크` 버튼은 같은 `/api/cctvup/check/` 경로를 즉시 실행해 수동 운영 리허설과 긴급 확인에 사용한다.
- 화면 상단의 `운영 점검` 버튼은 `/api/cctvup/smoke/`를 호출해 로컬 서버, 자동 체크 launchd, 일일 브리핑 launchd/manifest, 현재 API, history, stale state를 읽기 전용으로 확인한다.
- 웹 배포 production runtime에서는 `/cctvup` 페이지 자체와 운영 데이터 읽기 API를 기본 보호한다. 페이지는 Supabase Auth 세션이 있어야 열리고, 상단 `관리 secret`에 secret을 넣고 Enter를 누르면 `/api/cctvup`, history, registry, smoke, 분석/저장근거, 일일 브리핑 읽기 요청에 같은 secret을 붙여 다시 조회한다.
- Supabase `tbl_cctvup_camera_states`는 카메라별 현재 상태를 1행 upsert로 유지한다.
- Supabase `tbl_cctvup_issue_events`는 확정/회복/해결 전환 이벤트만 append한다.
- Supabase `tbl_cctvup_farm_scope_states`는 농장별 현재 감시범위를 1행 upsert로 유지한다.
- Supabase `tbl_cctvup_farm_scope_events`는 입추/감시 시작, 출하/휴지기 진입, 대상확인, 미설치 전환처럼 농장 감시범위가 바뀐 이벤트만 append한다.
- Supabase `tbl_cctvup_check_runs`는 체크 실행 요약만 저장한다.
- Supabase `tbl_cctvup_farm_registry`는 사용자가 바꾼 농장 표시명, 카테고리, 메모를 저장한다.
- 일일 운영 브리핑은 Supabase에 중복 저장하지 않고 프로젝트 내부 `content/cctvup/daily-reports/**`에 커밋 가능한 `md`, `raw.json`, `manifest.json` 파일로 저장한다. 로컬에서는 Next.js 생성 API가 파일을 만들고, `com.paiptree.cctvup-daily-report` launchd가 매일 00:05에 전날 보고서를 자동 생성한다. 웹 배포본에서는 GitHub에 포함된 같은 파일을 `/cctvup`에서 읽는다. 브리핑 원천은 CCTVUP 상태 이벤트와 함께 `tbl_farm_diary_input`, `tbl_farm_diary_output`, `tbl_farm_diary_dead_kill`을 read-only로 조회한 실제 입추/출하 원장을 포함한다.
- `/cctvup` 프론트는 `/api/cctvup`, `/api/cctvup/history`, `/api/cctvup/registry`를 조합해 화면을 만든다.
- `/api/cctvup/history`는 보조 정보다. 느리거나 실패해도 `/api/cctvup` 현재 목록 렌더링을 막지 않는다.
- `/api/cctvup`의 camera_state 병합은 history보다 중요하므로 별도 timeout을 사용하고, 실패하면 화면에 `상태머신 미반영`으로 표시한다.
- Supabase REST 장애가 의심될 때는 화면 상단의 `Supabase 진단` 버튼 또는 `scripts/cctvup-supabase-diagnose.mjs`로 환경, DNS, TCP 443, 핵심 REST 테이블 응답 시간을 확인한다.
- 선택 카메라 상세의 히스토리는 `상태전환 기록`으로 표시한다. `missing · open`, `critical · open` 같은 기술 값은 기본 화면에 쓰지 않고 `문제확정`, `회복중`, `해결`, `재확정` 운영 문구를 사용한다.
- 레거시 스냅샷/인시던트 반복 목록은 기본 화면에서 제거한다. 관련 테이블은 compatibility 보조 정보로만 유지한다.
- 선택 카메라 상세의 기본 판정은 `이미지 입력 상태` 1개로 축소한다.
- `중량분석 생성`은 `무게예측 참고` 접힘 영역으로 내리고, 사용자가 펼칠 때만 선택 카메라 기준으로 조회한다.
- `무게예측 참고`를 펼치면 상단에 보조 정보 안내를 표시한다. 분석 없음/지연/비정상 row는 왼쪽 농장 상태, 상태머신, Supabase issue event에 반영하지 않는다.
- `보정 근거`, `대표값 안정성`, `운영 사용 판단`은 기본 화면에서 제거한다. 실제 R2/A4/1시간 대표값 원천이 확정되기 전까지 후속 Phase 후보로만 유지한다.
- 보정/대표값/운영판단은 `연동 전` 카드로 기본 노출하지 않는다. 아직 원천이 확정되지 않은 항목을 화면에 깔아두면 실제 CCTV 장애가 아닌데도 문제처럼 보일 수 있기 때문이다.
- 선택 카메라 상세에는 `5분 저장 근거` 섹션을 둔다. 이 섹션은 최신 저장, 문제 직전 저장, 회복 확인 저장을 원본 DB `tbl_farm_image.FILE_NAME` 기준으로 읽어 보여준다.

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
- 5분 저장 근거:
  - `/api/cctvup/images`는 선택 카메라의 `farmId`, `houseId`, `moduleId`, `firstMissedAt`, `openedAt`, `resolvedAt`을 받아 원본 DB `tbl_farm_image`를 `SELECT`로만 조회한다.
  - 반환값은 `latest`, `before_issue`, `recovery` 3개 카드다.
  - `/api/cctvup/images`는 운영 이미지 서버 원본 URL, 원본 파일명, 이미지 바이너리, proxy URL을 반환하지 않는다.
  - 화면에는 썸네일을 표시하지 않고 저장 시각, 마스킹된 파일 참조, 파일 크기만 표시한다.
  - 정상 카메라는 추가 원본 DB 조회를 하지 않고 `/api/cctvup` 현재 목록의 최신 수신 시각을 `최신 저장`으로 표시한다.
  - 문제확정, 회복중, 최초 미수집/문제확정/해결 이력이 있는 카메라에서만 `/api/cctvup/images` 상세 조회로 `중단 직전`, `회복 확인` 저장 근거를 확인한다.
  - 상세 조회가 timeout되면 화면은 현재 목록 기준 fallback을 유지하고, timeout은 상세 저장 근거 지연으로만 표시한다.
  - 현재 단계에서 `/cctvup`은 이미지 뷰어가 아니라 이미지 저장 증거 관제로 둔다. 운영 이미지 서버 인증 방식 확인과 이미지 보기 기능은 후순위 보조 기능으로 분리한다.
- 절대 하지 않는 것: insert, update, delete, schema 변경, registry 저장, 로그 저장
- 내부 테스트 farm id 제외: `FA0000`, `FA0001`

### Supabase
- 역할: `/cctvup` 전용 운영 상태와 사용자 편집값을 저장한다.
- 현재 핵심 테이블:
  - `tbl_cctvup_camera_states`: 카메라별 현재 상태 1행
  - `tbl_cctvup_issue_events`: 상태 전환 이벤트
  - `tbl_cctvup_farm_scope_states`: 농장별 현재 감시범위 1행
  - `tbl_cctvup_farm_scope_events`: 농장 감시범위 전환 이벤트
  - `tbl_cctvup_check_runs`: 5분 체크 요약
  - `tbl_cctvup_farm_registry`: 농장 표시명, 카테고리, 메모, 태그
- 레거시/보조 테이블:
  - `tbl_cctvup_camera_snapshots`
  - `tbl_cctvup_incident_logs`
  - `tbl_cctvup_current_issues`
- 현재 권장 경로는 `camera_states + issue_events` 중심이다.
- history 기본 조회는 `check_runs` 5건, 최근 30일 `issue_events` 최대 20000건, 활성 `camera_states` 최대 1000건으로 제한한다.
- history는 정상/해결 state 전체나 정상 카메라 snapshot 전체를 기본으로 읽지 않는다.
- `issue_events`의 `opened/recovering/resolved/reopened`는 화면에서 `문제확정/이미지 재수신/해결/재확정`으로 표시한다.
- `tbl_cctvup_issue_events`는 서버 DB에서 임의 삭제하지 않고 계속 보관한다. 화면 기본 목록만 `event_at >= now - 30 days` 조건으로 읽는다.
- `tbl_cctvup_farm_scope_events`는 서버 DB에서 임의 삭제하지 않고 계속 보관한다. 화면 기본 목록만 `event_at >= now - 30 days` 조건으로 읽는다.
- 선택 카메라 상세에서도 레거시 스냅샷/인시던트 반복 목록은 기본으로 펼치지 않는다. 운영자는 상태전환 기록과 5분 저장 근거를 먼저 본다.
- 상태머신 저장과 화면 반영은 현재 `감시중` 카메라에 한정한다. `휴지기`, `대상확인`, `미설치` 카메라는 목록에는 남기되 문제로그 저장 대상에서 제외한다.
- 문제확정은 `gateway 설치 + 현재 사육중 + 3회 연속 미수집` 조건을 모두 만족하는 카메라에서만 발생한다.
- 이전에 `watching/open/recovering` 상태였던 카메라가 현재 `감시중` 범위에서 빠지면 다음 체크 때 `tbl_cctvup_camera_states.status = resolved`로 닫아 활성 조회에서 제외한다. 이 처리는 감시범위 변경 정리이며 카메라 회복 이벤트로 보지 않으므로 `issue_events`에는 새 이벤트를 남기지 않는다.
- Supabase history 읽기 timeout 기본값은 1500ms다. timeout이 나면 부분 응답 또는 `unavailable`로 빠르게 내려 화면을 유지한다.
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
- 에너지바 표시: 1~2회 미수집은 노랑 `late`, 3회째부터 빨강 `missing`이다.
- stale state 기준: 원본 DB live row의 최신 이미지 시각이 Supabase `camera_state.last_checked_at`보다 새로우면 저장 state는 화면 병합에서 제외한다.

### 전환 규칙
- 최초 정상 상태는 `ok`다.
- `ok`에서 1회 미수집이 발생하면 `watching`으로 간다.
- `watching`에서 2회까지는 계속 관찰한다.
- 3회 미수집이 되면 `open`으로 전환한다. 이때 화면 에너지바는 새 문제를 1칸부터 다시 쌓지 않고, 앞선 1~2회 미수집 흐름을 함께 보여준다.
- `open` 이후 이미지가 다시 들어오면 `recovering`으로 간다.
- `recovering`에서 최근 12슬롯이 모두 정상이 되면 `resolved`로 간다.
- `resolved` 이후 다시 미수집이 시작되면 `watching`부터 다시 시작한다.
- `recovering` 중 다시 미수집이 누적되면 `open`으로 재전환한다.

### 이벤트 저장 규칙
- `opened`: `open`으로 처음 확정될 때 저장한다.
- `recovering`: `open`에서 이미지가 다시 들어왔을 때 저장한다. 화면 라벨은 `이미지 재수신`이다.
- `resolved`: 최근 12슬롯이 모두 정상으로 채워졌을 때 저장한다.
- `reopened`: 회복/해결 흐름 이후 다시 `open`으로 확정될 때 저장한다.
- `watching`은 이벤트로 저장하지 않는다.

### 농장 감시범위 이벤트 규칙
- 농장 감시범위 이벤트는 카메라 이미지 장애 이벤트가 아니라 입추/출하/설치 기준 변화의 운영 이력이다.
- `/api/cctvup/check`는 매 체크마다 현재 농장 감시범위를 `tbl_cctvup_farm_scope_states`에 1행 upsert한다.
- 직전 감시범위와 현재 감시범위가 다를 때만 `tbl_cctvup_farm_scope_events`에 이벤트를 append한다.
- 최초 baseline 생성 시에는 대량 이벤트를 만들지 않는다. 이전 상태가 있는 농장이 실제로 `감시중/휴지기/대상확인/미설치` 사이를 이동한 경우부터 기록한다.
- `active` 전환은 `입추/감시 시작`, `resting` 전환은 `출하/휴지기 진입`, `needs_review` 전환은 `대상확인 전환`, `uninstalled` 전환은 `미설치 전환`으로 표시한다.

## 7. 백엔드 파일 구조
- `src/app/api/cctvup/route.ts`
  - 현재 화면용 payload를 반환한다.
  - 원본 DB 최신값을 읽고 Supabase `camera_states`를 병합한다.
- `src/app/api/cctvup/check/route.ts`
  - 5분마다 호출되는 보호된 checker다.
  - 원본 DB를 읽고 Supabase 상태머신 테이블에 저장한다.
  - 현재 감시중이 아닌 stale 활성 state는 `resolved`로 정리하고 응답의 `archivedStaleStateCount`에 건수를 표시한다.
  - 농장별 감시범위 현재값과 감시범위 전환 이벤트도 Supabase에 저장한다.
  - 화면의 `지금 체크` 버튼도 이 API를 `POST`로 호출한다.
- `src/app/api/cctvup/history/route.ts`
  - check run, camera state, issue event, farm scope event를 읽어 우측 로그 패널에 제공한다.
- `src/app/api/cctvup/daily-reports/route.ts`
  - 프로젝트 내부 `content/cctvup/daily-reports/manifest.json`을 읽어 일일 브리핑 목록을 제공한다.
- `src/app/api/cctvup/daily-reports/[date]/route.ts`
  - 선택 날짜의 `md`와 `raw.json` 파일을 읽어 `/cctvup` 일일 브리핑 탭에 제공한다.
- `src/app/api/cctvup/daily-reports/generate/route.ts`
  - 로컬 Next.js에서 하루 브리핑 파일을 생성한다. 생성 결과는 `content/cctvup/daily-reports/YYYY/MM/YYYY-MM-DD.md`, `.raw.json`, `manifest.json`이다.
- `src/lib/cctvup-daily-report.js`
  - KST 날짜 범위, 파일 경로, 업체별/농장별 요약, raw JSON, Markdown, manifest 읽기/쓰기를 담당한다.
  - Markdown은 요약, 업체별 특이사항, 업체별 주요 확인 항목, 출하·입추 원장, 계속 열려 있는 문제, 생성 기준 순서로 출력한다.
  - 업체별 주요 확인 항목, 출하·입추 원장, 계속 열려 있는 문제는 체리부로, 신우, 해외, 기타 순서로 묶고 각 업체 안에서 중요도순으로 정렬한다.
- `src/lib/cctvup-daily-report-server.ts`
  - Supabase 이벤트와 상태 요약, 현재 농장 metadata, 운영 DB 입추/출하/도폐사 원장을 read-only로 읽어 일일 브리핑 생성 로직을 실행한다.
  - 실제일이 보고일인 입추/출하는 당일 원장으로 표시하고, 보고일에 등록됐지만 실제일이 다른 입추/출하는 `지연 등록`으로 별도 표시한다.
  - 잔존 추정은 `입추수 - 출하수 - 폐사수 - 도태수` 기준이며 실제 재고 확정값이 아니라 원장 기반 추정값으로 취급한다.
- `src/app/api/cctvup/registry/route.ts`
  - 농장 표시명/카테고리/메모 변경을 Supabase registry에 저장한다.
- `src/app/api/cctvup/health/route.ts`
  - 운영 DB 연결과 쿼리 가능 여부를 진단한다.
- `src/app/api/cctvup/supabase-diagnose/route.ts`
  - Supabase 환경, DNS, TCP 443, 핵심 REST 테이블 응답 가능 여부를 진단한다.
  - `x-cctvup-cron-secret`으로 보호하며 secret 원문과 service key 원문은 반환하지 않는다.
- `src/app/api/cctvup/smoke/route.ts`
  - 화면 상단 `운영 점검` 버튼용 읽기 전용 smoke API다.
  - launchd, `/cctvup`, `/api/cctvup`, `/api/cctvup/history`, 최근 check run, stale 활성 state, 테스트/하니농장 예외를 확인한다.
  - `지금 체크`와 달리 `/api/cctvup/check/`를 실행하지 않고 Supabase에 새 run이나 event를 쓰지 않는다.
- `src/lib/cctvup-smoke.ts`
  - smoke API의 점검 로직과 응답 타입을 관리한다.
- `src/lib/cctvup-current.ts`
  - 원본 DB read-only 조회, mock/unavailable fallback, persisted state 병합을 담당한다.
  - `tbl_farm_gateway`와 `tbl_farm_house_breed_hist`를 함께 읽어 감시범위를 계산한다.
- `src/lib/cctvup-state.ts`
  - 상태머신 계산, Supabase state/event 저장, state 병합을 담당한다.
  - `감시중` 카메라만 상태머신 저장 대상으로 보고, 휴지기/대상확인/미설치 row에는 과거 state를 반영하지 않는다.
- `src/lib/cctvup-farm-scope-events.js`
  - 원본 row에서 농장별 현재 감시범위를 요약하고, 이전 Supabase state와 비교해 입추/출하/대상확인/미설치 전환 이벤트를 만든다.
- `scripts/cctvup-check-local.mjs`
  - 로컬 24시간 PC에서 `/api/cctvup/check/`를 1회 호출하는 스케줄러용 실행 스크립트다.
  - 기본 호출 대상은 `http://localhost:3002/api/cctvup/check/`이며, 웹 배포 URL은 기본값으로 사용하지 않는다.
- `scripts/cctvup-smoke.mjs`
  - 로컬 운영 상태를 한 번에 확인하는 기본 smoke script다.
  - 기본 실행은 읽기 전용이며, launchd 상태, `/cctvup`, `/api/cctvup`, `/api/cctvup/history`, 최근 check run 간격, stale 활성 state, 일일 브리핑 manifest, 테스트/하니농장 예외를 확인한다.
  - `/api/cctvup/registry/`가 JSON을 반환하는지도 함께 확인해 registry API가 HTML 오류 페이지를 반환하는 로컬 dev 캐시 문제를 조기에 잡는다.
  - `--run-check`를 붙인 경우에만 `/api/cctvup/check/`를 1회 호출해 Supabase `camera_states/check_runs`에 쓰기가 발생한다.
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
- `ops/launchd/com.paiptree.cctvup-daily-report.plist`
  - macOS launchd에서 `npm run cctvup:daily-report -- --yesterday`를 매일 00:05에 실행해 전날 일일 브리핑을 생성하는 LaunchAgent 템플릿이다.
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
- 상태머신 병합: Supabase camera_state는 현재 `감시중` row에 매칭되는 것만 반영하고 `stateSync.stateCount`도 그 기준으로 센다. 원본 DB live row의 최신 이미지 시각이 `camera_state.last_checked_at`보다 새로우면 stale state로 보고 병합하지 않는다.

### `GET 또는 POST /api/cctvup/check/`
- 목적: 5분 주기 상태머신 실행
- 인증: `x-cctvup-cron-secret` 헤더 필수
- 읽는 곳: 원본 운영 DB, Supabase 현재 states
- 쓰는 곳: Supabase `check_runs`, `camera_states`, `issue_events`, `farm_scope_states`, `farm_scope_events`
- 원본 운영 DB 쓰기: 없음
- 정상 응답 핵심: `ok: true`, `stateCount`, `archivedStaleStateCount`, `eventCount`, `openedCount`, `currentIssueCount`, `farmScopeStateCount`, `farmScopeEventCount`

### `GET /api/cctvup/history/?limit=50&days=30&issueEventLimit=20000`
- 목적: 우측 문제로그와 히스토리 표시
- 읽는 곳: Supabase `check_runs`, `camera_states`, `issue_events`, `farm_scope_events`
- 쓰는 곳: 없음
- 기본 조회량: check run 5건, 최근 30일 issue event 최대 20000건, 최근 30일 farm scope event 최대 20000건, 활성 camera state 최대 1000건
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
- 확인 항목: 환경 URL/key ref 매칭, DNS lookup, TCP 443, HTTPS reachability, `check_runs`, `camera_states`, `issue_events`, `farm_scope_states`, `farm_scope_events`, `farm_registry` REST 조회
- 쓰는 곳: 없음
- 보안: service key 원문은 반환하지 않고 role/ref/만료 시각과 단계별 응답 시간만 반환한다.

### `GET /api/cctvup/smoke/`
- 목적: 운영자가 명령어를 외우지 않아도 화면 상단 `운영 점검` 버튼으로 로컬 운영 상태를 확인한다.
- 인증: 로컬 운영 편의를 위해 읽기 전용 API로 제공한다. 외부 배포 시에는 관리자 인증 또는 내부망 제한을 붙인다.
- 확인 항목: `com.paiptree.website-dev`, `com.paiptree.cctvup-check`, `/cctvup`, `/api/cctvup`, `/api/cctvup/registry`, `/api/cctvup/history`, 최근 check run 시각/간격, 활성 `camera_states` stale 여부, `FA0000/FA0001` 제외와 `FA0014` 포함 여부
- 쓰는 곳: 없음
- 실패 처리: 핵심 API/페이지 실패는 `fail`, launchd/간격/이벤트 부족처럼 운영자가 확인할 신호는 `warn`으로 반환한다.

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

### `tbl_cctvup_farm_scope_states`
- 농장별 현재 감시범위를 1행으로 유지한다.
- `farm_id`는 unique다.
- 최초 baseline 역할을 하며, 이후 감시범위 변화 여부를 비교하는 기준이다.
- 주요 컬럼:
  - `farm_id`
  - `farm_name`
  - `monitor_scope_code`
  - `monitor_scope_label`
  - `cycle_bucket_code`
  - `cycle_bucket_label`
  - `gateway_installed_count`
  - `camera_count`
  - `active_camera_count`
  - `last_checked_at`
  - `run_id`
  - `message`

### `tbl_cctvup_farm_scope_events`
- 농장 감시범위 전환만 append한다.
- 정상 체크마다 쓰지 않는다.
- 카메라 수신 문제 이벤트가 아니라 입추/출하/설치 기준 변화의 운영 이력이다.
- 주요 컬럼:
  - `farm_id`
  - `event_kind`
  - `previous_scope_code`
  - `next_scope_code`
  - `previous_cycle_bucket_code`
  - `next_cycle_bucket_code`
  - `event_at`
  - `gateway_installed_count`
  - `camera_count`
  - `active_camera_count`
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
  - 서비스명, `운영 점검`, `지금 체크`, `Supabase 진단`, 테마 토글
  - `운영 점검`: 평소 상태 확인용 tooltip을 표시한다. 로컬 서버, 자동 5분 체크, 현재 API, history, stale state를 읽기 전용으로 확인한다고 설명한다.
  - `Supabase 진단`: Supabase 연결 문제 확인용 tooltip을 표시한다. URL/key, DNS, TCP 443, REST 핵심 테이블 응답 시간을 읽기 전용으로 확인한다고 설명한다.
  - `지금 체크`: 수동 체크런 실행용 tooltip을 표시한다. 원본 운영 DB를 읽어 상태머신을 돌리고 Supabase에 결과를 저장하는 쓰기 작업이라고 설명한다.
- 본문 상단 운영 상태
  - 기본 화면에는 문제확정, 회복, 관찰, 정상 수와 상태머신/자동 체크 상태만 한 줄로 표시한다.
  - `상세 보기`를 누르면 현재 목록, 상태머신, 히스토리, 5분 루프, 최근 check run, 상태 근거를 펼쳐 보여준다.
- 좌측 패널
  - 농장 그룹 목록
  - 헤더 배치: 1줄은 검색 입력과 정렬 select, 2줄은 문제/정상/전체 상태 버튼과 필터 메뉴 버튼으로 구성한다.
  - 상태 필터: 문제, 정상, 전체. 각 버튼에는 현재 payload 기준 농장 수를 표시한다.
  - 상태 필터 기준: `문제`는 watching/open/recovering 또는 late/missing/critical 카메라가 1대 이상 있는 농장이다. `정상`은 `전체 - 문제`다. 휴지기/대상확인/미설치 농장도 문제 카메라가 없으면 정상에 포함한다.
  - 카테고리 필터: 해외, 신우, 체리부로, 기타 다중 선택. `필터` 메뉴 안에 접어 둔다. 첫 진입 기본값은 해외/신우 선택이며, 모두 선택된 상태에서 특정 카테고리를 누르면 해당 카테고리만 단독 선택한다.
  - 감시범위 필터: 감시중, 휴지기, 대상확인, 미설치 다중 선택. `필터` 메뉴 안에 접어 둔다. 첫 진입 기본값은 감시중/휴지기 선택이며, 특정 범위만 단독으로 볼 수 있다.
  - 필터 버튼: 현재 카테고리/감시범위 선택값을 `필터: 해외·신우·감시중·휴지기`처럼 요약한다.
  - 정렬: 문제농장 우선, 심각도별, 카테고리별, 가나다순. 검색 입력 오른쪽에 둔다.
  - 기본 표시: `문제 농장` 필터, `해외/신우` 카테고리, `감시중/휴지기` 감시범위, `카테고리별` 정렬
  - 카테고리별 정렬 순서: 해외, 신우, 체리부로, 기타
  - 농장 row는 농장명을 1순위 정보로 두고, 상태는 왼쪽 레일과 비정상 상태 배지로만 표시한다. 정상 row에는 별도 `정상` 배지를 반복하지 않는다.
  - 농장 row 전체를 클릭하거나 Enter/Space를 누르면 해당 농장의 카메라 상세 목록이 펼쳐진다. 우측 chevron은 보조 표시이며, 카테고리 변경 버튼과 메뉴는 row 펼침 이벤트와 분리한다.
  - 농장 row는 MS Fluent의 반복 목록 문법을 따르되, 농장명을 중심으로 compact stack을 유지한다.
  - `농장코드`는 농장명 위에 작게 표시하고, 본문 줄은 `농장명`과 우측 `정상/문제 카메라 수`, 보조 줄은 왼쪽 정렬로 `분류 · 감시범위 · 최신 수신` 순서로 둔다.
  - 펼쳐진 카메라 row는 농장 row보다 더 밝은 배경과 큰 왼쪽 들여쓰기를 사용한다. row 테두리와 guide line은 쓰지 않고, 여백과 배경 차이로 농장 row와 카메라 하위 목록을 구분한다.
  - `원본 affiliates/country`는 기본 row에서 숨기고 카테고리 버튼의 보조 설명으로만 제공한다. 카테고리는 작은 버튼으로 유지해 즉시 수정할 수 있게 하되, 상태색과 경쟁하지 않도록 색 면적을 줄인다.
  - 태그와 메모는 농장 row 기본 노출에서 제외한다. 긴 보조 정보가 row 높이를 키우면 한 화면에 보이는 농장 수가 줄기 때문이다.
  - 검색
  - 농장 row와 카메라 row
- 우측 패널
  - 선택 카메라 상세
  - 최근 1시간 5분 슬롯
  - 상태머신 설명
  - 최근 문제로그
  - 30일 상태전환 로그
  - registry 편집 영역

### 프론트 주요 상태
- `payload`: `/api/cctvup` 응답
- `historyPayload`: `/api/cctvup/history` 응답
- `registry`: `/api/cctvup/registry` 응답과 로컬 편집값
- `smokeCheck`: 화면 상단 `운영 점검` 실행 상태와 launchd/API/history/stale state 결과
  - `api /api/cctvup/registry JSON` 단계가 실패하면 registry API가 JSON이 아닌 HTML/오류 응답을 반환 중이라는 뜻이다.
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
- `historyHealth`: Supabase `check_runs`, `issue_events`, `farm_scope_events` 조회 상태
- `recentCheckRuns`: 최근 check run 6회
- `recentIssueEvents`: Supabase `tbl_cctvup_issue_events` 최근 30일 상태전환 이벤트
- `recentFarmScopeEvents`: Supabase `tbl_cctvup_farm_scope_events` 최근 30일 감시범위 전환 이벤트
- `recentTransitionEvents`: `recentIssueEvents`와 `recentFarmScopeEvents`를 시간순으로 합친 오른쪽 30일 로그 목록

### 표시 원칙
- 왼쪽 목록은 빠른 문제 발견이 목적이다.
- 농장 카테고리는 상태 색상과 섞지 않고 보조 메타 줄의 별도 버튼으로 표시한다.
- 감시범위는 카테고리와 별개다. `감시중`은 상태머신 문제 판정 대상이고, `휴지기/대상확인/미설치`는 회색 계열의 보조 범위로 표시한다.
- 한 농장 안에 `감시중` 카메라와 휴지기/미설치 카메라가 섞이면 농장 대표 상태는 `감시중` 카메라 상태를 우선한다.
- `휴지기/대상확인/미설치`는 목록에는 남기되, 문제 농장 수와 issue event 저장 대상에서는 제외한다. 상태 필터 카운트에서는 문제 카메라가 없는 한 정상 농장에 포함한다.
- 자동 체크는 10분 미만이면 정상, 10분 이상이면 지연 주의, 15분 이상이면 멈춤 의심으로 표시한다.
- 상태 정보는 본문 상단 `운영 상태`로 통합한다. 평소에는 한 줄 요약만 보이고, 현재 목록, 상태머신, 히스토리, 5분 루프는 상세 펼침 안에서 별도 상태로 보여준다.
- Supabase history timeout은 현재 목록 실패로 오해하지 않게 `히스토리 부분 지연`으로 분리 표시한다.
- 최근 check run 6회는 issue, ok, watch, open, recovering 숫자와 함께 이전 run 대비 간격을 보여준다.
- 최근 check run 간격은 4분 미만이면 `수동/재기동 추정`, 4~7분이면 `정상 루프`, 7분 초과면 `루프 지연`으로 표시한다.
- 최근 check run 행의 맨왼쪽 배지는 화면 판독용으로 `정상`, `수동`, `지연`, `기준` 두 글자만 표시하고, 전체 판정 사유는 툴팁과 상세 문구에 남긴다.
- 오른쪽 기본 패널의 30일 상태전환 로그는 실제 Supabase `issue_events`와 `farm_scope_events` 기준이며, 카메라 문제확정/이미지 재수신/해결과 농장 입추/출하/대상확인/미설치 전환을 함께 보여준다.
- 오른쪽 기본 패널의 `지금 확인할 문제`, `30일 상태전환 로그`, `계속 열려 있는 문제`는 각각 접기/펼치기 가능해야 하며, 목록은 약 6개 항목 높이에서 내부 스크롤로 제한한다.
- `계속 열려 있는 문제`는 이미 일정 시간 이상 열린 카메라를 보조 보관 목록으로 접어두는 UI다.
- 현재 내부 분리 기준은 문제확정/재확정/이미지 재수신 전환 후 180분 이상이지만, 장애 확정 기준은 `계속 열려 있음`이 아니라 `감시중 + 3회 연속 미수집`, 약 15분이다.
- 계속 열려 있는 문제 목록은 기본 접힘 상태로 두어 현재 확인할 리스크와 30일 상태전환 로그가 먼저 보이게 한다.
- `문제확정`과 `회복중`은 정상 목록에서 사라지지 않아야 한다.
- `회복중`은 최근 슬롯의 빨간 칸이 밀려 사라지는 동안 유지한다.
- 오른쪽 로그는 `issue_events`와 `farm_scope_events`의 상태 전환 기록을 보여준다.

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

macOS launchd 템플릿은 세 개를 함께 사용한다. `ops/launchd/com.paiptree.website-dev.plist`는 로컬 Next 서버를 유지하고, `ops/launchd/com.paiptree.cctvup-check.plist`는 5분마다 상태머신 체크를 실행한다. `ops/launchd/com.paiptree.cctvup-daily-report.plist`는 매일 00:05에 전날 일일 브리핑을 생성한다. 실제 등록은 `website-dev`를 먼저 등록한 뒤 `cctvup-check`, `cctvup-daily-report` 순서로 등록한다.

등록 순서:
1. `cp ops/launchd/com.paiptree.website-dev.plist ~/Library/LaunchAgents/`
2. `cp ops/launchd/com.paiptree.cctvup-check.plist ~/Library/LaunchAgents/`
3. `cp ops/launchd/com.paiptree.cctvup-daily-report.plist ~/Library/LaunchAgents/`
4. `launchctl bootstrap "gui/$(id -u)" ~/Library/LaunchAgents/com.paiptree.website-dev.plist`
5. `launchctl bootstrap "gui/$(id -u)" ~/Library/LaunchAgents/com.paiptree.cctvup-check.plist`
6. `launchctl bootstrap "gui/$(id -u)" ~/Library/LaunchAgents/com.paiptree.cctvup-daily-report.plist`
7. `launchctl kickstart -k "gui/$(id -u)/com.paiptree.website-dev"`
8. `launchctl kickstart -k "gui/$(id -u)/com.paiptree.cctvup-check"`
9. 필요 시 `launchctl kickstart -k "gui/$(id -u)/com.paiptree.cctvup-daily-report"`로 전날 보고서 생성을 수동 리허설한다.

로그 위치:
- Next 서버: `/tmp/paiptree-website-dev.out.log`, `/tmp/paiptree-website-dev.err.log`
- 5분 체크: `/tmp/paiptree-cctvup-check.out.log`, `/tmp/paiptree-cctvup-check.err.log`
- 일일 브리핑: `/tmp/paiptree-cctvup-daily-report.out.log`, `/tmp/paiptree-cctvup-daily-report.err.log`

화면에서 수동으로 확인할 때는 상단 `관리 secret`에 `CCTVUP_CRON_TRIGGER_SECRET` 값을 넣고 `지금 체크`를 누른다. 성공하면 체크 결과 패널에 `state`, `event`, `opened`, `recovering`, `resolved` 건수가 표시되고 현재 목록/history를 다시 읽는다. 로컬 개발 환경에서는 농장 분류/registry 저장이 secret 입력 없이도 서버 registry까지 저장되어야 한다.

GitHub Actions의 `CCTVUP Check`는 현재 `workflow_dispatch` 수동 실행만 유지한다. GitHub-hosted runner 또는 웹 배포 서버가 원본 CCTV DB를 읽지 못하는 상태에서 schedule을 켜면 `/api/cctvup/check/`가 503을 반환하고 실패 메일이 반복된다. 웹 배포 서버에서 `/api/cctvup`가 `source: db`를 반환하고 `/api/cctvup/check/`가 성공하는 것이 확인된 뒤에만 schedule을 다시 켠다.

### 정상 동작 확인
- 화면 상단 `운영 점검`
- `node scripts/cctvup-smoke.mjs`
- `curl -sS http://localhost:3002/api/cctvup/`
- `curl -sS 'http://localhost:3002/api/cctvup/history/?limit=50&days=30&issueEventLimit=20000'`
- `curl -I http://localhost:3002/cctvup/`
- 화면 상단 `지금 체크`

화면 상단 `운영 점검`은 평소 권장하는 1차 확인 버튼이다. `node scripts/cctvup-smoke.mjs`와 같은 읽기 전용 핵심 점검을 화면에서 실행하며, 원본 운영 DB와 Supabase 모두에 쓰지 않는다. 체크 자체를 즉시 한 번 실행해야 할 때만 `지금 체크` 또는 `node scripts/cctvup-smoke.mjs --run-check`를 사용한다.

확인할 값:
- `/api/cctvup`의 `message`가 `Supabase camera_state 기준`인지
- `summary.cameras`가 활성 카메라 수와 맞는지
- `summary.monitorActive`, `summary.monitorResting`, `summary.monitorNeedsReview`, `summary.monitorUninstalled`가 감시범위 분포를 보여주는지
- `summary.open`, `summary.recovering`, `summary.watching`이 상태머신 기준으로 나오는지
- `summary.issueCount`가 `감시중` 카메라의 문제만 세는지
- Supabase가 응답 가능하면 history 응답에 활성 `cameraStates`와 최근 `issueEvents`가 채워지는지
- Supabase가 느리거나 응답하지 않으면 history가 약 1500ms 전후로 `unavailable` 또는 부분 응답을 반환하고 화면 목록은 유지되는지
- `지금 체크` 성공 후 상단 체크 루프 시각과 history의 최근 check run이 갱신되는지
- smoke script가 `FAIL` 없이 끝나는지. `WARN`은 수동 체크/재기동으로 0~1분 간격 run이 섞였거나 launchd 조회가 불가능한 경우처럼 운영자가 확인할 신호다.
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
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` 또는 기존 `NEXT_PUBLIC_SUPABASE_KEY`: Supabase Auth SSR client가 사용하는 공개 키다.

### 보호 secret
- `CCTVUP_CRON_TRIGGER_SECRET`

### 선택 설정
- `CCTVUP_DB_QUERY_TIMEOUT_MS`
- `CCTVUP_SUPABASE_FETCH_TIMEOUT_MS`: Supabase history 읽기 timeout. 기본값 1500ms
- `CCTVUP_SUPABASE_STATE_FETCH_TIMEOUT_MS`: Supabase camera_state 읽기 timeout. 기본값 1500ms
- `CCTVUP_SUPABASE_DIAG_TIMEOUT_MS`: Supabase 진단 단계별 timeout. 기본값 5000ms
- `CCTVUP_SUPABASE_WRITE_TIMEOUT_MS`: Supabase 쓰기 timeout. 기본값 8000ms
- `CCTVUP_IMAGE_QUERY_TIMEOUT_MS`: 선택 카메라 5분 저장 근거 조회 timeout. 기본값 5000ms
- `CCTVUP_LOCAL_CHECK_URL`: 로컬 체크 스크립트가 호출할 URL. 기본값 `http://localhost:3002/api/cctvup/check/`
- `CCTVUP_LOCAL_CHECK_TIMEOUT_MS`: 로컬 체크 스크립트 timeout. 기본값 120000ms
- `CCTVUP_CHECK_URL`: GitHub Actions 수동 workflow에서만 사용하는 웹 check URL. 로컬 24시간 PC의 기본 체크 경로로 쓰지 않는다.
- `CCTVUP_SMOKE_BASE_URL`: smoke 점검 대상 base URL. 기본값 `http://localhost:3002`
- `CCTVUP_SMOKE_TIMEOUT_MS`: smoke API/페이지 요청 timeout. 기본값 10000ms
- `CCTVUP_SMOKE_MAX_CHECK_AGE_MINUTES`: 최근 check run 정상 허용 시간. 기본값 8분
- `CCTVUP_SMOKE_MIN_CHECK_RUNS`: smoke가 기대하는 최소 최근 check run 수. 기본값 5건
- `CCTVUP_STABILITY_BASE_URL`: 안정화 리포트가 읽을 `/api/cctvup` base URL. 기본값 `http://localhost:3002`
- `CCTVUP_STABILITY_SUPABASE_TIMEOUT_MS`: 안정화 리포트의 Supabase REST timeout. 기본값 8000ms
- `CCTVUP_AUDIT_REST_DAYS`: 감시대상 전수조사의 휴지기 일수 기준. 기본값 35일
- `CCTVUP_AUDIT_QUERY_TIMEOUT_MS`: 감시대상 전수조사의 원본 DB query timeout. 기본값 30000ms
- `CCTVUP_AUDIT_DETAIL_LIMIT`: 감시대상 전수조사 상세 출력 제한. 기본값 60건
- `PAIPTREE_SENSITIVE_EXPORT_PASSPHRASE`: 민감 리포트 암호화 bundle 생성 passphrase. repo와 shell history에 남기지 않는다.
- `PAIPTREE_SENSITIVE_REPORT_DIR` 또는 `CCTVUP_SENSITIVE_REPORT_DIR`: 민감 리포트 저장 위치 override. 기본값은 `/Users/zoro/company-ops/.hermes-sensitive/farm-ops/reports`
- `CCTVUP_READ_SECRET`: production 읽기 API 보호용 secret. 없으면 `CCTVUP_REGISTRY_ADMIN_SECRET`, 그다음 `CCTVUP_CRON_TRIGGER_SECRET`를 사용한다.
- `CCTVUP_AUTH_REQUIRED`: `1`이면 로컬 개발에서도 `/cctvup` Supabase Auth 보호를 강제한다.
- `CCTVUP_AUTH_DISABLED`: `1`이면 production에서도 `/cctvup` Supabase Auth 보호를 끈다. 운영 공개 전환 중 긴급 우회 외에는 사용하지 않는다.
- `NEXT_PUBLIC_CCTVUP_SHARED_LOGIN_EMAIL`: `/cctvup/login`에 기본 표시할 공용 Supabase Auth 계정 이메일. 비밀값이 아니며, 비밀번호는 코드와 환경변수에 저장하지 않는다.
- `CCTVUP_PUBLIC_READ`: `1`일 때 production 읽기 API를 공개 모드로 연다. 운영 농장명/상태/브리핑 공개 승인이 없는 한 설정하지 않는다.
- `CCTVUP_ALLOW_MOCK_FALLBACK`

## 13. 보안 원칙
- `SUPABASE_SERVICE_KEY`는 서버에서만 사용한다.
- `CCTVUP_CRON_TRIGGER_SECRET`도 서버/관리자 호출에만 사용한다.
- production `/cctvup` 페이지는 Supabase Auth 세션 없이는 열면 안 된다. 로그인 화면과 callback route를 제외하고 페이지 본문은 middleware와 서버 컴포넌트 guard로 함께 보호한다.
- `/cctvup/login`은 Supabase email/password Auth를 사용한다. 화면에서 회원가입을 제공하지 않으며, Supabase Auth에 사전 등록된 공용 계정만 로그인할 수 있다.
- 공용 계정 비밀번호는 Supabase Auth 사용자에서만 관리하고 repo, workflow, 환경변수, 문서에 저장하지 않는다.
- 기존 email-link callback route는 남겨두지만 기본 로그인 흐름에서는 사용하지 않는다. Supabase Dashboard의 Auth URL 설정에는 기존 링크 호환과 향후 전환을 위해 실제 배포 origin의 `/auth/callback`을 redirect URL로 유지할 수 있다.
- `/cctvup/logout`은 현재 브라우저 세션 쿠키를 제거하고 `/cctvup/login?next=/cctvup`로 이동한다.
- registry 저장은 배포 환경에서 secret 없이 열면 안 된다. 로컬 개발 환경의 localhost registry 저장만 `local-registry` 모드로 허용한다.
- check 실행, history 쓰기, health 진단은 로컬/배포 모두 secret 없이 열면 안 된다.
- Supabase 진단도 service key 상태를 간접 확인하므로 secret 없이 열면 안 된다.
- production 읽기 API는 secret 없이 운영 데이터를 내려주면 안 된다. 대상은 `/api/cctvup`, `/api/cctvup/history`, `/api/cctvup/registry`, `/api/cctvup/smoke`, `/api/cctvup/images`, `/api/cctvup/analysis`, `/api/cctvup/daily-reports`다.
- `운영 점검` smoke API는 읽기 전용이지만 launchd/API/history 상태를 노출하므로 production에서는 같은 읽기 secret으로 보호한다.
- `CCTVUP_PUBLIC_READ=1`은 공개 데모나 고객 공유처럼 운영 데이터 공개가 별도 승인된 경우에만 사용한다.
- 배포 workflow는 `/cctvup/` 무인 접근이 로그인으로 이동하는지, `/api/cctvup/` 무인 접근이 401인지 hard gate로 확인한다. secret 접근은 서버 내부 `http://127.0.0.1:3000`으로만 수행하며, 200이면 `source=db`를 확인하고 503이면 auth 배포는 성공으로 두되 원본 DB 네트워크 접근을 후속 과제로 남긴다. 공개 IP HTTP 요청에는 secret을 싣지 않는다.
- 프론트에 secret 값을 하드코딩하지 않는다.
- 원본 운영 DB 계정은 가능하면 read-only 권한으로 제한한다.
- API 코드에서도 원본 DB 쿼리가 `SELECT/WITH`로 시작하는지 검사한다.
- CCTVUP 기본 기록은 CCTVUP 전용 Supabase 테이블에만 쓴다. PoC/무게예측/다른 서비스 테이블로 쓰는 브리지 기능은 별도 설계와 승인 없이 추가하지 않는다.

## 14. 장애 대응
### 화면이 갑자기 all green처럼 보임
- 원인 후보:
  - `tbl_cctvup_camera_states`가 비어 있음
  - `/api/cctvup/check/`가 5분마다 돌지 않음
  - `/api/cctvup`가 persisted state 병합에 실패해 live fallback만 반환함
- 확인:
  - `/api/cctvup`의 `message`
  - `/api/cctvup/history/?limit=50&days=30&issueEventLimit=20000`의 `cameraStates`
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
- Supabase REST 연결이 1500ms 안에 끝나지 않았거나 일부 테이블 조회가 실패했다.
- 이 상태는 우측 로그/히스토리 보조 정보의 문제이며, `/api/cctvup`의 현재 목록 조회와 원본 DB read-only 원칙은 유지된다.
- 반복되면 `/cctvup` 상단의 `Supabase 진단` 버튼이나 `node scripts/cctvup-supabase-diagnose.mjs`로 `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, Supabase 프로젝트 상태, 네트워크 상태를 확인한다.
- 운영상 문제가 계속되면 timeout을 소폭 늘리기보다 history 조회량과 Supabase 상태를 먼저 확인한다.

### `Unexpected token '<'` 또는 JSON 대신 HTML 오류 페이지
- 의미: 프론트가 API JSON을 기대했지만 Next HTML 오류 페이지를 받았다.
- 로컬에서 가장 흔한 원인: `npm run build`와 `next dev`가 같은 `.next` 산출물을 번갈아 쓰면서 dev 서버의 webpack chunk가 불일치했다.
- 확인: `/cctvup` 또는 `/api/cctvup/registry/`가 500 HTML을 반환하고, dev 서버 로그에 `Cannot find module './####.js'`가 찍히는지 본다.
- 복구: `.next`를 삭제하고 `com.paiptree.website-dev`를 재시작한다.
- 화면 기준: 프론트는 raw `Unexpected token '<'` 대신 해당 API가 HTML 오류 페이지를 반환했다는 운영 메시지를 보여준다.
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
- 원본 DB 최신 이미지가 Supabase state보다 새로우면 stale state가 화면을 덮어쓰지 않는다.
- 1~2회 미수집은 `watching`이고 `issue_events`에 기록되지 않는다.
- 1~2회 미수집 에너지바는 노랑으로 보이고, 3회 문제확정 시 기존 흐름이 리셋되지 않는다.
- 3회 미수집 이후 `opened` 이벤트가 1회만 생긴다.
- 이미지 재수신 후 `recovering` 이벤트가 생긴다.
- 최근 12슬롯 정상 후 `resolved` 이벤트가 생긴다.
- issue event는 서버 DB에서 삭제하지 않고, `/api/cctvup/history` 기본 화면 조회만 최근 30일로 제한한다.
- `/api/cctvup`가 `camera_states`를 병합한 상태를 반환한다.
- `/api/cctvup` 응답의 `stateSync.status`가 상태머신 반영 여부를 알려준다.
- `/api/cctvup/history`가 `cameraStates`, `issueEvents`, `currentIssues`를 반환한다.
- Supabase history가 timeout되어도 `/cctvup` 메인 목록이 계속 렌더링된다.
- `/cctvup` 좌측 목록에서 문제확정/회복중 카메라가 사라지지 않는다.
- registry 카테고리 변경이 Supabase에 저장되고 새로고침 후 유지된다.
- 관리 secret 입력 후 `Supabase 진단` 버튼이 DNS/TCP/REST 상태를 화면에 표시한다.
- 데스크톱에서도 전체 페이지 세로 스크롤이 가능하며, 모니터에서 원하는 중간 영역으로 화면 위치를 조정할 수 있다.
- `FA0014` 하니농장이 체리부로 정상 감시 농장으로 포함되고, `FA0000`/`FA0001` 테스트 농장은 목록/상태머신/문제 로그에서 제외된다.
- `node scripts/cctvup-smoke.mjs`가 `FAIL` 없이 끝나고, 활성 `camera_states`에 stale state가 없다.
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
  - 분석 결과는 `무게예측 참고` 접힘 영역으로 분리하고, `카메라 보정`, `예측 안정성`, `운영 판단`은 기본 화면에서 제거한다.
- 데이터 변경: 없음. 기존 수신 상태와 Supabase 상태머신만 사용한다.
- 주의점: 이 단계에서 `/cctvup`을 무게예측 결과 대시보드로 바꾸지 않는다.

### Phase 2 - 선택 카메라 상세 단순화
- 목표: 카메라 하나를 선택했을 때, 이 카메라의 CCTV 이미지 입력이 정상인지 먼저 보이게 한다.
- 현재 상태: 완료.
- 기본 상세 패널 항목:
  - 이미지 수신: 최근 수신 시각, 5분 주기 기준, 최근 1시간 수신 슬롯
- 접힘 참고 항목:
  - 분석 결과: 최근 분석 시각, 이미지 있음/분석 없음 여부
- 후속 후보 항목:
  - 카메라 보정: A4 calibration, pixel resolution, correction ratio 연동 상태
  - 예측 안정성: 5분 raw prediction 변동성, 최근 데이터 부족 여부
  - 운영 판단 가능 여부: 사용 가능, 제한적, 불가
- 초기 구현 기준:
  - 이미지 수신은 현재 상태머신 값을 실제로 연결한다.
  - 분석 결과는 CCTV 문제확정 기준에서 분리해 `무게예측 참고` 접힘 영역에서만 조회한다.
  - 보정, 예측 안정성, 운영 판단은 데이터 위치와 키 매칭이 확정되기 전까지 화면 기본 노출에서 제외한다.
- 구현 결과:
  - 선택 카메라 상세에 `이미지 입력 상태`를 기본 표시한다.
  - 사용자가 체크하는 UI가 아니라 현재 row와 Supabase camera_state 값으로 자동 분기한다.
  - `이미지 입력 상태`는 상태머신 상태, 최근 수신, 지연 시간, 미수집 카운트, 최근 1시간 슬롯, 마지막 체크, 최초 미수집, 문제 확정 시각을 보여준다.
  - `중량분석 생성`은 기본 판정에서 제외하고 `무게예측 참고` 접힘 영역에서만 보여준다.
  - `카메라 보정`, `예측 안정성`, `운영 판단`은 화면 기본 노출에서 제거하고 후속 Phase 후보로만 남긴다.
- 주의점: placeholder나 `연동 전` 카드를 기본 화면에 늘어놓지 않는다. 실제 문제가 아닌 미연동 상태가 문제처럼 보이면 안 된다.

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
  - `무게예측 참고`의 `중량분석 생성`은 최근 분석 시각, 분석 경과, 이미지와의 차이, 최근 상태, success/비정상 건수, 분석 개체 수, 모델 원천값을 근거로 표시한다.
  - 펼친 영역 상단에는 `이 영역은 무게예측 참고 정보`라는 안내를 표시하고, 분석 상태가 CCTV 문제확정 기준에 영향 없음을 명시한다.
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
  - `/api/cctvup/history` 기본 limit은 50이며 내부적으로 check run은 5건, issue event는 최근 30일 최대 20000건만 읽는다.
  - `camera_states`는 `watching/open/recovering` 활성 상태만 최대 1000건 읽는다.
  - 정상/해결 state 전체 5000건과 정상 카메라 snapshot 전체 조회는 기본 경로에서 제외한다.
  - Supabase 읽기 timeout 기본값은 1500ms이고, 일부 실패는 가능한 부분 응답으로 유지한다.
- 기대 효과:
  - Supabase REST가 느려도 화면 상단이 `운영 DB와 history를 함께 읽는 중` 상태로 묶이지 않는다.
  - 무료 Supabase 사용량을 정상 카메라 전체 조회/저장 중심으로 낭비하지 않는다.
  - 우측 로그는 보조 정보로 남고, 현재 상태 판정은 원본 DB와 활성 camera state 병합에 집중한다.

### Phase 3.6 - 상태머신 운영 루프 안정화
- 목표: `/api/cctvup` 화면이 지금 어떤 기준으로 보이는지 명확히 하고, 5분 체크 실행 경로를 로컬 운영 기준으로 고정한다.
- 현재 상태: 완료. Supabase 응답 가능 여부에 따라 실제 적재 검증은 별도로 확인한다.
- 구현 결과:
  - history timeout과 state timeout을 분리했다.
  - history 읽기는 기본 1500ms, camera_state 읽기는 기본 1500ms다.
  - `/api/cctvup` payload에 `stateSync`를 포함한다.
  - 화면 상단에 `상태머신 반영`, `상태머신 미반영`, `상태머신 미설정` 중 하나를 표시한다.
  - 원본 DB live row가 Supabase state보다 새로우면 stale state를 화면에 병합하지 않는다.
  - 문제확정 화면 표시에서는 1~2회 노랑, 3회차부터 빨강 슬롯을 유지해 확정 시점에 에너지바가 새로 시작되는 것처럼 보이지 않게 한다.
  - `scripts/cctvup-check-local.mjs`를 로컬 5분 체크 실행 표준 스크립트로 추가했다.
- 운영 판단:
  - `상태머신 반영`이면 3회 미수집, 회복중, 12슬롯 해결 흐름을 화면 판단 기준으로 삼을 수 있다.
  - `상태머신 미반영`이면 운영 DB live 수신 상태만 보고 있는 것이므로 상태머신 로그/회복 판단은 보류한다.
  - 로컬 PC가 24시간 켜져 있으면 launchd 또는 cron으로 `node scripts/cctvup-check-local.mjs`를 5분마다 실행한다.

### Phase 3.7 - 운영 진단과 화면 사용성 보강
- 목표: Supabase timeout 원인을 운영자가 화면에서 직접 구분하고, 긴 목록에서도 전체 페이지 세로 스크롤로 원하는 중간 영역을 볼 수 있게 한다.
- 현재 상태: 완료.
- 구현 결과:
  - `/api/cctvup/supabase-diagnose/`를 추가했다.
  - 화면 상단에 `Supabase 진단` 버튼을 추가했다.
  - 버튼은 관리 secret을 요구하고, 서버에서 환경 URL/key ref, DNS, TCP 443, REST 핵심 테이블 응답 시간을 확인한다.
  - 진단 결과는 정상/확인 필요와 단계별 응답 시간으로만 표시하며 secret 원문은 노출하지 않는다.
  - 데스크톱 `xl` 이상에서도 헤더와 본문을 고정 높이에 묶지 않고 전체 페이지 스크롤을 허용한다.

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
  - 기존 opened issue가 휴지기/대상확인/미설치로 빠질 때는 회복 이벤트로 기록하지 않는다. 다만 `camera_states`의 활성 목록에 계속 남아 오판하지 않도록 다음 체크에서 상태만 `resolved`로 닫는다.
- 적용 결과:
  - `/api/cctvup`는 gateway 설치 여부와 최신 사육 이력을 함께 읽어 row별 감시범위를 계산한다.
  - `감시중` row만 상태머신 저장/문제확정 대상으로 유지한다.
  - `휴지기/대상확인/미설치` row는 `paused`로 표시하고, 기존 stale camera_state가 있더라도 현재 화면에 문제로 반영하지 않는다. stale 활성 state는 다음 체크에서 `resolved`로 닫혀 history 활성 조회에서도 빠진다.
  - 좌측 목록에는 감시범위 필터를 추가해 전체, 감시중, 휴지기, 대상확인, 미설치 범위를 빠르게 분리해 볼 수 있다.

### Phase 3.12 - 농장 소속 분류 정리
- 목표: 농장 그룹의 `신우/체리부로/해외/기타` 분류를 원본 DB 소속 기준으로 복구한다.
- 현재 상태: 완료. 화면 분류는 원본 DB `tbl_farm_service.affiliates`와 `country` 자동분류를 기본값으로 사용한다.
- 기존 Supabase registry의 대량 `other` 값은 `legacy`로 취급한다. `legacy` category는 원본 DB 자동분류가 명확한 경우 덮어쓰지 않는다.
- 새 Supabase migration: `supabase/migrations/20260507072000_cctvup_farm_registry_category_source.sql`
- SQL 문서: `docs/sql/supabase/021_cctvup_farm_registry_category_source.sql`
- migration 적용 전에도 화면은 legacy registry를 약한 값으로 처리해 분류를 복구한다. migration 적용 후에는 버튼으로 바꾼 값이 `manual` override로 저장된다.

### Phase 3.15 - stale camera_state 정리
- 목표: 감시범위에서 빠진 카메라의 과거 활성 state가 화면/history 판단에 계속 남지 않게 한다.
- 현재 상태: 완료.
- 구현 결과:
  - 현재 `감시중`이 아닌 카메라의 과거 `watching/open/recovering` state는 다음 체크 때 `resolved`로 닫는다.
  - 이 처리는 감시범위 변경 정리이며 카메라 회복 이벤트가 아니므로 `issue_events`에는 새 이벤트를 남기지 않는다.
  - `/api/cctvup/check/` 응답은 `archivedStaleStateCount`로 정리 건수를 표시한다.

### Phase 3.16 - 로컬 smoke script
- 목표: 로컬 24시간 운영 상태를 한 명령 또는 화면 버튼으로 확인한다.
- 현재 상태: 완료.
- 실행 명령:
  - `node scripts/cctvup-smoke.mjs`
  - 필요 시 `node scripts/cctvup-smoke.mjs --run-check`
- 구현 결과:
  - 기본 모드는 read-only다.
  - 화면 상단 `운영 점검` 버튼은 `/api/cctvup/smoke/`를 호출해 같은 핵심 점검을 실행한다.
  - launchd 상태, `/cctvup`, `/api/cctvup`, `/api/cctvup/history`, 최근 check run 간격, stale 활성 state, 테스트/하니농장 예외를 확인한다.
  - `--run-check`를 붙인 경우에만 `/api/cctvup/check/`를 1회 호출한다.

### Phase 3.18 - 농장 감시범위 전환 로그
- 목표: 문제 있는 카메라 로그와 별도로, 농장이 입추되어 감시가 시작됐는지 또는 출하되어 휴지기에 들어갔는지 30일 안에서 확인한다.
- 현재 상태: 코드, SQL 문서, Supabase migration 반영 완료.
- 구현 결과:
  - `tbl_cctvup_farm_scope_states`는 농장별 현재 `감시중/휴지기/대상확인/미설치` 값을 1행으로 유지한다.
  - `tbl_cctvup_farm_scope_events`는 직전 상태와 현재 상태가 달라진 농장만 append한다.
  - 최초 baseline 생성 시에는 전체 농장 이벤트를 만들지 않는다. 기존 state가 있는 농장이 실제로 이동한 경우부터 이벤트를 남긴다.
  - 오른쪽 `30일 상태전환 로그`는 카메라 issue event와 농장 scope event를 시간순으로 합쳐 보여준다.
  - migration 적용 전에는 farm scope event 조회 실패를 전체 history 장애로 보지 않고, 농장 전환 이벤트 0건으로 표시한다.
  - smoke와 Supabase 진단은 farm scope 테이블/이벤트 조회 가능 여부도 확인한다.
- 운영 해석:
  - `입추/감시 시작`은 휴지기/대상확인/미설치에서 `감시중`으로 바뀐 농장이다.
  - `출하/휴지기 진입`은 `감시중` 또는 대상확인에서 휴지기로 바뀐 농장이다.
  - 이 이벤트는 CCTV 이미지 장애가 아니라 감시범위 전환 이력이다.

### Phase 3.19 - 일일 브리핑 파일 저장 및 페이지 탭
- 목표: 하루 동안의 CCTVUP 상태전환 이벤트와 농장 감시범위 이벤트를 `md`와 `raw.json` 파일로 묶고, `/cctvup` 안의 `일일 브리핑` 탭에서 볼 수 있게 한다.
- 현재 상태: 반영 완료. 로컬 생성 API, 보조 실행 script, `/cctvup` 일일 브리핑 탭, 단위 테스트, 오늘자 샘플 파일까지 추가했다.
- 기준 문서: `docs/plans/2026-05-17-cctvup-daily-report-content-tab.md`
- 저장 위치:
  - `content/cctvup/daily-reports/manifest.json`
  - `content/cctvup/daily-reports/YYYY/MM/YYYY-MM-DD.md`
  - `content/cctvup/daily-reports/YYYY/MM/YYYY-MM-DD.raw.json`
- 생성 경로:
  - 화면: `/cctvup`의 `일일 브리핑` 탭에서 `오늘 생성`을 누른다.
  - 명령어: `npm run cctvup:daily-report`
  - 전날 자동 생성 명령어: `npm run cctvup:daily-report -- --yesterday`
  - API: `POST /api/cctvup/daily-reports/generate`
- 운영 원칙:
  - 파일은 GitHub 커밋 대상이다.
  - 지금은 로컬 Next.js 생성 API로 만들고 로컬 `/cctvup`에서 본다.
  - 나중에 웹 배포 시에는 배포 산출물에 포함된 같은 파일을 읽어 보여준다.
  - raw 파일은 공개 가능한 CCTVUP 운영 이벤트 원천만 담는다. DB credential, Supabase service key, 이미지 원본 URL, 운영 이미지 파일 경로 원문, 원본 운영 DB 전체 row dump는 저장하지 않는다.
  - Supabase에는 일일 보고서 본문을 중복 저장하지 않는다.
  - 원본 운영 DB에는 계속 쓰지 않는다.
  - 브리핑 본문은 업체별 책임 단위로 읽도록 체리부로, 신우, 해외, 기타 순서로 그룹핑한다. 전체 중요도 정렬로 업체가 섞이지 않게 한다.

### Phase 4 - 상태전환 기록 정리
- 목표: 문제로그를 넓히기보다, 운영자가 읽는 상태전환 기록을 이미지 수신 상태머신 중심으로 단순화한다.
- 현재 UI 1차 반영:
  - 선택 카메라 상세에 `5분 저장 근거` 섹션을 추가해 최신 저장, 문제 직전 저장, 회복 확인 저장을 보여준다.
  - 5분 저장 근거는 `tbl_farm_image`의 파일명/시각/크기를 읽되, 브라우저에는 운영 이미지 서버 원본 URL, 원본 파일명, 이미지 바이너리를 노출하지 않는다. 이미지 자체는 Supabase에 저장하지 않는다.
  - 선택 카메라 상세 기본 섹션명을 `이미지 입력 상태`로 변경한다.
  - 기본 판정은 `이미지 입력`만 표시한다.
  - `중량분석 생성`은 `무게예측 참고` 접힘 영역으로 분리하고, 펼칠 때만 선택 카메라 최근 2시간 기준으로 조회한다.
  - R2/A4 보정값, 1시간 대표 중량, 변동성 판단, 운영 사용 판단은 기본 화면에서 제거하고 후속 Phase 후보로만 유지한다.
- 선택 카메라 히스토리 반영:
  - 섹션명을 `스냅샷 / 히스토리`에서 `상태전환 기록`으로 바꾼다.
  - `missing · open`, `critical · open` 같은 기술 값 대신 `문제확정`, `회복중`, `해결`, `재확정`을 표시한다.
  - 레거시 `최근 스냅샷`, `최근 인시던트` 반복 목록은 기본 화면에서 제거한다.
- 후속 issue type 후보:
  - `image_late`: 이미지 수신 지연
  - `image_missing`: 이미지 수신 누락
  - `analysis_missing`: 이미지 있음 / 분석 없음
  - `analysis_late`: 분석 결과 지연
  - `calibration_unknown`: 보정 상태 미확인
  - `prediction_unstable`: 예측값 변동 큼
  - `representative_value_unavailable`: 1시간 대표값 생성 불가
- 저장 원칙:
  - 현재 카메라 문제 Supabase 저장은 이미지 수신 상태머신의 `opened/recovering/resolved/reopened` 이벤트로 제한한다.
  - 농장 감시범위 Supabase 저장은 `activated/resting_started/review_needed/uninstalled/scope_changed` 전환 이벤트로 제한한다.
  - 분석/보정/대표값 후보 issue type은 현재 저장하지 않는다.
  - 정상 카메라 전체 snapshot을 매 5분 누적하지 않는다.
  - 확정 문제 또는 의미 있는 상태 전환만 event로 남긴다.
- 주의점: issue 종류가 늘어나도 화면 왼쪽 목록은 수신 상태 우선으로 유지한다.

### Phase 5 - 농장 단위 운영 가능 상태
- 현재 상태: 보류.
- 목표 후보: 운영자가 농장 단위로 무게예측 결과를 판단에 써도 되는지 빠르게 확인하게 한다.
- 현재 화면 원칙:
  - 농장 목록의 1차 상태는 계속 이미지 수신 상태만 사용한다.
  - 분석 정상 카메라 수, 보정 확인 카메라 수, 1시간 대표 중량 생성 여부는 농장 row에 표시하지 않는다.
  - `사용 가능`, `제한적`, `불가` 같은 종합 운영 판단을 표시하지 않는다.
- 보류 이유:
  - 분석 결과, R2/A4 보정, 1시간 대표 중량 원천이 아직 하나의 판정식으로 확정되지 않았다.
  - 원천이 불확실한 상태에서 농장 단위 종합 판단을 표시하면 정상 농장도 문제처럼 보일 수 있다.
  - 현재 CCTVUP의 1차 목표는 5분 이미지 수집 상태를 단단하게 감시하는 것이다.
- 착수 조건:
  - 분석 결과 테이블과 카메라 매칭 기준을 확정한다.
  - R2/A4 보정 상태를 읽을 원천과 최신성 기준을 확정한다.
  - 1시간 대표 중량값의 기준 테이블과 생성 성공 기준을 확정한다.
  - `사용 가능/제한적/불가` 판정식을 문서로 먼저 승인받는다.
  - Supabase 저장량 증가 여부를 계산하고, 저장이 필요하면 issue-focused 원칙을 유지한다.
- 주의점: 이 단계는 최종 운영판에 가깝다. 원천과 판정식이 확정되기 전에는 UI나 상태머신에 추가하지 않는다.

## 17. 확정된 운영 결정과 보류 항목
### 확정
- 웹 배포 인증 범위: 현재 1차 운영은 로컬 PC 기준이다. 외부 웹 배포 production runtime에서는 `/cctvup` 운영 데이터 읽기 API를 기본 secret 보호로 잠그고, 공개 읽기 모드는 별도 승인 후 `CCTVUP_PUBLIC_READ=1`로만 연다.
- `대상확인` 처리 방식: 현재는 장애가 아니라 사육/설치 기준 데이터 검수 필요 상태로만 표시한다. 이후 필요하면 원본 운영 DB를 수정하지 않고 Supabase에 수동 override UI를 추가한다.
- 이미지 보기 기능: 현재는 이미지 자체를 보여주지 않고 저장 근거만 표시한다. 운영 이미지 서버 인증 방식이 확정되기 전까지 이미지 프록시나 원본 URL 노출은 보류한다.

### 보류
- `계속 열려 있는 문제` 내부 분리 기준: 현재는 180분 이상 문제 상태를 기본 접힘 보관 목록으로 분리한다. 화면에는 시간 기준을 직접 강조하지 않고, 추후 운영 경험에 따라 24시간+/48시간+ 같은 보관 구간으로 바꿀지 확인한다.
- 농장 단위 무게예측 운영 가능 상태: 분석 결과, R2/A4 보정, 1시간 대표 중량 원천과 판정식이 확정되기 전까지 화면/상태머신/Supabase 저장에 추가하지 않는다.

## 18. 변경 시 지켜야 할 기준
- 변경 전 이 문서와 `docs/pages/cctvup.page.md`를 먼저 확인한다.
- 원본 운영 DB write가 생기는 변경은 금지한다.
- Supabase 저장량을 늘리는 변경은 먼저 저장량 계산을 한다.
- 화면 색상/카테고리 UI는 상태 색상과 섞지 않는다.
- 문제로그는 확정 문제 중심으로 유지한다.
- 수신감시와 무게예측 분석 상태를 같은 값으로 합치지 않는다.
