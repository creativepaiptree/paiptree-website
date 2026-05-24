---
title: CCTVUP 일일 브리핑 파일 저장 및 페이지 탭 설계서
author: ZORO
last_updated: 26.05.17
status: active
service: cctvup
---

# CCTVUP 일일 브리핑 파일 저장 및 페이지 탭 설계서

## 1. 목표
`/cctvup`의 5분 체크 결과를 바탕으로 하루 단위 운영 이벤트를 파일로 남기고, 같은 파일을 `/cctvup` 페이지 안의 `일일 브리핑` 탭에서 볼 수 있게 만든다.

이 기능은 지금은 로컬 Next.js 서버에서 생성하고 확인한다. 이후 웹 배포 단계에서는 GitHub에 올라간 `content/cctvup/daily-reports/**` 파일이 배포 산출물에 포함되어, 별도 저장소 이전 없이 같은 `/cctvup` 화면에서 읽히게 한다.

## 2. 핵심 결정
- 일일 보고서는 Supabase Storage나 외부 파일 서버에 먼저 두지 않는다.
- 보고서 파일은 프로젝트 내부 `content/cctvup/daily-reports/`에 저장하고 GitHub 커밋 대상에 포함한다.
- Next.js 서버가 보고서 생성 API를 실행해 `content/**` 아래에 `md`, `raw.json`, `manifest.json`을 쓴다.
- `/cctvup` 화면은 Next.js API를 통해 `content/**`의 보고서 목록과 본문을 읽는다.
- 웹 배포본에서는 서버가 새 보고서를 생성하지 않고, 이미 배포에 포함된 파일을 읽는 것을 기본으로 한다.
- 보고서 raw 파일은 공개 가능한 CCTVUP 운영 이벤트 원천만 담는다. DB credential, Supabase service key, 이미지 원본 URL, 운영 이미지 파일 경로 원문, 민감 SQL 응답 원문은 저장하지 않는다.
- 원본 운영 DB는 계속 읽기 전용이다. 보고서 생성도 원본 DB에 쓰지 않는다.
- Supabase에는 기존 상태머신과 이벤트만 유지한다. 일일 보고서 본문을 Supabase DB에 중복 저장하지 않는다.

## 3. 저장 구조

    content/
      cctvup/
        daily-reports/
          manifest.json
          2026/
            05/
              2026-05-17.md
              2026-05-17.raw.json

### `manifest.json`
보고서 목록과 화면 표시용 요약을 가진다.

    {
      "schemaVersion": 1,
      "updatedAt": "2026-05-17T23:10:00+09:00",
      "reports": [
        {
          "date": "2026-05-17",
          "title": "2026-05-17 CCTVUP 일일 브리핑",
          "companyCount": 4,
          "notableFarmCount": 3,
          "issueEventCount": 6,
          "farmScopeEventCount": 1,
          "status": "generated",
          "markdownPath": "2026/05/2026-05-17.md",
          "rawPath": "2026/05/2026-05-17.raw.json"
        }
      ]
    }

### `YYYY-MM-DD.raw.json`
하루 브리핑의 근거가 되는 구조화 데이터다.

포함한다.
- 보고서 생성 시각
- 기준 기간
- 업체별 요약
- 농장별 특이사항
- 카메라 상태 전환 이벤트
- 농장 감시범위 전환 이벤트
- 보고서 생성 시점에 아직 열려 있는 문제
- 최근 check run 요약

포함하지 않는다.
- DB 접속 정보
- Supabase service key
- 이미지 원본 URL
- 운영 이미지 파일 경로 원문
- 원본 운영 DB 전체 row dump
- 정상 카메라 5분 스냅샷 전체

### `YYYY-MM-DD.md`
사람과 AI가 함께 읽을 일일 브리핑 문서다.

권장 구성:

    # 2026-05-17 CCTVUP 일일 브리핑

    ## 요약
    - 문제확정: 2건
    - 이미지 재수신: 1건
    - 해결: 1건
    - 감시범위 전환: 1건

    ## 업체별 특이사항
    ### 신우
    - 건농장 FA0406: 15분 이상 이미지 미수신으로 문제확정.

    ### 체리부로
    - 특이사항 없음.

    ## 농장별 확인 항목
    - 건농장 FA0406: 다음 체크에서 이미지 재수신 여부 확인.

    ## 계속 열려 있는 문제
    - FA0406 / 2동 / CT01: 문제확정 후 45분 경과.

    ## 생성 기준
    - 기준 기간: 2026-05-17 00:00:00 KST ~ 2026-05-17 23:59:59 KST
    - 원천: tbl_cctvup_issue_events, tbl_cctvup_farm_scope_events, tbl_cctvup_camera_states, tbl_cctvup_check_runs

## 4. 생성 흐름
1. 사용자가 `/cctvup`에서 `일일 브리핑 생성` 버튼을 누른다.
2. `POST /api/cctvup/daily-reports/generate`가 실행된다.
3. `src/lib/cctvup-daily-report-server.ts`가 Supabase 이벤트/상태를 조회한다.
4. KST 기준 날짜 범위를 계산하고 업체별/농장별 요약을 만든다.
5. `content/cctvup/daily-reports/YYYY/MM/YYYY-MM-DD.raw.json`을 저장한다.
6. `content/cctvup/daily-reports/YYYY/MM/YYYY-MM-DD.md`를 저장한다.
7. `manifest.json`을 갱신한다.
8. `/cctvup`의 `일일 브리핑` 탭이 새 보고서를 즉시 표시한다.

## 5. 조회 흐름
1. `/cctvup`의 `일일 브리핑` 탭이 `GET /api/cctvup/daily-reports`를 호출한다.
2. 목록 API가 `manifest.json`을 읽어 보고서 목록을 반환한다.
3. 사용자가 날짜를 선택하면 `GET /api/cctvup/daily-reports/YYYY-MM-DD`를 호출한다.
4. 상세 API가 `YYYY/MM/YYYY-MM-DD.md`와 `YYYY/MM/YYYY-MM-DD.raw.json`을 읽는다.
5. 화면은 Markdown 브리핑 본문을 먼저 표시하고, raw 근거는 접힘 영역에 표시한다.

## 6. 백엔드 설계
### 생성 로직
- 파일: `src/lib/cctvup-daily-report.js`, `src/lib/cctvup-daily-report-server.ts`
- 책임:
  - KST 기준 날짜 범위를 만든다.
  - Supabase `tbl_cctvup_issue_events`에서 하루 상태 전환 이벤트를 읽는다.
  - Supabase `tbl_cctvup_farm_scope_events`에서 하루 감시범위 전환 이벤트를 읽는다.
  - Supabase `tbl_cctvup_camera_states`에서 보고서 생성 시점의 열린 문제를 읽는다.
  - Supabase `tbl_cctvup_check_runs`에서 최근 체크런 요약을 읽는다.
  - 이벤트를 업체별, 농장별로 묶는다.
  - raw JSON과 Markdown 문자열을 만든다.
  - `content/cctvup/daily-reports/**`에 파일을 쓴다.
  - `manifest.json`을 최신순으로 갱신한다.

### 생성 API
- 파일: `src/app/api/cctvup/daily-reports/generate/route.ts`
- 메서드: `POST`
- 인증:
  - 로컬 개발: 현재 CCTVUP 관리 secret 사용.
  - 배포 환경: 기본적으로 생성 비활성화 또는 관리자 인증 필요.
- 쓰기 대상:
  - 프로젝트 내부 `content/cctvup/daily-reports/**`
- 원본 운영 DB 쓰기:
  - 없음.
- Supabase 쓰기:
  - 없음.

### 목록 API
- 파일: `src/app/api/cctvup/daily-reports/route.ts`
- 메서드: `GET`
- 읽는 대상:
  - `content/cctvup/daily-reports/manifest.json`
- 반환:
  - 보고서 목록
  - 최신 보고서 요약
  - 파일 누락 여부

### 상세 API
- 파일: `src/app/api/cctvup/daily-reports/[date]/route.ts`
- 메서드: `GET`
- 읽는 대상:
  - `content/cctvup/daily-reports/YYYY/MM/YYYY-MM-DD.md`
  - `content/cctvup/daily-reports/YYYY/MM/YYYY-MM-DD.raw.json`
- 반환:
  - Markdown 본문
  - raw JSON 요약
  - 이전/다음 날짜 포인터

### 터미널 보조 실행
- 파일: `scripts/cctvup-daily-report.mjs`
- 목적:
  - API 버튼 없이 터미널에서 동일 생성 로직을 실행한다.
  - `--yesterday` 옵션으로 매일 00:05 전날 보고서를 자동 생성할 수 있다.
- 원칙:
  - 파일 변환/저장은 `src/lib/cctvup-daily-report.js`, 서버 조회 orchestration은 `src/lib/cctvup-daily-report-server.ts`에 두고, script는 API를 호출하는 얇은 wrapper로만 둔다.

## 7. 프론트 설계
### 탭 구조
`/cctvup` 본문 상단에 다음 탭을 둔다.
- `실시간 관제`: 기존 화면
- `일일 브리핑`: 새 보고서 화면

### 일일 브리핑 탭 구성
- 상단:
  - 선택 날짜
  - 최신 보고서 생성 시각
  - `보고서 생성` 버튼
- 요약:
  - 문제확정
  - 이미지 재수신
  - 해결
  - 감시범위 전환
  - 계속 열려 있는 문제
- 본문:
  - Markdown 브리핑 렌더링
- 근거:
  - 접힘 영역 `raw 근거 보기`
  - 업체별/농장별 구조화 데이터 표시
- 빈 상태:
  - 보고서가 없으면 `아직 생성된 일일 브리핑이 없습니다. 보고서 생성을 눌러 오늘 기준 파일을 만들 수 있습니다.`로 표시한다.

### 화면 원칙
- 일일 브리핑은 실시간 문제 판단 화면을 대체하지 않는다.
- 실시간 관제 탭의 문제농장 필터와 상태머신은 그대로 둔다.
- 브리핑 탭은 하루가 끝난 뒤 운영 이력을 읽는 보조 화면이다.
- raw JSON은 기본 펼침으로 두지 않는다. 운영자는 Markdown 브리핑을 먼저 본다.

## 8. 웹 배포 시 동작
로컬에서는 생성 API가 실제 파일을 쓴다.

웹 배포본에서는 배포 산출물에 포함된 `content/cctvup/daily-reports/**` 파일을 읽는다. Vercel 같은 서버리스 환경에서는 런타임 파일 쓰기가 영구 보장되지 않으므로, 배포 환경의 `보고서 생성` 버튼은 숨기거나 읽기 전용 안내로 바꾼다.

웹에서도 최신 보고서를 자동으로 보이게 하려면 다음 흐름이 필요하다.
1. 로컬에서 보고서 생성
2. 생성 파일 검토
3. GitHub commit/push
4. 웹 배포
5. 배포된 `/cctvup`에서 보고서 표시

현재 로컬 보고서 생성은 `ops/launchd/com.paiptree.cctvup-daily-report.plist`가 담당한다. 매일 00:05에 `npm run cctvup:daily-report -- --yesterday`를 실행해 전날 전체 보고서를 만든다.

나중에 완전 자동화가 필요하면 `보고서 생성 -> 자동 commit/push -> 배포`를 별도 Phase로 분리한다. 새벽 자동 GitHub 업데이트가 이미 운영 중이면, 이 content 파일은 그 커밋에 포함되어 웹 배포본에도 반영된다.

## 9. 보안/공개 범위
GitHub에 올라가는 `content/cctvup/daily-reports/**`는 공개 가능한 운영 브리핑으로 간주한다.

허용:
- farm id
- 농장명
- 소속 분류
- 카메라 표시명
- 상태 전환 시각
- 문제확정/회복/해결 상태
- 감시범위 전환
- 업체별/농장별 집계

금지:
- `.env*` 값
- DB credential
- Supabase service key
- 원본 이미지 URL
- 원본 이미지 파일 경로 원문
- 민감한 운영 DB 전체 row dump
- 암호화되지 않은 민감 분석 리포트

민감 원천 분석이 필요하면 기존 원칙대로 `/Users/zoro/company-ops/.hermes-sensitive/**` 암호화 bundle에만 둔다. 이 일일 브리핑 기능은 그 민감 리포트와 별개다.

## 10. 테스트 계획
- 단위 테스트:
  - 날짜별 경로 생성
  - `manifest.json` 갱신
  - issue event를 업체별/농장별로 묶기
  - 이벤트가 없는 날의 Markdown 생성
  - 열린 문제가 있는 날의 Markdown 생성
- API 테스트:
  - 보고서가 없을 때 목록 API가 빈 목록을 반환한다.
  - 보고서 생성 후 목록 API가 새 날짜를 반환한다.
  - 상세 API가 Markdown과 raw JSON을 반환한다.
  - 잘못된 날짜 요청은 400 또는 404를 반환한다.
- 화면 확인:
  - `/cctvup`에서 `일일 브리핑` 탭이 보인다.
  - 보고서 없는 상태가 깨지지 않는다.
  - 생성 후 최신 보고서가 바로 표시된다.
  - 기존 `실시간 관제` 탭의 필터와 문제 목록이 유지된다.
- 기본 검증:
  - `npm run lint`
  - `npm run build`
  - 로컬 `/cctvup` 브라우저 확인

## 11. 구현 순서
1. `content/cctvup/daily-reports/manifest.json` 초기 파일을 만든다.
2. `src/lib/cctvup-daily-report.js`와 `src/lib/cctvup-daily-report-server.ts`에 날짜/경로/Markdown/raw 생성 로직과 서버 조회 orchestration을 만든다.
3. `src/app/api/cctvup/daily-reports/route.ts` 목록 API를 만든다.
4. `src/app/api/cctvup/daily-reports/[date]/route.ts` 상세 API를 만든다.
5. `src/app/api/cctvup/daily-reports/generate/route.ts` 생성 API를 만든다.
6. `scripts/cctvup-daily-report.mjs` 보조 실행 wrapper를 만든다.
7. `/cctvup` 클라이언트에 `실시간 관제` / `일일 브리핑` 탭을 추가한다.
8. 일일 브리핑 탭에서 목록, 본문, raw 근거 접힘 영역, 생성 버튼을 연결한다.
9. `docs/pages/cctvup.page.md`와 `docs/pages/cctvup.service-manual.md`에 운영 기준을 반영한다.
10. 테스트, lint, build, 로컬 브라우저 확인을 실행한다.

## 12. 완료 조건
- 로컬 `/cctvup`에 `일일 브리핑` 탭이 생긴다.
- 보고서가 없을 때도 화면이 깨지지 않는다.
- 버튼으로 오늘 또는 지정 날짜 보고서를 생성할 수 있다.
- 생성 후 `content/cctvup/daily-reports/YYYY/MM/YYYY-MM-DD.md`와 `.raw.json`이 생긴다.
- `manifest.json`이 최신 보고서 목록을 가진다.
- `/cctvup`에서 생성된 Markdown 브리핑을 볼 수 있다.
- 기존 실시간 관제의 5분 체크, 문제확정, 회복, 해결 로직은 변하지 않는다.
- `npm run lint`와 `npm run build`가 통과한다.

## 13. 구현 결과
- 상태: 2026-05-17 기준 구현 완료.
- 생성 파일:
  - `content/cctvup/daily-reports/manifest.json`
  - `content/cctvup/daily-reports/2026/05/2026-05-17.md`
  - `content/cctvup/daily-reports/2026/05/2026-05-17.raw.json`
- 구현 파일:
  - `src/lib/cctvup-daily-report.js`
  - `src/lib/cctvup-daily-report-server.ts`
  - `src/app/api/cctvup/daily-reports/route.ts`
  - `src/app/api/cctvup/daily-reports/[date]/route.ts`
  - `src/app/api/cctvup/daily-reports/generate/route.ts`
  - `scripts/cctvup-daily-report.mjs`
  - `scripts/cctvup-daily-report.test.mjs`
  - `ops/launchd/com.paiptree.cctvup-daily-report.plist`
- 화면 반영:
  - `/cctvup` 상단에 `실시간 관제`와 `일일 브리핑` 탭을 둔다.
  - `일일 브리핑` 탭은 보고서 목록, 요약 지표, Markdown 본문, raw 근거 접힘 영역, 생성 버튼을 제공한다.
- 실행:
  - 화면에서 `오늘 생성`을 누르거나 `npm run cctvup:daily-report`를 실행한다.
  - 매일 자동 생성은 `npm run cctvup:daily-report -- --yesterday`를 실행하는 launchd가 담당한다.
  - 외부 웹 배포본에서는 런타임 파일 쓰기가 영구 보장되지 않으므로 생성 버튼은 로컬 운영 중심으로 유지하고, 배포본은 GitHub에 포함된 보고서 파일을 읽는 구조를 우선한다.
