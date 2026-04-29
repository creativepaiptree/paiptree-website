import mysql from 'mysql2/promise';
import type { RowDataPacket } from 'mysql2';
import {
  buildPayload,
  mapDbSummaryRows,
  mockCctvUpRows,
  type CctvUpDbSummaryRow,
  type CctvUpPayload,
} from '@/lib/cctvup';

type DbSummaryResultRow = CctvUpDbSummaryRow & RowDataPacket;

type CurrentPayloadResult = {
  payload: CctvUpPayload;
  status: number;
};

function getDbConfig() {
  const host = process.env.CCTVUP_DB_HOST?.trim();
  const user = process.env.CCTVUP_DB_USER?.trim();
  const password = process.env.CCTVUP_DB_PASSWORD;
  const database = process.env.CCTVUP_DB_DATABASE?.trim() || 'paip';
  const port = Number(process.env.CCTVUP_DB_PORT || 3306);

  if (!host || !user || !password || !Number.isFinite(port)) return null;

  return { host, user, password, database, port };
}

export async function fetchCctvUpCurrentPayload(limit = 1000): Promise<CurrentPayloadResult> {
  const dbConfig = getDbConfig();

  if (!dbConfig) {
    return {
      payload: buildPayload(mockCctvUpRows, 'mock', 'CCTVUP_DB_* 환경변수가 없어 mock 데이터로 표시합니다.'),
      status: 200,
    };
  }

  let connection: mysql.Connection | null = null;

  try {
    connection = await mysql.createConnection({
      ...dbConfig,
      connectTimeout: 3000,
      supportBigNumbers: true,
      dateStrings: false,
    });

    const [rows] = await connection.execute<DbSummaryResultRow[]>(
      `
      SELECT
        i.FARM_ID AS farm_id,
        s.farm_name,
        i.HOUSE_ID AS house_id,
        h.house_name,
        i.MODULE_ID AS module_id,
        c.cctv_name AS camera_name,
        MAX(i.CREATE_TIME) AS latest_at,
        SUM(i.CREATE_TIME >= DATE_SUB(NOW(), INTERVAL 1 HOUR)) AS cnt_1h,
        COUNT(*) AS cnt_24h
      FROM tbl_farm_image i FORCE INDEX (idx_farm_house_module_createtime)
      LEFT JOIN tbl_farm_service s
        ON s.farm_id = i.FARM_ID
      LEFT JOIN tbl_farm_house h
        ON h.farm_id = i.FARM_ID AND h.house_id = i.HOUSE_ID
      INNER JOIN tbl_farm_cctv c
        ON c.farm_id = i.FARM_ID
        AND c.house_id = i.HOUSE_ID
        AND c.cctv_id = REPLACE(i.MODULE_ID, ',1', '')
        AND c.applied = 1
        AND c.display = 'YES'
        AND c.is_working = 'Y'
      WHERE i.CREATE_TIME >= DATE_SUB(NOW(), INTERVAL 90 DAY)
        AND i.CREATE_TIME <= NOW()
      GROUP BY i.FARM_ID, s.farm_name, i.HOUSE_ID, h.house_name, i.MODULE_ID, c.cctv_name
      ORDER BY latest_at DESC
      LIMIT ?
      `,
      [limit],
    );

    const mappedRows = mapDbSummaryRows(rows);

    return {
      payload: buildPayload(mappedRows, 'db'),
      status: 200,
    };
  } catch (error) {
    console.error('[cctvup] read-only DB query failed', error);

    return {
      payload: buildPayload(mockCctvUpRows, 'unavailable', 'DB 조회 실패로 mock 데이터로 표시합니다.'),
      status: 503,
    };
  } finally {
    await connection?.end().catch(() => undefined);
  }
}