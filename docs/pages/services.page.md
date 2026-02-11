---
title: "/services 페이지 운영 문서"
author: ZORO
last_updated: 26.02.11
---

# /services 페이지 운영 문서

## 1. 문서 정보
- 라우트: `/services`
- 페이지 파일: `src/app/services/page.tsx`
- 문서 파일: `docs/pages/services.page.md`

## 2. 목적
- AI 서비스 카탈로그와 가격/기술 스택을 단일 페이지로 설명한다.
- 영업/도입 문의를 위한 CTA를 제공한다.

## 3. 화면/기능 구성
- 상단: `Header`, `ParticleBackground`
- 본문 주요 섹션:
  - Hero
  - Service Overview
  - Main Services(4개 카드)
  - Technology Stack
  - API Documentation Preview
  - Pricing(Starter/Professional/Enterprise)
  - CTA
- 하단: `Footer`

## 4. 데이터/상태
- 페이지 로컬 상태 없음
- 대부분 정적 문자열 기반 콘텐츠
- 버튼들은 현재 시각 효과 중심이며 실제 라우팅/액션 연결은 제한적

## 5. 인터랙션 규칙
- 카드/버튼 hover 스타일이 중심이며, 페이지 자체의 비즈니스 이벤트는 없음
- API 예제 코드 블록은 읽기 전용
- 가격/서비스 정보는 정적 문구 기준으로 노출

## 6. QA 체크리스트
- [ ] 섹션 순서와 타이포그래피가 깨지지 않는다.
- [ ] 서비스 카드/가격 카드 hover 스타일이 정상 동작한다.
- [ ] 모바일에서 버튼과 카드 배치가 겹치지 않는다.
