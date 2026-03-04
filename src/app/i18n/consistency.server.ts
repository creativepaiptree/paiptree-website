import { promises as fs } from 'node:fs';
import path from 'node:path';

export const LANGS = ['en', 'ko', 'th', 'tw', 'jp'] as const;
export type Lang = (typeof LANGS)[number];

export const SERVICES = ['FM-AI', 'FM-EMS and PoC'] as const;
export type Service = (typeof SERVICES)[number];

export type FlatTranslation = Record<string, string>;

export type ServiceConsistency = {
  keys: string[];
  languages: Partial<Record<Lang, FlatTranslation>>;
  errors: Partial<Record<Lang, string>>;
};

export type I18nConsistencyData = Record<Service, ServiceConsistency>;

const I18N_ROOT_DIR = path.join(process.cwd(), 'i18n', 'FM-i18n');
export const FILE_PREFIX: Record<Service, string> = {
  'FM-AI': 'ai',
  'FM-EMS and PoC': 'ems',
};

type SupabaseOverridePayload = {
  service: string;
  lang: string;
  key: string;
  value: string | null;
};

const isObjectLike = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const parseTsFile = (source: string): Record<string, unknown> => {
  const cleaned = source.replace(/^\uFEFF?export default\s*/, '').trim();
  const body = cleaned.replace(/;+\s*$/, '');
  const value = new Function(`return (${body})`)();
  if (!isObjectLike(value)) {
    throw new Error('번들 루트 객체가 아닙니다.');
  }
  return value;
};

const flattenTranslations = (
  value: Record<string, unknown>,
  prefix = '',
): FlatTranslation => {
  const out: FlatTranslation = {};

  const walk = (curr: unknown, keyPrefix: string): void => {
    if (isObjectLike(curr)) {
      for (const [key, value] of Object.entries(curr)) {
        walk(value, keyPrefix ? `${keyPrefix}.${key}` : key);
      }
      return;
    }

    out[keyPrefix] = curr === null || curr === undefined ? '' : String(curr);
  };

  walk(value, prefix);
  return out;
};

const getSupabaseConfig = () => {
  const supabaseUrl = process.env.SUPABASE_URL?.trim() || process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseKey =
    process.env.SUPABASE_SERVICE_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_KEY?.trim();

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  return {
    supabaseUrl: supabaseUrl.endsWith('/') ? supabaseUrl : `${supabaseUrl}/`,
    supabaseKey,
  };
};

const normalizeValue = (value: unknown): string => {
  if (typeof value === 'undefined' || value === null) {
    return '';
  }

  return String(value);
};

const fetchLanguageOverrides = async (service: Service): Promise<{
  data: Partial<Record<Lang, FlatTranslation>>;
  error: string | null;
}> => {
  const config = getSupabaseConfig();
  if (!config) {
    return { data: {}, error: null };
  }

  const endpoint = new URL(`/rest/v1/i18n_translation_overrides`, config.supabaseUrl);
  endpoint.searchParams.set('select', 'service,lang,key,value');
  endpoint.searchParams.set('service', `eq.${service}`);
  endpoint.searchParams.set('order', 'lang.asc,key.asc');
  endpoint.searchParams.set('limit', '100000');

  try {
      const response = await fetch(endpoint.toString(), {
        method: 'GET',
        headers: {
          apikey: config.supabaseKey,
          Authorization: `Bearer ${config.supabaseKey}`,
          Accept: 'application/json',
        },
      });

    if (!response.ok) {
      const body = await response.text();
      return {
        data: {},
        error: `Supabase 번역 데이터 조회 실패 (${response.status}): ${body}`,
      };
    }

    const rows = (await response.json()) as unknown[];
    if (!Array.isArray(rows)) {
      return { data: {}, error: 'Supabase 응답이 배열이 아닙니다.' };
    }

    const data: Partial<Record<Lang, FlatTranslation>> = {};
    for (const row of rows) {
      if (!isObjectLike(row)) {
        continue;
      }
      const payload = row as SupabaseOverridePayload;
      const lang = payload.lang as Lang;
      if (!LANGS.includes(lang as Lang)) {
        continue;
      }

      const current = data[lang] ?? {};
      if (typeof payload.key === 'string') {
        current[payload.key] = normalizeValue(payload.value);
      }
      data[lang] = current;
    }

    return { data, error: null };
  } catch (error) {
    return {
      data: {},
      error: error instanceof Error ? error.message : 'Supabase 조회 중 알 수 없는 오류',
    };
  }
};

const readServiceData = async (service: Service): Promise<ServiceConsistency> => {
  const filenamePrefix = FILE_PREFIX[service];
  const serviceDir = path.join(I18N_ROOT_DIR, service);
  const languages: ServiceConsistency['languages'] = {};
  const errors: ServiceConsistency['errors'] = {};
  const keys = new Set<string>();

  for (const lang of LANGS) {
    const filename = `${filenamePrefix}_${lang}.ts`;
    const filePath = path.join(serviceDir, filename);

    try {
      const raw = await fs.readFile(filePath, 'utf-8');
      const parsed = parseTsFile(raw);
      const flattened = flattenTranslations(parsed);
      languages[lang] = flattened;

      for (const key of Object.keys(flattened)) {
        keys.add(key);
      }
    } catch (error) {
      errors[lang] = error instanceof Error ? error.message : '알 수 없는 오류';
      languages[lang] = {};
    }
  }

  const overrideResult = await fetchLanguageOverrides(service);
  if (overrideResult.error) {
    for (const lang of LANGS) {
      const existed = errors[lang];
      errors[lang] = existed
        ? `${existed} / Supabase: ${overrideResult.error}`
        : `Supabase: ${overrideResult.error}`;
    }
  } else {
    for (const lang of LANGS) {
      const overrideMap = overrideResult.data[lang];
      if (!overrideMap) {
        continue;
      }

      const merged = {
        ...(languages[lang] ?? {}),
        ...overrideMap,
      };
      languages[lang] = merged;

      for (const key of Object.keys(overrideMap)) {
        keys.add(key);
      }
    }
  }

  return {
    keys: Array.from(keys).sort((a, b) => a.localeCompare(b)),
    languages,
    errors,
  };
};

export const readI18nConsistencyData = async (): Promise<I18nConsistencyData> => {
  const entries = await Promise.all(
    SERVICES.map(async (service) => {
      const data = await readServiceData(service);
      return [service, data] as const;
    }),
  );

  return Object.fromEntries(entries) as I18nConsistencyData;
};
