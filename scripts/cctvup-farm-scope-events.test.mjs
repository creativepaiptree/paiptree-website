import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCctvUpFarmScopeStates,
  computeCctvUpFarmScopeChanges,
  formatCctvUpFarmScopeEventKind,
} from '../src/lib/cctvup-farm-scope-events.js';

const checkedAt = '2026-05-17T12:00:00.000Z';

const baseRow = {
  farm: 'FA0014',
  farmName: '하니농장',
  gatewayInstalledCount: 1,
  house: 'H01',
  camera: 'CT01',
};

test('buildCctvUpFarmScopeStates summarizes current farm scope by farm', () => {
  const states = buildCctvUpFarmScopeStates([
    {
      ...baseRow,
      id: 'FA0014-H01-CT01',
      monitorScopeCode: 'active',
      monitorScopeLabel: '감시중',
      cycleBucketCode: 'current_rearing',
      cycleBucketLabel: '현재 사육중',
    },
    {
      ...baseRow,
      id: 'FA0014-H02-CT02',
      house: 'H02',
      camera: 'CT02',
      monitorScopeCode: 'active',
      monitorScopeLabel: '감시중',
      cycleBucketCode: 'current_rearing',
      cycleBucketLabel: '현재 사육중',
    },
  ], checkedAt);

  assert.equal(states.length, 1);
  assert.equal(states[0].farmId, 'FA0014');
  assert.equal(states[0].monitorScopeCode, 'active');
  assert.equal(states[0].cameraCount, 2);
  assert.equal(states[0].activeCameraCount, 2);
});

test('computeCctvUpFarmScopeChanges logs resting to active as placement/start monitoring', () => {
  const result = computeCctvUpFarmScopeChanges([
    {
      ...baseRow,
      id: 'FA0014-H01-CT01',
      monitorScopeCode: 'active',
      monitorScopeLabel: '감시중',
      cycleBucketCode: 'current_rearing',
      cycleBucketLabel: '현재 사육중',
    },
  ], [
    {
      farmId: 'FA0014',
      farmName: '하니농장',
      monitorScopeCode: 'resting',
      monitorScopeLabel: '휴지기',
      cycleBucketCode: 'resting',
      cycleBucketLabel: '휴지기 D+12',
    },
  ], checkedAt);

  assert.equal(result.events.length, 1);
  assert.equal(result.events[0].eventKind, 'activated');
  assert.equal(formatCctvUpFarmScopeEventKind(result.events[0].eventKind), '입추/감시 시작');
});

test('computeCctvUpFarmScopeChanges does not log unchanged farm scope', () => {
  const result = computeCctvUpFarmScopeChanges([
    {
      ...baseRow,
      id: 'FA0014-H01-CT01',
      monitorScopeCode: 'resting',
      monitorScopeLabel: '휴지기',
      cycleBucketCode: 'resting',
      cycleBucketLabel: '휴지기 D+5',
    },
  ], [
    {
      farmId: 'FA0014',
      farmName: '하니농장',
      monitorScopeCode: 'resting',
      monitorScopeLabel: '휴지기',
      cycleBucketCode: 'resting',
      cycleBucketLabel: '휴지기 D+0',
    },
  ], checkedAt);

  assert.equal(result.events.length, 0);
});
