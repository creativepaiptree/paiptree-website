---
paths:
  - "src/app/**"
  - "src/components/**"
  - "src/contexts/**"
  - "src/hooks/**"
---

# Architecture Rules

페이지 레벨 로직은 `src/app/**`에 두고 재사용 UI 로직을 혼합하지 않는다.
공통 컴포넌트는 `src/components/**`로 이동하고 페이지 의존 코드를 포함하지 않는다.
상태/훅 변경 시 영향 컴포넌트를 함께 수정해 죽은 props를 남기지 않는다.
클라이언트 전용 API 사용 파일에는 `'use client'`를 명시한다.
번역 키를 추가/변경하면 ko/en 양쪽 매핑 누락을 금지한다.
