import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  fetchReleaseNotesFromSupabase,
  type NormalizedNotes,
} from '@/lib/releaseNotes';

export const runtime = 'nodejs';

const PROJECT_ID_PATTERN = /^[a-z0-9][a-z0-9_-]{1,63}$/;
const MIRROR_SECRET_HEADER = 'x-release-mirror-secret';
const MIRROR_OUTPUT_PATH = path.join(process.cwd(), 'src/data/version-notes.json');

type MirrorSyncRequest = {
  projectId?: string;
};

const toPositiveInt = (raw: string | undefined, fallback: number) => {
  if (!raw) {
    return fallback;
  }
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.floor(parsed);
};

const readProjectId = (body: MirrorSyncRequest) => {
  const candidate = typeof body.projectId === 'string' ? body.projectId.trim() : '';
  const fallback = process.env.SUPABASE_PROJECT_ID?.trim() || 'poc';
  return candidate || fallback;
};

const writeMirrorJson = async (payload: NormalizedNotes) => {
  const jsonText = `${JSON.stringify(payload.notes, null, 2)}\n`;
  await writeFile(MIRROR_OUTPUT_PATH, jsonText, 'utf8');
};

export async function POST(request: NextRequest) {
  const expectedSecret = process.env.RELEASE_MIRROR_TRIGGER_SECRET?.trim();
  if (!expectedSecret) {
    return NextResponse.json(
      {
        ok: false,
        error: 'RELEASE_MIRROR_TRIGGER_SECRET is not configured.',
      },
      { status: 503 },
    );
  }

  const providedSecret = request.headers.get(MIRROR_SECRET_HEADER)?.trim();
  if (!providedSecret || providedSecret !== expectedSecret) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Unauthorized mirror sync request.',
      },
      { status: 401 },
    );
  }

  const body = await request.json().catch(() => ({})) as MirrorSyncRequest;
  const projectId = readProjectId(body);
  if (!PROJECT_ID_PATTERN.test(projectId)) {
    return NextResponse.json(
      {
        ok: false,
        error: `Invalid projectId: ${projectId}`,
      },
      { status: 400 },
    );
  }

  const timeoutMs = toPositiveInt(process.env.RELEASE_MIRROR_TIMEOUT_MS, 5000);
  const mirrorData = await fetchReleaseNotesFromSupabase({
    projectId,
    timeoutMs,
  });

  if (!mirrorData) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Supabase release-note fetch failed.',
      },
      { status: 502 },
    );
  }

  if (mirrorData.valid === 0) {
    return NextResponse.json(
      {
        ok: false,
        error: 'No valid release notes to mirror.',
        meta: {
          total: mirrorData.total,
          valid: mirrorData.valid,
          invalid: mirrorData.invalid,
        },
      },
      { status: 422 },
    );
  }

  try {
    await writeMirrorJson(mirrorData);

    return NextResponse.json(
      {
        ok: true,
        projectId,
        syncedCount: mirrorData.valid,
        mirrorPath: 'src/data/version-notes.json',
        meta: {
          total: mirrorData.total,
          valid: mirrorData.valid,
          invalid: mirrorData.invalid,
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to write mirror JSON file.',
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
