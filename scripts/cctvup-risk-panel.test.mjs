import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCctvUpProblemTransitionMap,
  getCctvUpProblemTransitionAt,
  isCctvUpFreshProblemRow,
} from '../src/lib/cctvup-risk-panel.js';

const checkedAt = '2026-05-17T12:00:00.000Z';

test('buildCctvUpProblemTransitionMap keeps the latest problem transition per camera', () => {
  const map = buildCctvUpProblemTransitionMap([
    { cameraKey: 'camera-1', eventKind: 'opened', eventAt: '2026-05-17T08:00:00.000Z' },
    { cameraKey: 'camera-1', eventKind: 'recovering', eventAt: '2026-05-17T11:20:00.000Z' },
    { cameraKey: 'camera-1', eventKind: 'resolved', eventAt: '2026-05-17T11:55:00.000Z' },
  ]);

  assert.equal(map.get('camera-1').eventKind, 'recovering');
  assert.equal(map.get('camera-1').eventAt, '2026-05-17T11:20:00.000Z');
});

test('isCctvUpFreshProblemRow uses transition time instead of latest image age', () => {
  const map = buildCctvUpProblemTransitionMap([
    { cameraKey: 'camera-2', eventKind: 'opened', eventAt: '2026-05-17T11:30:00.000Z' },
  ]);
  const row = {
    id: 'camera-2',
    status: 'critical',
    latestAtIso: '2026-05-16T00:00:00.000Z',
    openedAt: '2026-05-17T11:30:00.000Z',
    ageMinutes: 999,
  };

  assert.equal(isCctvUpFreshProblemRow(row, map, checkedAt), true);
});

test('isCctvUpFreshProblemRow moves old open issues to chronic', () => {
  const row = {
    id: 'camera-3',
    status: 'critical',
    openedAt: '2026-05-17T08:30:00.000Z',
    ageMinutes: 999,
  };

  assert.equal(isCctvUpFreshProblemRow(row, new Map(), checkedAt), false);
  assert.equal(getCctvUpProblemTransitionAt(row, new Map()), '2026-05-17T08:30:00.000Z');
});
