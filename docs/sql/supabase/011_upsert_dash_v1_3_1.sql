-- ============================================================
-- dash · v1.3.1 · 2026-03-06
-- Service Architecture 다이어그램 레이아웃 전면 개편
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
  '1.3.1',
  '2026-03-06',
  '[
    {
      "titleKo": "연결선 직교 라우팅 및 라벨 박스 도입",
      "titleEn": "Orthogonal Connection Routing with Label Boxes",
      "detailsKo": [
        "기존 베지어 곡선(C path) 연결선을 직교 L-path(M→L→L 꺾임)로 전면 교체해 아키텍처 다이어그램 가독성 개선",
        "각 연결선 경로 위에 rect + text 조합의 라벨 박스를 배치해 경로별 역할(센서 수집, API 호출 등)을 명확히 표시",
        "라벨 박스는 lx/ly 좌표로 명시적 위치를 지정하며, stroke 색상·opacity를 연결선과 동기화",
        "Service→APIGW 연결선 4개를 y=244/249/254/259로 스태거링, Backend 연결선 5개를 y=372/379/386/393/400으로 스태거링해 겹침 방지"
      ],
      "detailsEn": [
        "Replaced all bezier curves (C paths) with orthogonal L-paths (M→L→L bends) to improve readability.",
        "Added label boxes (rect + text) on each connection path to clearly indicate link roles.",
        "Label box positions are explicitly set via lx/ly; stroke color and opacity are synchronized with the connection line.",
        "Staggered 4 Service→APIGW lines at y=244/249/254/259 and 5 Backend lines at y=372/379/386/393/400 to prevent overlap."
      ]
    },
    {
      "titleKo": "노드 연결 끝점 면 중앙 고정 원칙 적용",
      "titleEn": "Connection Endpoints Fixed to Node Face Centers",
      "detailsKo": [
        "모든 연결선 시작·끝점을 노드 면(상/하/좌/우)의 기하학적 중앙으로 고정하는 규칙 적용",
        "CCTV/Camera → NVR/NAS를 우측 외곽 우회 경로(x=885)로 변경해 다이어그램 경계를 벗어나던 문제 해결; CCTV 우측 면(748,60) → NVR 상단 면(750,423)",
        "AI CORE 수평 연결(Data Collection→farmDiary→AI/ML→API GW) 좌/우 면 중앙 좌표로 재계산"
      ],
      "detailsEn": [
        "Applied a rule fixing all connection endpoints to the geometric center of the node face (top/bottom/left/right).",
        "Changed CCTV/Camera → NVR/NAS to a right-edge bypass (x=885), fixing the line that previously exited the diagram boundary; exits CCTV right face (748,60), arrives at NVR top face (750,423).",
        "Recalculated AI CORE horizontal connection coordinates to precisely reference each node left/right face center."
      ]
    },
    {
      "titleKo": "레이어 밴드 수직 간격 확대 및 viewBox 조정",
      "titleEn": "Expanded Layer Band Vertical Spacing and viewBox",
      "detailsKo": [
        "4개 레이어 밴드 사이 간격을 40px 균일 간격으로 확대해 연결선·라벨 박스 여백 확보",
        "노드 cy 값 재산정: FARM EDGE 60, SERVICE 189, AI CORE 319, BACKEND 449",
        "viewBox 900×482 → 900×550으로 확장해 하단 범례 클리핑 제거"
      ],
      "detailsEn": [
        "Expanded spacing between all 4 layer bands to a uniform 40px to provide clearance for connection lines and label boxes.",
        "Recalculated node cy values: FARM EDGE 60, SERVICE 189, AI CORE 319, BACKEND 449.",
        "Expanded viewBox from 900×482 to 900×550 to prevent the bottom legend from being clipped."
      ]
    },
    {
      "titleKo": "VMS 노드 상태·위치·Inspector 업데이트",
      "titleEn": "VMS Node Status, Position, and Inspector Updated",
      "detailsKo": [
        "Farmers-Mind_vms 노드 상태 PLANNED → DEV; GitLab 분석으로 VMS-back(Spring Boot, 28커밋)·VMS-service(Quasar/Vue3, 48커밋)가 독립 리포로 개발 중임을 확인",
        "노드 색상 #6e7681(회색) → #f0883e(주황)으로 변경해 DEV 상태 시각 구분",
        "SERVICE 레이어 내 위치 cx 767(우측 끝) → cx 345(EMS와 AI 사이)로 이동",
        "Inspector 내 VMS-back 컨트롤러 상세 추가: /vms/ 토큰 관리, /fms/dash/ 대시보드, /fms/diary/ 다이어리"
      ],
      "detailsEn": [
        "Updated Farmers-Mind_vms status from PLANNED to DEV; GitLab analysis confirmed VMS-back (Spring Boot, 28 commits) and VMS-service (Quasar/Vue3, 48 commits) are in active development.",
        "Changed node color from #6e7681 (gray) to #f0883e (orange) to visually distinguish DEV status.",
        "Moved position in SERVICE layer from cx 767 (far right) to cx 345 (between EMS and AI).",
        "Added VMS-back controller details to Inspector: /vms/ token mgmt, /fms/dash/ dashboard, /fms/diary/ diary."
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
