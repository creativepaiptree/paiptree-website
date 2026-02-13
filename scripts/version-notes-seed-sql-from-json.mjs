import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const SOURCE_JSON_PATH = path.join(ROOT_DIR, 'src/data/version-notes.json');
const OUTPUT_SQL_PATH = path.join(ROOT_DIR, 'docs/sql/supabase/002_seed_project_release_notes_from_json.sql');
const PROJECT_ID_PATTERN = /^[a-z0-9][a-z0-9_-]{1,63}$/;
const VERSION_PATTERN = /^\d+\.\d+\.\d+$/;

const projectId = process.env.SUPABASE_PROJECT_ID?.trim() || 'poc';

const escapeLiteral = (value) => value.replace(/'/g, "''");

const toIsoDate = (rawDate) => {
  if (typeof rawDate !== 'string') {
    return null;
  }

  const parts = rawDate
    .trim()
    .split(/[./-]/)
    .filter(Boolean);

  if (parts.length !== 3 || parts.some((part) => !/^\d+$/.test(part))) {
    return null;
  }

  const [yearPart, monthPart, dayPart] = parts;
  const fullYear = yearPart.length === 4 ? Number(yearPart) : 2000 + Number(yearPart);
  const month = Number(monthPart);
  const day = Number(dayPart);

  const date = new Date(Date.UTC(fullYear, month - 1, day));
  if (
    Number.isNaN(date.getTime()) ||
    date.getUTCFullYear() !== fullYear ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${fullYear}-${mm}-${dd}`;
};

const validateItem = (item) => {
  if (typeof item !== 'object' || item === null) {
    return false;
  }

  const { titleKo, titleEn, detailsKo, detailsEn } = item;
  return (
    typeof titleKo === 'string' &&
    titleKo.trim().length > 0 &&
    typeof titleEn === 'string' &&
    titleEn.trim().length > 0 &&
    Array.isArray(detailsKo) &&
    detailsKo.every((detail) => typeof detail === 'string') &&
    Array.isArray(detailsEn) &&
    detailsEn.every((detail) => typeof detail === 'string')
  );
};

const normalizeNote = (note, index) => {
  if (typeof note !== 'object' || note === null) {
    throw new Error(`Invalid note at index ${index}: expected object`);
  }

  const { version, date, items } = note;
  if (typeof version !== 'string' || !VERSION_PATTERN.test(version.trim())) {
    throw new Error(`Invalid version at index ${index}: ${String(version)}`);
  }

  const isoDate = toIsoDate(date);
  if (!isoDate) {
    throw new Error(`Invalid date at index ${index}: ${String(date)}`);
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error(`Invalid items at index ${index}: expected non-empty array`);
  }
  if (!items.every(validateItem)) {
    throw new Error(`Invalid item contract at index ${index}`);
  }

  return {
    version: version.trim(),
    releasedOn: isoDate,
    items,
  };
};

const run = async () => {
  if (!PROJECT_ID_PATTERN.test(projectId)) {
    throw new Error(`Invalid SUPABASE_PROJECT_ID: ${projectId}`);
  }

  const raw = await fs.readFile(SOURCE_JSON_PATH, 'utf8');
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('src/data/version-notes.json must be a non-empty array');
  }

  const notes = parsed.map(normalizeNote);

  const valuesSql = notes
    .map((note) => {
      const itemsJson = escapeLiteral(JSON.stringify(note.items));
      return `  ('${projectId}', '${note.version}', '${note.releasedOn}', '${itemsJson}'::jsonb, '{}'::jsonb, true)`;
    })
    .join(',\n');

  const sql = `begin;

insert into public.project_release_notes (
  project_id,
  version,
  released_on,
  items,
  meta,
  is_public
)
values
${valuesSql}
on conflict (project_id, version)
do update set
  released_on = excluded.released_on,
  items = excluded.items,
  meta = excluded.meta,
  is_public = excluded.is_public,
  updated_at = now();

commit;
`;

  await fs.mkdir(path.dirname(OUTPUT_SQL_PATH), { recursive: true });
  await fs.writeFile(OUTPUT_SQL_PATH, sql, 'utf8');

  console.log(`Generated: ${path.relative(ROOT_DIR, OUTPUT_SQL_PATH)}`);
  console.log(`Rows: ${notes.length}`);
  console.log(`Project: ${projectId}`);
};

run().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
