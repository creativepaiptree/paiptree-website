begin;

insert into public.project_release_notes (
  project_id,
  version,
  released_on,
  items,
  meta,
  is_public
)
values (
  'p_root',
  '4.2.5',
  '2026-02-14',
  '[
    {
      "titleKo": "문서 경로를 docs 단일 구조로 정리",
      "titleEn": "Standardized documentation paths to a docs-only structure",
      "detailsKo": [
        "운영 문서 기준 경로를 `docs/`로 단일화하고 레거시 문서는 `docs/old/`로 분리했습니다.",
        "`public/admin-docs` 기반 잔여 참조를 운영 경로에서 제거해 문서 저장소 혼선을 정리했습니다.",
        "문서 허브/가이드/버전 문구를 현재 구조(`docs/admin/README.md`) 기준으로 재정렬했습니다."
      ],
      "detailsEn": [
        "Unified active documentation under `docs/` and isolated legacy content under `docs/old/`.",
        "Removed remaining `public/admin-docs` references from active operational paths to eliminate storage path ambiguity.",
        "Realigned hub, guide, and release-note wording to the current structure centered on `docs/admin/README.md`."
      ]
    },
    {
      "titleKo": "대화 이력 기반 문서 품질 규칙 추가",
      "titleEn": "Added conversation-driven documentation quality rules",
      "detailsKo": [
        "`document-authoring.md`에 결정/근거/영향/검증 체크리스트를 추가해 반복 실수를 방지하도록 보강했습니다.",
        "`release-notes-db-webhook-trigger.md`에 단일 기준 저장소, 미러 역할, 환경변수 기준, 버전 증가 규칙 FAQ를 추가했습니다.",
        "운영자가 버전/경로/데이터 소스 판단을 동일 기준으로 수행하도록 가드레일을 명문화했습니다."
      ],
      "detailsEn": [
        "Extended `document-authoring.md` with decision, evidence, impact, and validation checklists to prevent repeated mistakes.",
        "Added guardrails and FAQ in `release-notes-db-webhook-trigger.md` for source of truth, mirror behavior, env keys, and version increment rules.",
        "Documented an explicit operating standard so version, path, and data-source decisions stay consistent across updates."
      ]
    }
  ]'::jsonb,
  '{"source":"manual_sql","scope":"p_root","approved_date":"2026-02-14"}'::jsonb,
  true
)
on conflict (project_id, version)
do update set
  released_on = excluded.released_on,
  items = excluded.items,
  meta = excluded.meta,
  is_public = excluded.is_public,
  updated_at = now();

commit;
