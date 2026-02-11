---
title: "/tms 페이지 운영 문서"
author: ZORO
last_updated: 26.02.11
---
# /tms 페이지 운영 문서

## 1. 문서 정보
- 라우트: `/tms`
- 페이지 파일: `src/app/tms/page.tsx`
- 문서 파일: `docs/pages/tms.page.md`

## 2. 목적
- TMS 제품 소개/기능 설명/보안 소개/앱 다운로드를 제공한다.
- 한국어/영어 전환이 가능한 랜딩 페이지를 운영한다.

## 3. 화면/기능 구성
- 상단 고정 헤더: 로고, 언어 토글, 햄버거 메뉴(매뉴얼 링크)
- 본문 섹션:
  - Hero + 다운로드 CTA
  - Enterprise Features 그리드
  - Key Features(교차 배치 블록)
  - Security 카드 3종
- 하단: 상세 푸터(데스크탑/모바일 분기)

## 4. 데이터/상태
- 클라이언트 상태: `menuOpen`
- 언어 상태: `useLanguage` (`language`, `toggleLanguage`)
- 텍스트/이미지 소스: `useTranslation` 키(`tms.*`)
- 다운로드 API: `http://paipddns.iptime.org:8100/tms/app/deploy/get/apk/gps`

## 5. 인터랙션 규칙
- Android 다운로드 버튼 클릭 시 APK fetch 후 blob 다운로드를 시도한다.
- 다운로드 실패 시 동일 URL을 새 탭으로 fallback 오픈한다.
- 기능 카드 index 5 클릭/키보드 Enter/Space 시 `/tms/tms-schedule.html` 새 탭 오픈.
- 햄버거 메뉴는 내부 상태(`menuOpen`)로 열고 닫는다.

## 6. QA 체크리스트
- [ ] 언어 토글 시 전체 문구가 즉시 전환된다.
- [ ] 다운로드 버튼의 성공/실패 fallback이 동작한다.
- [ ] Data Insights 카드 키보드 접근성(Enter/Space)이 동작한다.
- [ ] 메뉴얼 링크 드롭다운 열림/닫힘이 정상이다.
