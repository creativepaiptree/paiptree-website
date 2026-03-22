---
title: 문서 아카이브 인덱스
author: ZORO
last_updated: 26.03.20
---

# 문서 아카이브 인덱스

## 1. 목적
- 현재 운영 문서에서 제외한 레거시 문서를 보관한다.
- 삭제 대신 이력 보존이 필요한 문서만 유지한다.
- 활성 기준 문서와 혼동되지 않도록 아카이브 위치를 명시한다.

## 2. 운영 규칙
- `docs/old/**` 문서는 기본적으로 신규 작성/수정 대상이 아니다.
- `docs/guides/old/**`는 이전 스타일 단계 가이드 아카이브다.
- `docs/pages/무제 폴더/**`는 이전 페이지 문서 아카이브다.
- 활성 문서는 `docs/pages`, `docs/admin`, `docs/guides` root 문서를 우선 사용한다.
- 레거시 문서를 재활성화할 때만 운영 영역으로 복원한다.

## 3. 현재 아카이브
- guide 아카이브: `docs/guides/old/**/*.md`
- page 아카이브: `docs/pages/무제 폴더/**/*.page.md`
- legacy 아카이브: `docs/old/**/*.md`

대표 문서:
- `docs/old/components/CCTVMonitor.blueprint.md`
- `docs/old/components/ForecastMatrix.blueprint.md`
- `docs/old/components/WeightDistribution.blueprint.md`
- `docs/old/components/versionmodal.md`
