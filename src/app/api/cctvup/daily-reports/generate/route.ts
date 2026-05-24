import { NextResponse } from 'next/server';
import { getCctvUpCronAuthState } from '@/lib/cctvup-check-core.js';
import { generateCctvUpDailyReport } from '@/lib/cctvup-daily-report-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CRON_SECRET_HEADER = 'x-cctvup-cron-secret';
const ADMIN_SECRET_HEADER = 'x-cctvup-admin-secret';

function readMutationSecret(request: Request) {
  const expectedSecret = process.env.CCTVUP_CRON_TRIGGER_SECRET?.trim();
  const providedSecret = request.headers.get(CRON_SECRET_HEADER)?.trim()
    || request.headers.get(ADMIN_SECRET_HEADER)?.trim()
    || '';
  return getCctvUpCronAuthState({ expectedSecret, providedSecret });
}

async function readDateFromRequest(request: Request) {
  const url = new URL(request.url);
  const queryDate = url.searchParams.get('date')?.trim();
  if (queryDate) return queryDate;

  try {
    const body = await request.json();
    if (body && typeof body.date === 'string') return body.date.trim();
  } catch {
    // body 없는 POST 허용
  }

  return undefined;
}

function isReportDateValidationMessage(message: string) {
  return message.includes('YYYY-MM-DD') || message.includes('존재하지 않는 보고서 날짜');
}

export async function POST(request: Request) {
  const auth = readMutationSecret(request);
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, message: auth.message, mode: auth.mode },
      { status: auth.status, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  try {
    const date = await readDateFromRequest(request);
    const result = await generateCctvUpDailyReport({ date });
    return NextResponse.json(
      {
        ok: true,
        date: result.date,
        paths: result.paths,
        manifest: result.manifest,
        summary: result.report.summary,
        markdown: result.report.markdown,
        raw: {
          date: result.report.date,
          summary: result.report.summary,
          companies: result.report.companies,
          notableFarms: result.report.notableFarms,
        },
        message: `${result.date} CCTVUP 일일 브리핑을 생성했습니다.`,
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'CCTVUP 일일 브리핑 생성에 실패했습니다.';
    return NextResponse.json(
      {
        ok: false,
        message,
      },
      { status: isReportDateValidationMessage(message) ? 400 : 500, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
