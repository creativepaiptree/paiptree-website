---
title: CCTVMonitor 설계 문서
author: ZORO
last_updated: 26.02.09
---

# CCTVMonitor 설계 문서

## 1. 문서 정보
- 구현 파일
  - `/Users/zoro/projects/paiptree-website/src/app/PoC/sections/CCTVMonitor.tsx`
- 샘플 미디어
  - `/Users/zoro/projects/paiptree-website/public/media/cctv-sample-test1/cctv.mp4`
  - `/Users/zoro/projects/paiptree-website/public/media/cctv-sample-test1/images/frame-001.jpg ~ frame-072.jpg`
- 적용 범위
  - PoC 대시보드의 CCTV 라이브 + 보관 분석 이미지(6시간/72장) 통합 모니터링 UI

## 2. 목적
- 라이브 스트림은 상시 재생 채널로 독립 유지한다.
- 분석 이미지는 연구/분석용으로 보관된 가공 이미지를 조회한다.
- 라이브와 보관 분석의 데이터/상태 흐름을 분리한다.

## 3. 화면/기능 구성
- 상단 헤더
  - 타이틀 + 활성 배치 기준 `정상/총 프레임`, `이상 프레임` 요약
- 본문 3영역
  - 좌측 카메라 레일(`280px`)
    - 카드형 목록 + 우측 미니 라이브 프리뷰(`16:12`, `width 120px`)
    - 미니 프리뷰 오버레이: `LIVE/OFF`, 카메라 ID, latency
    - 카드 정보: 카메라명, latency/heartbeat, 최신 배치 `정상/실패/누락`
    - 목록 패널은 중앙 라이브 높이에 맞춰 stretch 되고 내부는 세로 스크롤(카메라 증가 시 약 4개 카드 가시)
  - 중앙 라이브 패널(`820px`): 운영 상태바(스트림 상태, 지연, heartbeat, 재연결), 상시 라이브 표시
    - 라이브 캔버스는 소스 `920x720`(23:18) 비율 유지, `max-width 800px`
  - 우측 보관 이미지 패널(`flex 1`, `min-width 320px`)
    - 상단 미리보기는 `16:9` 고정 비율(`preview-canvas`)
    - 6시간 배치 선택, 페이지 이동, 72장 썸네일
    - `보관된 가공 이미지 조회 전용` 안내 문구만 유지
- 반응형 규칙
  - `<=1360px`: 썸네일 `4열 -> 3열`
  - `<=1350px`: 3컬럼을 세로 스택으로 전환, 카메라 목록 가로 스크롤, 카드 최소폭 `380px`
  - `<=640px`: 썸네일 `2열`

## 4. 핵심 로직
- 데이터 소스 분리
  - 라이브 상태: `fetchLiveStreamState(cameraId)`
  - 보관 배치: `fetchArchiveBatches(cameraId)`
- 샘플 미디어 매핑
  - 라이브 영상: `SAMPLE_LIVE_VIDEO_URL = /media/cctv-sample-test1/cctv.mp4`
  - 보관 이미지: `SAMPLE_ARCHIVE_IMAGE_URLS = frame-001 ~ frame-072`
  - 3개 카메라(CT01/CT02/CT03)가 동일 샘플 소스를 공유
- 배치 모델
  - 카메라별 배치: `latest`, `prev-1`, `prev-2`
  - 각 배치 `72장`, `5분 간격`
- 배치 전환
  - 카메라 변경 시 자동으로 해당 카메라의 `latest` 배치 선택
- 페이지네이션
  - 페이지 크기 `12`, 총 `6페이지` 기준 탐색
- 선택 이미지
  - 배치/페이지 기준 기본 선택은 각 페이지 썸네일의 `우상단(index 3)`
  - 기존 선택이 현재 페이지에 없으면 `우상단` 항목으로 자동 보정
  - 라이브 패널은 선택 이미지와 무관하게 동일 상태 유지
- 썸네일 상태 표기 단순화
  - 썸네일 하단: `시각(좌)` + 상태 배지(우)
  - 상태 배지: `정상(녹색)` / `없음(빨강)` 2단 표기
  - 썸네일의 상태/이벤트 기반 가변 테두리색은 제거(선택 테두리만 유지)

## 5. 데이터 모델
```ts
type ImageStatus = 'ok' | 'failed' | 'missing';
type EventType = 'person' | 'vehicle' | 'intrusion' | 'none';

type LiveSessionState = 'playing' | 'reconnecting';

interface LiveStreamState {
  cameraId: string;
  online: boolean;
  sessionState: LiveSessionState;
  latencyMs: number;
  lastHeartbeat: string;
  streamUrl: string;
}

interface ProcessedArchiveImage {
  id: string;
  cameraId: string;
  batchId: string;
  sequence: number;
  capturedAt: string;
  processedAt: string;
  status: ImageStatus;
  eventType: EventType;
  score?: number;
  processedImageUrl: string;
}

interface ArchiveBatch {
  id: string;
  cameraId: string;
  label: { ko: string; en: string };
  rangeText: string;
  images: ProcessedArchiveImage[]; // 72 frames
}
```

## 6. 인터랙션 규칙
- 카메라 선택
  - 좌측 카메라 카드 클릭 시 라이브 상태와 보관 배치를 각각 다시 로드
- 배치 선택
  - 보관 패널 상단 배치 버튼 클릭 시 해당 6시간/72장 집합으로 교체
- 페이지 이동
  - 페이지 버튼 클릭 시 해당 페이지로 이동하고 기본 선택을 페이지 우상단으로 보정
- 이미지 선택
  - 썸네일 클릭 시 상단 확대 미리보기가 갱신
  - 라이브 패널은 상시 재생 상태 유지
- 재연결
  - 재연결 버튼 클릭 시 임시 `retrying` 상태 표시
- 접근성
  - 썸네일은 `button`과 `aria-label` 제공

## 7. 예외/에러 처리
- 라이브/보관 로딩 중
  - 상태바와 패널에 `loadingLive`, `loadingArchive` 문구를 분리 노출
- 보관 배치 없음
  - 빈 상태 메시지 표시, 선택 이미지 `null` 처리
- 오프라인 카메라
  - 상태바 오프라인 표기, 지연값 `-` 처리, 좌측 미니 프리뷰 `OFF` 표시
- 배치 길이 0
  - 페이지 계산 최소값 1로 보정
- 현재 페이지에 이미지가 없는 경우
  - 선택값 갱신을 중단하고 안전하게 return

## 8. QA 체크리스트
- 라이브 패널이 선택 이미지와 무관하게 상시 상태를 유지하는가
- 카메라 변경 시 라이브/보관이 각각 로드되고 좌측 카드 미니 프리뷰가 유지되는가
- 배치/페이지 변경 시 기본 선택이 각 페이지 우상단으로 맞춰지는가
- 72장 기준 페이지(`12 x 6`)가 정확히 동작하는가
- 썸네일 상태 배지가 `정상(녹색)` / `없음(빨강)`으로 양끝 정렬되는가
- 우측 상단 미리보기가 `16:9` 비율로 고정되고 가로 넘침 없이 렌더링되는가

## 9. 업데이트 기록
- `v1.5.0` (`26.02.09`)
  - CCTV 3컬럼 폭을 `280 / 820 / flex(min 320)`로 재정렬하고 모바일 전환 기준을 `1350px`로 명시
  - 라이브 영상 샘플을 `cctv.mp4` 단일 소스로 고정하고, 보관 이미지 72장을 `frame-001~072` 규칙으로 통일
  - 페이지 기본 선택 규칙(각 페이지 우상단 index 3)과 썸네일/미리보기 비율 규칙(`16:9`)을 문서화
