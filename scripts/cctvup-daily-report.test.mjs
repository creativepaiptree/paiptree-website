import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  buildCctvUpDailyReportDocument,
  buildFarmMetadataFromRows,
  buildKstReportDateFromNow,
  buildKstReportRange,
  readCctvUpDailyReportDetail,
  readCctvUpDailyReportManifest,
  writeCctvUpDailyReportFiles,
} from '../src/lib/cctvup-daily-report.js';

test('buildKstReportRange uses KST day boundaries', () => {
  const range = buildKstReportRange('2026-05-17');

  assert.equal(range.fromIso, '2026-05-16T15:00:00.000Z');
  assert.equal(range.toIso, '2026-05-17T15:00:00.000Z');
  assert.equal(range.fromLabel, '2026-05-17 00:00:00 KST');
});

test('buildKstReportDateFromNow returns yesterday by KST day', () => {
  assert.equal(buildKstReportDateFromNow(new Date('2026-05-17T15:05:00.000Z'), -1), '2026-05-17');
  assert.equal(buildKstReportDateFromNow(new Date('2026-05-17T14:59:00.000Z'), -1), '2026-05-16');
});

test('buildFarmMetadataFromRows classifies source farm groups and manual overrides', () => {
  const farms = buildFarmMetadataFromRows([
    { farm: 'FA0014', farmName: '하니농장', farmAffiliates: 'cherrybro', country: 'KR' },
    { farm: 'FA0406', farmName: '건농장', farmAffiliates: 'shinwoo', country: 'KR' },
    { farm: 'FA9000', farmName: 'Taiwan Farm', farmAffiliates: '', country: 'TW' },
  ], [
    { farmId: 'FA0406', displayName: '건농장 표시명', category: 'other', categorySource: 'legacy' },
    { farmId: 'FA9000', displayName: '수동 기타', category: 'other', categorySource: 'manual' },
  ]);

  assert.equal(farms.find((farm) => farm.farmId === 'FA0014').company, 'cheriburo');
  assert.equal(farms.find((farm) => farm.farmId === 'FA0406').company, 'shinwoo');
  assert.equal(farms.find((farm) => farm.farmId === 'FA9000').company, 'other');
});

test('buildCctvUpDailyReportDocument renders markdown and structured summaries', () => {
  const report = buildCctvUpDailyReportDocument({
    date: '2026-05-17',
    generatedAt: '2026-05-17T12:30:00.000Z',
    farmMetadata: [
      { farmId: 'FA0406', farmName: '건농장', company: 'shinwoo', companyLabel: '신우' },
    ],
    issueEvents: [
      {
        id: 'event-1',
        cameraKey: 'FA0406-H01-CT01',
        farmId: 'FA0406',
        farmName: '건농장',
        houseId: 'H01',
        moduleId: 'CT01',
        eventKind: 'opened',
        previousStatus: 'watching',
        nextStatus: 'open',
        eventAt: '2026-05-17T03:20:00.000Z',
        latestImageAt: '2026-05-17T03:00:00.000Z',
        missCount: 3,
        message: '15분 이상 새 이미지가 감지되지 않아 문제로 확정했습니다.',
      },
    ],
    farmScopeEvents: [
      {
        id: 'scope-1',
        farmId: 'FA0406',
        farmName: '건농장',
        eventKind: 'activated',
        previousScopeCode: 'resting',
        nextScopeCode: 'active',
        eventAt: '2026-05-17T04:00:00.000Z',
        gatewayInstalledCount: 1,
        cameraCount: 2,
        activeCameraCount: 2,
        message: '휴지기에서 감시중으로 전환했습니다.',
      },
    ],
    cameraStates: [
      {
        id: 'state-1',
        cameraKey: 'FA0406-H01-CT01',
        farmId: 'FA0406',
        farmName: '건농장',
        houseId: 'H01',
        moduleId: 'CT01',
        status: 'open',
        lastCheckedAt: '2026-05-17T12:00:00.000Z',
        missCount: 4,
        ageMinutes: 20,
        recentSlots: [],
        message: '열린 문제입니다.',
      },
    ],
    checkRuns: [
      {
        id: 'run-1',
        source: 'db',
        checkedAt: '2026-05-17T12:00:00.000Z',
        tableName: 'paip.tbl_farm_image',
        farmCount: 1,
        cameraCount: 2,
        okCount: 1,
        lateCount: 0,
        missingCount: 0,
        criticalCount: 1,
        pausedCount: 0,
        issueCount: 1,
        note: 'sensitive note should not render',
      },
    ],
  });

  assert.equal(report.summary.issueEventCount, 1);
  assert.equal(report.summary.farmScopeEventCount, 1);
  assert.equal(report.summary.activeIssueCount, 1);
  assert.equal(report.companies.find((company) => company.company === 'shinwoo').openedCount, 1);
  assert.match(report.markdown, /건농장 FA0406/);
  assert.doesNotMatch(JSON.stringify(report.checkRuns), /sensitive note/);
});

test('writeCctvUpDailyReportFiles writes markdown, raw json and sorted manifest', async () => {
  const tempRoot = await mkdtemp(path.join(tmpdir(), 'cctvup-daily-report-'));
  try {
    const first = buildCctvUpDailyReportDocument({ date: '2026-05-16', generatedAt: '2026-05-16T12:00:00.000Z' });
    const second = buildCctvUpDailyReportDocument({ date: '2026-05-17', generatedAt: '2026-05-17T12:00:00.000Z' });

    await writeCctvUpDailyReportFiles(first, tempRoot);
    await writeCctvUpDailyReportFiles(second, tempRoot);

    const manifest = await readCctvUpDailyReportManifest(tempRoot);
    assert.deepEqual(manifest.reports.map((report) => report.date), ['2026-05-17', '2026-05-16']);

    const detail = await readCctvUpDailyReportDetail('2026-05-17', tempRoot);
    assert.match(detail.markdown, /2026-05-17 CCTVUP 일일 브리핑/);
    assert.equal(detail.previousDate, '2026-05-16');
    assert.equal(detail.nextDate, null);

    const rawText = await readFile(path.join(tempRoot, 'content/cctvup/daily-reports/2026/05/2026-05-17.raw.json'), 'utf8');
    assert.equal(JSON.parse(rawText).date, '2026-05-17');
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});
