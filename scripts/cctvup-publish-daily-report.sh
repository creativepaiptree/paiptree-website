#!/usr/bin/env bash
set -euo pipefail

REPO="/Users/zoro/company/paiptree-website"
cd "$REPO"

REPORT_DATE="${1:-$(TZ=Asia/Seoul date -v-1d +%F)}"
YEAR="${REPORT_DATE:0:4}"
MONTH="${REPORT_DATE:5:2}"
ROOT="content/cctvup/daily-reports"
MD="$ROOT/$YEAR/$MONTH/$REPORT_DATE.md"
RAW="$ROOT/$YEAR/$MONTH/$REPORT_DATE.raw.json"
MANIFEST="$ROOT/manifest.json"

fail() {
  echo "[회사] $(TZ=Asia/Seoul date +%m.%d) CCTVUP 브리핑 배포 ❌"
  echo "- 이유: $1"
  exit 1
}

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
[ "$BRANCH" = "main" ] || fail "main 브랜치가 아님"

BAD_BEFORE="$(git status --porcelain | awk '$2 !~ /^content\/cctvup\/daily-reports\// {print}')"
[ -z "$BAD_BEFORE" ] || fail "브리핑 외 변경사항 존재"

if [ -z "$(git status --porcelain)" ]; then
  git pull --ff-only origin main >/dev/null || fail "git pull 실패"
fi

npm run cctvup:daily-report -- --date "$REPORT_DATE" >/tmp/cctvup-daily-publish.log 2>&1 \
  || fail "브리핑 생성 실패"

[ -f "$MD" ] || fail "md 파일 없음"
[ -f "$RAW" ] || fail "raw 파일 없음"
[ -f "$MANIFEST" ] || fail "manifest 없음"

grep -q "\"date\": \"$REPORT_DATE\"" "$MANIFEST" || fail "manifest 최신 날짜 누락"

if grep -R -E "CCTVUP_DB_PASSWORD|SUPABASE_SERVICE_KEY|CCTVUP_CRON_TRIGGER_SECRET|PRIVATE KEY|mysql://|postgres://" "$MD" "$RAW" "$MANIFEST" >/dev/null; then
  fail "민감정보 패턴 감지"
fi

BAD_AFTER="$(git status --porcelain | awk '$2 !~ /^content\/cctvup\/daily-reports\// {print}')"
[ -z "$BAD_AFTER" ] || fail "브리핑 외 변경사항 발생"

git add "$ROOT"
if git diff --cached --quiet; then
  echo "[SILENT]"
  exit 0
fi

git commit -m "Update CCTVUP daily reports through $REPORT_DATE" >/dev/null \
  || fail "git commit 실패"

git push origin main >/dev/null \
  || fail "git push 실패"

echo "[SILENT]"
