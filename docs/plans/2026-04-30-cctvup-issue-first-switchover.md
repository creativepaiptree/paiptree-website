---
title: CCTVUP issue-first 전환 계획
author: ZORO
last_updated: 26.04.30
---

# CCTVUP issue-first 전환 계획

## 목표
- `paip.tbl_farm_image` 기반 5분 수신 모니터링을 안정적으로 누적한다.
- 화면은 문제 우선(issue-first)으로 보여주고, 정상은 기본값으로 간주한다.
- 운영 DB를 매 요청 직접 계산하지 않고, Supabase에 쌓인 결과를 읽는 구조로 전환한다.

## 진행 순서
1. Supabase 스키마를 문제 중심으로 확정한다.
2. checker를 웹 런타임과 분리한다.
3. `/cctvup` 읽기 경로를 Supabase-first로 바꾼다.
4. stale / last_checked 표시를 추가한다.
5. raw-query 경로를 debug-only fallback으로 정리한다.

## 이번 단계의 산출물
- `tbl_cctvup_current_issues` 추가 스키마
- `check_runs` summary에 issue_count 반영
- `cctvup` 공통 타입에 current issue 모델 반영
- `cctvup-history` 적재 로직이 current issue를 함께 갱신하도록 준비

## 승인 기준
- 5분 수집이 쌓이는 구조가 명확해야 한다.
- 문제 로그가 없으면 정상으로 본다는 운영 철학과 맞아야 한다.
- 완전 실시간이 아니어도 stale 여부를 운영자가 구분할 수 있어야 한다.
