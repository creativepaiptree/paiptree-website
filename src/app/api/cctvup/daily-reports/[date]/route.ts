import { NextResponse } from 'next/server';
import { readCctvUpDailyReportDetail } from '@/lib/cctvup-daily-report.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = {
  params: {
    date: string;
  };
};

function isReportDateValidationMessage(message: string) {
  return message.includes('YYYY-MM-DD') || message.includes('존재하지 않는 보고서 날짜');
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const detail = await readCctvUpDailyReportDetail(context.params.date, process.cwd());
    return NextResponse.json(
      {
        ok: true,
        source: 'content',
        ...detail,
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'CCTVUP 일일 브리핑 상세 조회에 실패했습니다.';
    const isMissing = error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT';
    const isInvalidDate = isReportDateValidationMessage(message);
    return NextResponse.json(
      {
        ok: false,
        source: 'unavailable',
        date: context.params.date,
        markdown: '',
        raw: null,
        message,
      },
      { status: isInvalidDate ? 400 : isMissing ? 404 : 500, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
