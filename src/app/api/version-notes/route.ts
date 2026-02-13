import { NextResponse } from 'next/server';
import {
  type ReleaseNote,
  fetchReleaseNotesFromSupabase,
} from '@/lib/releaseNotes';

type ReleaseNotesPayload = {
  notes: ReleaseNote[];
  meta: {
    total: number;
    valid: number;
    invalid: number;
    source: 'supabase';
  };
};

const SUPABASE_TIMEOUT_MS = 5000;

export async function GET() {
  try {
    const supabaseResult = await fetchReleaseNotesFromSupabase({
      timeoutMs: SUPABASE_TIMEOUT_MS,
    });
    if (!supabaseResult) {
      throw new Error('Supabase version-notes fetch returned null');
    }

    const payload: ReleaseNotesPayload = {
      notes: supabaseResult.notes,
      meta: {
        total: supabaseResult.total,
        valid: supabaseResult.valid,
        invalid: supabaseResult.invalid,
        source: 'supabase',
      },
    };

    return NextResponse.json(
      payload,
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    );
  } catch (error) {
    console.error('[release-notes] Supabase-only fetch failed', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Supabase 기반 버전 노트를 불러오지 못했습니다.',
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    );
  }
}
