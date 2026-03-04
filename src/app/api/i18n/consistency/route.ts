import { NextResponse } from 'next/server';
import { readI18nConsistencyData, type FlatTranslation, type I18nConsistencyData, type Lang, type Service } from '@/app/i18n/consistency.server';

export const dynamic = 'force-dynamic';

const isObjectLike = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const escapeTsString = (value: string): string => {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .replace(/'/g, "\\'");
};

const quoteKey = (key: string): string => `'${escapeTsString(key)}'`;

const serializeValue = (value: unknown, indent = 0): string => {
  if (typeof value === 'string') {
    return `'${escapeTsString(value)}'`;
  }

  if (value === null || value === undefined) {
    return "''";
  }

  if (Array.isArray(value)) {
    return '[]';
  }

  if (isObjectLike(value)) {
    const entries = Object.entries(value);
    if (entries.length === 0) {
      return '{}';
    }

    const pad = ' '.repeat(indent);
    const nextPad = ' '.repeat(indent + 2);
    const body = entries
      .map(
        ([k, v], idx) =>
          `${nextPad}${quoteKey(k)}: ${serializeValue(v, indent + 2)}${idx + 1 === entries.length ? '' : ','}`,
      )
      .join('\n');

    return `{\n${body}\n${pad}}`;
  }

  return `'${escapeTsString(String(value))}'`;
};

const buildTsContent = (flat: FlatTranslation, keys: string[]): string => {
  const nested: Record<string, unknown> = {};

  for (const key of keys) {
    const value = flat[key] ?? '';
    const path = key.split('.');
    let node = nested;

    for (let i = 0; i < path.length; i += 1) {
      const segment = path[i];
      const isLeaf = i === path.length - 1;

      if (isLeaf) {
        node[segment] = value;
        continue;
      }

      if (!isObjectLike(node[segment])) {
        node[segment] = {};
      }

      node = node[segment] as Record<string, unknown>;
    }
  }

  return `export default ${serializeValue(nested, 0)};\n`;
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

const upsertOverrides = async (service: Service, payload: Partial<Record<Lang, FlatTranslation>>) => {
  const config = getSupabaseConfig();
  if (!config) {
    throw new Error(
      'Supabase 설정이 없습니다. SUPABASE_URL 또는 NEXT_PUBLIC_SUPABASE_URL, 그리고 SUPABASE_SERVICE_KEY/SUPABASE_SERVICE_ROLE_KEY 또는 NEXT_PUBLIC_SUPABASE_KEY가 필요합니다.',
    );
  }

  const rows = Object.entries(payload)
    .filter((entry): entry is [Lang, FlatTranslation] => entry[1] !== undefined)
    .flatMap(([lang, translations]) =>
      Object.entries(translations).map(([key, value]) => ({
        service,
        lang,
        key,
        value,
      })),
    );

  if (rows.length === 0) {
    return;
  }

  const endpoint = new URL('/rest/v1/i18n_translation_overrides', config.supabaseUrl);
  endpoint.searchParams.set('on_conflict', 'service,lang,key');

  const response = await fetch(endpoint.toString(), {
    method: 'POST',
    headers: {
      apikey: config.supabaseKey,
      Authorization: `Bearer ${config.supabaseKey}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates',
    },
    body: JSON.stringify(rows),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Supabase 저장 실패 (${response.status}): ${body}`);
  }
};

type SavePayload = {
  service: Service;
  keys: string[];
  languages: Partial<Record<Lang, FlatTranslation>>;
};

type ApiPayload = {
  success: true;
  data: I18nConsistencyData;
};

export async function GET() {
  try {
    const data = await readI18nConsistencyData();
    const payload: ApiPayload = {
      success: true,
      data,
    };

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '정합성 데이터를 읽지 못했습니다.',
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as SavePayload;
    const validServices = new Set<Service>(['FM-AI', 'FM-EMS and PoC']);
    if (!payload || !validServices.has(payload.service) || !Array.isArray(payload.keys)) {
      return NextResponse.json(
        {
          success: false,
          error: '요청 형식이 올바르지 않습니다.',
        },
        { status: 400 },
      );
    }

    const keys = Array.from(new Set(payload.keys)).sort((a, b) => a.localeCompare(b));
    const toSave: Partial<Record<Lang, FlatTranslation>> = {};

    for (const lang of ['en', 'ko', 'th', 'tw', 'jp'] as const) {
      const map = payload.languages?.[lang] ?? {};
      const flat: FlatTranslation = {};

      for (const key of keys) {
        const value = map[key];
        flat[key] = typeof value === 'string' ? value : '';
      }

      toSave[lang] = flat;
    }

    await upsertOverrides(payload.service, toSave);

    return NextResponse.json(
      {
        success: true,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '번역 파일 저장에 실패했습니다.',
      },
      { status: 500 },
    );
  }
}
