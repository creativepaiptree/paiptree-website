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

function compareText(a, b) {
  return String(a || '').localeCompare(String(b || ''), 'ko-KR');
}

function pickLatest(rowA, rowB) {
  const left = rowA?.latestAtIso || rowA?.latestAt || '';
  const right = rowB?.latestAtIso || rowB?.latestAt || '';
  return String(left) >= String(right) ? rowA : rowB;
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

export function buildCctvUpFarmGroups(rows) {
  const byFarm = new Map();

  for (const row of rows) {
    const current = byFarm.get(row.farm);
    if (current) {
      current.rows.push(row);
      current.problemCount += row.status === 'ok' ? 0 : 1;
      current.okCount += row.status === 'ok' ? 1 : 0;
      current.latestRow = pickLatest(current.latestRow, row);
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
    });
  }

  return Array.from(byFarm.values()).map((group) => {
    const status = getGroupStatus(group.rows);
    const category = getGroupCategory(group.rows);
    const latestRow = group.latestRow;
    const latestAtIso = latestRow.latestAtIso || '';

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
      status,
      isProblem: status !== 'ok',
    };
  });
}

function compareIssueGroup(a, b) {
  const problemDiff = Number(b.isProblem) - Number(a.isProblem);
  if (problemDiff !== 0) return problemDiff;
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
    return compareText(a.farmName, b.farmName) || compareText(a.farmId, b.farmId);
  }

  if (sortMode === 'severity') {
    const statusDiff = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
    if (statusDiff !== 0) return statusDiff;
    const categoryDiff = CATEGORY_PRIORITY[a.category] - CATEGORY_PRIORITY[b.category];
    if (categoryDiff !== 0) return categoryDiff;
    return compareText(a.farmName, b.farmName) || compareText(a.farmId, b.farmId);
  }

  return compareIssueGroup(a, b);
}
