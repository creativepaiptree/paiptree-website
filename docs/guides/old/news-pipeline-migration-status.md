---
title: "뉴스 파이프라인 전환 진행 현황"
author: ZORO
last_updated: 26.02.12
---

# 뉴스 파이프라인 전환 진행 현황

## 1. 기준일
- 2026-02-12

## 2. 목표 구조
- `RSS 수집 -> paiptree_ds API -> Supabase(news) -> paiptree-website 화면`

## 3. 완료 항목
- [x] `paiptree-website`의 Google Sheets 직접 조회 제거
- [x] `paiptree-website` 뉴스 데이터 소스를 `paiptree_ds` API 호출로 교체
- [x] API 응답 필드 매핑(`date -> upload_date`, `downloadCount/download_count -> download_count`, `originalUrl/original_url -> original_url`) 적용
- [x] `paiptree_ds /api/news`에 CORS 헤더 및 `OPTIONS` 핸들러 적용
- [x] `NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY` 제거 및 `NEXT_PUBLIC_PAIPTREE_NEWS_API_BASE_URL` 사용 구조로 정리

## 4. 검증 결과
- [x] `npm run lint` (`paiptree-website`)
- [x] `npm run build` (`paiptree-website`)
- [x] `curl -i -H "Origin: http://localhost:3002" "https://paiptree-ds.vercel.app/api/news?tab=news&sortBy=date&sortOrder=desc"`에서 CORS 헤더 확인
- [x] `curl -i -X OPTIONS ... /api/news?...`에서 204 + CORS 헤더 확인

## 5. 운영 권고
- Google Sheets 관련 기존 공개 키/시크릿은 전환 완료 후 폐기(회전) 권장
- 뉴스 소스 변경/확장은 `Supabase(news)`와 `paiptree_ds /api/news`만 관리

## 6. 남은 확인
- [ ] `/about` 실브라우저 기준 뉴스 카드 링크 동작(외부 원문 이동) 최종 점검
- [ ] 운영 환경에서 캐시 잔존 시 강력 새로고침 또는 무효화 후 재확인
