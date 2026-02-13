import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const OUTPUT_JSON_PATH = path.join(ROOT_DIR, 'src/data/version-notes.json');

const VERSION_PATTERN = /^\d+\.\d+\.\d+$/;
const DATE_PATTERN = /^\d{2}\.\d{2}\.\d{2}$/;

const supabaseUrl = process.env.SUPABASE_URL?.trim();
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const projectId = process.env.SUPABASE_PROJECT_ID?.trim() || 'poc';
const exportViewName = process.env.SUPABASE_EXPORT_VIEW?.trim() || 'project_release_notes_export_v1';
const allowEmpty = process.env.ALLOW_EMPTY_VERSION_NOTES === 'true';

const compareSemverDesc = (a, b) => {
  const aParts = a.split('.').map(Number);
  const bParts = b.split('.').map(Number);

  for (let index = 0; index < 3; index += 1) {
    if (aParts[index] !== bParts[index]) {
      return bParts[index] - aParts[index];
    }
  }
  return 0;
};

const compareDateDesc = (a, b) => {
  const [aY, aM, aD] = a.split('.').map(Number);
  const [bY, bM, bD] = b.split('.').map(Number);
  const aValue = (2000 + aY) * 10000 + aM * 100 + aD;
  const bValue = (2000 + bY) * 10000 + bM * 100 + bD;
  return bValue - aValue;
};

const isValidReleaseItem = (item) => {
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
    detailsKo.every((detail) => typeof detail === 'string' && detail.trim().length > 0) &&
    Array.isArray(detailsEn) &&
    detailsEn.every((detail) => typeof detail === 'string' && detail.trim().length > 0)
  );
};

const normalizeReleaseNote = (row, index) => {
  if (typeof row !== 'object' || row === null) {
    throw new Error(`Invalid row at index ${index}: expected object`);
  }

  const version = typeof row.version === 'string' ? row.version.trim() : '';
  const date = typeof row.date === 'string' ? row.date.trim() : '';
  const items = Array.isArray(row.items) ? row.items : [];

  if (!VERSION_PATTERN.test(version)) {
    throw new Error(`Invalid version at index ${index}: ${String(row.version)}`);
  }
  if (!DATE_PATTERN.test(date)) {
    throw new Error(`Invalid date at index ${index}: ${String(row.date)}`);
  }
  if (items.length === 0 || !items.every(isValidReleaseItem)) {
    throw new Error(`Invalid items at index ${index}`);
  }

  return { version, date, items };
};

const run = async () => {
  if (!supabaseUrl) {
    throw new Error('Missing SUPABASE_URL');
  }
  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
  }

  const endpoint = new URL(`/rest/v1/${exportViewName}`, supabaseUrl.endsWith('/') ? supabaseUrl : `${supabaseUrl}/`);
  endpoint.searchParams.set('project_id', `eq.${projectId}`);
  endpoint.searchParams.set('select', 'version,date,items');
  endpoint.searchParams.set('limit', '500');

  const response = await fetch(endpoint.toString(), {
    method: 'GET',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      Accept: 'application/json',
      Prefer: 'count=exact',
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Supabase fetch failed (${response.status}): ${body}`);
  }

  const rows = await response.json();
  if (!Array.isArray(rows)) {
    throw new Error('Supabase response must be an array');
  }

  if (rows.length === 0 && !allowEmpty) {
    throw new Error('No rows found. If intentional, set ALLOW_EMPTY_VERSION_NOTES=true');
  }

  const notes = rows
    .map(normalizeReleaseNote)
    .sort((a, b) => {
      const semverOrder = compareSemverDesc(a.version, b.version);
      if (semverOrder !== 0) {
        return semverOrder;
      }
      return compareDateDesc(a.date, b.date);
    });

  const payload = `${JSON.stringify(notes, null, 2)}\n`;
  await fs.writeFile(OUTPUT_JSON_PATH, payload, 'utf8');

  console.log(`Synced ${notes.length} rows to ${path.relative(ROOT_DIR, OUTPUT_JSON_PATH)}`);
  console.log(`Project: ${projectId}`);
};

run().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
