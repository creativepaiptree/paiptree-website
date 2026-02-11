---
title: "/culture 페이지 운영 문서"
author: ZORO
last_updated: 26.02.11
---

# /culture 페이지 운영 문서

## 1. 문서 정보
- 라우트: `/culture`
- 페이지 파일: `src/app/culture/page.tsx`
- 문서 파일: `docs/pages/culture.page.md`

## 2. 목적
- 회사 문화, 핵심 가치, 복리후생, 팀 스토리를 소개한다.
- 채용 유입 전 브랜드 신뢰를 높이는 설명 페이지로 사용한다.

## 3. 화면/기능 구성
- 상단: `Header`, `ParticleBackground`
- 본문 섹션:
  - Hero
  - Core Values(4개)
  - Benefits(4개 카테고리)
  - Employee Stories(3개)
  - CTA
- 하단: `Footer`

## 4. 데이터/상태
- `coreValues`, `benefits`, `employeeStories` 정적 배열 사용
- 페이지 상태 없음
- 모든 항목은 컴포넌트 상수로 관리

## 5. 인터랙션 규칙
- 카드 hover 시 확대/색상 변화 적용
- 버튼은 시각적 CTA 중심(페이지 내부 로직 연결 없음)
- 페이지 레벨 비동기 처리 없음

## 6. QA 체크리스트
- [ ] 배열 항목 수 변경 시 카드 그리드가 깨지지 않는다.
- [ ] 각 섹션 제목/설명 텍스트가 의도대로 노출된다.
- [ ] 모바일에서 1열/2열 전환이 자연스럽다.
