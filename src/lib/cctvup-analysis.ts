import mysql from 'mysql2/promise';
import type { ExecuteValues, QueryOptions, RowDataPacket } from 'mysql2';
import { minutesBetween } from '@/lib/cctvup';

export type CctvUpAnalysisStatus = 'ok' | 'late' | 'missing' | 'abnormal' | 'input_missing' | 'unavailable';

export type CctvUpAnalysisRecord = {
  createdAt: string;
  status: string;
  modelWeight: number | null;
  dinoWeight: number | null;
  predictionCount: string | null;
};

export type CctvUpAnalysisPayload = {
  source: 'db' | 'unavailable';
  table: 'paip.tbl_farm_image_analysis_weight_v2';
  checkedAt: string;
  cameraKey: string;
  farmId: string;
  houseId: string;
  moduleId: string;
  windowHours: number;
  analysisStatus: CctvUpAnalysisStatus;
  statusLabel: string;
  latestImageAt?: string | null;
  latestAnalysisAt?: string | null;
  latestAnalysisStatus?: string | null;
  analysisAgeMinutes?: number | null;
  imageAgeMinutes?: number | null;
  imageAnalysisLagMinutes?: number | null;
  recordCount: number;
  successCount: number;
  abnormalCount: number;
  records: CctvUpAnalysisRecord[];
  message: string;
};

type AnalysisDbRow = RowDataPacket & {
  create_time: Date | string;
  weight_prediction_status?: string | null;
  weight_prediction_model_weight?: number | string | null;
  dino_weight?: number | string | null;
  weight_prediction_count?: string | number | null;
};

type FetchAnalysisOptions = {
  farmId: string;
  houseId: string;
  moduleId: string;
  latestImageAt?: string | null;
  windowHours?: number;
  limit?: number;
};

const ANALYSIS_TABLE = 'paip.tbl_farm_image_analysis_weight_v2' as const;
const DEFAULT_WINDOW_HOURS = 2;
const DEFAULT_LIMIT = 12;
const ANALYSIS_LATE_MINUTES = 15;
const ANALYSIS_QUERY_TIMEOUT_MS = Number(process.env.CCTVUP_ANALYSIS_QUERY_TIMEOUT_MS || 5000);
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

function toNullableNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === '') return null;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function normalizeStatus(value?: string | null) {
  return (value || '').trim();
}

function isSuccessStatus(value?: string | null) {
  return normalizeStatus(value).toLowerCase() === 'success';
}

function getStatusLabel(status: CctvUpAnalysisStatus) {
  if (status === 'ok') return '분석 정상';
  if (status === 'late') return '분석 지연';
  if (status === 'missing') return '이미지 있음 / 분석 없음';
  if (status === 'abnormal') return '분석 비정상';
  if (status === 'input_missing') return '이미지 입력 대기';
  return '분석 확인 불가';
}

function buildUnavailablePayload(options: FetchAnalysisOptions, message: string): CctvUpAnalysisPayload {
  const checkedAt = new Date().toISOString();
  return {
    source: 'unavailable',
    table: ANALYSIS_TABLE,
    checkedAt,
    cameraKey: `${options.farmId}-${options.houseId}-${options.moduleId}`,
    farmId: options.farmId,
    houseId: options.houseId,
    moduleId: options.moduleId,
    windowHours: options.windowHours ?? DEFAULT_WINDOW_HOURS,
    analysisStatus: 'unavailable',
    statusLabel: getStatusLabel('unavailable'),
    latestImageAt: options.latestImageAt ?? null,
    recordCount: 0,
    successCount: 0,
    abnormalCount: 0,
    records: [],
    message,
  };
}

function classifyAnalysisStatus(params: {
  records: CctvUpAnalysisRecord[];
  latestImageAt?: string | null;
  checkedAt: string;
}) {
  const latest = params.records[0];
  const latestImageAt = toIso(params.latestImageAt);
  const imageAgeMinutes = latestImageAt ? minutesBetween(new Date(params.checkedAt), latestImageAt) : null;

  if (!latest) {
    return {
      analysisStatus: latestImageAt ? 'missing' as const : 'input_missing' as const,
      analysisAgeMinutes: null,
      imageAgeMinutes,
      imageAnalysisLagMinutes: null,
      message: latestImageAt
        ? '최근 이미지 입력은 있으나 분석 결과가 조회되지 않았습니다.'
        : '최근 이미지 입력이 없어 분석 결과를 별도 문제로 판단하지 않습니다.',
    };
  }

  const analysisAgeMinutes = minutesBetween(new Date(params.checkedAt), latest.createdAt);
  const imageAnalysisLagMinutes = latestImageAt
    ? Math.max(0, Math.floor((new Date(latestImageAt).getTime() - new Date(latest.createdAt).getTime()) / 60000))
    : null;
  const latestStatus = normalizeStatus(latest.status);

  if (!isSuccessStatus(latestStatus)) {
    return {
      analysisStatus: 'abnormal' as const,
      analysisAgeMinutes,
      imageAgeMinutes,
      imageAnalysisLagMinutes,
      message: `최근 분석 상태가 ${latestStatus || 'unknown'}입니다.`,
    };
  }

  if (analysisAgeMinutes >= ANALYSIS_LATE_MINUTES || (imageAnalysisLagMinutes !== null && imageAnalysisLagMinutes >= ANALYSIS_LATE_MINUTES)) {
    return {
      analysisStatus: 'late' as const,
      analysisAgeMinutes,
      imageAgeMinutes,
      imageAnalysisLagMinutes,
      message: '분석 결과가 이미지 입력 대비 지연되고 있습니다.',
    };
  }

  return {
    analysisStatus: 'ok' as const,
    analysisAgeMinutes,
    imageAgeMinutes,
    imageAnalysisLagMinutes,
    message: '최근 이미지가 중량 분석 결과로 이어지고 있습니다.',
  };
}

export async function fetchCctvUpAnalysisPayload(options: FetchAnalysisOptions): Promise<CctvUpAnalysisPayload> {
  const checkedAt = new Date().toISOString();
  const dbConfig = getDbConfig();
  const windowHours = Math.min(Math.max(Math.trunc(options.windowHours ?? DEFAULT_WINDOW_HOURS), 1), 24);
  const limit = Math.min(Math.max(Math.trunc(options.limit ?? DEFAULT_LIMIT), 1), 24);

  if (!dbConfig) {
    return buildUnavailablePayload({ ...options, windowHours }, 'CCTVUP_DB_* 환경변수가 없어 분석 결과를 조회하지 못합니다.');
  }

  let connection: mysql.Connection | null = null;

  try {
    connection = await mysql.createConnection({
      ...dbConfig,
      connectTimeout: 3000,
      supportBigNumbers: true,
      dateStrings: false,
    });

    const [moduleA, moduleB] = normalizeModuleCandidates(options.moduleId);
    const [rows] = await executeReadOnlyDbQuery<AnalysisDbRow[]>(
      connection,
      {
        sql: `
          SELECT
            create_time,
            weight_prediction_status,
            weight_prediction_model_weight,
            dino_weight,
            weight_prediction_count
          FROM tbl_farm_image_analysis_weight_v2 FORCE INDEX (idx_create_time)
          WHERE create_time >= DATE_SUB(NOW(), INTERVAL ? HOUR)
            AND create_time <= NOW()
            AND farm_id = ?
            AND house_id = ?
            AND module_id IN (?, ?)
          ORDER BY create_time DESC
          LIMIT ?
        `,
        timeout: ANALYSIS_QUERY_TIMEOUT_MS,
      },
      [windowHours, options.farmId, options.houseId, moduleA, moduleB, limit],
    );

    const records = rows
      .map((row) => ({
        createdAt: toIso(row.create_time),
        status: normalizeStatus(row.weight_prediction_status) || 'unknown',
        modelWeight: toNullableNumber(row.weight_prediction_model_weight),
        dinoWeight: toNullableNumber(row.dino_weight),
        predictionCount: row.weight_prediction_count === null || row.weight_prediction_count === undefined
          ? null
          : String(row.weight_prediction_count),
      }))
      .filter((row): row is CctvUpAnalysisRecord => Boolean(row.createdAt));

    const successCount = records.filter((record) => isSuccessStatus(record.status)).length;
    const abnormalCount = records.length - successCount;
    const classified = classifyAnalysisStatus({ records, latestImageAt: options.latestImageAt, checkedAt });
    const latest = records[0];

    return {
      source: 'db',
      table: ANALYSIS_TABLE,
      checkedAt,
      cameraKey: `${options.farmId}-${options.houseId}-${options.moduleId}`,
      farmId: options.farmId,
      houseId: options.houseId,
      moduleId: options.moduleId,
      windowHours,
      analysisStatus: classified.analysisStatus,
      statusLabel: getStatusLabel(classified.analysisStatus),
      latestImageAt: toIso(options.latestImageAt),
      latestAnalysisAt: latest?.createdAt ?? null,
      latestAnalysisStatus: latest?.status ?? null,
      analysisAgeMinutes: classified.analysisAgeMinutes,
      imageAgeMinutes: classified.imageAgeMinutes,
      imageAnalysisLagMinutes: classified.imageAnalysisLagMinutes,
      recordCount: records.length,
      successCount,
      abnormalCount,
      records,
      message: classified.message,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : '분석 결과 조회 실패';
    return buildUnavailablePayload({ ...options, windowHours }, message.slice(0, 240));
  } finally {
    await connection?.end().catch(() => undefined);
  }
}
