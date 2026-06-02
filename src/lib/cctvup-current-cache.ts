import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { CctvUpPayload } from '@/lib/cctvup';

type CctvUpCurrentCacheDocument = {
  schemaVersion: 1;
  savedAt: string;
  payload: CctvUpPayload;
};

const DEFAULT_CACHE_PATH = '/tmp/paiptree-cctvup-current.json';
const DEFAULT_MAX_AGE_MS = 20 * 60 * 1000;

export function getCctvUpCurrentCachePath() {
  return process.env.CCTVUP_CURRENT_CACHE_PATH?.trim() || DEFAULT_CACHE_PATH;
}

function getCctvUpCurrentCacheMaxAgeMs() {
  const value = Number(process.env.CCTVUP_CURRENT_CACHE_MAX_AGE_MS || DEFAULT_MAX_AGE_MS);
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_MAX_AGE_MS;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

export function isValidCctvUpCurrentCachePayload(value: unknown): value is CctvUpPayload {
  if (!isRecord(value)) return false;
  if (value.source !== 'db') return false;
  if (typeof value.checkedAt !== 'string' || !value.checkedAt) return false;
  if (!Array.isArray(value.rows) || value.rows.length === 0) return false;
  if (!isRecord(value.summary)) return false;
  return Number(value.summary.farms ?? 0) > 0 && Number(value.summary.cameras ?? 0) > 0;
}

function normalizeCachedPayload(payload: CctvUpPayload, savedAt: string): CctvUpPayload {
  return {
    ...payload,
    source: 'db',
    checkedAt: payload.checkedAt || savedAt,
    rows: Array.isArray(payload.rows) ? payload.rows : [],
    incidents: Array.isArray(payload.incidents) ? payload.incidents : [],
    currentIssues: Array.isArray(payload.currentIssues) ? payload.currentIssues : [],
    message: `로컬 CCTVUP 릴레이의 최신 운영 DB 스냅샷을 표시합니다. 저장 ${new Date(savedAt).toLocaleString('ko-KR')}`,
  };
}

export async function readCctvUpCurrentCachePayload(): Promise<CctvUpPayload | null> {
  const cachePath = getCctvUpCurrentCachePath();
  try {
    const text = await fs.readFile(cachePath, 'utf8');
    const document = JSON.parse(text) as Partial<CctvUpCurrentCacheDocument>;
    if (document.schemaVersion !== 1 || !document.savedAt || !isValidCctvUpCurrentCachePayload(document.payload)) {
      return null;
    }

    const savedAtMs = Date.parse(document.savedAt);
    if (!Number.isFinite(savedAtMs)) return null;
    if (Date.now() - savedAtMs > getCctvUpCurrentCacheMaxAgeMs()) return null;

    return normalizeCachedPayload(document.payload, document.savedAt);
  } catch {
    return null;
  }
}

export async function writeCctvUpCurrentCachePayload(payload: CctvUpPayload) {
  if (!isValidCctvUpCurrentCachePayload(payload)) {
    throw new Error('CCTVUP current cache payload는 source=db이고 rows/summary가 있는 전체 현재 목록이어야 합니다.');
  }

  const cachePath = getCctvUpCurrentCachePath();
  const cacheDir = path.dirname(cachePath);
  const savedAt = new Date().toISOString();
  const document: CctvUpCurrentCacheDocument = {
    schemaVersion: 1,
    savedAt,
    payload,
  };
  const tempPath = `${cachePath}.${process.pid}.${Date.now()}.tmp`;

  await fs.mkdir(cacheDir, { recursive: true });
  await fs.writeFile(tempPath, `${JSON.stringify(document)}\n`, 'utf8');
  await fs.rename(tempPath, cachePath);

  return {
    ok: true as const,
    cachePath,
    savedAt,
    summary: payload.summary,
  };
}
