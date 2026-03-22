---
title: CCTV 라이브+분석 이미지 벤치마크
author: ZORO
last_updated: 26.02.07
---

# CCTV 라이브+분석 이미지 벤치마크

## 1. 문서 정보
- 분석 대상 코드
  - `/Users/zoro/projects/paiptree-website/src/app/PoC/sections/CCTVMonitor.tsx`
  - `/Users/zoro/projects/paiptree-website/src/app/PoC/page.tsx`
- 분석 범위
  - 라이브 스트리밍 화면 + 분석 이미지(6시간, 72프레임) 동시 조회 UX
  - 데이터/상태 모델, 운영(모니터링) 정보 구조
- 기준일
  - 2026-02-07 (참고자료 재확인 기준)

## 2. 목적
- 현재 `CCTVMonitor` 구현의 구조적 한계를 코드 기준으로 명확히 정리한다.
- Google, Amazon(Ring/AWS), NAVER Cloud 공개 문서의 공통 패턴을 추출한다.
- 즉시 적용 가능한 개선 우선순위(P1/P2)와 구현 단계 초안을 정의한다.

## 3. 현재 구조 분석 (코드 기준)
### 3.1 레이아웃/컴포넌트 구조
- 대시보드 하단에 `CCTVMonitor`를 풀폭으로 렌더링한다.
  - `/Users/zoro/projects/paiptree-website/src/app/PoC/page.tsx:49`
- `CCTVMonitor` 내부는 `Live 40% + Gallery 60%` 고정 2분할이다.
  - `/Users/zoro/projects/paiptree-website/src/app/PoC/sections/CCTVMonitor.tsx:141`
  - `/Users/zoro/projects/paiptree-website/src/app/PoC/sections/CCTVMonitor.tsx:148`

### 3.2 데이터/상태 구조
- 카메라 목록은 하드코딩(CT01~CT03)이다.
  - `/Users/zoro/projects/paiptree-website/src/app/PoC/sections/CCTVMonitor.tsx:24`
- 분석 이미지는 실데이터가 아니라 난수 기반 목업 생성(`72장`, `5분 간격`)이다.
  - `/Users/zoro/projects/paiptree-website/src/app/PoC/sections/CCTVMonitor.tsx:54`
  - `/Users/zoro/projects/paiptree-website/src/app/PoC/sections/CCTVMonitor.tsx:64`
- 실패 상태는 `failed`만 실사용되고 `missing`은 정의만 되어 있다.
  - `/Users/zoro/projects/paiptree-website/src/app/PoC/sections/CCTVMonitor.tsx:10`
  - `/Users/zoro/projects/paiptree-website/src/app/PoC/sections/CCTVMonitor.tsx:206`

### 3.3 상호작용/접근성
- 썸네일 선택은 `div onClick` 기반이라 키보드 탐색/스크린리더 대응이 약하다.
  - `/Users/zoro/projects/paiptree-website/src/app/PoC/sections/CCTVMonitor.tsx:370`
- 타임 탐색은 가로 필름스트립 스크롤 1가지 방식에 집중되어 있고, 날짜/시간 점프 UI가 없다.
  - `/Users/zoro/projects/paiptree-website/src/app/PoC/sections/CCTVMonitor.tsx:368`

## 4. 참고자료 요약
### 4.1 Google (Google Home for web / Nest web app)
- 카메라 그리드(멀티)와 카메라 상세(싱글) 전환 구조를 제공한다.
- 카메라 상세에서는 라이브와 히스토리를 동시에 노출한다(양쪽 패널 구조).
- 이벤트 히스토리와 24/7 타임라인을 구분하고, 이벤트 마커/날짜 선택 기반 탐색을 지원한다.
- 카메라 상태(On/Off/Offline/Idle) 확인과 라이브 제어를 화면 안에서 처리한다.
- 시사점
  - 라이브 패널과 분석 타임라인 패널을 분리해 동시 인지성을 높여야 한다.
  - 단순 썸네일 열이 아니라 이벤트 중심 타임라인과 날짜 점프를 제공해야 한다.

### 4.2 Amazon Ring (Event History Timeline)
- Event History 리스트와 Timeline을 함께 사용한다.
- 상단 필터(Device/Event Type)로 탐색 범위를 빠르게 축소한다.
- 타임라인 마커로 이벤트 시점을 빠르게 파악한다.
- 시사점
  - 우리 UI에도 카메라/이벤트타입/상태 필터가 필요하다.
  - 72프레임 스캔 효율을 위해 마커 중심 탐색이 필요하다.

### 4.3 AWS (Kinesis Video Streams GetImages)
- `GetImages` 제약
  - `StartTimestamp~EndTimestamp` 범위가 300초 초과 시 예외
  - 기본 페이지 크기 25장(`MaxResults`를 더 크게 줘도 응답당 25)
  - `NextToken` 기반 페이지네이션
  - `NO_MEDIA`, `MEDIA_ERROR`를 응답 단에서 명시
- 시사점
  - 6시간(72프레임)을 한 번에 뽑기보다 서버 집계 API(구간 분할+페이지 조합)가 안정적이다.
  - UI에서 `missing`과 `failed`를 분리 표기해야 운영 판단이 빨라진다.

### 4.4 NAVER Cloud (Live Station)
- 채널 상세에서 운영 기능을 분리한다.
  - `Status`, `Monitoring`, `Check streaming information`, `Retry`
  - `Service URL`, `TimeMachine URL`, `Thumbnail URL`, `Event Tab`
- 이벤트는 카테고리/필터 기반 조회를 제공한다.
- 시사점
  - 라이브 재생 UI와 운영(상태/재시도/스트림정보) UI를 분리해 가시성을 높여야 한다.

## 5. 벤치마크 통합 패턴
### 5.1 권장 정보구조(IA)
1. 좌측: 카메라 레일
2. 중앙: 라이브 플레이어 + 실시간 상태(online/offline, 지연, last frame)
3. 우측 또는 하단: 분석 타임라인(이벤트 마커, 필터, 페이지)
4. 하단: 프레임 상세 패널(선택 프레임 메타, AI 결과, 원본 이동)

### 5.2 현재 구조와 목표 구조 비교
- 현재: 고정 2분할 + 필름스트립 단일 탐색
- 목표: 라이브/운영/분석 분리 + 이벤트 중심 타임라인 + 필터 + 페이지

## 6. 우리 컴포넌트 개선안
### 6.1 P1 (즉시)
1. 라이브 영역과 분석 영역 사이에 운영 상태 바 추가
2. 필터 추가: 카메라, 이벤트 타입, 상태(`ok/failed/missing`)
3. 타임라인 전환: 필름스트립 단일 스크롤 -> 페이지 + 이벤트 마커
4. 선택 상태 키 변경: `index` -> `frameId/timestamp` 기반
5. 접근성 개선: 썸네일 클릭 요소 `button` 전환, `aria-label`, 키보드 이동

### 6.2 P2 (후속)
1. 가상 스크롤/지연 로딩으로 프레임 수 증가 대응
2. URL 쿼리 동기화(`camera`, `range`, `page`, `filters`)
3. 모바일 레이아웃: 40/60 고정 비율 제거, 세로 스택 전환

## 7. 데이터/상태 모델 초안
```ts
type FrameStatus = 'ok' | 'failed' | 'missing';

interface AnalysisFrame {
  frameId: string;
  cameraId: string;
  capturedAt: string; // ISO-8601
  thumbnailUrl: string;
  status: FrameStatus;
  eventType?: 'person' | 'vehicle' | 'intrusion' | 'none';
  confidence?: number;
}

interface StreamHealth {
  cameraId: string;
  online: boolean;
  latencyMs: number;
  lastFrameAt: string; // ISO-8601
  streamUrl?: string;
}
```

## 8. 구현 단계(초안)
1. 1단계: UI 구조 분리(라이브/운영/분석 패널) + 접근성 보강
2. 2단계: 6시간 배치(72장) 선택/타임라인/페이지네이션 상태 도입
3. 3단계: 실데이터 API 연동(라이브 스트림 API + 분석 프레임 API 분리)
4. 4단계: 운영 기능(재시도, 상태 점검, 이벤트 로그) 연동

## 9. QA 체크리스트
- 라이브 화면과 분석 패널이 동시에 보이는가
- 6시간/72프레임에서 특정 시간대로 즉시 이동 가능한가
- `missing`/`failed`/`ok` 상태를 시각적으로 명확히 구분하는가
- 카메라 전환 시 선택 프레임/스크롤/배치 상태가 의도대로 유지되는가
- 키보드만으로 프레임 선택/이동이 가능한가

## 10. 참고자료
- Google
  - https://support.google.com/googlenest/answer/9241220?hl=en
  - https://support.google.com/googlenest/answer/9681538?hl=en
- Amazon
  - https://ring.com/support/articles/16fks/Using-Event-History-Timeline
  - https://docs.aws.amazon.com/kinesisvideostreams/latest/dg/API_reader_GetImages.html
  - https://docs.aws.amazon.com/kinesisvideostreams/latest/dg/API_reader_Image.html
- NAVER Cloud
  - https://guide.ncloud-docs.com/docs/en/livestation-manage
  - https://guide.ncloud-docs.com/release-20250918/docs/en/livestation-channelscreen

## 11. 반영 상태 (26.02.07)
- P1 1차 UI 반영 완료
  - 3영역 구조(카메라 레일/라이브 패널/분석 패널) 적용
  - 운영 상태바(상태/지연/마지막 프레임/재시도) 적용
  - 상태·이벤트 필터, 이벤트 마커 타임라인, 페이지네이션 적용
  - 썸네일/마커를 버튼화하고 `aria-label`을 제공해 기본 접근성 보강

## 12. 반영 상태 (2차 구현)
- 라이브 패널과 분석 패널의 데이터 결합 해소
  - 라이브는 상시 동작 상태(`always-on live`)로 고정
  - 분석은 별도 72장 배치 데이터만 탐색
- 필터 UI 제거
  - 상태/이벤트 필터를 삭제하고 6시간 단위 배치 선택 UI로 대체
- 배치 모델 도입
  - 카메라별 배치: `최근 0~6시간`, `이전 6~12시간`, `이전 12~18시간`
  - 각 배치 `72장(5분 간격)` 기준 유지

## 13. 반영 상태 (3차 구현)
- 라이브/보관 API 흐름 분리
  - 라이브: `fetchLiveStreamState(cameraId)` 별도 로드
  - 보관: `fetchArchiveBatches(cameraId)` 별도 로드
- 보관 이미지 의미 명확화
  - 우측 패널을 `보관 분석 이미지` 조회 전용으로 고정
  - 선택 카드에 `capturedAt`, `processedAt`, `processedImageUrl` 노출
- 스트림-마커 혼동 제거
  - 스트림 이벤트처럼 보일 수 있는 타임라인 마커 UI 제거
  - 배치/페이지/썸네일 중심 탐색으로 단순화
