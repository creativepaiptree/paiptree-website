import { NextResponse } from 'next/server';
import {
  buildGitWeeklyReportsPayload,
  fetchGitWeeklyReportsFromSupabase,
} from '@/lib/gitWeeklyReports';

export const runtime = 'nodejs';

const SUPABASE_TIMEOUT_MS = 5000;

export async function GET() {
  try {
    const reports = await fetchGitWeeklyReportsFromSupabase({
      timeoutMs: SUPABASE_TIMEOUT_MS,
    });

    if (reports === null) {
      return NextResponse.json(buildGitWeeklyReportsPayload([], 'unavailable'), {
        status: 503,
        headers: {
          'Cache-Control': 'no-store',
        },
      });
    }

    return NextResponse.json(buildGitWeeklyReportsPayload(reports, 'supabase'), {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('[git-weekly-reports] API unavailable', error);
    return NextResponse.json(buildGitWeeklyReportsPayload([], 'unavailable'), {
      status: 503,
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  }
}
