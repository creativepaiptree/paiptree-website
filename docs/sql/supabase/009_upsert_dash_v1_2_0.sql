-- ============================================================
-- dash · v1.2.0 · 2026-03-07
-- 디자인 시스템 문서 파일명 변경 및 개발문서 모달 연결
-- ============================================================

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
  'dash',
  '1.2.0',
  '2026-03-07',
  '[
    {
      "titleKo": "디자인 시스템 문서 파일명 변경 및 버전 명칭 체계화",
      "titleEn": "Design System Doc Renamed and Version Nomenclature Standardized",
      "detailsKo": [
        "`docs/poc-design-system.md` 파일을 `docs/3.0-design-system.md`로 git mv 처리해 버전 명칭이 파일명에 직접 반영되도록 변경",
        "디자인 시스템 문서가 특정 페이지(PoC)에 종속되지 않고 프로젝트 전체 내부 도구 UI 기준 문서임을 파일명으로 명확히 표현",
        "파일명 변경으로 인한 잔여 참조를 전수 검사(Grep)해 미반영 링크가 없음을 확인"
      ],
      "detailsEn": [
        "Renamed `docs/poc-design-system.md` to `docs/3.0-design-system.md` via git mv so the versioned name is reflected directly in the filename.",
        "Clarified that the design system doc governs all internal tool UIs project-wide, not only the PoC page.",
        "Verified no dangling references remained after the rename with a full Grep scan."
      ]
    },
    {
      "titleKo": "개발문서 인덱스 및 운영 허브에 3.0 디자인 시스템 링크 추가",
      "titleEn": "Linked 3.0 Design System in Docs Index and Admin Hub",
      "detailsKo": [
        "`docs/README.md` §2(문서 구조)에 `docs/3.0-design-system.md` 항목을 추가하고 용도(색상 토큰·레이아웃 패턴·컴포넌트 레시피)를 한 줄로 기술",
        "`docs/README.md` §3(핵심 문서)에 `디자인 시스템` 소섹션을 신설하고 파일 링크와 설명을 추가해 개발문서 진입 경로에서 바로 접근 가능하도록 연결",
        "`docs/admin/README.md` §6(최근 수정 문서) 목록에서 `poc-design-system.md` 참조를 `3.0-design-system.md`로 교체해 허브 문서와 실제 파일명 일치"
      ],
      "detailsEn": [
        "Added `docs/3.0-design-system.md` entry to §2 of `docs/README.md` with a one-line description of its purpose (color tokens, layout patterns, component recipes).",
        "Created a new `Design System` subsection in §3 of `docs/README.md` with a direct link, making the file reachable from the primary docs entry point.",
        "Updated the recent-files list in `docs/admin/README.md` §6 to replace the old `poc-design-system.md` reference with `3.0-design-system.md`."
      ]
    },
    {
      "titleKo": "PoC 개발문서 모달에 3.0 디자인 시스템 버튼 추가",
      "titleEn": "Added 3.0 Design System Button to PoC Dev Docs Modal",
      "detailsKo": [
        "`src/app/PoC/sections/Navbar.tsx`의 `SystemDocKey` 유니온 타입에 `design` 키를 추가",
        "`SYSTEM_DOC_BUTTONS` 배열에 `{ key: design, path: docs/3.0-design-system.md, labelKo: 3.0 디자인 시스템, labelEn: Design System 3.0 }` 항목을 컴포넌트 템플릿 버튼 바로 다음에 삽입",
        "모달 상단 버튼 탭에서 3.0 디자인 시스템 버튼 클릭 시 우측 뷰어에 문서 전문이 표시되고 수정(Edit) 버튼으로 로컬 에디터 직접 열기 가능"
      ],
      "detailsEn": [
        "Added `design` to the `SystemDocKey` union type in `src/app/PoC/sections/Navbar.tsx`.",
        "Inserted `{ key: design, path: docs/3.0-design-system.md, labelKo: 3.0 디자인 시스템, labelEn: Design System 3.0 }` into `SYSTEM_DOC_BUTTONS` immediately after the component-spec template entry.",
        "Clicking the button in the modal top tabs displays the full document in the right viewer with an Edit shortcut to open the local file in an external editor."
      ]
    },
    {
      "titleKo": "dash 개발문서 모달에도 3.0 디자인 시스템 버튼 동기화",
      "titleEn": "Synced 3.0 Design System Button to dash Dev Docs Modal",
      "detailsKo": [
        "`src/app/dash/page.tsx`의 `SYSTEM_DOC_BUTTONS`는 PoC Navbar와 독립 사본으로 관리되고 있어 동일 항목이 반영되지 않은 상태였음을 확인",
        "PoC와 동일하게 `{ key: design, path: docs/3.0-design-system.md, label: 3.0 디자인 시스템 }` 항목을 추가해 두 시스템에서 동일 버튼 구성을 유지",
        "백엔드 `/api/dev-docs`가 공유되므로 문서 내용은 동일하며, 상단 버튼 목록만 각 파일에서 독립 관리되는 구조임을 문서화"
      ],
      "detailsEn": [
        "Identified that `SYSTEM_DOC_BUTTONS` in `src/app/dash/page.tsx` is maintained as an independent copy from the PoC Navbar, causing the new button to be missing.",
        "Added the same `{ key: design, path: docs/3.0-design-system.md, label: 3.0 Design System }` entry to keep button parity between both systems.",
        "Documented that `/api/dev-docs` is shared, so document content is identical; only the top button list is managed independently per page."
      ]
    }
  ]'::jsonb,
  '{}'::jsonb,
  true
)
on conflict (project_id, version)
do update set
  released_on = excluded.released_on,
  items       = excluded.items,
  meta        = excluded.meta,
  is_public   = excluded.is_public,
  updated_at  = now();

commit;
