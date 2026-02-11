---
title: "/newsroom 페이지 운영 문서"
author: ZORO
last_updated: 26.02.11
---

# /newsroom 페이지 운영 문서

## 1. 문서 정보
- 라우트: `/newsroom`
- 페이지 파일: `src/app/newsroom/page.tsx`
- 문서 파일: `docs/pages/newsroom.page.md`

## 2. 목적
- 보도자료/회사소식/미디어 노출 정보를 집약 제공한다.
- 미디어킷 다운로드 및 연락 채널을 함께 노출한다.

## 3. 화면/기능 구성
- 상단: `Header`, `ParticleBackground`
- 본문 섹션:
  - Hero
  - Latest Updates(Featured + 일반 카드)
  - Media Coverage
  - Media Kit + Press Contact
  - Newsletter Signup
- 하단: `Footer`

## 4. 데이터/상태
- `newsArticles`, `mediaArticles` 정적 배열 기반
- newsletter 입력 필드는 존재하나 제출 로직 미연결
- 날짜는 `toLocaleDateString('en-US')`로 포맷

## 5. 인터랙션 규칙
- Featured 기사와 일반 기사의 레이아웃을 분리한다.
- Media Kit `Download` 버튼은 현재 시각 CTA로만 동작한다.
- 문의 메일 링크는 `mailto:`로 연결한다.

## 6. QA 체크리스트
- [ ] Featured 기사 1건과 일반 기사 목록이 정상 분리된다.
- [ ] 연락처 메일 링크가 올바르게 열린다.
- [ ] 뉴스레터 입력 UI 레이아웃이 모바일에서 깨지지 않는다.
