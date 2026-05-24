import { NextResponse } from 'next/server';
import { readCctvUpDailyReportManifest } from '@/lib/cctvup-daily-report.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const manifest = await readCctvUpDailyReportManifest(process.cwd());
    return NextResponse.json(
      {
        ok: true,
        source: 'content',
        ...manifest,
      },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        source: 'unavailable',
        schemaVersion: 1,
        updatedAt: null,
        reports: [],
        message: error instanceof Error ? error.message : 'CCTVUP 일일 브리핑 목록 조회에 실패했습니다.',
      },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
