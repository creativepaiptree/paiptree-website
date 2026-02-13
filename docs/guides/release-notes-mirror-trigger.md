---
title: "릴리즈 노트 미러 트리거 운영"
author: ZORO
last_updated: 26.02.13
---

# 릴리즈 노트 미러 트리거 운영

## 1. 목적
- `paiptree_ds` 어드민 입력을 단일 진입점으로 사용한다.
- 저장 직후 `paiptree-website`의 `src/data/version-notes.json`을 자동 갱신한다.
- Supabase `project_release_notes`를 SoT로 유지한다.

## 2. 동작 흐름
1. `paiptree_ds` 어드민에서 릴리즈 노트를 저장한다.
2. `paiptree_ds` API가 Supabase 업서트 후 웹훅을 호출한다.
3. `paiptree-website` `POST /api/admin/release-mirror-sync`가 Supabase에서 `project_id` 기준 데이터를 다시 읽는다.
4. 정규화/정렬 후 `src/data/version-notes.json`에 반영한다.

## 3. 환경 변수
### `paiptree_ds`
- `RELEASE_MIRROR_WEBHOOK_POC`: `paiptree-website` 웹훅 URL
- `RELEASE_MIRROR_TRIGGER_SECRET`: 웹훅 시크릿
- `RELEASE_MIRROR_TIMEOUT_MS`: 트리거 타임아웃(ms, 선택)

### `paiptree-website`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_PROJECT_ID=poc`
- `SUPABASE_EXPORT_VIEW=project_release_notes_export_v1` (선택)
- `RELEASE_MIRROR_TRIGGER_SECRET`
- `RELEASE_MIRROR_TIMEOUT_MS` (선택)

## 4. 수동 호출 예시
- `curl -sS -X POST "http://localhost:3002/api/admin/release-mirror-sync" -H "Content-Type: application/json" -H "x-release-mirror-secret: $RELEASE_MIRROR_TRIGGER_SECRET" -d '{"projectId":"poc"}'`

## 5. 실패 처리 기준
- `401`: 시크릿 불일치
- `400`: `projectId` 형식 오류
- `502`: Supabase 조회 실패
- `422`: 유효 릴리즈 노트 0건
- `500`: JSON 미러 파일 쓰기 실패
