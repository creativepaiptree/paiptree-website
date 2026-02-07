# 브로일러 목표체중 범위 설정 리서치

> 작성일: 2026-02-07 | 적용 대상: WeightDistribution 패널 기본값

---

## 1. 목표범위 설정 방법 (국제 표준)

처리장은 일반적으로 다음 방식으로 목표 밴드를 설정:

- **Mean ± 10%** — 균일도 평가의 업계 공통 기준
- **CV% 기반**: CV 8-10% (우수), 10-12% (수용 가능), >12% (처리 문제 발생)
- **Uniformity 80-90%**: 도계 시 평균±10% 내 마릿수 비율 목표
- 처리 장비는 좁은 체중 범위를 요구하며, CV >12%일 경우 기계 문제 발생 (탈모 불량, 항문절개기 오작동 등)

## 2. 품종별 성장 기준 (Performance Objectives)

### Ross 308 (mixed-sex)

| 일령 | 체중 (g) |
|------|----------|
| 28d  | ~1,676   |
| 35d  | ~2,454   |
| 42d  | ~3,203 (수컷) / ~2,219 (혼합) |
| 49d  | ~3,876   |

### Cobb 500 (mixed-sex)

| 일령 | 체중 (g) | vs Ross 308 |
|------|----------|-------------|
| 28d  | +59g     | 약간 우위   |
| 35d  | +64g     | 약간 우위   |
| 42d  | ~2,298   | +79g        |

## 3. 처리 카테고리별 생체중

| 카테고리 | 생체중 (kg) | 비고 |
|----------|-------------|------|
| Cornish Game Hen / Griller | 0.9-1.1 | 3-4주 도계 |
| 소형/중형 브로일러 | 1.5-2.0 | 표준 절단 |
| 중대형 (Cut-up) | 2.2-3.0 | 절단/가공용 |
| 대형 (Deboning) | 2.5-3.2+ | 탈골 최적화 |
| US 초대형 | 3.6+ | 8lb+ 추세 |

## 4. CV% 및 밴드 기준

| CV% 범위 | 등급 | 비고 |
|-----------|------|------|
| < 8% | 우수 | 자동 내장 처리 기준 충족 |
| 8-10% | 양호 | 업계 목표 |
| 10-12% | 수용 가능 | 주의 필요 |
| > 12% | 불량 | 처리장 장비 문제 발생 |

- **±10% 밴드**: 업계 표준 관행
- **목표 달성률**: 35-49일령에서 80-90% 목표

## 5. 국가별 비교

### 한국 (육계)

- 평균 목표: **~1,500g** (소형, 치킨 시장용)
- 소형: ~1,500g / 대형: ~3,000g
- 한국식 치킨 시장은 소형·연한 닭 선호
- 체중 편차로 인한 산업 손실: 연간 ~333억 원 추정

### US

- 평균: ~2,600g (5.8 lbs), 47일령
- 대형화 추세 (탈골 경제성)

### EU / 브라질

- EU: 2,000-2,500g 표준
- 브라질: 평균 2,150g 판매체중 (지역별 1,900-2,500g)
- 가슴살 수율 최적화에 집중

### 핵심 차이

한국은 통닭 조리용 소형(1.5kg)을 선호하는 반면, 서구 시장은 절단/탈골용 중대형(2.0-2.6kg+)을 목표로 함.

## 6. 현재 대시보드 적용

- **데이터 평균**: ~2,981g (중대형 탈골용 카테고리)
- **적용 기본값**: 2,820 ~ 3,300g
- **근거**: Ross 308 mixed-sex ~40일령 기준, 처리장 사양에 맞춘 밴드

## 출처

- [Ross 308 vs Cobb 500 비교](https://fidarfeed.com/broiler-chickens/broiler-breed/ross-308-vs-cobb-500-which-broiler-breed-is-right-for-you/)
- [브로일러 균일도 평가 (The Poultry Site)](https://www.thepoultrysite.com/articles/evaluating-uniformity-in-broilers-factors-affecting-variation)
- [브로일러 군 균일도의 중요성 (Poultry World)](https://www.poultryworld.net/health-nutrition/importance-of-broiler-flock-uniformity/)
- [US 브로일러 성적 (NCC)](https://www.nationalchickencouncil.org/about-the-industry/statistics/u-s-broiler-performance/)
- [브라질 브로일러 체중 (WATTAgNet)](https://www.wattagnet.com/home/article/15512300/brazils-average-broiler-saleable-weight-breakdown)
- [Ross 308 & Cobb 500 성적 비교 논문](https://abah.bioflux.com.ro/docs/2017.22-27.pdf)
- [한국 브로일러 체중 기준 (한국과학기술정보)](https://koreascience.kr/article/JAKO201312061569534.page)
