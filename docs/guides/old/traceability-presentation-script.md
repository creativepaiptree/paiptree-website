---
title: 데이터 추적성 UI 발표 자료
author: ZORO
last_updated: 26.02.11
---

# 데이터 추적성 UI 발표 자료 — 슬라이드 가이드 & 스크립트

> **대상**: 경영진 / 투자자
> **시간**: 약 8분 (5~10분)
> **슬라이드**: 총 8장
> **원칙**: 슬라이드당 핵심 메시지 1문장 + 비주얼 1개

---

## 0. 코드 검증 요약 (발표 전 필독)

이 문서는 아래 실제 구현 파일을 기준으로 수치/용어를 맞춘 버전입니다.

- `src/app/PoC/page.tsx`
- `src/app/PoC/sections/Header.tsx`
- `src/app/PoC/components/trace/TracePanel.tsx`
- `src/app/PoC/sections/CCTVMonitor.tsx`
- `src/types/traceability.ts`

### 꼭 맞춰 말해야 하는 6가지

| 항목 | 발표 시 정답 표현 |
|------|------------------|
| 추정체중 수식 | `0.7×CCTV(1,060g) + 0.3×표준곡선(1,130g) = 1,081g` |
| 추정체중 버전 | `model-2.4.1` (confidence 87%) |
| 히스토리 기본 비교 | `model-2.4.1(1,081g)` vs `model-2.4.0(1,064g)` |
| 히스토리 델타 예시 | `+17g`, `+4.0pp` |
| CCTV 파이프라인 버전 | `vision-pipeline-1.8.0` (CCTV 탭은 `trace_id`가 `cctv:`일 때만 노출) |
| 원본 하이라이트 의미 | 원본 파일 자체를 자동 하이라이트하는 것이 아니라, `highlight_text`/`highlight_anchor` 메타를 제공 |

### 발표 리스크 주의

- 외부 솔루션(Power BI, Palantir)과의 세부 기능 비교는 코드로 검증할 수 없습니다.
- 대외 발표에서는 "내부 기능 기준 비교"로 먼저 설명하고, 경쟁사 비교 수치는 별도 리서치 근거를 붙여야 안전합니다.

### 2분 이해 프레임 (대표/CTO 공통 오프닝)

1. L1: 사용자가 숫자를 본다. (`TraceableValue`, AI/H 배지)
2. L2: 숫자를 클릭하면 추적 패널이 열린다. (`Summary`, `Logic`, `Sources`, `History`)
3. L3: Sources에서 원본 링크와 메타(`highlight_text`, `highlight_anchor`)를 확인한다.
4. 버전 비교: History에서 현재/과거 스냅샷을 바꿔 값·신뢰도·출처 diff를 본다.
5. CCTV 특화: `trace_id`가 `cctv:`면 `Frame/Pipeline/Raw` 탭이 추가된다.

### 기획 정합성 체크표 (발표 전 자가 점검)

| 체크 항목 | 현재 구현 상태 | 확인 파일 |
|-----------|----------------|-----------|
| 핵심 수치가 클릭 가능한가 | Yes (`TraceableValue`로 연결) | `src/app/PoC/sections/Header.tsx`, `src/app/PoC/sections/ForecastMatrix.tsx`, `src/app/PoC/sections/WeightDistribution.tsx`, `src/app/PoC/sections/RightSidebar.tsx` |
| AI/H 출처 배지가 분리 노출되는가 | Yes (`is_ai_generated` 기반) | `src/app/PoC/components/trace/TraceableValue.tsx` |
| 클릭 시 단일 패널로 추적되는가 | Yes (`openTracePanel`) | `src/app/PoC/page.tsx` |
| Sources에서 시점별 출처(current/target/base) 비교가 되는가 | Yes | `src/app/PoC/components/trace/TracePanel.tsx` |
| History에서 값/신뢰도/출처 diff가 보이는가 | Yes | `src/app/PoC/components/trace/TracePanel.tsx` |
| CCTV 전용 탭이 조건부 노출되는가 | Yes (`trace_id` prefix = `cctv:`) | `src/app/PoC/components/trace/TracePanel.tsx` |
| 원본 링크와 근거 메타를 함께 보여주는가 | Yes (`url`, `highlight_text`, `highlight_anchor`) | `src/types/traceability.ts`, `src/app/PoC/components/trace/TracePanel.tsx` |
| 실시간/실데이터 API가 붙어있는가 | No (현재 mock/fake async) | `src/app/PoC/sections/CCTVMonitor.tsx`, 각 섹션 inline trace payload |

---

## Page 1. 표지 (30초)

### 레이아웃
- **중앙 정렬**
- 제목: **"모든 숫자에 출처를 — 데이터 추적성 UI"**
- 부제: PAIP AI Livestock PoC
- 하단: 날짜 · 발표자명
- 배경: 어두운 톤 (#0A0F14) + PAIP 로고 워터마크

### 스피커 노트
> 안녕하세요. 오늘은 저희 PAIP AI Livestock PoC에 구현한 '데이터 추적성 UI'를 소개드리겠습니다. AI가 만들어내는 수치를 경영진이 신뢰하려면, 그 숫자의 출처와 근거를 즉시 확인할 수 있어야 합니다. 오늘 그 방법을 보여드리겠습니다.

---

## Page 2. 문제 정의 (1분)

### 핵심 메시지
> **"대시보드의 숫자, 믿을 수 있습니까?"**

### 레이아웃
- 상단: 핵심 메시지 대문자 강조
- 중앙: 3개 문제점 카드 (아이콘 + 텍스트)
- 배경: 일반적인 대시보드 스크린샷에 "?" 마크 오버레이

### 콜아웃 텍스트

| # | 문제 | 설명 |
|---|------|------|
| 1 | AI vs 사람 구분 불가 | 이 값이 AI가 추정한 건지, 사람이 입력한 건지 알 수 없다 |
| 2 | 출처 추적 불가 | "이 82%는 어디서 왔나?" → 담당자에게 물어봐야 답을 얻는다 |
| 3 | 변경 이력 부재 | 과거 값이 바뀌었는데 왜 바뀌었는지 추적할 수 없다 |

### 비주얼 가이드
- 일반 대시보드(경쟁 제품 또는 일반적 BI 화면) 캡처
- 각 숫자 위에 빨간 "?" 원형 마크 3개 배치
- 흐릿한 처리(blur)로 "불투명한 데이터" 느낌 강조

### 스피커 노트
> 현재 대부분의 축산 대시보드는 이렇게 생겼습니다. 숫자는 보이지만, 이 숫자가 어디서 온 건지 알 수 없습니다.
>
> 세 가지 문제가 있습니다.
>
> 첫째, AI가 만든 값인지 사람이 입력한 값인지 구분이 안 됩니다. 둘째, "이 생존율 82%는 어디서 왔나?"라고 물으면 담당자를 찾아가 물어봐야 합니다. 셋째, 이전 버전 1,064g이 현재 1,081g으로 바뀌었는데, 왜 바뀌었는지 이력이 없습니다.
>
> 저희는 이 세 가지를 한 번에 해결했습니다.

---

## Page 3. 해결 — 3계층 추적 구조 개요 (1분)

### 핵심 메시지
> **"값 → 산출 근거 → 원본 데이터, 3클릭 이내"**

### 레이아웃
- 중앙: 3단 계층 다이어그램 (세로 또는 가로)
- 각 계층 사이 화살표(→) 연결

### 다이어그램 구성

```
┌─────────────────────────────────────────────────┐
│  L1  Surface Layer (표면)                        │
│  ─────────────────────────────────               │
│  값 표시 + AI/Human 배지                          │
│  예: 추정체중 1,081g [AI]                         │
│  → 클릭하면 L2로 이동                              │
└──────────────────────┬──────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────┐
│  L2  Logic Layer (로직)                          │
│  ─────────────────────────────────               │
│  산출 로직 · 수식 · 신뢰도 · 버전 이력              │
│  예: 0.7×CCTV(1,060g) + 0.3×표준곡선(1,130g)      │
│      신뢰도 87% · model-2.4.1 (최신)              │
│  → 출처 클릭하면 L3로 이동                          │
└──────────────────────┬──────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────┐
│  L3  Source Layer (원본)                         │
│  ─────────────────────────────────               │
│  원본 파일 · DB 레코드 · API 응답 직접 링크         │
│  예: cctv_weight_hourly 행 / forecast run JSON    │
│      highlight_text·anchor 메타 제공               │
└─────────────────────────────────────────────────┘
```

### 비주얼 가이드
- 3단 박스를 accent 색상(#00ABE6) 테두리로 구분
- 각 계층에 아이콘: L1 = 눈(eye), L2 = 기어(gear), L3 = 데이터베이스(database)
- 화살표에 "click" 라벨

### 스피커 노트
> 저희 해결 방법은 3계층 추적 구조입니다.
>
> 첫 번째 L1, 표면 계층입니다. 대시보드에 보이는 모든 핵심 값 옆에 AI가 생성한 값인지, 사람이 입력한 값인지를 배지로 표시합니다.
>
> 이 값을 클릭하면 두 번째 L2, 로직 계층이 열립니다. 이 값이 어떤 수식과 데이터를 조합해서 만들어졌는지, 신뢰도는 몇 퍼센트인지, 몇 번째 버전인지를 보여줍니다.
>
> 여기서 출처를 클릭하면 세 번째 L3, 원본 계층으로 이동합니다. 실제 파일, DB 레코드, API 응답까지 직접 연결되며, 하이라이트 텍스트/앵커 메타가 함께 제공됩니다.
>
> 3클릭 이내에 어떤 숫자든 원본까지 추적할 수 있습니다.

---

## Page 4. 실제 화면 — L1 대시보드 전체 뷰 (1분)

### 핵심 메시지
> **"모든 핵심 값이 클릭 가능하고, AI/사람 출처가 즉시 구분됩니다"**

### 스크린샷 촬영 가이드
- **영역**: PoC 대시보드 전체 화면 (`/PoC` 페이지)
- **해상도**: 1920×1080 이상
- **상태**: TracePanel 닫힌 상태

### 콜아웃 위치 & 텍스트

| # | 위치 | 콜아웃 텍스트 | 색상 |
|---|------|-------------|------|
| ① | Header 좌측 날씨 카드 | "실시간 외부 환경 정보" | 흰색 |
| ② | OVERVIEW 배지 | "농장 상태 한눈에" | 흰색 |
| ③ | 일령 "Age 35" [H] | "사람 입력 = [H] 배지" | 빨강 원형 |
| ④ | 추정체중 "1,081g" [AI] | "AI 추정 = [AI] 배지, 클릭 가능" | 빨강 원형 (강조) |
| ⑤ | 생존율 "100%" [H] | "사람 입력 값" | 빨강 원형 |

### KPI 5개 상세

| KPI | 값 | 배지 | 추적 시 주요 정보 |
|-----|---|------|-----------------|
| 일령 (Age) | 35일 | H (Human) | 입추일 기준 자동 계산 |
| 입추수 (Rearing Count) | 6,400수 | H (Human) | 초기 입력 데이터 |
| 생존율 (Survival Rate) | 100% | H (Human) | 폐사 기록 기반 |
| 추정체중 (Est. Weight) | 1,081g | **AI** | `0.7×CCTV(1,060g) + 0.3×표준곡선(1,130g)`, 신뢰도 87% |
| 온습도 (Temp/Humid) | 0°C / 0% | H (Human) | IoT 센서 직접 연결 |

### 비주얼 가이드
- 스크린샷 위에 빨간 원형(circle) 콜아웃 번호 ①~⑤
- AI 배지가 있는 추정체중에 가장 큰 콜아웃
- 하단 화살표: "이 값을 클릭하면 →" (다음 슬라이드 연결)

### 스피커 노트
> 이것이 실제 PoC 대시보드 화면입니다.
>
> 상단 헤더에 5개 핵심 KPI가 보입니다. 일령, 입추수, 생존율, 추정체중, 온습도입니다.
>
> 각 값 옆에 작은 배지가 보이시죠? [H]는 사람이 입력한 값, [AI]는 AI가 추정한 값입니다. 현재 AI 배지가 붙은 것은 추정체중 1,081g입니다. CCTV 추정 평균과 표준 성장곡선을 가중 결합해 산출한 값입니다.
>
> 이 값들은 모두 클릭 가능합니다. 추정체중을 클릭해보겠습니다.

---

## Page 5. 실제 화면 — L2→L3 추적 패널 (1.5분) ⭐

### 핵심 메시지
> **"한 패널 안에서 산출 근거부터 원본 데이터까지 모두 확인"**

### 스크린샷 촬영 가이드
- **영역**: 추정체중 1,081g 클릭 → TracePanel 오픈 상태
- **촬영 탭별 4장**:
  1. 요약(Summary) 탭 열린 상태
  2. 로직(Logic) 탭 열린 상태
  3. 원본(Sources) 탭 — 소스 하나 선택된 상태
  4. 히스토리(History) 탭 — 2버전 비교 상태

### 탭별 콜아웃

#### 탭 1: 요약 (Summary)
| 항목 | 표시 내용 | 콜아웃 |
|------|---------|--------|
| 값 | 1,081g | "추적 대상 값" |
| 스냅샷 시간 | 02.07 11:00 | "이 시점의 값" |
| 출처 버전 | model-2.4.1 | "현재 적용 모델 버전" |
| 산출 요약 | 0.7×CCTV + 0.3×표준곡선 | "블렌딩 로직 요약" |
| 신뢰도 | 87% | "AI 확신도" |
| 배지 | AI Generated | "AI가 만든 값 명시" |

#### 탭 2: 로직 (Logic)
| 항목 | 표시 내용 | 콜아웃 |
|------|---------|--------|
| 로직 요약 | CCTV + 표준곡선 가중평균 | "산출 방법 설명" |
| 수식 | 0.7×CCTV(1,060g) + 0.3×표준곡선(1,130g) | "정확한 수식 공개" |
| 소스 목록 | forecast run JSON, `cctv_weight_hourly` | "사용된 데이터 소스" |

#### 탭 3: 원본 (Sources)
| 항목 | 표시 내용 | 콜아웃 |
|------|---------|--------|
| 컨텍스트 선택 | 현재 / 비교 기준 / 비교 대상 | "어느 시점 기준으로 볼지 선택" |
| 소스 상세 | 파일명, 타입(파일/DB/API), 페이지, 행 | "정확한 위치까지 표시" |
| 하이라이트 | `highlight_text`, `highlight_anchor` 메타 | "원본 근거 포인트를 메타로 제공" |
| 원본 열기 버튼 | "원본 열기" | "클릭하면 실제 원본으로 이동" |

#### 탭 4: 히스토리 (History)
| 항목 | 표시 내용 | 콜아웃 |
|------|---------|--------|
| 버전 트렌드 | SVG 스파크라인 차트 | "값의 변화 추이" |
| 비교 기준(현재) | model-2.4.1: 1,081g | "현재 버전" |
| 비교 대상(과거) | model-2.4.0: 1,064g | "이전 버전" |
| 값 델타 | +17g (+1.60%) | "얼마나 변했는지" |
| 신뢰도 델타 | +4.0pp | "AI 확신도 변화" |
| 출처 변경 | 추가/제거/공통 출처 | "어떤 데이터가 바뀌었는지" |

### 비주얼 가이드
- 4개 탭 스크린샷을 2×2 그리드로 배치
- 또는: 요약 탭을 크게 중앙에, 나머지 3탭은 작게 우측에 세로 배치
- 각 탭에 색상별 콜아웃 (요약=파랑, 로직=초록, 원본=주황, 히스토리=보라)

### 스피커 노트
> 추정체중을 클릭하면 이 추적 패널이 열립니다. 4개 탭으로 구성되어 있습니다.
>
> 먼저 요약 탭입니다. 값이 1,081g이고, 02월 7일 11시 기준 스냅샷이며, AI가 생성한 값으로 신뢰도 87%입니다. 모델 버전은 model-2.4.1이고, 로직은 CCTV와 표준성장곡선 가중 결합입니다.
>
> 로직 탭에서는 정확한 수식을 확인할 수 있습니다.
>
> 원본 탭에서는 각 데이터 소스의 실제 파일이나 DB 레코드로 직접 이동할 수 있습니다. "원본 열기" 버튼으로 링크를 열고, 패널에서 하이라이트 텍스트/앵커 메타를 함께 확인합니다.
>
> 히스토리 탭에서는 이전 버전과 비교합니다. model-2.4.0에서 2.4.1로 넘어오면서 17g 증가했고, 신뢰도는 4.0pp 올랐습니다. 어떤 출처가 추가되고 제거되었는지도 나옵니다.
>
> 이 네 개 탭만으로 "이 숫자는 왜 이 값인가?"에 대한 완전한 답을 얻을 수 있습니다.

---

## Page 6. CCTV 추적 시나리오 (1분)

### 핵심 메시지
> **"AI가 어떤 프레임을 보고 판단했는지까지 추적"**

### 스크린샷 촬영 가이드
1. CCTV 모니터링 섹션 전체 (라이브 스트림 + 보관 분석 이미지)
2. TracePanel의 CCTV 탭 (Frame / Pipeline / Raw 서브탭)

### 추적 흐름 다이어그램

```
CCTV 카메라 (CT01: 1동 A구역)
        │
        ▼
  라이브 스트림
  상태: 온라인 · 지연 380ms(샘플)
        │
        ▼
  보관 분석 이미지
  배치: "최근 0~6시간" · 총 72장
  선택 프레임 #N/72
        │
        ▼
  TracePanel CCTV 탭
  ┌──────────────────────────────┐
  │ [Frame] [Pipeline] [Raw]     │
  │                              │
  │ Frame Info                   │
  │  캡처 시각: 02.07 09:23      │
  │  가공 시각: 02.07 09:24      │
  │  프레임 #: N/72              │
  │                              │
  │ Pipeline Info                │
  │  버전: vision-pipeline-1.8.0 │
  │  입력 해상도: 1920×1080      │
  │  confidence: score(optional) │
  │                              │
  │ Raw Data                     │
  │  [원본 이미지 URL]            │
  │  [가공 이미지 URL]            │
  └──────────────────────────────┘
```

### 콜아웃 위치 & 텍스트

| # | 위치 | 콜아웃 |
|---|------|--------|
| ① | 카메라 목록 CT01 | "3대 카메라 실시간 상태" |
| ② | 보관 분석 이미지 배치 | "6시간 단위 72장 자동 수집" |
| ③ | 선택된 프레임 썸네일 | "이 프레임으로 체중 추정" |
| ④ | CCTV 탭 Frame 서브탭 | "촬영 시각 · 가공 시각 추적" |
| ⑤ | Raw Data 링크 | "원본 이미지까지 접근 가능" |

### 비주얼 가이드
- 좌측: CCTV 모니터 섹션 캡처 (프레임 선택 상태)
- 우측: TracePanel CCTV 탭 캡처
- 좌→우 화살표로 흐름 연결

### 스피커 노트
> CCTV 추적 시나리오를 보여드리겠습니다.
>
> 대시보드 하단에 CCTV 모니터링 섹션이 있습니다. 3대 카메라가 실시간으로 영상을 보내고, 6시간 단위로 72장의 프레임이 자동 수집됩니다.
>
> AI가 체중을 추정할 때 어떤 프레임을 사용했는지 궁금하면, 추적 패널의 CCTV 탭을 엽니다.
>
> Frame 탭에서는 선택 프레임 번호, 캡처 시각, 가공 시각을 확인할 수 있습니다. Pipeline 탭에서는 로직 요약, 계산식, 파이프라인 버전, 신뢰도를 봅니다. Raw 탭에서는 원본 이미지 URL과 출처 메타에 직접 접근할 수 있습니다.
>
> 즉, "AI가 어떤 프레임을 보고 이 체중을 추정했는가?"에 대한 완전한 답을 제공합니다.

---

## Page 7. 기능 기준 비교 (1분)

### 핵심 메시지
> **"기존 대시보드 대비, PAIP PoC는 값-로직-원본 연결을 화면 내에서 완결"**

### 비교 테이블

| 기능 | 일반 대시보드 방식 | **PAIP PoC (현재 구현)** |
|------|:----------------:|:-------------------------:|
| 값 클릭 시 추적 패널 | ✕ | **✔** |
| AI/Human 배지 구분 | ✕ | **✔** |
| Summary/Logic/Sources 분리 | ✕ | **✔** |
| 버전 히스토리 비교 | ✕ | **✔** |
| Source diff(추가/제거/공통) | ✕ | **✔** |
| CCTV Frame/Pipeline/Raw 추적 | ✕ | **✔** |

### 레이아웃
- 테이블을 화면 중앙에 크게 배치
- PAIP 열은 accent 색상(#00ABE6) 배경으로 강조
- ✔ 표시는 초록색, ✕는 회색
- 하단에 핵심 메시지 1줄

### 비주얼 가이드
- 테이블 형태 — 깔끔한 그리드
- PAIP 열 전체에 하이라이트
- 하단 캡션: "* 대외 경쟁사 비교 수치는 별도 리서치 근거 확보 후 사용"

### 스피커 노트
> 이 기능이 왜 차별점인지, 기존 대시보드 방식과 현재 PoC 구현을 기준으로 보겠습니다.
>
> 일반 대시보드는 숫자를 보여주지만 그 숫자의 출처, 계산식, 버전 비교를 한 화면에서 연결해주지 못합니다.
>
> PAIP PoC는 값을 클릭하면 Summary, Logic, Sources, History로 이어지고, CCTV는 Frame/Pipeline/Raw까지 확장됩니다. 즉 "숫자 확인"이 아니라 "숫자 증명"까지 UI 안에서 끝냅니다.
>
> 이게 경영진 관점에서 가장 큰 차이점입니다. 지표를 보는 것을 넘어, 지표를 바로 검증할 수 있습니다.

---

## Page 8. 향후 계획 + 마무리 (30초)

### 핵심 메시지
> **"신뢰할 수 있는 AI, 증명할 수 있는 데이터"**

### 레이아웃
- 상단: Next Steps 3개 항목 (타임라인 형태)
- 하단: 클로징 메시지 대형 타이포

### Next Steps

| 단계 | 내용 | 시기 |
|------|------|------|
| 1 | API 계약 확정 → 실데이터 연결 | Phase 2 |
| 2 | 추적 체인 URL 공유 기능 (링크 하나로 출처 전달) | Phase 2 |
| 3 | 리포트/상세 화면으로 추적 UI 확장 | Phase 3 |

### 비주얼 가이드
- 3단계를 가로 타임라인(→ → →)으로 표현
- 마지막에 큰 폰트로 클로징 메시지
- PAIP 로고 + 연락처

### 스피커 노트
> 마지막으로 향후 계획입니다.
>
> Phase 2에서는 실제 농장 API와 연결하여 실데이터로 추적 기능을 검증합니다. 또한 추적 체인 URL 공유 기능을 추가하여, 링크 하나만 보내면 상대방이 해당 값의 출처를 바로 확인할 수 있게 합니다.
>
> Phase 3에서는 리포트와 상세 화면까지 추적 UI를 확장합니다.
>
> 저희의 목표는 명확합니다. 신뢰할 수 있는 AI, 증명할 수 있는 데이터. 감사합니다.

---

## 부록: 스크린샷 촬영 체크리스트

촬영 전 PoC 대시보드(`/PoC`)를 열고 아래 순서로 캡처합니다.

| # | 화면 | 상태 | 사용 슬라이드 |
|---|------|------|-------------|
| 1 | 대시보드 전체 뷰 | TracePanel 닫힘, Header KPI 배지 보이게 | Page 4 |
| 2 | 추정체중 클릭 → TracePanel 요약 탭 | "1,081g" 값 + 신뢰도 87% 보이게 | Page 5 |
| 3 | TracePanel 로직 탭 | 수식 보이게 | Page 5 |
| 4 | TracePanel 원본 탭 | 소스 하나 선택, "원본 열기" 버튼 보이게 | Page 5 |
| 5 | TracePanel 히스토리 탭 | model-2.4.0 ↔ model-2.4.1 비교, 델타 값 보이게 | Page 5 |
| 6 | CCTV 모니터링 섹션 | 프레임 선택 상태, 카메라 목록 보이게 | Page 6 |
| 7 | TracePanel CCTV 탭 | Frame 서브탭 열린 상태 | Page 6 |
| 8 | ForecastMatrix 차트 툴팁 | "출처 열기" 버튼 보이게 | (보너스) |

### 촬영 권장 설정
- 브라우저: Chrome, 100% 줌
- 화면 해상도: 1920×1080 이상
- 다크 모드 상태 (기본 테마)
- 스크린샷 도구: macOS `Cmd+Shift+4` 또는 Chrome DevTools 캡처

---

## 부록: 주요 용어 정리 (발표 중 질문 대비)

| 용어 | 설명 |
|------|------|
| TracePanel | 값을 클릭하면 열리는 추적 정보 패널 |
| L1/L2/L3 | 표면(값) → 로직(산출근거) → 원본(데이터소스) 3계층 |
| AI 배지 | AI가 생성한 값에 붙는 보라색 [AI] 표시 |
| H 배지 | 사람이 입력한 값에 붙는 파란색 [H] 표시 |
| 신뢰도 (Confidence) | AI 추정의 확신도 (0~100%) |
| 블렌딩 | 여러 데이터 소스를 가중 합산하는 방식 |
| 스냅샷 | 특정 시점의 값 저장본 |
| 출처 체인 URL | 추적 정보를 공유할 수 있는 고유 링크 (향후 기능) |

---

# Part 2: 기술 부록 — CTO / 내부 개발팀용

> **대상**: CTO, 내부 개발팀
> **시간**: 약 10분
> **슬라이드**: 6장 (Page A1 ~ A6)
> **원칙**: 슬라이드당 핵심 메시지 + 다이어그램/테이블/코드 스니펫 1개

---

## Page A1. 전체 구조 트리 — "이 시스템은 어떻게 생겼는가" (2분)

### 핵심 메시지
> **"13개 파일, 8,045줄 — 3-column 레이아웃 위에 TracePanel 오버레이 한 장"**

### 컴포넌트 트리 다이어그램

```
src/app/PoC/page.tsx (DashboardPage)
├── state: activeTrace, isTracePanelOpen, lang
├── callbacks: openTracePanel(), closeTracePanel()
│
├── Navbar                        ← lang 전환
├── <3-column layout>
│   ├── LeftSidebar               ← 농장 정보, 메뉴
│   ├── [Center Column]
│   │   ├── Header                ← KPI 5개 + TraceableValue
│   │   ├── ForecastMatrix        ← 예측 차트 + 정확도 카드
│   │   └── WeightDistribution    ← 체중 분포 히스토그램
│   └── RightSidebar              ← 센서/도태 KPI + TraceableValue
│
├── CCTVMonitor                   ← 라이브 + 아카이브 (full-width)
│   ├── Live Stream (<video>)
│   └── Archive Explorer (72프레임/배치)
│
└── TracePanel (overlay)          ← 우측 고정 패널, z-50
    ├── Summary 탭
    ├── Logic 탭
    ├── Sources 탭
    ├── History 탭 (조건부)
    └── CCTV 탭 (조건부: trace_id.startsWith('cctv:'))
```

### 파일 인벤토리

| # | 파일 | 줄 수 | 역할 |
|---|------|------:|------|
| 1 | `src/app/PoC/page.tsx` | 86 | 루트 컴포넌트, 전체 상태 관리 |
| 2 | `src/app/PoC/components/trace/TracePanel.tsx` | 853 | 추적 패널 (5탭, 히스토리 비교, CCTV) |
| 3 | `src/app/PoC/components/trace/TraceableValue.tsx` | 55 | 클릭 가능한 값 래퍼 + AI/H 배지 |
| 4 | `src/app/PoC/sections/Header.tsx` | 301 | KPI 5개 + mock trace payload |
| 5 | `src/app/PoC/sections/ForecastMatrix.tsx` | 2,432 | 예측 차트 + 정확도 추적 |
| 6 | `src/app/PoC/sections/WeightDistribution.tsx` | 1,000 | 체중 분포 히스토그램 |
| 7 | `src/app/PoC/sections/CCTVMonitor.tsx` | 1,419 | CCTV 이중 채널 |
| 8 | `src/app/PoC/sections/RightSidebar.tsx` | 784 | 센서/도태 KPI 패널 |
| 9 | `src/app/PoC/sections/Navbar.tsx` | 660 | 상단 내비게이션 |
| 10 | `src/app/PoC/sections/LeftSidebar.tsx` | 148 | 좌측 사이드바 |
| 11 | `src/app/PoC/sections/ScaleWeightChart.tsx` | 143 | 실측 체중 차트 |
| 12 | `src/app/PoC/sample-sensor-data.ts` | 130 | 센서 샘플 데이터 |
| 13 | `src/types/traceability.ts` | 34 | 핵심 타입 정의 |
| | **합계** | **8,045** | |

### 스피커 노트
> 전체 시스템은 `page.tsx` 하나가 루트입니다. 여기서 `activeTrace` 상태와 `openTracePanel` 콜백을 관리하고, 6개 섹션 컴포넌트에 prop으로 내려줍니다.
>
> 레이아웃은 3-column 구조입니다. 좌측 280px, 중앙 최대 1,128px, 우측 320px. CCTV는 전체 폭으로 하단에 배치됩니다.
>
> TracePanel은 이 모든 것 위에 오버레이로 뜹니다. z-50, 우측 고정, 최대 760px. 어떤 섹션에서든 `openTracePanel(payload)`을 호출하면 같은 패널이 열립니다.
>
> 총 13개 파일, 8,045줄입니다. 가장 큰 파일은 ForecastMatrix(2,432줄)와 CCTVMonitor(1,419줄)입니다.

---

## Page A2. 타입 시스템 & 데이터 모델 — "추적 데이터의 생김새" (2분)

### 핵심 메시지
> **"이 타입 하나가 전체 추적 체계의 계약(contract)이다"**

### 타입 구조 도식

```typescript
// src/types/traceability.ts — 34줄, 전체 시스템의 계약

type DataSourceKind = 'file' | 'db' | 'slack' | 'email' | 'jira' | 'drive' | 'api';
                       ↑ 7개 소스 타입 — 확장 시 여기에만 추가

type DataSourceReference = {
  source_id: string;          // 고유 키 (예: "db:cctv_weight_hourly:2026-02-07")
  type: DataSourceKind;       // 소스 종류
  name: string;               // 표시명 (예: "cctv_weight_hourly")
  url: string;                // 원본 직접 링크
  page?: number;              // 문서 페이지 (optional)
  row_id?: string;            // DB 행 식별자 (optional)
  highlight_text?: string;    // 원본에서 강조할 텍스트
  highlight_anchor?: string;  // 앵커 위치
};

type TraceVersionSnapshot = {
  source_version: string;     // 버전 태그 (예: "model-2.4.0")
  snapshot_at: string;        // 스냅샷 시각
  display_value?: string;     // 해당 시점의 값
  logic_summary?: string;     // 해당 시점의 로직 요약
  confidence?: number;        // 해당 시점의 신뢰도
  data_source?: DataSourceReference[];  // 해당 시점의 출처
};

type TraceabilityPayload = {
  trace_id: string;           // 추적 체인 고유 키
  display_value: string;      // L1 표시 값
  logic_summary: string;      // L2 산출 근거 요약
  logic_formula?: string;     // L2 수식
  data_source: DataSourceReference[];  // L3 원본 목록
  is_ai_generated: boolean;   // AI 배지 여부
  source_version?: string;    // 현재 버전
  snapshot_at?: string;       // 현재 스냅샷 시각
  confidence?: number;        // 신뢰도 (0~1)
  version_history?: TraceVersionSnapshot[];  // 과거 버전 배열
};
```

### DataSourceKind 7개 소스 타입

| 소스 타입 | 의미 | 현재 사용처 |
|----------|------|-----------|
| `file` | 정적 파일 (JSON, CSV, 이미지) | 예측 결과 JSON, CCTV 프레임 |
| `db` | 데이터베이스 레코드 | 사육 재고, 폐사 기록, 센서 |
| `api` | 외부/내부 API 응답 | 라이브 스트림 레지스트리 |
| `slack` | Slack 메시지 | (향후 알림 추적) |
| `email` | 이메일 | (향후 보고서 추적) |
| `jira` | Jira 이슈 | (향후 태스크 연결) |
| `drive` | Google Drive 등 클라우드 문서 | (향후 문서 추적) |

### 스피커 노트
> 전체 추적 체계의 핵심은 `TraceabilityPayload` 타입입니다. 34줄 파일 하나입니다.
>
> 이 타입이 L1(display_value), L2(logic_summary, logic_formula), L3(data_source[])를 모두 담고 있습니다.
>
> DataSourceKind는 현재 7개 소스 타입을 지원합니다. 실제로 PoC에서 사용 중인 것은 `file`, `db`, `api` 세 가지이고, 나머지 네 개(`slack`, `email`, `jira`, `drive`)는 프로덕션 확장을 위해 미리 정의해둔 것입니다.
>
> `version_history` 배열로 시점 비교가 가능합니다. 각 스냅샷이 독립적으로 `data_source`를 가지므로 "어떤 시점에 어떤 데이터를 썼는지"까지 추적됩니다.
>
> 중요한 점: 프론트엔드와 백엔드가 이 타입 하나만 합의하면 추적 UI가 동작합니다. API 전환 시 이 계약만 유지하면 됩니다.

---

## Page A3. 데이터 흐름도 — "값이 클릭되면 무슨 일이 일어나는가" (2분)

### 핵심 메시지
> **"Redux 없이 순수 React hooks — prop drilling 3단계, 전환 비용 최소"**

### 데이터 흐름 다이어그램

```
┌────────────────────────────────────────────────────────────┐
│  page.tsx (DashboardPage)                                  │
│                                                            │
│  const [activeTrace, setActiveTrace] = useState(null)      │
│  const [isTracePanelOpen, setIsTracePanelOpen] = useState  │
│                                                            │
│  const openTracePanel = useCallback((trace) => {           │
│    setActiveTrace(trace);   ← ② payload 저장              │
│    setIsTracePanelOpen(true);                              │
│  }, []);                                                   │
│                                                            │
│  ┌──────────────┐                                          │
│  │ <Header      │ ← onOpenTrace={openTracePanel}          │
│  │   onOpenTrace>│                                         │
│  └──────┬───────┘                                          │
│         │ prop drilling                                    │
│         ▼                                                  │
│  ┌──────────────────┐                                      │
│  │ <TraceableValue  │ ← trace={payload}                   │
│  │   onClick={() => │    onOpenTrace={onOpenTrace}         │
│  │     onOpenTrace(  │                                     │
│  │       trace)}    │ ← ① 사용자 클릭                      │
│  └──────────────────┘                                      │
│                                                            │
│  ┌──────────────────┐                                      │
│  │ <TracePanel      │ ← open={isTracePanelOpen}           │
│  │   trace=         │    trace={activeTrace}               │
│  │   {activeTrace}  │    onClose={closeTracePanel}         │
│  │ />               │ ← ③ 패널 렌더링                      │
│  └──────────────────┘                                      │
└────────────────────────────────────────────────────────────┘
```

### 흐름 단계

| 단계 | 발생 위치 | 동작 |
|------|----------|------|
| ① 클릭 | `TraceableValue` | `onClick → onOpenTrace(trace)` 콜백 호출 |
| ② 상태 업데이트 | `page.tsx` | `setActiveTrace(payload)` + `setIsTracePanelOpen(true)` |
| ③ 패널 렌더링 | `TracePanel` | `open && trace` 조건으로 렌더, 5개 탭 표시 |
| ④ 패널 닫기 | `TracePanel` | ESC / 오버레이 클릭 / Close 버튼 → `setIsTracePanelOpen(false)` |

### 현재 vs 향후 데이터 소싱

| 항목 | 현재 (PoC) | 향후 (프로덕션) |
|------|-----------|---------------|
| 데이터 생성 | 각 섹션 내 inline mock 객체 | API fetch → `TraceabilityPayload` |
| 상태 관리 | `useState` + prop drilling | 동일 또는 Context/Zustand |
| TracePanel 입력 | 동일한 `TraceabilityPayload` | 동일한 `TraceabilityPayload` |
| 전환 비용 | — | mock 객체를 API 호출로 교체만 하면 됨 |

### 스피커 노트
> 데이터 흐름은 매우 단순합니다. Redux나 별도 상태 라이브러리 없이 순수 React hooks로 구현했습니다.
>
> page.tsx에서 `activeTrace`와 `isTracePanelOpen` 두 개의 state만 관리합니다. `openTracePanel` 콜백을 각 섹션 컴포넌트에 prop으로 내려줍니다.
>
> 사용자가 TraceableValue를 클릭하면, 해당 값에 바인딩된 `TraceabilityPayload` 객체가 콜백을 통해 page.tsx로 올라가고, TracePanel에 전달됩니다.
>
> 현재는 각 섹션에서 inline으로 mock payload를 생성합니다. 프로덕션에서는 이 mock 부분만 API 호출로 교체하면 됩니다. TracePanel과 TraceableValue는 변경이 필요 없습니다. 이것이 타입 계약 기반 설계의 이점입니다.

---

## Page A4. CCTV 이중 채널 아키텍처 — "라이브와 아카이브를 분리한 이유" (2분)

### 핵심 메시지
> **"라이브 장애가 분석에 영향 안 줌 — 두 채널은 완전히 독립"**

### 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────────────────┐
│  CCTVMonitor.tsx (1,419줄)                                      │
│                                                                 │
│  CAMERAS: CT01, CT02, CT03 (3대 독립 관리)                       │
│  ┌──────────┐    ┌─────────────────────────────────────────┐    │
│  │ Camera   │    │                                         │    │
│  │ Rail     │    │  ┌─ Live Channel ──────────────────┐    │    │
│  │          │    │  │ <video> 태그 (현재)               │    │    │
│  │ CT01 ●── │───▶│  │ → WebRTC 전환 예정               │    │    │
│  │ CT02 ○   │    │  │                                  │    │    │
│  │ CT03 ●   │    │  │ 상태: playing | reconnecting     │    │    │
│  │          │    │  │ 지연: latencyMs (실시간)          │    │    │
│  │ (● 온라인)│    │  │ Heartbeat: lastHeartbeat         │    │    │
│  │ (○ 오프라 │    │  └──────────────────────────────────┘    │    │
│  │   인)    │    │                                         │    │
│  └──────────┘    │  ┌─ Archive Channel ────────────────┐    │    │
│                  │  │ 배치: 3개 × 72프레임 = 216장/카메라│    │    │
│                  │  │  ├ 최근 0~6시간                   │    │    │
│                  │  │  ├ 이전 6~12시간                  │    │    │
│                  │  │  └ 이전 12~18시간                 │    │    │
│                  │  │                                  │    │    │
│                  │  │ 페이지네이션: 12장/페이지           │    │    │
│                  │  │ 프레임 선택 → TraceableValue       │    │    │
│                  │  │  ├ capturedAt (캡처 시각)          │    │    │
│                  │  │  ├ processedAt (가공 시각)         │    │    │
│                  │  │  └ imageUrl (가공 이미지 URL)      │    │    │
│                  │  └──────────────────────────────────┘    │    │
│                  └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### 이중 채널 비교

| 항목 | Live Channel | Archive Channel |
|------|-------------|-----------------|
| 목적 | 실시간 모니터링 | 과거 프레임 분석 |
| 렌더링 | `<video>` 태그 (autoPlay, muted, loop) | `<Image>` (Next.js optimized) |
| 데이터 | 스트림 URL 1개 | 배치 × 72 프레임 |
| 상태 | `LiveStreamState` (online, latencyMs, sessionState) | `ArchiveBatch[]` → `ProcessedArchiveImage[]` |
| 장애 격리 | 오프라인 시 "OFF" 표시, 재연결 버튼 | 영향 없음 — 독립 조회 |
| 추적 연결 | `liveStreamTrace` (스트림 URL 추적) | `selectedImageTraces` (프레임별 4개 trace) |

### 카메라 상태 머신

```
             online=true          online=false
                │                      │
    ┌───────────▼──────────┐  ┌───────▼────────┐
    │  playing             │  │  reconnecting  │
    │  ─────────           │  │  ─────────────  │
    │  <video> 재생        │  │  grayscale     │
    │  latencyMs 표시      │  │  "OFF" 배지    │
    │  LIVE 배지 + 펄스    │  │  재연결 버튼    │
    └──────────────────────┘  └────────────────┘
```

### 스피커 노트
> CCTV 모니터링에서 가장 중요한 설계 결정은 라이브와 아카이브를 완전히 분리한 것입니다.
>
> 라이브 채널은 `<video>` 태그로 실시간 스트림을 보여줍니다. 카메라가 오프라인이면 "OFF" 배지를 표시하고 재연결 버튼을 제공합니다. 향후 WebRTC로 전환 예정입니다.
>
> 아카이브 채널은 6시간 배치 단위로 72장의 가공 프레임을 관리합니다. 3개 배치(최근 0~6시간, 6~12시간, 12~18시간)를 독립적으로 조회할 수 있습니다.
>
> 핵심은 이 두 채널이 완전히 독립이라는 점입니다. 라이브 스트림이 끊어져도 아카이브 분석은 그대로 동작합니다. 각 카메라(CT01, CT02, CT03)도 독립적으로 상태를 관리합니다.
>
> 아카이브 프레임을 선택하면 `capturedAt`, `processedAt`, `imageUrl` 세 가지 값이 각각 TraceableValue로 연결되어 추적 패널에서 프레임 메타데이터를 확인할 수 있습니다.

---

## Page A5. 현재 vs 프로덕션 갭 분석 — "PoC에서 프로덕션까지" (1분)

### 핵심 메시지
> **"기술 부채를 투명하게 공개 — Mock → API 전환 포인트 6곳"**

### Mock → API 전환 포인트

| # | 파일 | 현재 (Mock) | 프로덕션 (API) | 난이도 |
|---|------|-----------|--------------|-------|
| 1 | `Header.tsx` | inline `TraceabilityPayload` 객체 | `/api/trace/{trace_id}` fetch | 🟢 낮음 |
| 2 | `ForecastMatrix.tsx` | inline mock 예측 데이터 | 예측 API + trace payload | 🟡 중간 |
| 3 | `WeightDistribution.tsx` | inline mock 분포 데이터 | 분포 API + trace payload | 🟡 중간 |
| 4 | `RightSidebar.tsx` | inline mock 센서/도태 KPI | 센서 API + trace payload | 🟢 낮음 |
| 5 | `CCTVMonitor.tsx` | `fetchLiveStreamState()` / `fetchArchiveBatches()` (fake async) | 실제 카메라 API | 🔴 높음 |
| 6 | `sample-sensor-data.ts` | 하드코딩 센서 배열 | IoT 센서 API 실시간 | 🟡 중간 |

### 누락 항목 (프로덕션 필수)

| 카테고리 | 항목 | 설명 |
|---------|------|------|
| 테스트 | 자동화 테스트 없음 | 컴포넌트 단위 테스트, E2E 테스트 필요 |
| 에러 처리 | Error Boundary 없음 | 섹션별 에러 격리 필요 |
| 실시간 | WebSocket 미구현 | 센서/CCTV 실시간 업데이트 |
| 인증 | 인증/권한 없음 | API 호출 시 토큰 관리 |
| 성능 | 번들 최적화 미수행 | `ForecastMatrix` 2,432줄 — 코드 스플리팅 대상 |
| 접근성 | 기본 수준만 구현 | ARIA 라벨 일부만 적용 |

### 번들 사이즈 & 성능 최적화 후보

| 대상 | 현재 상태 | 최적화 방안 |
|------|----------|-----------|
| `ForecastMatrix.tsx` (2,432줄) | 단일 파일 | 차트 컴포넌트 분리 + `dynamic()` import |
| `CCTVMonitor.tsx` (1,419줄) | CSS-in-JS (`<style jsx>`) | CSS Modules 전환 또는 Tailwind 통합 |
| `TracePanel.tsx` (853줄) | 항상 DOM에 포함 | `open=false`일 때 이미 null 반환 (✅ 최적화됨) |
| recharts 의존성 | SSR width/height 경고 | `suppressHydrationWarning` 적용 완료 |

### 스피커 노트
> PoC에서 프로덕션으로 가려면 무엇이 필요한지 투명하게 공유합니다.
>
> Mock → API 전환 포인트는 6곳입니다. 가장 난이도가 높은 것은 CCTV입니다. 실제 카메라 API와 WebRTC 스트리밍을 연동해야 합니다. 나머지는 inline mock 객체를 API 호출로 교체하는 수준입니다.
>
> 현재 누락된 것을 정리했습니다. 자동화 테스트, Error Boundary, WebSocket 실시간 업데이트, 인증, 번들 최적화가 필요합니다.
>
> 특히 ForecastMatrix는 2,432줄로 가장 큰 파일이므로 코드 스플리팅 1순위입니다. TracePanel은 이미 `open=false`일 때 null을 반환하므로 추가 최적화가 필요 없습니다.

---

## Page A6. 관련 자료 인덱스 — "더 알고 싶으면 여기를 보세요" (1분)

### 핵심 메시지
> **"6개 가이드 문서 + 13개 코드 파일 — 진입점을 알면 길을 잃지 않는다"**

### 문서 맵

| 문서 | 경로 | 내용 |
|------|------|------|
| 추적성 UI 기획서 | `docs/guides/p-root-traceability-ui-plan.md` | L1→L2→L3 설계, 인터랙션 규칙, QA 체크리스트 |
| 발표 스크립트 (Part 1) | `docs/guides/traceability-presentation-script.md` | 경영진/투자자 발표 자료 8장 |
| 기술 부록 (Part 2) | `docs/guides/traceability-presentation-script.md` (하단) | 이 문서 — CTO/내부팀 기술 세부사항 |
| CCTV 벤치마크 | `docs/guides/cctv-live-analysis-benchmark.md` | CCTV 라이브/분석 성능 기준 |
| 육계 목표 체중 리서치 | `docs/guides/broiler-target-weight-research.md` | 표준 성장곡선 근거 |
| YouTube/블로그 초안 | `docs/guides/p-root-traceability-youtube-blog-draft.md` | 외부 커뮤니케이션용 초안 |

### 코드 진입점 가이드

| 목적 | 시작 파일 | 다음 단계 |
|------|----------|----------|
| 전체 구조 파악 | `src/app/PoC/page.tsx` | → 각 섹션 import 따라가기 |
| 타입 계약 확인 | `src/types/traceability.ts` | → Header.tsx의 mock payload 참고 |
| 추적 UI 동작 이해 | `src/app/PoC/components/trace/TraceableValue.tsx` | → TracePanel.tsx 탭 구조 |
| CCTV 아키텍처 | `src/app/PoC/sections/CCTVMonitor.tsx` | → `CAMERAS`, `BATCH_TEMPLATES`, `LiveStreamState` |
| 예측 차트 구조 | `src/app/PoC/sections/ForecastMatrix.tsx` | → 정확도 카드, 차트 툴팁 trace 연결 |
| 센서 데이터 구조 | `src/app/PoC/sample-sensor-data.ts` | → RightSidebar.tsx에서 사용 |

### 전체 발표 자료 구성 요약

```
┌─────────────────────────────────────────────┐
│  Part 1: 경영진/투자자 발표 (Page 1~8)       │
│  ─────────────────────────────────────       │
│  비즈니스 가치, 실제 화면, 기능 기준 비교        │
│  → 의사결정자에게 "왜 필요한가" 전달           │
│                                             │
│  Part 2: 기술 부록 (Page A1~A6)              │
│  ─────────────────────────────────────       │
│  구조, 타입, 데이터 흐름, CCTV, 갭 분석        │
│  → 개발팀에게 "어떻게 만들었는가" 전달          │
│                                             │
│  합계: 14장 (투자자는 8장만, 내부는 전체 14장)  │
└─────────────────────────────────────────────┘
```

### 스피커 노트
> 마지막으로 관련 자료를 정리했습니다.
>
> docs/guides 폴더에 6개 가이드 문서가 있습니다. 추적성 UI 기획서가 가장 상세한 레퍼런스이고, 이 발표 스크립트가 요약본입니다.
>
> 코드를 처음 보는 분은 `page.tsx`부터 시작하세요. 전체 구조가 86줄에 담겨 있습니다. 타입 계약을 확인하려면 `traceability.ts` 34줄만 읽으면 됩니다.
>
> 전체 발표 자료는 14장입니다. 투자자/경영진에게는 Part 1의 8장만 보여주고, 내부 개발팀에게는 Part 2 기술 부록 6장을 추가로 공유합니다.
>
> 질문이 있으면 해당 문서나 코드 경로를 참고해주세요. 감사합니다.
