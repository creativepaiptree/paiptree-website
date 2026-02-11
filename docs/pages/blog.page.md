---
title: "/blog 페이지 운영 문서"
author: ZORO
last_updated: 26.02.11
---
# /blog 페이지 운영 문서

## 1. 문서 정보
- 라우트: `/blog`
- 페이지 파일: `src/app/blog/page.tsx`
- 문서 파일: `docs/pages/blog.page.md`

## 2. 목적
- 블로그 포스트 목록을 카드형 리스트로 제공한다.
- 태그/카테고리 UI를 통해 추후 필터 확장을 위한 구조를 유지한다.

## 3. 화면/기능 구성
- 상단: `BlogHeader`
- 본문:
  - 카테고리 텍스트 링크
  - 포스트 목록(좌측)
  - 태그 사이드바(우측)
- 하단: `Footer`

## 4. 데이터/상태
- `blogPosts`, `categories`, `popularTags` 정적 배열 사용
- 날짜는 `toLocaleDateString('ko-KR')`로 포맷
- 현재 카테고리/태그 필터 상태는 미구현

## 5. 인터랙션 규칙
- `blogPosts` 중 `link`가 있는 항목은 새 탭(`_blank`)으로 이동
- 썸네일이 없으면 대체 박스 UI 표시
- 카테고리/태그 버튼은 현재 시각 요소로만 동작

## 6. QA 체크리스트
- [ ] 링크가 있는 포스트는 새 탭으로 열린다.
- [ ] 썸네일 유무에 따라 레이아웃이 깨지지 않는다.
- [ ] 사이드바 sticky 동작이 정상이다.
