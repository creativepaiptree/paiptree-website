---
title: 문서 운영 표준
author: ZORO
last_updated: 26.05.09
status: active
---

# 문서 운영 표준

## 1. 원칙
- repo 문서는 개발과 운영의 실행 기준이다.
- Obsidian vault는 장문 배경지식, 회고, 사고 과정, 외부 맥락을 보관한다.
- Company 에이전트는 repo 문서를 직접 추측해서 읽는 것이 아니라 export feed를 통해 현재 기준을 받는다.
- 코드 동작이 바뀌면 같은 턴에 관련 repo 문서를 갱신한다.
- 서비스 구현/운영 검수 중 새로 확정된 원칙, 판정 기준, 금지사항, 예외 처리는 관련 서비스 문서에 누적한다.
- 문서는 결과 화면 설명만 남기지 않고, 왜 그렇게 판정하는지에 대한 운영 기준을 함께 남긴다.
- 새 원칙이 기존 문서와 중복되면 하나의 기준으로 통합하고, 상충되면 임의로 결정하지 않고 사용자에게 선택지를 제시해 확정받는다.
- 오래되었거나 실제 코드와 맞는지 확인되지 않은 문서는 `needs-review` 또는 `archive`로 분리한다.

## 2. 문서 상태
- `active`: 현재 작업 기준으로 사용한다.
- `needs-review`: 실제 코드와 대조 전까지 확정 기준으로 사용하지 않는다.
- `archive`: 이력 보관용이다.
- `external-context`: Hermes, Kiro, Obsidian 등 외부 맥락 문서다.
- `generated`: 자동 생성 문서다.
- `template`: 새 문서 작성용 양식이다.

## 3. 기본 위치
- `docs/pages/*.page.md`: 실제 `src/app/**/page.tsx`에 대응하는 page 운영 문서.
- `docs/company/README.md`: Company 원천 문서가 이 repo 밖의 `/Users/zoro/company-ops/company/source-of-truth/`에 있음을 안내하는 포인터.
- `/Users/zoro/company-ops/company/source-of-truth/**`: Hermes company가 회사 서비스 판단의 원천으로 우선 참조하는 문서.
- `/Users/zoro/company-ops/company/source-of-truth/farm-ops/**`: farm 운영시스템을 사이트 없이 이해하기 위한 루트 지도, 페이지 카드, 전수조사, API, 테이블, 민감필드, write-risk, raw-log 매핑 문서 묶음.
- `docs/services/**`: 서비스 단위 운영/데이터/로드맵 문서의 목표 위치.
- `docs/plans/**`: 진행 중이거나 완료된 작업 계획.
- `docs/standards/**`: 문서, 에이전트, 운영 방식의 기준 문서.
- `docs/templates/**`: 새 문서 작성 템플릿.
- `docs/archive/**`: 정리 후 이동할 과거 문서의 목표 위치.

## 4. 자동 감사
- 전체 문서 전수조사는 `scripts/docs-audit.mjs`로 수행한다.
- 감사 결과에서 route page 문서 누락, 템플릿 잔재, 깨진 참조, frontmatter 누락을 확인한다.
- `needs-review` 문서는 실제 코드와 비교한 뒤에만 `active`로 승격한다.

실행 명령:
- `node scripts/docs-audit.mjs`

## 5. Company/Obsidian 피드
- 현재 repo에는 Obsidian vault 또는 Company 에이전트로 자동 동기화되는 기존 연결이 없다.
- 대신 `scripts/docs-agent-feed.mjs`가 repo 문서를 Company/Obsidian이 먹을 수 있는 형태로 export한다.
- 기본 생성 위치는 `.company-feed/company-docs`이며, 이 경로는 git에 커밋하지 않는다.
- 실제 Obsidian vault에 넣을 때는 `--vault` 옵션으로 vault 안의 대상 폴더를 지정한다.

기본 export:
- `node scripts/docs-agent-feed.mjs`

Obsidian 노트 포함 export:
- `node scripts/docs-agent-feed.mjs --out /private/tmp/paiptree-company-feed --obsidian`

특정 서비스만 export:
- `node scripts/docs-agent-feed.mjs --service cctvup --out /private/tmp/cctvup-company-feed --obsidian`
- `node scripts/docs-agent-feed.mjs --service farm-ops --out /private/tmp/farm-ops-company-feed --obsidian`
  - `farm-ops` source-of-truth는 company-ops로 이동했으므로, 이 repo에서 실행하면 구현 문서만 export된다.

Obsidian vault로 직접 export:
- `node scripts/docs-agent-feed.mjs --vault /절대경로/ObsidianVault/PaiptreeDocs`

## 6. Company 에이전트 섭취 순서
1. `company-agent-brief.md`를 먼저 읽힌다.
2. `manifest.json`으로 전체 문서 목록과 상태를 확인시킨다.
3. `company-agent-feed.jsonl`을 본문 지식으로 먹인다.
4. Obsidian에서 사람이 읽거나 링크할 때는 `obsidian-notes/**`를 사용한다.

## 7. 주의사항
- `archive` 문서를 현재 기준으로 사용하지 않는다.
- `needs-review` 문서를 Company가 확정 사실처럼 답하게 두지 않는다.
- 원본 코드와 비교되지 않은 장문 배경지식은 repo 기준 문서로 승격하지 않는다.
- export 산출물은 생성물이며 repo에 커밋하지 않는다.
- 민감 raw 값이 포함된 CSV/JSON/MD는 `docs/**`에 저장하지 않는다. 필요한 경우 `*.sensitive.json` 암호화 bundle로 `/Users/zoro/company-ops/.hermes-sensitive/**` 또는 별도 암호화 볼륨에만 둔다.
- 민감 bundle 복호화는 사용자에게 경고와 목적/범위를 보고하고 명시 승인을 받은 뒤에만 진행한다.
