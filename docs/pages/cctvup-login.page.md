---
title: "/cctvup/login 페이지 운영 문서"
author: ZORO
last_updated: 26.06.02
---
# /cctvup/login 페이지 운영 문서

## 1. 문서 정보
- 라우트: `/cctvup/login`
- 페이지 파일: `src/app/cctvup/login/page.tsx`
- 문서 파일: `docs/pages/cctvup-login.page.md`

## 2. 목적
- CCTVUP 운영 관제 화면을 Supabase Auth 세션 뒤에 두기 위한 로그인 진입점이다.
- 대상 사용자는 Supabase Auth에 사전 등록된 운영/관리 계정이다.
- 로컬 개발 기본 모드에서는 `/cctvup`가 열리지만, `CCTVUP_AUTH_REQUIRED=1` 또는 production runtime에서는 이 페이지를 거쳐야 한다.

## 3. 화면/기능 구성
- 상단: FMS/CCTVUP 식별자, `CCTVUP 운영 관제 로그인` 제목, Paiptree 홈 링크
- 본문: 접근 범위, 인증 방식, next 경로 요약
- 로그인 폼: 이메일 입력, 로그인 링크 요청 버튼, 성공/오류 상태 메시지
- 환경 미설정 상태: `NEXT_PUBLIC_SUPABASE_URL`과 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` 또는 `NEXT_PUBLIC_SUPABASE_KEY`가 없으면 입력과 버튼을 비활성화한다.

## 4. 데이터/상태
- 주요 데이터 소스: Supabase Auth email-link API
- 클라이언트 상태: 이메일 입력값, 요청 중 상태, 링크 발송 성공 메시지, 오류 메시지
- 서버 의존성: `/auth/callback` route가 Supabase auth code를 SSR cookie 세션으로 교환한다.
- 설정 의존성: Supabase Auth redirect URL 허용 목록에 실제 배포 origin의 `/auth/callback`이 등록되어 있어야 한다.

## 5. 인터랙션 규칙
- 주요 사용자 액션: 이메일 입력 후 로그인 링크 요청
- 가입 정책: `shouldCreateUser=false`로 요청해 신규 가입을 열지 않는다.
- 라우팅/네비게이션: 성공 메일의 링크는 `/auth/callback?next=/cctvup`로 돌아오고, callback route가 성공하면 `next` 경로로 이동한다.
- 예외 동작: callback code가 없거나 교환에 실패하면 `/cctvup/login?next=/cctvup&error=...`로 돌아온다.
- 로그아웃: `/cctvup/logout`은 현재 브라우저 세션을 제거한 뒤 `/cctvup/login?next=/cctvup`로 이동한다.

## 6. QA 체크리스트
- [x] `CCTVUP_AUTH_REQUIRED=1`에서 `/cctvup/` 미로그인 접근이 `/cctvup/login?next=/cctvup/`로 이동한다.
- [x] 공개 키 미설정 상태에서 로그인 폼이 비활성화되고 환경 미설정 메시지를 표시한다.
- [x] `/auth/callback/?next=/cctvup` code 누락 요청이 로그인 페이지 오류 상태로 돌아간다.
- [x] 기본 로컬 모드에서 `/cctvup`와 `/api/cctvup/`는 기존처럼 정상 동작한다.
- [ ] 실제 Supabase Auth 공개 키와 redirect URL이 설정된 환경에서 메일 링크 발송 및 callback 세션 교환을 확인한다.
