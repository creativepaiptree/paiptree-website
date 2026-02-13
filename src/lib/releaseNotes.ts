export type ReleaseItem = {
  titleKo: string;
  titleEn: string;
  detailsKo: string[];
  detailsEn: string[];
};

export type ReleaseNote = {
  version: string;
  date: string;
  items: ReleaseItem[];
};

export type NormalizedNotes = {
  notes: ReleaseNote[];
  total: number;
  valid: number;
  invalid: number;
};

const SEMVER_LIKE_PATTERN = /^\d+\.\d+\.\d+$/;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const normalizeSemverLike = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const raw = value.trim();
  if (!SEMVER_LIKE_PATTERN.test(raw)) {
    return null;
  }

  const [major, minor, patch] = raw.split('.').map((part) => Number(part));
  if ([major, minor, patch].some((part) => Number.isNaN(part))) {
    return null;
  }

  return `${major}.${minor}.${patch}`;
};

const normalizeDate = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const raw = value.trim();
  const parts = raw.split(/[./-]/).filter(Boolean);
  if (parts.length !== 3 || parts.some((part) => !/^\d+$/.test(part))) {
    return null;
  }

  const [yearPart, monthPart, dayPart] = parts;
  const fullYear = yearPart.length === 4 ? Number(yearPart) : 2000 + Number(yearPart);
  const year2 = fullYear % 100;
  const month = Number(monthPart);
  const day = Number(dayPart);

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  const date = new Date(Date.UTC(fullYear, month - 1, day));
  if (
    date.getUTCFullYear() !== fullYear ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return `${String(year2).padStart(2, '0')}.${String(month).padStart(2, '0')}.${String(day).padStart(2, '0')}`;
};

const sanitizeReleaseItem = (item: unknown): ReleaseItem | null => {
  if (!isRecord(item)) {
    return null;
  }

  const titleKo = typeof item.titleKo === 'string' ? item.titleKo.trim() : '';
  const titleEn = typeof item.titleEn === 'string' ? item.titleEn.trim() : '';
  const detailsKo = Array.isArray(item.detailsKo) ? item.detailsKo.filter((d): d is string => typeof d === 'string' && d.trim().length > 0) : [];
  const detailsEn = Array.isArray(item.detailsEn) ? item.detailsEn.filter((d): d is string => typeof d === 'string' && d.trim().length > 0) : [];

  if (!titleKo || !titleEn) {
    return null;
  }

  return {
    titleKo,
    titleEn,
    detailsKo,
    detailsEn,
  };
};

const sanitizeReleaseNote = (note: unknown): ReleaseNote | null => {
  if (!isRecord(note)) {
    return null;
  }

  const version = normalizeSemverLike(note.version);
  const date = normalizeDate(note.date);
  if (!version || !date) {
    return null;
  }

  const items = Array.isArray(note.items)
    ? note.items.map(sanitizeReleaseItem).filter((item): item is ReleaseItem => item !== null)
    : [];

  if (items.length === 0) {
    return null;
  }

  return {
    version,
    date,
    items,
  };
};

const compareSemverDesc = (a: string, b: string): number => {
  const aParts = a.split('.').map(Number);
  const bParts = b.split('.').map(Number);

  for (let index = 0; index < 3; index += 1) {
    if (aParts[index] !== bParts[index]) {
      return bParts[index] - aParts[index];
    }
  }

  return 0;
};

const compareDateDesc = (a: string, b: string): number => {
  const toComparable = (value: string) => {
    const [yy, mm, dd] = value.split('.').map(Number);
    return (2000 + yy) * 10000 + mm * 100 + dd;
  };

  return toComparable(b) - toComparable(a);
};

export const normalizeAndSortReleaseNotes = (rawNotes: unknown[]): NormalizedNotes => {
  const notes = rawNotes
    .map(sanitizeReleaseNote)
    .filter((note): note is ReleaseNote => note !== null)
    .sort((a, b) => {
      const versionOrder = compareSemverDesc(a.version, b.version);
      if (versionOrder !== 0) {
        return versionOrder;
      }
      return compareDateDesc(a.date, b.date);
    });

  return {
    notes,
    total: rawNotes.length,
    valid: notes.length,
    invalid: rawNotes.length - notes.length,
  };
};

export type FetchReleaseNotesFromSupabaseParams = {
  projectId?: string;
  exportView?: string;
  timeoutMs?: number;
};

export const fetchReleaseNotesFromSupabase = async ({
  projectId = process.env.SUPABASE_PROJECT_ID?.trim() || 'poc',
  exportView = process.env.SUPABASE_EXPORT_VIEW?.trim() || 'project_release_notes_export_v1',
  timeoutMs = 5000,
}: FetchReleaseNotesFromSupabaseParams = {}): Promise<NormalizedNotes | null> => {
  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  try {
    const endpoint = new URL(
      `/rest/v1/${exportView}`,
      supabaseUrl.endsWith('/') ? supabaseUrl : `${supabaseUrl}/`,
    );
    endpoint.searchParams.set('project_id', `eq.${projectId}`);
    endpoint.searchParams.set('select', 'version,date,items');
    endpoint.searchParams.set('limit', '500');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(endpoint.toString(), {
      method: 'GET',
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
      signal: controller.signal,
    }).finally(() => {
      clearTimeout(timeout);
    });

    if (!response.ok) {
      throw new Error(`Supabase request failed (${response.status})`);
    }

    const rows = await response.json();
    if (!Array.isArray(rows)) {
      throw new Error('Supabase payload must be an array');
    }

    return normalizeAndSortReleaseNotes(rows);
  } catch (error) {
    console.error('[release-notes] Supabase fetch failed', error);
    return null;
  }
};
