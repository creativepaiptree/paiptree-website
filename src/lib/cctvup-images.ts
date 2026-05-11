import mysql from 'mysql2/promise';
import type { ExecuteValues, QueryOptions, RowDataPacket } from 'mysql2';

export type CctvUpImageEvidenceKind = 'latest' | 'before_issue' | 'recovery';

export type CctvUpImageEvidenceItem = {
  kind: CctvUpImageEvidenceKind;
  label: string;
  status: 'available' | 'missing';
  capturedAt: string | null;
  fileRef: string | null;
  fileSize: number | null;
  dataType: string | null;
  note: string;
};

export type CctvUpImageEvidencePayload = {
  source: 'db' | 'unavailable';
  table: 'paip.tbl_farm_image';
  checkedAt: string;
  cameraKey: string;
  farmId: string;
  houseId: string;
  moduleId: string;
  items: CctvUpImageEvidenceItem[];
  message: string;
};

export type CctvUpImageDbRow = RowDataPacket & {
  create_time: Date | string;
  farm_id: string;
  house_id: string;
  module_id: string;
  data_type?: string | null;
  file_name?: string | null;
  file_size?: string | number | null;
};

type FetchImageEvidenceOptions = {
  farmId: string;
  houseId: string;
  moduleId: string;
  firstMissedAt?: string | null;
  openedAt?: string | null;
  resolvedAt?: string | null;
};

const IMAGE_TABLE = 'paip.tbl_farm_image' as const;
const IMAGE_QUERY_TIMEOUT_MS = Number(process.env.CCTVUP_IMAGE_QUERY_TIMEOUT_MS || 5000);
const READ_ONLY_SQL_PATTERN = /^(?:select|with)\b/i;
const LOCKING_READ_PATTERN = /\b(?:for\s+update|lock\s+in\s+share\s+mode)\b/i;

function getDbConfig() {
  const host = process.env.CCTVUP_DB_HOST?.trim();
  const user = process.env.CCTVUP_DB_USER?.trim();
  const password = process.env.CCTVUP_DB_PASSWORD;
  const database = process.env.CCTVUP_DB_DATABASE?.trim() || 'paip';
  const port = Number(process.env.CCTVUP_DB_PORT || 3306);

  if (!host || !user || !password || !Number.isFinite(port)) return null;
  return { host, user, password, database, port };
}

function assertReadOnlySql(sql: string) {
  const normalizedSql = sql
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/--.*$/gm, ' ')
    .trim()
    .replace(/;+$/g, '')
    .trim();

  if (!READ_ONLY_SQL_PATTERN.test(normalizedSql) || normalizedSql.includes(';') || LOCKING_READ_PATTERN.test(normalizedSql)) {
    throw new Error('CCTVUP 원본 DB 연결은 SELECT/WITH 조회만 허용합니다.');
  }
}

async function executeReadOnlyDbQuery<T extends RowDataPacket[]>(
  connection: mysql.Connection,
  query: QueryOptions,
  values?: ExecuteValues,
) {
  assertReadOnlySql(query.sql);
  return connection.execute<T>(query, values);
}

function normalizeModuleCandidates(moduleId: string) {
  const normalized = moduleId.replace(/,1$/, '');
  return Array.from(new Set([normalized, `${normalized},1`]));
}

function toIso(value: Date | string | null | undefined) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function toDbDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function toNullableNumber(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === '') return null;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function maskFileName(fileName?: string | null) {
  if (!fileName) return null;
  const extension = fileName.includes('.') ? `.${fileName.split('.').pop()}` : '';
  const prefix = fileName.slice(0, 10);
  const suffix = fileName.slice(Math.max(0, fileName.length - Math.max(16, extension.length + 8)));
  return `${prefix}...${suffix}`;
}

function toEvidenceItem(
  kind: CctvUpImageEvidenceKind,
  label: string,
  row: CctvUpImageDbRow | null,
  note: string,
): CctvUpImageEvidenceItem {
  const capturedAt = toIso(row?.create_time);
  const fileName = row?.file_name?.trim() || null;
  const hasImage = Boolean(row && fileName && capturedAt);

  return {
    kind,
    label,
    status: hasImage ? 'available' : 'missing',
    capturedAt,
    fileRef: maskFileName(fileName),
    fileSize: toNullableNumber(row?.file_size),
    dataType: row?.data_type?.trim() || null,
    note,
  };
}

function buildUnavailablePayload(options: FetchImageEvidenceOptions, message: string): CctvUpImageEvidencePayload {
  return {
    source: 'unavailable',
    table: IMAGE_TABLE,
    checkedAt: new Date().toISOString(),
    cameraKey: `${options.farmId}-${options.houseId}-${options.moduleId}`,
    farmId: options.farmId,
    houseId: options.houseId,
    moduleId: options.moduleId,
    items: [],
    message,
  };
}

async function fetchImageRow(
  connection: mysql.Connection,
  options: FetchImageEvidenceOptions,
  mode: 'latest' | 'before' | 'after',
  anchorAt?: Date | null,
) {
  const [moduleA, moduleB] = normalizeModuleCandidates(options.moduleId);
  const baseValues: ExecuteValues = [options.farmId, options.houseId, moduleA, moduleB];
  let timeClause = '';
  let orderBy = 'ORDER BY create_time DESC';
  let values = baseValues;

  if (mode === 'before' && anchorAt) {
    timeClause = 'AND create_time <= ?';
    values = [...baseValues, anchorAt];
  }

  if (mode === 'after' && anchorAt) {
    timeClause = 'AND create_time >= ?';
    orderBy = 'ORDER BY create_time ASC';
    values = [...baseValues, anchorAt];
  }

  const [rows] = await executeReadOnlyDbQuery<CctvUpImageDbRow[]>(
    connection,
    {
      sql: `
        SELECT
          CREATE_TIME AS create_time,
          FARM_ID AS farm_id,
          HOUSE_ID AS house_id,
          MODULE_ID AS module_id,
          DATA_TYPE AS data_type,
          FILE_NAME AS file_name,
          FILE_SIZE AS file_size
        FROM tbl_farm_image FORCE INDEX (idx_farm_house_module_createtime)
        WHERE FARM_ID = ?
          AND HOUSE_ID = ?
          AND MODULE_ID IN (?, ?)
          ${timeClause}
        ${orderBy}
        LIMIT 1
      `,
      timeout: IMAGE_QUERY_TIMEOUT_MS,
    },
    values,
  );

  return rows[0] ?? null;
}

export async function fetchCctvUpImageEvidencePayload(
  options: FetchImageEvidenceOptions,
): Promise<CctvUpImageEvidencePayload> {
  const checkedAt = new Date().toISOString();
  const dbConfig = getDbConfig();

  if (!dbConfig) {
    return buildUnavailablePayload(options, 'CCTVUP_DB_* 환경변수가 없어 5분 저장 근거를 조회하지 못합니다.');
  }

  let connection: mysql.Connection | null = null;

  try {
    connection = await mysql.createConnection({
      ...dbConfig,
      connectTimeout: 3000,
      supportBigNumbers: true,
      dateStrings: false,
    });

    const issueAnchorAt = toDbDate(options.firstMissedAt) ?? toDbDate(options.openedAt);
    const recoveryAnchorAt = toDbDate(options.openedAt);
    const latestRow = await fetchImageRow(connection, options, 'latest');
    const beforeIssueRow = issueAnchorAt ? await fetchImageRow(connection, options, 'before', issueAnchorAt) : null;
    const recoveryRow = recoveryAnchorAt ? await fetchImageRow(connection, options, 'after', recoveryAnchorAt) : null;

    return {
      source: 'db',
      table: IMAGE_TABLE,
      checkedAt,
      cameraKey: `${options.farmId}-${options.houseId}-${options.moduleId}`,
      farmId: options.farmId,
      houseId: options.houseId,
      moduleId: options.moduleId,
      items: [
        toEvidenceItem('latest', '최신 저장', latestRow, '현재 입력 최신성을 확인하는 기준 저장 기록입니다.'),
        toEvidenceItem('before_issue', '중단 직전', beforeIssueRow, issueAnchorAt ? '문제 구간 시작 직전 마지막으로 확인된 저장 기록입니다.' : '아직 문제 시작 시각이 없어 비교 기록을 특정하지 않았습니다.'),
        toEvidenceItem('recovery', '회복 확인', recoveryRow, recoveryAnchorAt ? '문제 확정 이후 처음 다시 들어온 저장 기록입니다.' : '문제 확정 이력이 없어 회복 기록을 특정하지 않았습니다.'),
      ],
      message: '선택 카메라의 5분 저장 근거를 원본 DB에서 읽었습니다.',
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : '5분 저장 근거 조회 실패';
    return buildUnavailablePayload(options, message.slice(0, 240));
  } finally {
    await connection?.end().catch(() => undefined);
  }
}
