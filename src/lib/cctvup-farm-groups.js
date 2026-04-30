const STATUS_PRIORITY = {
  critical: 0,
  missing: 1,
  late: 2,
  paused: 3,
  ok: 4,
};

const CATEGORY_PRIORITY = {
  overseas: 0,
  shinwoo: 1,
  cheriburo: 2,
  other: 3,
};

const CHRONIC_AGE_MINUTES = 180;

function compareText(a, b) {
  return String(a || '').localeCompare(String(b || ''), 'ko-KR');
}

function pickLatest(rowA, rowB) {
  const left = rowA?.latestAtIso || rowA?.latestAt || '';
  const right = rowB?.latestAtIso || rowB?.latestAt || '';
  return String(left) >= String(right) ? rowA : rowB;
}

function pickFreshestIssue(rowA, rowB) {
  const left = Number.isFinite(rowA?.ageMinutes) ? rowA.ageMinutes : Number.POSITIVE_INFINITY;
  const right = Number.isFinite(rowB?.ageMinutes) ? rowB.ageMinutes : Number.POSITIVE_INFINITY;
  if (left !== right) return left < right ? rowA : rowB;
  return pickLatest(rowA, rowB);
}

function getGroupStatus(rows) {
  let winner = 'ok';
  for (const row of rows) {
    if (STATUS_PRIORITY[row.status] < STATUS_PRIORITY[winner]) {
      winner = row.status;
    }
  }
  return winner;
}

function getGroupCategory(rows) {
  let winner = rows[0]?.displayCategory || 'other';
  for (const row of rows) {
    if (CATEGORY_PRIORITY[row.displayCategory] < CATEGORY_PRIORITY[winner]) {
      winner = row.displayCategory;
    }
  }
  return winner;
}

function getGroupFreshIssue(rows) {
  let winner = null;
  for (const row of rows) {
    if (row.status === 'ok' || row.status === 'paused') continue;
    winner = winner ? pickFreshestIssue(winner, row) : row;
  }
  return winner;
}

function getGroupFreshIssueAgeMinutes(rows) {
  const freshestIssue = getGroupFreshIssue(rows);
  if (!freshestIssue) return Number.POSITIVE_INFINITY;
  return Number.isFinite(freshestIssue.ageMinutes) ? freshestIssue.ageMinutes : Number.POSITIVE_INFINITY;
}

export function buildCctvUpFarmGroups(rows) {
  const byFarm = new Map();

  for (const row of rows) {
    const current = byFarm.get(row.farm);
    if (current) {
      current.rows.push(row);
      current.problemCount += row.status === 'ok' ? 0 : 1;
      current.okCount += row.status === 'ok' ? 1 : 0;
      current.latestRow = pickLatest(current.latestRow, row);
      current.freshIssueRow = row.status === 'ok' || row.status === 'paused'
        ? current.freshIssueRow
        : (current.freshIssueRow ? pickFreshestIssue(current.freshIssueRow, row) : row);
      continue;
    }

    byFarm.set(row.farm, {
      farmId: row.farm,
      farmName: row.displayFarmName || row.farmName || row.farm,
      category: row.displayCategory || 'other',
      rows: [row],
      problemCount: row.status === 'ok' ? 0 : 1,
      okCount: row.status === 'ok' ? 1 : 0,
      latestRow: row,
      freshIssueRow: row.status === 'ok' || row.status === 'paused' ? null : row,
    });
  }

  return Array.from(byFarm.values()).map((group) => {
    const status = getGroupStatus(group.rows);
    const category = getGroupCategory(group.rows);
    const latestRow = group.latestRow;
    const latestAtIso = latestRow.latestAtIso || '';
    const freshestIssueRow = group.freshIssueRow || getGroupFreshIssue(group.rows);
    const issueAgeMinutes = freshestIssueRow ? (Number.isFinite(freshestIssueRow.ageMinutes) ? freshestIssueRow.ageMinutes : Number.POSITIVE_INFINITY) : Number.POSITIVE_INFINITY;

    return {
      farmId: group.farmId,
      farmName: group.farmName,
      category,
      rows: group.rows.slice(),
      cameraCount: group.rows.length,
      problemCount: group.problemCount,
      okCount: group.okCount,
      latestAt: latestRow.latestAt || '-',
      latestAtIso,
      latestRowId: latestRow.id,
      issueAgeMinutes,
      freshestIssueRowId: freshestIssueRow?.id || '',
      freshestIssueAt: freshestIssueRow?.latestAtIso || freshestIssueRow?.latestAt || '',
      status,
      isProblem: status !== 'ok',
      isChronic: Number.isFinite(issueAgeMinutes) ? issueAgeMinutes >= CHRONIC_AGE_MINUTES : false,
    };
  });
}

function compareIssueGroup(a, b) {
  const problemDiff = Number(b.isProblem) - Number(a.isProblem);
  if (problemDiff !== 0) return problemDiff;
  const freshnessDiff = (a.issueAgeMinutes ?? Number.POSITIVE_INFINITY) - (b.issueAgeMinutes ?? Number.POSITIVE_INFINITY);
  if (freshnessDiff !== 0) return freshnessDiff;
  const statusDiff = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
  if (statusDiff !== 0) return statusDiff;
  const categoryDiff = CATEGORY_PRIORITY[a.category] - CATEGORY_PRIORITY[b.category];
  if (categoryDiff !== 0) return categoryDiff;
  return compareText(a.farmName, b.farmName) || compareText(a.farmId, b.farmId);
}

export function compareCctvUpFarmGroups(a, b, sortMode = 'issue') {
  if (sortMode === 'name') {
    return compareText(a.farmName, b.farmName) || compareText(a.farmId, b.farmId);
  }

  if (sortMode === 'category') {
    const categoryDiff = CATEGORY_PRIORITY[a.category] - CATEGORY_PRIORITY[b.category];
    if (categoryDiff !== 0) return categoryDiff;
    const statusDiff = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
    if (statusDiff !== 0) return statusDiff;
    const freshnessDiff = (a.issueAgeMinutes ?? Number.POSITIVE_INFINITY) - (b.issueAgeMinutes ?? Number.POSITIVE_INFINITY);
    if (freshnessDiff !== 0) return freshnessDiff;
    return compareText(a.farmName, b.farmName) || compareText(a.farmId, b.farmId);
  }

  if (sortMode === 'severity') {
    const statusDiff = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
    if (statusDiff !== 0) return statusDiff;
    const freshnessDiff = (a.issueAgeMinutes ?? Number.POSITIVE_INFINITY) - (b.issueAgeMinutes ?? Number.POSITIVE_INFINITY);
    if (freshnessDiff !== 0) return freshnessDiff;
    const categoryDiff = CATEGORY_PRIORITY[a.category] - CATEGORY_PRIORITY[b.category];
    if (categoryDiff !== 0) return categoryDiff;
    return compareText(a.farmName, b.farmName) || compareText(a.farmId, b.farmId);
  }

  return compareIssueGroup(a, b);
}
