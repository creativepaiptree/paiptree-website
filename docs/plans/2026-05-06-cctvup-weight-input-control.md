---
title: CCTVUP 무게예측 입력 관제 전환 기준
author: ZORO
last_updated: 26.05.07
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

## 5. 화면 발전 순서
1. Phase 1 - 문구와 정보 구조 정리
   - 제목을 AI 중량예측 입력 관제 관점으로 정리한다.
   - 이미지 누락이 예측 공백이나 신뢰도 저하로 이어진다는 설명을 추가한다.
   - 선택 카메라 상세에 무게예측 입력 상태 placeholder를 추가한다.
   - 현재 상태: 완료. 데이터/API 변경 없이 프론트 정보 구조만 반영했다.

2. Phase 2 - 상세 패널 체크리스트
   - 이미지 수신, 분석 결과, 카메라 보정, 예측 안정성, 운영 판단 가능 여부를 한 묶음으로 표시한다.
   - 실제 연결된 값은 이미지 수신만 사용하고, 나머지는 `미연동` 또는 `확인 필요`로 둔다.
   - 현재 상태: 완료. 선택 카메라 상세에서 5단계 자동 진단표로 표시한다.

3. Phase 3 - 분석 결과 읽기 연동
   - 분석 테이블 스키마와 카메라 키 매칭을 확인한다.
   - "이미지는 있음 / 분석 없음", "분석 지연", "분석 정상"을 수신 상태와 분리해 표시한다.
   - 이 단계도 원본 DB와 분석 DB 모두 읽기 전용이다.
   - 현재 상태: 완료. 전체 목록이 아니라 선택 카메라 상세에서만 `/api/cctvup/analysis`로 최근 2시간 분석 근거를 읽는다.
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
   - 데스크톱 화면에서는 좌측 농장 목록과 우측 결과창을 독립 스크롤 영역으로 분리한다.
   - 현재 상태: 완료. 진단 결과는 secret 원문 없이 화면에 표시하며, 긴 목록에서도 좌우 패널을 따로 탐색할 수 있다.

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

4. Phase 4 - 문제 유형 확장
   - issue 종류를 이미지 수신 문제와 분석 파이프라인 문제로 나눈다.
   - Supabase 저장은 계속 문제 중심으로 제한한다.

5. Phase 5 - 농장 단위 운영 가능 상태
   - 농장별 이미지 정상 카메라 수, 분석 가능 카메라 수, 대표값 생성 여부를 요약한다.
   - 운영자가 "지금 무게예측 결과를 판단에 써도 되는가"를 바로 볼 수 있게 한다.

## 6. 하지 않을 것
- `tbl_farm_image_analysis_weight_v2`를 이미지 수신감시의 기준 테이블로 바꾸지 않는다.
- 5분 raw 예측값을 사용자용 최종 중량처럼 보여주지 않는다.
- 보정 상태가 확인되지 않았는데 예측 신뢰도를 확정값처럼 표시하지 않는다.
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
