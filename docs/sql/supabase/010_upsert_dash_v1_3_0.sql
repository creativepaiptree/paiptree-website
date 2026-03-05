-- ============================================================
-- dash · v1.3.0 · 2026-03-07
-- GitLab 기반 Service Architecture 전면 개편
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
  '1.3.0',
  '2026-03-07',
  '[
    {
      "titleKo": "GitLab 내부 서버 분석을 통한 실제 서비스 구조 검증",
      "titleEn": "Service Structure Verified Against Internal GitLab Repository",
      "detailsKo": [
        "gitlab-analysis-report.md 기반으로 플랫폼 전체 75개 리포지토리를 platform/service · core · proxy · affiliates · web · etc · temp · notused 8개 그룹으로 분류 확인",
        "운영 중인 서비스: fms.farmers-mind.com (FMS/FMS-back, Vue3+Spring Boot), farm.paiptree.com:9000 (managerweb/managerback), API Gateway (172.31.55.157:8100), farmDiaryManager (172.31.55.157:8200)",
        "개발 중: TMS/TMS-back (Nuxt3+Spring Boot, 156커밋), platform/temp의 newWeightModule2 · newWeightAnalysis2 · newWeightFcrLogic (AI 체중예측 신규 모듈)",
        "미사용(notused): farmers-mind · FM-mobile · FM-back — 과거 Core-Engine 역할을 했던 프로젝트들로 현재 비활성 상태 확인",
        "계획 단계: VMS-back · VMS-service 리포 존재하나 커밋 없음. enterprise-management-system-frontend 빈 리포 확인",
        "인프라: MariaDB(172.31.33.100:6241/fms) · Redis · AWS S3(파일) · NVR(nvrManager) · NAS(nasTransfer) 구성 확인",
        "이 분석 결과를 바탕으로 기존 다이어그램과 실제 구조의 차이를 식별하고 전면 개편 계획 수립"
      ],
      "detailsEn": [
        "Classified all 75 platform repositories into 8 groups (service, core, proxy, affiliates, web, etc, temp, notused) based on gitlab-analysis-report.md.",
        "Confirmed live services: fms.farmers-mind.com (FMS/FMS-back, Vue3+Spring Boot), farm.paiptree.com:9000 (managerweb/managerback), API Gateway (:8100), farmDiaryManager (:8200).",
        "Confirmed in-development: TMS/TMS-back (Nuxt3+Spring Boot, 156 commits), platform/temp weight modules (newWeightModule2, newWeightAnalysis2, newWeightFcrLogic).",
        "Confirmed inactive (notused): farmers-mind, FM-mobile, FM-back — previously the Core-Engine, now decommissioned.",
        "Confirmed planned: VMS-back/VMS-service repos exist with no commits. enterprise-management-system-frontend is an empty repo.",
        "Confirmed infra stack: MariaDB, Redis, AWS S3, NVR (nvrManager), NAS (nasTransfer).",
        "Used findings to identify gaps between the existing diagram and the actual structure, then planned a full diagram overhaul."
      ]
    },
    {
      "titleKo": "Service Architecture 레이어 및 노드 명칭 체계 전면 개편",
      "titleEn": "Full Rename of Architecture Layer and Node Labels",
      "detailsKo": [
        "ArchLayer 타입에서 frontend 키를 service로 변경하고, SVG 레이어 밴드 라벨 FRONTEND → SERVICE로 교체",
        "서비스 노드 명칭을 Farmers-Mind 제품 브랜드 체계에 맞춰 EMS → Farmers-Mind_ems, AI App → Farmers-Mind_ai, TMS → Farmers-Mind_tms로 변경",
        "코어 단일 노드 이름을 Farmers-Mind → Core-Engine으로 변경하고, 레이어 밴드 라벨도 CORE ENGINE → AI CORE로 교체",
        "모든 connects 배열의 Farmers-Mind 참조를 Core-Engine으로 일괄 업데이트",
        "SVG 하단 범례 및 다이어그램 하단 푸터 텍스트(Farmers-Mind Platform → Core-Engine Platform)도 동기화"
      ],
      "detailsEn": [
        "Renamed the ArchLayer type key from frontend to service and updated the SVG layer band label from FRONTEND to SERVICE.",
        "Renamed service nodes to follow the Farmers-Mind product brand: EMS → Farmers-Mind_ems, AI App → Farmers-Mind_ai, TMS → Farmers-Mind_tms.",
        "Renamed the single core node from Farmers-Mind to Core-Engine, and updated the layer band label from CORE ENGINE to AI CORE.",
        "Batch-updated all connects arrays to reference Core-Engine instead of Farmers-Mind.",
        "Synchronized SVG legend entries and footer text (Farmers-Mind Platform → Core-Engine Platform)."
      ]
    },
    {
      "titleKo": "GitLab 구조 기반 4레이어 아키텍처 확장 및 노드 세분화",
      "titleEn": "Expanded to 4-Layer Architecture with Fine-Grained Nodes Based on GitLab Structure",
      "detailsKo": [
        "기존 3레이어(SERVICE / AI CORE / BACKEND)에서 4레이어로 확장. 최상단에 FARM EDGE 레이어(주황 테두리 밴드)를 신설해 데이터 원점을 명시",
        "FARM EDGE: Farm Sensor(sensorCollector · fileCollector, 체중계·환경센서, LIVE)와 CCTV / Camera(cctvManager · imageTransfer, LIVE) 2개 노드 추가. CCTV는 우측 외곽 우회 경로로 NVR/NAS에 직접 연결",
        "SERVICE: Farmers-Mind_vms(VMS-back · VMS-service, 영상관제, PLANNED) 노드 추가로 4노드 체계 완성. 기존 3노드(cx 220·450·680)를 4노드 균등 배치(cx 134·345·556·767)로 재조정",
        "AI CORE: 단일 Core-Engine을 Data Collection(sensorCollector · fileCollector · dataConsumer · dataStatistic · farmDiaryManager · eventEngine, LIVE) · AI / ML Engine(dataAnalysis · newWeightModule2, DEV) · API Gateway(172.31.55.157:8100, LIVE) 3개 독립 노드로 분리. 수평 연결선(파란색)으로 데이터 흐름 표현",
        "BACKEND: 단일 Database를 MariaDB(172.31.33.100:6241/fms, LIVE) · Redis(세션 캐시, LIVE) · AWS S3(파일 저장소, LIVE) · NVR/NAS(nvrManager · nasTransfer, LIVE) 4개 노드로 세분화",
        "연결선 색상 체계화: FARM EDGE → Core 연결은 주황(arr-edge), Core 수평 연결은 파란(arr-core), 일반 레이어간 연결은 회색(arr), PLANNED 연결은 회색 점선(arr-dim)으로 구분",
        "viewBox를 900×460에서 900×482로 확장해 4레이어와 2줄 범례를 수용"
      ],
      "detailsEn": [
        "Expanded from 3 layers (SERVICE / AI CORE / BACKEND) to 4 layers by adding a FARM EDGE layer (orange-bordered band) at the top to represent data origin points.",
        "FARM EDGE: Added Farm Sensor (sensorCollector, fileCollector — scale/env sensor, LIVE) and CCTV / Camera (cctvManager, imageTransfer, LIVE). CCTV routes directly to NVR/NAS via a right-edge bypass path.",
        "SERVICE: Added Farmers-Mind_vms (VMS-back, VMS-service — video control, PLANNED) to complete a 4-node layout. Redistributed 3 nodes (cx 220/450/680) to 4 evenly spaced positions (cx 134/345/556/767).",
        "AI CORE: Split single Core-Engine into 3 independent nodes — Data Collection (LIVE), AI / ML Engine (DEV, newWeightModule2 in platform/temp), API Gateway (LIVE, :8100). Connected horizontally with blue arrows to show data flow.",
        "BACKEND: Split single Database into 4 nodes — MariaDB (172.31.33.100:6241/fms, LIVE), Redis (session cache, LIVE), AWS S3 (file storage, LIVE), NVR/NAS (nvrManager, nasTransfer, LIVE).",
        "Color-coded connection lines: FARM EDGE → Core in orange (arr-edge), Core horizontal in blue (arr-core), standard inter-layer in gray (arr), PLANNED connections in dashed gray (arr-dim).",
        "Expanded viewBox from 900×460 to 900×482 to accommodate 4 layers and a 2-row legend."
      ]
    },
    {
      "titleKo": "노드 개발 상태 배지 시스템 도입 및 Inspector · 범례 개선",
      "titleEn": "Node Status Badge System Introduced with Inspector and Legend Updates",
      "detailsKo": [
        "NodeStatus 유니온 타입(live | dev | inactive | planned)과 STATUS_CFG 상수(label · color 쌍)를 모듈 레벨에 추가",
        "ArchNode 타입에 status 필드를 추가하고 전체 13개 노드에 실제 운영 상태를 반영: LIVE 9개(Farm Sensor, CCTV, Farmers-Mind_ems, Data Collection, API Gateway, MariaDB, Redis, AWS S3, NVR/NAS), DEV 2개(AI/ML Engine, Farmers-Mind_tms), INACTIVE 1개(Farmers-Mind_ai), PLANNED 1개(Farmers-Mind_vms)",
        "SVG 노드 렌더링에서 각 노드 우상단에 7px 폰트의 상태 텍스트(LIVE/DEV/INACTIVE/PLANNED)를 해당 색상으로 표시",
        "PLANNED 상태 노드는 opacity 0.65 + 점선 테두리(strokeDasharray: 4 3)로 미구현임을 시각적으로 명확히 구분",
        "Inspector 사이드 드로어 헤더에서 기존 레이어 배지 옆에 상태 배지를 나란히 추가해 노드 클릭 시 레이어와 상태를 동시에 확인 가능",
        "SVG 하단 범례를 레이어 4종(FARM EDGE · SERVICE · AI CORE · BACKEND)과 상태 4종(LIVE · DEV · INACTIVE · PLANNED) 총 8개 항목으로 확장. 상태는 원형 아이콘 + PLANNED는 점선으로 구분 표시"
      ],
      "detailsEn": [
        "Added NodeStatus union type (live | dev | inactive | planned) and STATUS_CFG constant (label/color pairs) at module level.",
        "Added a status field to ArchNode and assigned real operational statuses to all 13 nodes: LIVE×9 (Farm Sensor, CCTV, Farmers-Mind_ems, Data Collection, API Gateway, MariaDB, Redis, AWS S3, NVR/NAS), DEV×2 (AI/ML Engine, Farmers-Mind_tms), INACTIVE×1 (Farmers-Mind_ai), PLANNED×1 (Farmers-Mind_vms).",
        "Rendered a 7px status label (LIVE/DEV/INACTIVE/PLANNED) in the top-right corner of each SVG node in the corresponding status color.",
        "PLANNED nodes render with opacity 0.65 and a dashed border (strokeDasharray: 4 3) to clearly indicate unimplemented status.",
        "Added a status badge next to the existing layer badge in the Inspector side drawer header so both layer and status are visible at a glance when a node is clicked.",
        "Expanded the SVG legend to 8 items: 4 layer types (FARM EDGE, SERVICE, AI CORE, BACKEND) with colored rectangles, and 4 status types (LIVE, DEV, INACTIVE, PLANNED) with circle icons and a dashed line for PLANNED."
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
