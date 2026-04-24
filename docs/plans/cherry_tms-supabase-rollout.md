---
title: Cherry TMS Supabase Rollout Plan
author: ZORO
last_updated: 26.04.24
---
# Cherry TMS Supabase Rollout Plan

> **For Hermes:** Use this plan to implement the Supabase-backed Excel → raw → grouping → settlement flow step by step.

**Goal:** Move the Cherrybro TMS grouping/settlement flow onto company Supabase so the Excel source can be imported once and reused by `/cherry_tms/grouping` and downstream pages.

**Architecture:**
Start with a small Supabase-backed wedge instead of reworking the whole TMS stack. Preserve the uploaded Excel file as raw rows, normalize only the fields needed for grouping, and expose a view that matches the current `/grouping` page layout. Keep the shared TMS DB untouched; use a separate company Supabase dataset with service-role access for import jobs and read-only page queries.

**Tech Stack:** Next.js App Router, Supabase/Postgres, SQL migration files, server-side fetch helpers, existing `cherry_tms` route shell.

---

## Execution order

### Task 1: Define the Supabase schema draft
**Objective:** Create a DB model that preserves raw Excel rows and supports grouping/settlement views.

**Files:**
- Create: `docs/sql/supabase/016_cherry_tms_excel_rollout.sql`
- Create/Update: `docs/pages/cherry_tms-grouping.page.md`
- Create/Update: `docs/pages/cherry_tms-intake.page.md`

**Step 1: Write the schema and view draft**
- raw file table
- raw row table
- grouping candidate table
- grouping detail row table
- settlement run table
- settlement detail table
- a view for `/cherry_tms/grouping`

**Step 2: Verify the schema names match the current page vocabulary**
- keep `grouping`, `settlement-register`, `settlement-review`, `claim-docs`
- expose business labels, not internal code names

**Step 3: Mark the docs as actual operational notes**
- replace placeholder text with the real purpose of the pages
- note that the source is the uploaded Excel bundle

---

### Task 2: Import the January Excel sheet into raw storage
**Objective:** Load the uploaded 2026 January sheet into Supabase without losing original values.

**Files:**
- Create: `scripts/cherry-tms/import_cherrybro_excel.py`
- Optional: `scripts/cherry-tms/cherrybro-excel-mapping.json`

**Step 1: Map the 1월 sheet columns**
- 날짜
- 발지
- 착지
- 착지수
- 톤
- 체리청구비용
- 기사지급비용
- 소속
- 외부배송기사
- 내부배송기사
- 비용부담
- 비용귀책
- 특이사항
- 업무구분
- 업무

**Step 2: Preserve raw Excel row metadata**
- source file name
- sheet name
- row number
- raw cell payload
- import timestamp

**Step 3: Normalize the fields needed for grouping**
- work date
- origin
- destination
- driver display
- ton class
- amount fields
- memo/exception tags

---

### Task 3: Add a Supabase-backed read layer for `/cherry_tms/grouping`
**Objective:** Replace the hardcoded grouping sample with data from Supabase.

**Files:**
- Modify: `src/app/cherry_tms/grouping/page.tsx`
- Modify: `src/app/cherry_tms/grouping/_GroupingTable.tsx`
- Create: `src/lib/cherryTmsGroupings.ts`
- Create: `src/app/api/cherry-tms/grouping/route.ts`

**Step 1: Add a server fetch helper**
- read the Supabase view used by the grouping page
- return the page-shaped rows

**Step 2: Swap the page from static rows to fetched rows**
- keep the current layout
- only change the data source

**Step 3: Validate the visible row shape**
- one row = one grouping candidate
- details = raw detail rows attached to that grouping candidate

---

### Task 4: Connect settlement pages in order
**Objective:** Reuse the same Supabase base data for the next pages in the flow.

**Files:**
- Modify: `src/app/cherry_tms/settlement-register/page.tsx`
- Modify: `src/app/cherry_tms/settlement-review/page.tsx`
- Modify: `src/app/cherry_tms/claim-docs/page.tsx`

**Step 1: Align register with the grouping output**
- settlement register should consume grouping-approved rows

**Step 2: Keep review on the settlement layer**
- review should inspect the registered settlement rows, not raw Excel

**Step 3: Keep claim-docs downstream of approved review rows**
- document generation should only follow approved settlement records

---

### Task 5: Verify with lint/build/browser checks
**Objective:** Prove the Supabase-backed flow renders correctly.

**Files:**
- Existing app routes and SQL migration files

**Step 1: Run lint**
- `npm run lint`

**Step 2: Run build**
- `npm run build`

**Step 3: Open the key pages**
- `/cherry_tms/intake`
- `/cherry_tms/grouping`
- `/cherry_tms/settlement-register`
- `/cherry_tms/settlement-review`
- `/cherry_tms/claim-docs`

**Step 4: Check the data match**
- row count
- date range
- amount fields
- exception labels
- grouping order

---

## Notes
- Keep the shared TMS DB untouched.
- Use company Supabase as the operational copy.
- Start with January only, then expand month by month.
- Keep raw rows permanently; do not overwrite them with normalized results.
- Make the grouping page look like the current operational table, not a dashboard.
