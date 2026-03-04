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
