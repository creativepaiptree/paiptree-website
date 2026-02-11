---
title: "/careers 페이지 운영 문서"
author: ZORO
last_updated: 26.02.11
---

# /careers 페이지 운영 문서

## 1. 문서 정보
- 라우트: `/careers`
- 페이지 파일: `src/app/careers/page.tsx`
- 문서 파일: `docs/pages/careers.page.md`

## 2. 목적
- 채용 브랜딩 및 포지션 정보를 제공한다.
- 지원 프로세스를 시각화해 지원 전환을 유도한다.

## 3. 화면/기능 구성
- 상단: `Header`, `ParticleBackground`
- 본문 섹션:
  - Hero
  - Culture Link
  - Benefits
  - Job Openings(Featured + 일반)
  - Application Process
  - CTA
- 하단: `Footer`

## 4. 데이터/상태
- `jobOpenings`, `benefits`, `departments` 정적 배열 사용
- 페이지 상태 없음
- 부서 필터 버튼은 현재 선택 상태를 갖지 않는 정적 UI

## 5. 인터랙션 규칙
- 포지션 카드의 `Apply` 버튼은 시각적 CTA 중심(실제 제출 플로우 미연결)
- Featured 포지션은 별도 강조 배지로 분리
- Department 버튼은 향후 필터 기능 확장 포인트

## 6. QA 체크리스트
- [ ] Featured/일반 포지션 구분 렌더링이 유지된다.
- [ ] 요구사항 리스트 아이콘/정렬이 깨지지 않는다.
- [ ] 모바일에서 카드 간격과 텍스트 오버플로가 정상이다.
