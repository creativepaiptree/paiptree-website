import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCctvUpFarmGroups,
  compareCctvUpFarmGroups,
} from '../src/lib/cctvup-farm-groups.js';

const rows = [
  {
    id: 'farm-a-cam-1',
    farm: 'FARM-A',
    farmName: '가농장',
    house: 'H01',
    houseName: '하우스1',
    camera: 'C01',
    cameraName: '카메라1',
    latestAt: '09:00',
    latestAtIso: '2026-04-29T00:00:00.000Z',
    ageMinutes: 4,
    consecutiveMiss: 0,
    rate1h: '12/12',
    rate24h: '288/288',
    reason: '이미지 정상 수신',
    status: 'ok',
    slots: ['ok', 'ok'],
    displayFarmName: '가농장',
    displayHouseName: '하우스1',
    displayCameraName: '카메라1',
    displayCategory: 'other',
    displayTags: [],
    displayMemo: '',
  },
  {
    id: 'farm-a-cam-2',
    farm: 'FARM-A',
    farmName: '가농장',
    house: 'H02',
    houseName: '하우스2',
    camera: 'C02',
    cameraName: '카메라2',
    latestAt: '09:10',
    latestAtIso: '2026-04-29T00:10:00.000Z',
    ageMinutes: 18,
    consecutiveMiss: 3,
    rate1h: '9/12',
    rate24h: '280/288',
    reason: '최근 5분 이미지 누락',
    status: 'missing',
    slots: ['ok', 'missing'],
    displayFarmName: '가농장',
    displayHouseName: '하우스2',
    displayCameraName: '카메라2',
    displayCategory: 'other',
    displayTags: [],
    displayMemo: '',
  },
  {
    id: 'farm-b-cam-1',
    farm: 'FARM-B',
    farmName: '나농장',
    house: 'H01',
    houseName: '하우스1',
    camera: 'C01',
    cameraName: '카메라1',
    latestAt: '09:20',
    latestAtIso: '2026-04-29T00:20:00.000Z',
    ageMinutes: 2,
    consecutiveMiss: 0,
    rate1h: '12/12',
    rate24h: '288/288',
    reason: '이미지 정상 수신',
    status: 'ok',
    slots: ['ok', 'ok'],
    displayFarmName: '나농장',
    displayHouseName: '하우스1',
    displayCameraName: '카메라1',
    displayCategory: 'overseas',
    displayTags: [],
    displayMemo: '',
  },
];

test('buildCctvUpFarmGroups aggregates camera status by farm', () => {
  const groups = buildCctvUpFarmGroups(rows);

  assert.equal(groups.length, 2);
  assert.equal(groups[0].farmId, 'FARM-A');
  assert.equal(groups[0].status, 'missing');
  assert.equal(groups[0].problemCount, 1);
  assert.equal(groups[0].cameraCount, 2);
  assert.equal(groups[0].latestAt, '09:10');
  assert.equal(groups[0].isProblem, true);
});

test('compareCctvUpFarmGroups keeps issue farms before normal farms', () => {
  const groups = buildCctvUpFarmGroups(rows);
  const sorted = groups.slice().sort((a, b) => compareCctvUpFarmGroups(a, b, 'issue'));

  assert.equal(sorted[0].farmId, 'FARM-A');
  assert.equal(sorted[1].farmId, 'FARM-B');
});

test('compareCctvUpFarmGroups supports name sorting', () => {
  const groups = buildCctvUpFarmGroups(rows);
  const sorted = groups.slice().sort((a, b) => compareCctvUpFarmGroups(a, b, 'name'));

  assert.deepEqual(sorted.map((group) => group.farmName), ['가농장', '나농장']);
});
