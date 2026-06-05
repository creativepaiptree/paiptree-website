---
title: "/cctvup/login 페이지 운영 문서"
author: ZORO
last_updated: 26.06.05
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
- 로그인 폼: 공용 계정 ID, 비밀번호 입력, 로그인 버튼, 성공/오류 상태 메시지
- 환경 미설정 상태: `NEXT_PUBLIC_SUPABASE_URL`과 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` 또는 `NEXT_PUBLIC_SUPABASE_KEY`가 없으면 입력과 버튼을 비활성화한다.
- `NEXT_PUBLIC_CCTVUP_SHARED_LOGIN_EMAIL`을 설정하면 공용 계정 ID가 기본 입력값으로 표시된다. 이 값은 비밀값이 아니며, 비밀번호는 코드와 환경변수에 저장하지 않는다.

## 4. 데이터/상태
- 주요 데이터 소스: Supabase Auth email/password API
- 클라이언트 상태: 공용 계정 ID, 비밀번호 입력값, 요청 중 상태, 로그인 성공 메시지, 오류 메시지
- 서버 의존성: Supabase SSR cookie 세션
- 설정 의존성: Supabase Auth에 공용 사용자를 미리 만들고 Email provider의 password login을 허용해야 한다.

## 5. 인터랙션 규칙
- 주요 사용자 액션: 공용 계정 ID와 비밀번호 입력 후 로그인
- 가입 정책: 화면에서 회원가입 플로우를 제공하지 않는다. Supabase Auth에 사전 등록된 사용자만 로그인할 수 있다.
- 라우팅/네비게이션: 로그인 성공 후 `next` 경로로 이동한다.
- 예외 동작: 기존 callback route로 code가 없거나 교환에 실패한 요청이 들어오면 `/cctvup/login?next=/cctvup&error=...`로 돌아온다.
- 로그아웃: `/cctvup/logout`은 현재 브라우저 세션을 제거한 뒤 `/cctvup/login?next=/cctvup`로 이동한다.

## 6. QA 체크리스트
- [x] `CCTVUP_AUTH_REQUIRED=1`에서 `/cctvup/` 미로그인 접근이 `/cctvup/login?next=/cctvup/`로 이동한다.
- [x] 공개 키 미설정 상태에서 로그인 폼이 비활성화되고 환경 미설정 메시지를 표시한다.
- [x] `/auth/callback/?next=/cctvup` code 누락 요청이 로그인 페이지 오류 상태로 돌아간다.
- [x] 기본 로컬 모드에서 `/cctvup`와 `/api/cctvup/`는 기존처럼 정상 동작한다.
- [ ] 실제 Supabase Auth 공용 계정이 설정된 환경에서 email/password 로그인과 세션 쿠키 생성을 확인한다.
