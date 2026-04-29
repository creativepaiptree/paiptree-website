import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createCctvUpCheckRunner,
  getCctvUpCronAuthState,
} from '../src/lib/cctvup-check-core.js';

test('getCctvUpCronAuthState rejects an unconfigured secret', () => {
  const result = getCctvUpCronAuthState({
    expectedSecret: '',
    providedSecret: '',
  });

  assert.equal(result.ok, false);
  assert.equal(result.status, 503);
  assert.equal(result.mode, 'unconfigured');
});

test('getCctvUpCronAuthState rejects a mismatched secret', () => {
  const result = getCctvUpCronAuthState({
    expectedSecret: 'expected-secret',
    providedSecret: 'wrong-secret',
  });

  assert.equal(result.ok, false);
  assert.equal(result.status, 401);
  assert.match(result.message, /Unauthorized/);
});

test('createCctvUpCheckRunner loads payload and persists it once', async () => {
  const payload = {
    source: 'db',
    checkedAt: '2026-04-29T00:00:00.000Z',
    table: 'paip.tbl_farm_image',
    rows: [],
    incidents: [],
    summary: { farms: 0, cameras: 0, ok: 0, late: 0, missing: 0, critical: 0, paused: 0 },
  };

  let persistCalls = 0;
  const runner = createCctvUpCheckRunner({
    loadCurrentPayload: async () => payload,
    persistHistory: async (nextPayload) => {
      persistCalls += 1;
      assert.equal(nextPayload, payload);
      return { ok: true, runId: 'run-1', snapshotCount: 0, incidentCount: 0 };
    },
  });

  const result = await runner();

  assert.equal(persistCalls, 1);
  assert.equal(result.ok, true);
  assert.equal(result.persistResult.runId, 'run-1');
  assert.equal(result.payload, payload);
});
