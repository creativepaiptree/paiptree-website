---
title: 개발 문서 작성 가이드
author: ZORO
last_updated: 26.02.11
---

# 개발 문서 작성 가이드

## 1. 목적
- 대시보드/컴포넌트 변경사항을 동일한 구조로 기록한다.
- 신규 작성자도 같은 품질로 문서를 작성할 수 있게 한다.
- 코드 변경과 문서 변경의 싱크를 유지한다.

## 2. 문서 분류
- `docs/admin/`: 자동 생성 허브 문서(수동 수정 금지)
- `docs/pages/`: 라우트 페이지 운영 문서
- `docs/components/`: 컴포넌트 설계/로직 문서
- `docs/guides/`: 작성 규칙, 운영 절차
- `docs/old/`: 아카이브 문서(레거시 유지, 신규 작성 금지)
- `docs/templates/`: 문서 템플릿

## 3. 파일명 규칙
- 페이지 문서: `route-name.page.md` (예: `about.page.md`, `home.page.md`)
- 컴포넌트 문서: `ComponentName.blueprint.md` 또는 `component-name.md`
- 가이드 문서: `kebab-case.md`
- 템플릿 문서: `*.template.md`

## 4. 문서 메타데이터 규칙
- 모든 문서는 최상단에 frontmatter를 넣는다.
- 필수 키: `title`, `author`, `last_updated`
- 날짜 포맷: `YY.MM.DD`
- 개발문서 모달은 이 값을 읽어 `변경일 · 작성자`를 표시한다.

```yaml
---
title: ForecastMatrix 설계 문서
author: ZORO
last_updated: 26.02.06
---
```

## 5. 필수 섹션
- `1. 문서 정보`
- `2. 목적`
- `3. 화면/기능 구성`
- `4. 핵심 로직`
- `5. 데이터 모델`
- `6. 인터랙션 규칙`
- `7. 예외/에러 처리`
- `8. QA 체크리스트`

## 6. 작성 원칙
- 구현 파일 경로를 명시한다.
- 추상 설명보다 현재 코드 기준 동작을 우선 기록한다.
- 숫자 기준(임계값, 인덱스, 포맷)은 반드시 값으로 남긴다.
- 다국어가 있으면 `KO/EN` 표기 기준을 같이 적는다.

## 7. 변경 절차
1. 기능 변경 전: 영향 컴포넌트 문서 확인
2. 기능 변경 후: 문서의 로직/값/상태 섹션 업데이트
3. 리뷰 시: 코드 diff와 문서 diff를 함께 확인
4. 페이지 추가/수정 시 `npm run docs:sync`로 페이지 문서 및 허브를 동기화
5. 더 이상 운영하지 않는 문서는 `docs/old/`로 이동하고, 활성 인덱스에는 링크만 남긴다

## 8. 리뷰 체크포인트
- 코드와 문서의 상수/임계값이 일치하는가
- UI 설명이 실제 노출 순서와 동일한가
- 예외 케이스(미도래, 분석중, 에러)가 포함됐는가
- QA 체크리스트로 수동 검증이 가능한가

## 9. 자동화 명령
- `npm run docs:sync`
  - `src/app/**/page.tsx` 기준 페이지 문서 누락 자동 생성 및 `docs/admin/README.md` 갱신
  - 페이지 파일이 문서보다 최신이면 해당 페이지 문서의 `last_updated` 자동 갱신
- `npm run docs:validate`
  - frontmatter/링크/페이지 문서 대응 관계 검사

## 10. Codex 요청 문구 표준
- `document-authoring.md 기준으로 개발문서 작성`
- `component-spec.template.md 템플릿으로 초안 생성`
- `기존 문서와 코드 차이만 업데이트`
