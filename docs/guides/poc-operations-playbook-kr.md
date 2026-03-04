---
title: PoC 페이지 운영형 템플릿 가이드
author: ZORO
last_updated: 26.03.06
---

# PoC 페이지 운영형 템플릿 가이드(비개발자용)

이 문서는 `/PoC`에서 적용한 방식(카카오워크 Block Kit 스타일 + 정책 기반)을
다음 페이지에도 **같은 방식으로 재사용**할 수 있게 만든 운영 가이드입니다.

목표는 두 가지입니다.

- 처음 만들 때 헤매지 않기
- 만든 뒤에도 매번 같은 기준으로 운영/점검해서 정합성 유지하기

---

## 0. 핵심 원칙(3줄)

1. 먼저 화면을 “무엇이 어디에 들어가는 블록인지” 먼저 정한다.
2. 각 블록마다 정책(규칙)을 먼저 만든다.
3. 구현 → 스토리북 상태 스냅샷 → 문서/체크리스트 순으로 항상 같은 순서를 따른다.

---

## 1. 폴더/파일 구조 템플릿 (복붙해서 그대로 사용)

```
src/app/PoC/
  ├─ blocks/
  │  ├─ poc-block-policy.ts          # 블록 규칙(정책) 정의
  │  ├─ poc-block-catalog.tsx        # 블록 조립 규칙
  │  └─ PoCBlockShell.tsx            # 블록 라벨/메타 래퍼
  ├─ sections/                      # 실제 렌더링 컴포넌트(기능 본체)
  ├─ components/trace/TracePanel.tsx # 패널/오버레이 공통
  ├─ stories/                       # Storybook 스토리
  │  ├─ PoCPage.stories.tsx
  │  ├─ PoCBlockShell.stories.tsx
  │  └─ (블록별/패널별 stories)
  ├─ page.tsx                       # 페이지 조립 진입점
  └─ sample-...                     # 샘플 데이터/피스로 사용

.storybook/
  ├─ main.js
  └─ preview.js

docs/
  ├─ guides/
  │  ├─ poc-blockkit-kakao-style-guide.md
  │  └─ poc-operations-playbook-kr.md (이 문서)
  └─ pages/
     └─ poc.page.md
```

---

## 2. 왜 이 방식인지 (비개발자 관점)

- 페이지를 일단 “블록” 단위로 나누면, 누가 보아도 어디가 어디인지 직관적입니다.
- 블록이 바뀌어도 정책만 보면 의사결정이 가능합니다. 즉, UI와 규칙을 분리해서 관리합니다.
- 스토리북은 “화면을 찍은 증빙”입니다. 개발자 없이도 팀원이 상태별로 눈으로 검증 가능합니다.
- 상태(`default / loading / empty / error`)를 분리하면, 운영 중 이슈 대응이 쉬워집니다.

---

## 3. 진행 순서(항상 이 순서로!)

### 3-1. 블록 정의 (policy 먼저)

1. 파일: `src/app/PoC/blocks/poc-block-policy.ts`
2. 블록 목록을 등록
   - id, 이름, 목적, 필수 입력값, 허용 상태, 금지 패턴, 승인 기준을 적는다.

예시:
- `top-navigation`
- `left-sidebar-alerts`
- `header-overview`
- `forecast-matrix`
- `weight-distribution`
- `right-sidebar-overview`
- `cctv-monitor`

3. 정책은 아래 규칙을 반드시 기재
- `supportedStates`: `default/loading/empty/error` 중 지원하는 것
- `prohibitedPatterns`: 안돼야 할 패턴(중복 배치, 비정상 텍스트, 빠진 상태 등)
- `acceptanceCriteria`: 화면 점검 시 체크 문장

---

### 3-2. 블록 조립(카탈로그)

1. 파일: `src/app/PoC/blocks/poc-block-catalog.tsx`
2. “어떤 블록을 어떤 영역에 넣을지” 선언
3. 페이지는 반드시 카탈로그를 순회해서 렌더링

검증 포인트:
- `top`, `left`, `center`, `right`, `bottom` 영역이 누락되지 않았는지
- 각 블록이 `buildBlock` 유틸로 감싸지는지
- 필요한 props(언어/콜백/데이터)가 정책의 requiredFields와 맞는지

---

### 3-3. 블록 래퍼 붙이기

1. 파일: `src/app/PoC/blocks/PoCBlockShell.tsx`
2. 각 블록 렌더를 정책 id 기준 section으로 감싸기
3. HTML 검수/운영 시 추적이 쉬워짐

검증 포인트:
- `id="poc-block-블록ID"`가 남아 있는지
- `data-poc-block` 값이 있는지
- 정책 이름이 화면 접근성 레이블에 반영되는지

---

### 3-4. 페이지 본체 조립

1. 파일: `src/app/PoC/page.tsx`
2. `buildPocBlockCatalog` 결과를 map으로 렌더
3. 상태는 “페이지 기준”에서 관리, 블록 상태는 props로 전달

검증 포인트:
- 페이지가 블록을 직접 조립하지 않고 카탈로그만 순회하는 구조인지
- 공통 오버레이(예: `TracePanel`)가 한 곳에서만 제어되는지

---

### 3-5. 컴포넌트(섹션) 상태 인터페이스 고정

각 핵심 컴포넌트에 아래 상태 props를 표준화한다.

- `state?: 'default' | 'loading' | 'empty' | 'error'`
- 상태별 메시지 표시를 컴포넌트 내부에서 처리
- 실제 데이터 실패시 `error` 문구를 노출
- 데이터 없음은 `empty` 문구를 노출

권장:
- CCTV: `loading/empty/error`에서 각 화면 영역(라이브, 아카이브) 별 상태를 보이게
- TracePanel: 패널 전체를 상태별로 스켈레톤/빈상태/에러로 분리

---

## 4. Storybook 등록 규칙(가장 중요)

### 4-1. 기본 원칙

- 모든 블록/핵심 오버레이는 스토리북에 올라가야 함
- 상태별 스냅샷(`loading`, `empty`, `error`)은 별도 story로 분리
- `Default`는 기본 동작, 나머지는 정책 검증용

### 4-2. 필수 파일

- 스토리 엔트리: `src/app/PoC/stories/*.stories.tsx`
- 공통 샘플 데이터: `src/app/PoC/stories/poc-story-fixtures.ts`
- 스토리북 설정: `.storybook/main.js`, `.storybook/preview.js`
- 실행 스크립트: `package.json`(`storybook`, `build-storybook`)

### 4-3. 각 story 템플릿(복붙 규칙)

```tsx
// 1) 스토리 기본 뼈대
const renderX = (args: { lang: 'ko' | 'en'; state: 'default' | 'loading' | 'empty' | 'error' }) => (
  <div className="p-2">
    <TargetComponent {...args} />
  </div>
);

export const Default = { render: renderX };
export const Loading = { args: { state: 'loading' }, render: renderX };
export const Empty = { args: { state: 'empty' }, render: renderX };
export const Error = { args: { state: 'error' }, render: renderX };
```

### 4-4. 정책 기준 story 문서화 규칙

`PolicyReference` story를 넣어
- 정책 ID
- 어떤 규칙을 검증하는지
- 어떤 상태를 체크하는지
를 한 곳에 설명해 둔다.

---

## 5. 문서화 루틴(운영형)

### 5-1. 페이지 운영 문서 업데이트 (`docs/pages/poc.page.md`)

항상 아래 6개를 넣는다.
1. 구성 블록 목록
2. 페이지 상태 목록
3. 주요 인터랙션 규칙
4. 스토리북 경로
5. 운영 체크리스트
6. 최종 정책 반영 여부

### 5-2. 가이드 문서 업데이트 (`docs/guides/poc-blockkit-kakao-style-guide.md`)

항목 추가:
- 새 블록/새 컴포넌트 설명
- Storybook 체크 포인트
- 상태 스냅샷 기준 항목(`default/loading/empty/error`)

---

## 6. 팀 기준 QA 체크리스트 (매 배포 전 필수)

- [ ] 블록 정책 파일에 새/변경 블록 id와 이름이 반영되었는가?
- [ ] `buildPocBlockCatalog`에 영역 매핑이 반영되었는가?
- [ ] storybook에서 블록 스냅샷 스토리가 다 뜨는가?
- [ ] `loading` 상태에서 스피너/로딩 문구가 보이는가?
- [ ] `empty` 상태에서 “데이터 없음” 문구가 정확한가?
- [ ] `error` 상태에서 재시도/문구가 정확한가?
- [ ] 언어(`ko/en`) 토글 시 텍스트가 모두 반영되는가?
- [ ] policy 문서(acceptanceCriteria)와 실제 UI가 일치하는가?
- [ ] 문서(`docs/pages/...`, `docs/guides/...`)가 최신인지?

---

## 7. 운영 프로세스(반복)

한 번 만든 뒤도 다음을 반복하면 정합성 유지가 됩니다.

1. 변경 요청 수집
2. 정책 미반영 항목 확인
3. 컴포넌트 변경
4. 동일한 스토리 상태 3개(`loading/empty/error`) 갱신
5. 문서 2곳 업데이트
6. QA 체크리스트 통과

---

## 8. 실제 실행 명령 모음

- 스토리북 실행
  - `npm run storybook`
- 스토리북 빌드
  - `npm run build-storybook`
- 문서 확인
  - `docs/pages/poc.page.md`
  - `docs/guides/poc-blockkit-kakao-style-guide.md`
  - `docs/guides/poc-operations-playbook-kr.md` (이 문서)

---

## 9. 빠른 시작 체크리스트 (새 페이지 복붙용)

- [ ] `blocks/poc-block-policy.ts`에 블록 정책 생성
- [ ] `blocks/poc-block-catalog.tsx`에 영역 배치
- [ ] `page.tsx`에서 카탈로그 기반 렌더링 적용
- [ ] 각 섹션에 `state` 프로퍼티 추가
- [ ] CCTV/TracePanel 같은 패널/오버레이 스토리 추가
- [ ] `loading/empty/error` 스냅샷 스토리 3개 이상 생성
- [ ] 문서 2개 업데이트
- [ ] 배포 전 QA 체크리스트 완료

이 문서는 다음 페이지를 만들 때 이대로 복붙해서 사용하세요.
작업을 시작할 때마다 “1~9번” 순서만 지키면, 누락 없이 동일한 품질로 진행할 수 있습니다.
