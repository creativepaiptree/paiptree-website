import { NextResponse } from 'next/server';
import versionNotes from '@/data/version-notes.json';
import {
  type ReleaseNote,
  fetchReleaseNotesFromSupabase,
  normalizeAndSortReleaseNotes,
} from '@/lib/releaseNotes';

type ReleaseNotesPayload = {
  notes: ReleaseNote[];
  meta: {
    total: number;
    valid: number;
    invalid: number;
    source: 'supabase' | 'json';
  };
};

const SUPABASE_TIMEOUT_MS = 5000;

export async function GET() {
  const jsonRawNotes = Array.isArray(versionNotes) ? versionNotes : [];
  const jsonResult = normalizeAndSortReleaseNotes(jsonRawNotes);
  const supabaseResult = await fetchReleaseNotesFromSupabase({
    timeoutMs: SUPABASE_TIMEOUT_MS,
  });

  const useSupabase = Boolean(
    supabaseResult && (supabaseResult.valid > 0 || jsonResult.valid === 0),
  );
  const selected = useSupabase && supabaseResult ? supabaseResult : jsonResult;

  const payload: ReleaseNotesPayload = {
    notes: selected.notes,
    meta: {
      total: selected.total,
      valid: selected.valid,
      invalid: selected.invalid,
      source: useSupabase ? 'supabase' : 'json',
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
}
