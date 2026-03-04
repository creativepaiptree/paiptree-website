# i18n Supabase Bootstrap (Public)

## 실행할 SQL

1. Supabase SQL Editor에서 아래 파일 하나를 순서대로 실행하세요.

- `/docs/sql/supabase/008_bootstrap_i18n_translation_overrides.sql`

이 파일은 `public.i18n_translation_overrides` 테이블을 생성하고, 현재 `i18n/FM-i18n`의 10개 번역 파일을 모두 업서트합니다.
`public.i18n_translation_overrides`는 더 이상 JSON 객체를 저장하지 않고, `service / lang / key / value` 단위 행으로 저장합니다.

## 실행 후 확인

```sql
SELECT service, lang, COUNT(*) AS cnt
FROM public.i18n_translation_overrides
GROUP BY service, lang
ORDER BY service, lang;
```

## 환경 변수 (이 프로젝트 `/i18n` API 저장 API 기준)

- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY` 또는 `SUPABASE_SERVICE_ROLE_KEY`

예시

```
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_KEY=<service_role_key>
```
