---
title: CCTVUP 무게예측 입력 관제 전환 기준
author: ZORO
last_updated: 26.05.13
---

# CCTVUP 무게예측 입력 관제 전환 기준

## 1. 목표
- `/cctvup`은 먼저 농장 CCTV 이미지가 5분 주기로 정상 저장되는지 확인하는 운영 관제 페이지로 유지한다.
- 무게예측 관점은 CCTV 이미지가 예측 모델의 원천 입력이라는 맥락으로 붙인다.
- 화면은 "카메라가 살아있는가"에서 "무게예측에 쓸 입력이 정상적으로 들어오는가"로 확장한다.
- 단, `/cctvup`을 무게예측 결과 대시보드로 바꾸지 않는다.

## 2. 현재 기준
- 1차 수신 기준 테이블: 원본 운영 DB `paip.tbl_farm_image`
- 활성 CCTV 기준: 원본 운영 DB `tbl_farm_cctv`의 `applied = 1`, `display = 'YES'`, `is_working = 'Y'`
- 농장/소속 기준: `tbl_farm_service`, `tbl_farm_house`를 읽어 화면 표시명과 기본 그룹을 잡는다.
- 원본 운영 DB 연결은 읽기 전용이며 `SELECT/WITH` 조회만 허용한다.
- 원본 운영 DB에는 어떤 쓰기, 수정, 보정값 저장, registry 저장도 하지 않는다.
- 기록층은 별도 Supabase를 사용한다.

## 3. 저장 원칙
- Supabase에는 정상 카메라 전체 로그를 매번 적재하지 않는다.
- `late`는 화면에서 지연 가능성으로 보여주되 기본 로그 적재 대상에서 제외한다.
- 1~2회 미수집은 `watching`으로만 유지하고 issue event를 남기지 않는다.
- 3회 연속 미수집부터 `open` 확정 문제로 보고 issue event를 남긴다.
- 에너지바 표시는 1~2회 미수집을 노랑, 3회째부터 빨강으로 표시한다. 문제확정 시 기존 미수집 흐름이 새로 리셋된 것처럼 보이면 안 된다.
- 원본 DB live row의 최신 이미지 시각이 Supabase `camera_state.last_checked_at`보다 새로우면 저장 state는 stale로 보고 화면에 병합하지 않는다.
- `/cctvup`의 농장 목록은 정상 운영 농장 목록으로 본다. 단, CCTV 문제확정은 `감시중` 카메라에서만 발생한다.
- `휴지기`는 이미지 미수집이 발생해도 장애가 아니다. 휴지기 여부는 이미지 공백 시간이 아니라 원본 DB 사육 이력의 출하일 기준으로 판단한다.
- `대상확인`은 장애가 아니라 사육/설치 기준 데이터 검수 필요 상태다.
- `check_runs.payload`도 전체 정상 row가 아니라 문제 row 중심으로 보관한다.
- 원본 DB 조회 실패, mock, unavailable payload는 history에 정상 체크처럼 적재하지 않는다.
- history 조회는 화면 보조 정보로만 쓰고, 기본 조회량은 check run 5건, issue event 50건, 활성 camera state 최대 1000건으로 제한한다.
- Supabase history 읽기 timeout 기본값은 800ms이며, timeout 시 화면 현재 목록을 막지 않는다.
- Supabase camera_state 읽기 timeout은 history와 분리하고 기본값은 1500ms로 둔다.
- camera_state 조회가 실패하면 화면에는 `상태머신 미반영`을 표시하고 운영 DB live 기준 화면임을 분명히 한다.

## 4. 무게예측 확장 경계
- 이미지 수신 여부는 계속 `paip.tbl_farm_image`만 기준으로 판단한다.
- 분석 결과 여부는 추후 `tbl_farm_image_analysis_weight_v2` 같은 분석 테이블을 읽어 별도 상태로 붙인다.
- 분석 테이블은 수신감시의 1차 기준으로 사용하지 않는다.
- 보정 상태, 예측 안정성, 1시간 대표 중량은 실제 데이터 위치와 키 매칭이 확인된 뒤 읽기 전용으로만 붙인다.
- 5분 단위 예측값은 내부 진단값이고, 운영 판단값은 1시간 대표 중량으로 분리한다.
- 보정/대표값/운영판단은 원천과 키 매칭이 확정되기 전까지 기본 화면에 `연동 전` 카드로 노출하지 않는다.
- 미연동 항목이 장애처럼 보이지 않도록, 현재 화면의 기본 판정은 이미지 입력 상태에 집중한다.

## 5. 화면 발전 순서
1. Phase 1 - 문구와 정보 구조 정리
   - 제목을 AI 중량예측 입력 관제 관점으로 정리한다.
   - 이미지 누락이 예측 공백이나 신뢰도 저하로 이어진다는 설명을 추가한다.
   - 선택 카메라 상세에 무게예측 입력 상태 placeholder를 추가한다.
   - 현재 상태: 완료. 데이터/API 변경 없이 프론트 정보 구조만 반영했다.

2. Phase 2 - 선택 카메라 상세 단순화
   - 선택 카메라 상세의 기본 판정은 `이미지 입력 상태` 1개로 둔다.
   - `중량분석 생성`은 CCTV 수신 장애가 아니라 무게예측 참고 정보이므로 접힘 영역으로 분리한다.
   - 카메라 보정, 예측 안정성, 운영 판단 가능 여부는 실제 원천과 판정 기준이 확정되기 전까지 기본 화면에 표시하지 않는다.
   - 현재 상태: 완료. 초기 5단계 자동 진단표 방식은 폐기하고, 이미지 입력 중심 구조로 단순화했다.

3. Phase 3 - 분석 결과 읽기 연동
   - 분석 테이블 스키마와 카메라 키 매칭을 확인한다.
   - "이미지는 있음 / 분석 없음", "분석 지연", "분석 정상"을 수신 상태와 분리해 표시한다.
   - 이 단계도 원본 DB와 분석 DB 모두 읽기 전용이다.
   - 현재 상태: 완료. 전체 목록이 아니라 선택 카메라 상세에서만 `/api/cctvup/analysis`로 최근 2시간 분석 근거를 읽는다.
   - `무게예측 참고` 영역 상단에는 분석 정보가 CCTV 문제확정 기준에 영향 없음을 표시한다.
   - Supabase 저장은 추가하지 않는다. 분석 문제 로그 적재는 Phase 4에서 별도로 판단한다.

3.5. Phase 3.5 - Supabase history 경량화
   - `/api/cctvup/history`를 화면 보조 조회로 분리해 `/api/cctvup` 현재 목록 렌더링을 막지 않게 한다.
   - history는 check run 5건, issue event 50건, 활성 camera state 최대 1000건만 기본 조회한다.
   - 정상/해결 state 전체와 정상 카메라 snapshot 전체 조회는 기본 경로에서 제외한다.
   - Supabase 읽기 timeout은 기본 800ms로 두고, 일부 실패는 부분 응답으로 처리한다.
   - 현재 상태: 완료. Supabase REST가 느리거나 실패해도 화면은 현재 상태 중심으로 유지한다.

3.6. Phase 3.6 - 상태머신 운영 루프 안정화
   - history timeout과 camera_state timeout을 분리한다.
   - `/api/cctvup` 응답에 상태머신 반영 여부를 싣고 화면에 표시한다.
   - 로컬 24시간 PC에서는 `scripts/cctvup-check-local.mjs`를 5분마다 실행하는 것을 1차 운영 경로로 둔다.
   - macOS launchd 템플릿은 `ops/launchd/com.paiptree.cctvup-check.plist`에 둔다.
   - `/api/cctvup/check/` 1회 실행으로 Supabase 적재 가능 여부를 확인한다.
   - 현재 상태: 완료. Supabase REST가 응답하지 않는 환경에서는 `상태머신 미반영`으로 화면을 유지한다.

3.7. Phase 3.7 - 운영 진단과 화면 사용성 보강
   - Supabase REST timeout 원인을 운영자가 화면에서 즉시 확인할 수 있게 한다.
   - `/api/cctvup/supabase-diagnose/`는 관리 secret으로 보호하고, 환경 URL/key ref, DNS, TCP 443, REST 핵심 테이블 응답 시간을 확인한다.
   - `scripts/cctvup-supabase-diagnose.mjs`는 로컬 CLI 진단 경로로 유지한다.
   - 데스크톱 화면에서도 전체 페이지 세로 스크롤을 허용해 모니터에서 원하는 중간 영역으로 이동할 수 있게 한다.
   - 현재 상태: 완료. 진단 결과는 secret 원문 없이 화면에 표시하며, 고정 높이 레이아웃으로 본문이 갇히지 않는다.

3.8. Phase 3.8 - 수동 체크와 루프 리허설
   - 운영자가 화면에서 상태머신을 직접 1회 실행할 수 있게 한다.
   - `지금 체크` 버튼은 관리 secret으로 `/api/cctvup/check/`를 호출하고, 성공 후 현재 목록과 history를 다시 읽는다.
   - 상단에는 최근 check run 시각을 계속 표시해 5분 루프가 멈췄는지 빠르게 확인한다.
   - 현재 상태: 완료. check run id, state/event 반영 건수, opened/recovering/resolved 건수를 화면에 표시한다.

3.9. Phase 3.9 - 로컬 24시간 운영 고정
   - 웹 배포 서버와 GitHub-hosted runner가 원본 CCTV DB를 읽지 못하는 동안 로컬 PC를 1차 운영 체크 위치로 고정한다.
   - `ops/launchd/com.paiptree.website-dev.plist`로 `localhost:3002` Next 서버를 유지한다.
   - `ops/launchd/com.paiptree.cctvup-check.plist`로 `scripts/cctvup-check-local.mjs`를 5분마다 실행한다.
   - 로컬 체크 스크립트는 기본값으로 웹 URL을 호출하지 않고 `CCTVUP_LOCAL_CHECK_URL` 또는 `localhost:3002`만 호출한다.
   - 현재 상태: 완료. 로컬 LaunchAgent 템플릿, 체크 스크립트 기준, 현재 PC 등록까지 확인했다.

3.10. Phase 3.10 - 운영 안정성 폴리싱
   - 회복/해결 흐름을 화면에서 추적할 수 있게 한다.
   - 현재 목록, 상태머신, 히스토리, 5분 루프 상태를 한 패널에서 분리해 보여준다.
   - Supabase history timeout은 현재 목록 실패로 오해하지 않게 별도 상태로 표시한다.
   - 최근 check run 6회의 issue, ok, watch, open, recovering 흐름을 보여준다.
   - 현재 상태: 완료. 우측 운영 루프 상태 패널에 반영했다.

3.15. Phase 3.15 - stale camera_state 정리
   - 현재 감시중이 아닌 `휴지기/대상확인/미설치` 카메라에 과거 `watching/open/recovering` state가 남으면 다음 체크 때 `resolved`로 닫는다.
   - 이 처리는 감시범위 변경 정리이며 카메라 회복 이벤트가 아니므로 `issue_events`에는 새 이벤트를 남기지 않는다.
   - `/api/cctvup/check/` 응답은 `archivedStaleStateCount`로 정리 건수를 알려준다.
   - 현재 상태: 완료. 화면 판정, history 활성 조회, Supabase 사용량을 모두 현재 감시중 중심으로 유지한다.

3.16. Phase 3.16 - 로컬 smoke script와 화면 버튼
   - `node scripts/cctvup-smoke.mjs`와 화면 상단 `운영 점검` 버튼으로 launchd, `/cctvup`, `/api/cctvup`, `/api/cctvup/registry`, `/api/cctvup/history`, 최근 check run, stale 활성 state, 테스트/하니농장 예외를 한 번에 확인한다.
   - 기본 모드는 read-only이며, `--run-check`를 붙인 경우에만 `/api/cctvup/check/`를 1회 호출한다.
   - 화면 버튼은 `/api/cctvup/smoke/`를 호출하며 체크런을 새로 저장하지 않는다.
   - 현재 상태: 완료. 로컬 운영 상태 확인의 1차 버튼/명령으로 사용한다. registry API JSON 응답도 smoke에서 확인한다.

3.17. Phase 3.17 - 상태머신 표시 안정성
   - 원본 DB live row가 Supabase state보다 새로우면 stale state가 화면을 덮어쓰지 못하게 한다.
   - 1~2회 미수집은 노랑 `late`, 3회째부터 빨강 `missing`으로 표시해 문제확정 시 에너지바가 1칸부터 새로 시작되는 것처럼 보이지 않게 한다.
   - 현재 상태: 완료. FA0406처럼 live DB가 이미 정상으로 회복된 카메라는 stale state 대신 live row 기준 정상으로 표시한다.

4. Phase 4 - 상태전환 기록 정리
   - issue 종류를 무리하게 늘리기보다, 선택 카메라 히스토리를 이미지 수신 상태머신 중심으로 단순화한다.
   - Supabase 저장은 계속 이미지 수신 문제 중심으로 제한한다.
   - 현재 UI 1차 반영: 선택 카메라 상세 기본 판정을 `이미지 입력 상태`로 축소하고, `중량분석 생성`은 `무게예측 참고` 접힘 영역으로 분리했다.
   - R2/A4/대표값/변동성/운영 판단은 기본 화면 노출에서 제거했고, 실제 원천 연결 전까지 후속 Phase 후보로만 유지한다.
   - 선택 카메라 상세에 `5분 저장 근거` 섹션을 추가했다. 최신 저장, 문제 직전 저장, 회복 확인 저장을 `tbl_farm_image.FILE_NAME` 기준으로 읽는다.
   - 브라우저에는 운영 이미지 서버 원본 URL, 원본 파일명, 이미지 바이너리를 노출하지 않는다.
   - 5분 저장 근거는 원본 DB 읽기 전용이며 Supabase에 이미지나 파일명을 저장하지 않는다. 화면에는 저장 시각, 마스킹된 파일 참조, 파일 크기만 표시하고 이미지 보기는 후순위 보조 기능으로 분리한다.
   - 정상 카메라는 현재 목록의 최신 수신 시각만으로 `최신 저장`을 표시하고, 문제확정/회복중처럼 근거가 필요한 카메라에서만 상세 저장 근거 API를 호출한다.
   - 선택 카메라 상세의 `스냅샷 / 히스토리`는 `상태전환 기록`으로 바꾸고, `문제확정/회복중/해결/재확정` 운영 문구만 기본 노출한다.
   - 레거시 스냅샷/인시던트 반복 목록은 기본 화면에서 제거하고 compatibility 보조 정보로만 유지한다.
   - 분석/보정/대표값 후보 issue type은 현재 Supabase에 저장하지 않는다.

5. Phase 5 - 농장 단위 운영 가능 상태
   - 현재는 보류한다.
   - 농장 목록의 1차 상태는 계속 이미지 수신 상태만 사용한다.
   - 분석 가능 카메라 수, 보정 확인 카메라 수, 대표값 생성 여부, `사용 가능/제한적/불가` 같은 종합 판단은 화면에 추가하지 않는다.
   - 분석 결과 테이블 매칭, R2/A4 보정 원천, 1시간 대표 중량 원천, 운영 판단 판정식이 확정된 뒤 별도 승인 후 진행한다.

## 6. 하지 않을 것
- `tbl_farm_image_analysis_weight_v2`를 이미지 수신감시의 기준 테이블로 바꾸지 않는다.
- 5분 raw 예측값을 사용자용 최종 중량처럼 보여주지 않는다.
- 보정 상태가 확인되지 않았는데 예측 신뢰도를 확정값처럼 표시하지 않는다.
- 보정/대표값/운영판단을 원천 미확정 상태에서 `연동 전` 문제 카드로 기본 노출하지 않는다.
- 정상 카메라 전체 스냅샷을 매 5분 Supabase에 대량 적재하지 않는다.
- 원본 운영 DB에 registry, 로그, 보정, 메모 데이터를 쓰지 않는다.

## 7. Phase 0 완료 기준
- `/cctvup` 운영 문서에 무게예측 입력 관제 방향이 명시되어 있다.
- 원본 DB 읽기 전용 경계가 문서에 명시되어 있다.
- 수신 기준과 분석 기준이 분리되어 있다.
- 다음 구현 단계가 Phase 1부터 시작되도록 범위가 작게 잘려 있다.

## 8. 상태머신 운영 목표
- `/cctvup` 서비스의 1차 성공 기준은 "5분마다 들어와야 하는 CCTV 이미지가 15분 이상 멈춘 카메라를 확정 문제로 남기는 것"이다.
- 1~2회 미수집은 `watching`으로 두고 문제 로그를 적재하지 않는다.
- 3회 연속 미수집부터 `open`으로 전환하고 `tbl_cctvup_issue_events`에 `opened` 이벤트를 1회 남긴다.
- `open` 이후 이미지가 다시 들어오면 즉시 정상 삭제하지 않고 `recovering`으로 둔다.
- `recovering` 상태에서는 `recent_slots`의 빨간 칸이 5분 체크마다 뒤로 밀려 사라져야 한다.
- 최근 12회 슬롯이 모두 정상으로 채워지면 `resolved` 이벤트를 남기고 문제 목록에서 빠진다.
- Supabase는 `tbl_cctvup_camera_states` 1행 upsert와 `tbl_cctvup_issue_events` 상태 전환 append만 기본으로 사용한다.
- 전체 카메라 스냅샷을 5분마다 누적하지 않는다.
- Supabase timeout이 반복되면 먼저 진단 버튼/API/CLI로 네트워크와 REST 상태를 확인하고, 단순 timeout 증가보다 실행 환경과 조회량을 먼저 점검한다.
- GitHub Actions `CCTVUP Check` schedule은 웹 배포 서버가 원본 CCTV DB를 읽을 수 있을 때만 켠다. 현재 1차 운영 체크 위치는 원본 DB 접근이 가능한 로컬 24시간 PC다.
