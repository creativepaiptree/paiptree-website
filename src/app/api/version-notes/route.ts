import { NextResponse } from 'next/server';
import versionNotes from '@/data/version-notes.json';

type ReleaseItem = {
  titleKo: string;
  titleEn: string;
  detailsKo: string[];
  detailsEn: string[];
};

type ReleaseNote = {
  version: string;
  date: string;
  items: ReleaseItem[];
};

type ReleaseNotesPayload = {
  notes: ReleaseNote[];
  meta: {
    total: number;
    valid: number;
    invalid: number;
  };
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

  const items = Array.isArray(note.items) ? note.items.map(sanitizeReleaseItem).filter((item): item is ReleaseItem => item !== null) : [];
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

export async function GET() {
  const rawNotes = Array.isArray(versionNotes) ? versionNotes : [];
  const normalizedNotes = rawNotes
    .map(sanitizeReleaseNote)
    .filter((note): note is ReleaseNote => note !== null)
    .sort((a, b) => {
      const versionOrder = compareSemverDesc(a.version, b.version);
      if (versionOrder !== 0) {
        return versionOrder;
      }
      return compareDateDesc(a.date, b.date);
    });

  const payload: ReleaseNotesPayload = {
    notes: normalizedNotes,
    meta: {
      total: rawNotes.length,
      valid: normalizedNotes.length,
      invalid: rawNotes.length - normalizedNotes.length,
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
