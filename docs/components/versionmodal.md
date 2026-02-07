---
title: Version Modal 설계 문서
author: ZORO
last_updated: 26.02.07
---

# Version Modal 설계 문서

## 1. 문서 정보
- 문서명: `Version Modal Specification`
- 관련 구현:
`/src/app/dashboard/sections/Navbar.tsx`  
`/src/app/api/version-notes/route.ts`  
`/src/data/version-notes.json`

## 2. 목적
- 대시보드 상단 `업데이트 정보`에서 버전 이력을 일관된 UX로 제공한다.
- 버전 데이터의 입력 품질(버전/날짜)을 API 레벨에서 자동 검증/정규화한다.
- 접근성 기본 요건(키보드 닫기/포커스 관리)을 충족한다.

## 3. 범위
- 포함:
모달 오픈/클로즈, 카드형 버전 목록, 세로 스크롤, 다국어 렌더링, JSON+API 로딩, 데이터 검증/정렬
- 제외:
관리자 편집 UI, DB 저장, 권한 기반 노출 제어

## 4. UI 구조
- 진입: 상단 브랜드 영역 `업데이트 정보` 버튼
- 모달:
`fixed inset-0`, dimmed overlay, 중앙 정렬, `max-w-[480px]`
- 헤더:
`버전별 업데이트 정보` + `닫기`
- 본문:
버전별 카드 반복 렌더링, `max-h-[460px]`, `overflow-y-auto`
- 카드:
`버전(노랑, 큰 폰트) · 일자(회색)` 메타 1줄 + 본문(제목/상세) 전체폭 배치
- 제목/상세:
  - 1차 제목은 번호형(`1.`, `2.`), 텍스트 색은 밝은 회색/화이트 계열
  - 상세는 `-` 마커를 `grid` 정렬(`grid-cols-[10px_1fr]`)로 고정

## 5. 핵심 UX 규칙
- 최신 버전이 상단에 위치한다.
- 각 버전은 하나의 덩어리(card)로 묶어서 읽는다.
- 상세 항목은 `-` 마커 정렬을 유지해 줄바꿈 시 가독성을 보장한다.
- 언어(`KO/EN`) 전환 시 모달 텍스트도 즉시 전환된다.
- `업데이트 정보` 모달 오픈 시 `개발문서` 모달은 자동으로 닫힌다(상호배타).

## 6. 인터랙션/접근성 로직
- 오픈:
`isVersionModalOpen = true`
  - `업데이트 정보` 버튼 클릭 시 `개발문서` 모달을 닫고 버전 모달을 오픈(상호배타)
- 닫기:
닫기 버튼 클릭, `ESC`, 오버레이 외곽 클릭
- 포커스 트랩:
모달 오픈 시 닫기 버튼에 초기 포커스, `Tab/Shift+Tab` 순환
  - 키보드 핸들러는 `Navbar`에서 버전/개발문서 모달 공용으로 동작하며 현재 활성 모달에만 적용
- 모달 역할:
`role="dialog"`, `aria-modal="true"`

## 7. 데이터 아키텍처
- 소스:
`/src/data/version-notes.json` (정적 파일)
- 제공 API:
`GET /api/version-notes`
- 클라이언트 로딩:
모달 오픈 시 fetch(`no-store`)로 최신 데이터 조회
- 상태:
`releaseNotes`, `isNotesLoading`, `notesError`
  - API 응답은 `notes + meta` 구조이며, UI 렌더링은 `notes`만 사용
- 모듈 경계:
  - `ForecastMatrix`의 공통 계약(`/src/data/dashboard-data.json`)과 데이터 파이프라인을 공유하지 않는다.
  - 버전 모달은 `version-notes` 계약만 사용하며, 차트/테이블 계산 유틸에 의존하지 않는다.

## 8. 데이터 품질 정책 (API)
- 버전 검증:
`semver-like` 형식만 허용 (`x.y.z`)
- 날짜 정규화:
입력 변형(`YY.MM.DD`, `YYYY-MM-DD`, `/` 등) 허용 후 응답은 `YY.MM.DD`로 통일
- sanitize:
필수 필드 누락/비정상 항목 제거
- 정렬:
버전 내림차순 -> 동일 버전이면 날짜 내림차순
- 메타 정보:
`total`, `valid`, `invalid` 반환
  - item 레벨에서는 `titleKo/titleEn`이 비어 있으면 제외, details는 비어있는 문자열 제거

## 9. API 명세

### Request
```http
GET /api/version-notes
```

### Response
```json
{
  "notes": [
    {
      "version": "1.3.0",
      "date": "26.02.06",
      "items": [
        {
          "titleKo": "CCTV WEIGHT UI/호버/정확도 표시 로직 업데이트",
          "titleEn": "CCTV WEIGHT UI/Hover/Accuracy Logic Update",
          "detailsKo": ["...", "..."],
          "detailsEn": ["...", "..."]
        }
      ]
    }
  ],
  "meta": {
    "total": 5,
    "valid": 5,
    "invalid": 0
  }
}
```

## 10. 오류 처리 정책
- 로딩 중: `불러오는 중...`
- 실패 시: 에러 문구 노출 (`버전 정보를 불러오지 못했습니다.`)
- 데이터 0건: `표시할 버전 정보가 없습니다.`

## 11. QA 체크리스트
- `업데이트 정보` 클릭 시 모달 오픈
- `ESC`로 닫힘
- 오버레이 클릭으로 닫힘
- `Tab` 이동이 모달 밖으로 이탈하지 않음
- 목록이 길어져도 본문만 스크롤
- 버전이 최신순으로 표시
- 날짜가 `YY.MM.DD` 포맷으로 통일
- 잘못된 버전 형식 데이터가 응답에서 제외됨

## 12. 운영 가이드
- 버전 추가 절차:
`/src/data/version-notes.json`에 새 항목 추가
- 작성 규칙:
버전 `x.y.z`, 날짜 `YY.MM.DD` 권장, 항목별 KO/EN 동시 작성
- 구조 원칙:
  - `Version Modal`은 `Navbar` UI 상태와 `version-notes` 데이터 로딩 책임만 가진다.
  - 도메인 차트 데이터(`dashboard-data`) 변경은 본 모듈 영향 범위 밖으로 유지한다.
- 배포 전 확인:
`npx tsc --noEmit` + `/dashboard` 수동 확인
