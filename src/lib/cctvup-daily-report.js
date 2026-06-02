import { promises as fs } from 'node:fs';
import path from 'node:path';

export const CCTVUP_DAILY_REPORT_SCHEMA_VERSION = 1;
export const CCTVUP_DAILY_REPORT_ROOT_RELATIVE = 'content/cctvup/daily-reports';

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const REPORT_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const COMPANY_ORDER = ['cheriburo', 'shinwoo', 'overseas', 'other'];
const COMPANY_LABELS = {
  overseas: '해외',
  shinwoo: '신우',
  cheriburo: '체리부로',
  other: '기타',
};
const ISSUE_EVENT_LABELS = {
  opened: '문제확정',
  reopened: '재확정',
  recovering: '이미지 재수신',
  resolved: '해결',
};
const FARM_SCOPE_EVENT_LABELS = {
  activated: '입추/감시 시작',
  resting_started: '출하/휴지기 진입',
  review_needed: '대상확인 전환',
  uninstalled: '미설치 전환',
  scope_changed: '감시범위 변경',
};
const FLOCK_MOVEMENT_LABELS = {
  placement: '입추',
  shipment: '출하',
};
const FLOCK_MOVEMENT_BUCKET_LABELS = {
  actual_date: '실제일 기준',
  registered_late: '지연 등록',
};

function parseReportDate(reportDate) {
  if (!REPORT_DATE_PATTERN.test(reportDate)) {
    throw new Error('보고서 날짜는 YYYY-MM-DD 형식이어야 합니다.');
  }
  const [year, month, day] = reportDate.split('-').map(Number);
  const utcMs = Date.UTC(year, month - 1, day);
  const date = new Date(utcMs);
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    throw new Error('존재하지 않는 보고서 날짜입니다.');
  }
  return { year, month, day };
}

export function buildKstReportDateFromNow(now = new Date(), dayOffset = 0) {
  const nowDate = now instanceof Date ? now : new Date(now);
  if (Number.isNaN(nowDate.getTime())) {
    throw new Error('기준 시각을 날짜로 해석할 수 없습니다.');
  }
  const shifted = new Date(nowDate.getTime() + KST_OFFSET_MS + dayOffset * DAY_MS);
  const year = shifted.getUTCFullYear();
  const month = String(shifted.getUTCMonth() + 1).padStart(2, '0');
  const day = String(shifted.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function compact(value) {
  return String(value ?? '').trim();
}

function normalizeCompany(value) {
  const normalized = compact(value).toLowerCase();
  if (normalized === 'overseas' || normalized === '해외') return 'overseas';
  if (normalized === 'shinwoo' || normalized === '신우') return 'shinwoo';
  if (normalized === 'cheriburo' || normalized === '체리부로') return 'cheriburo';
  return 'other';
}

function classifyFarm(row) {
  const affiliates = compact(row.farmAffiliates).toLowerCase();
  const country = compact(row.country).toUpperCase();
  if (/cherry|체리/.test(affiliates)) return 'cheriburo';
  if (/shinwoo|신우/.test(affiliates)) return 'shinwoo';
  if (country && country !== 'KR') return 'overseas';
  if (/taiwan|indonesia|madagascar|cpgroup|prifoods|laos|overseas|global/.test(affiliates)) return 'overseas';

  const text = [row.farmName, row.displayFarmName, row.farmAlias].filter(Boolean).join(' ');
  const compactText = text.replace(/\s+/g, '');
  if (/체리부로/i.test(text)) return 'cheriburo';
  if (/신우/i.test(text)) return 'shinwoo';
  if (/해외/i.test(text)) return 'overseas';
  if (/체리/.test(compactText)) return 'cheriburo';
  const hasHangul = /[가-힣]/.test(text);
  const hasLatin = /[A-Za-z]/.test(text);
  const hasCjk = /[\u3400-\u9fff]/.test(text);
  if (!hasHangul && (hasLatin || hasCjk)) return 'overseas';
  return 'other';
}

function formatCount(value) {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
}

function formatBirdCount(value) {
  return formatCount(value).toLocaleString('ko-KR');
}

function companyOrderIndex(company) {
  const index = COMPANY_ORDER.indexOf(normalizeCompany(company));
  return index === -1 ? COMPANY_ORDER.length : index;
}

function compareCompanyOrder(a, b) {
  return companyOrderIndex(a.company) - companyOrderIndex(b.company);
}

function groupByCompany(items) {
  const groups = new Map(COMPANY_ORDER.map((company) => [company, []]));
  for (const item of items) {
    const company = normalizeCompany(item.company);
    if (!groups.has(company)) groups.set(company, []);
    groups.get(company).push(item);
  }
  return Array.from(groups.entries())
    .filter(([, groupItems]) => groupItems.length)
    .map(([company, groupItems]) => ({
      company,
      label: COMPANY_LABELS[company] ?? company,
      items: groupItems,
    }));
}

function safeIso(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export function getKstDateString(now = new Date()) {
  return new Date(now.getTime() + KST_OFFSET_MS).toISOString().slice(0, 10);
}

export function getPreviousKstDateString(now = new Date()) {
  return getKstDateString(new Date(now.getTime() - 24 * 60 * 60 * 1000));
}

export function normalizeCctvUpReportDate(value, now = new Date()) {
  const reportDate = compact(value) || getKstDateString(now);
  parseReportDate(reportDate);
  return reportDate;
}

export function buildKstReportRange(reportDate) {
  const { year, month, day } = parseReportDate(reportDate);
  const fromMs = Date.UTC(year, month - 1, day) - KST_OFFSET_MS;
  const toMs = fromMs + 24 * 60 * 60 * 1000;
  return {
    date: reportDate,
    timezone: 'Asia/Seoul',
    fromIso: new Date(fromMs).toISOString(),
    toIso: new Date(toMs).toISOString(),
    fromLabel: `${reportDate} 00:00:00 KST`,
    toLabel: `${reportDate} 23:59:59 KST`,
  };
}

export function buildCctvUpDailyReportPaths(reportDate) {
  const { year, month } = parseReportDate(reportDate);
  const yearText = String(year);
  const monthText = String(month).padStart(2, '0');
  return {
    reportDate,
    directory: `${yearText}/${monthText}`,
    markdownPath: `${yearText}/${monthText}/${reportDate}.md`,
    rawPath: `${yearText}/${monthText}/${reportDate}.raw.json`,
    markdownFileName: `${reportDate}.md`,
    rawFileName: `${reportDate}.raw.json`,
  };
}

export function getCctvUpDailyReportRoot(rootDir = process.cwd()) {
  return path.join(rootDir, CCTVUP_DAILY_REPORT_ROOT_RELATIVE);
}

export function buildFarmMetadataFromRows(rows = [], registryItems = []) {
  const registryMap = new Map(
    registryItems
      .filter((entry) => entry?.farmId)
      .map((entry) => [entry.farmId, entry]),
  );
  const farmMap = new Map();

  for (const row of rows) {
    const farmId = compact(row.farm);
    if (!farmId || farmMap.has(farmId)) continue;
    const registry = registryMap.get(farmId);
    const autoCompany = classifyFarm(row);
    const registryCompany = registry?.categorySource === 'manual' ? normalizeCompany(registry.category) : autoCompany;
    const company = autoCompany !== 'other' && registry?.categorySource !== 'manual' ? autoCompany : registryCompany;
    farmMap.set(farmId, {
      farmId,
      farmName: compact(registry?.displayName) || compact(row.farmName) || farmId,
      company,
      companyLabel: COMPANY_LABELS[company],
      farmAffiliates: compact(row.farmAffiliates) || null,
      country: compact(row.country) || null,
    });
  }

  return Array.from(farmMap.values()).sort((a, b) => a.farmId.localeCompare(b.farmId));
}

function buildFarmMetaMap(farmMetadata = []) {
  return new Map(
    farmMetadata
      .filter((item) => item?.farmId)
      .map((item) => [item.farmId, {
        ...item,
        company: normalizeCompany(item.company),
        companyLabel: COMPANY_LABELS[normalizeCompany(item.company)],
      }]),
  );
}

function getEventFarmMeta(event, farmMetaMap) {
  const fallbackCompany = classifyFarm({
    farmName: event.farmName,
    displayFarmName: event.farmName,
  });
  const meta = farmMetaMap.get(event.farmId);
  const company = meta?.company ?? fallbackCompany;
  return {
    farmId: event.farmId,
    farmName: meta?.farmName || event.farmName || event.farmId,
    company,
    companyLabel: COMPANY_LABELS[company],
  };
}

function sanitizeIssueEvent(event, farmMetaMap) {
  const meta = getEventFarmMeta(event, farmMetaMap);
  return {
    id: event.id ?? null,
    type: 'camera_issue',
    eventKind: event.eventKind,
    eventLabel: ISSUE_EVENT_LABELS[event.eventKind] ?? event.eventKind,
    eventAt: safeIso(event.eventAt) ?? event.eventAt,
    farmId: event.farmId,
    farmName: meta.farmName,
    company: meta.company,
    companyLabel: meta.companyLabel,
    houseId: event.houseId,
    houseName: event.houseName ?? null,
    moduleId: event.moduleId,
    cameraName: event.cameraName ?? null,
    previousStatus: event.previousStatus ?? null,
    nextStatus: event.nextStatus,
    latestImageAt: safeIso(event.latestImageAt),
    missCount: formatCount(event.missCount),
    message: compact(event.message),
  };
}

function sanitizeFarmScopeEvent(event, farmMetaMap) {
  const meta = getEventFarmMeta(event, farmMetaMap);
  return {
    id: event.id ?? null,
    type: 'farm_scope',
    eventKind: event.eventKind,
    eventLabel: FARM_SCOPE_EVENT_LABELS[event.eventKind] ?? event.eventKind,
    eventAt: safeIso(event.eventAt) ?? event.eventAt,
    farmId: event.farmId,
    farmName: meta.farmName,
    company: meta.company,
    companyLabel: meta.companyLabel,
    previousScopeCode: event.previousScopeCode ?? null,
    nextScopeCode: event.nextScopeCode,
    previousCycleBucketCode: event.previousCycleBucketCode ?? null,
    nextCycleBucketCode: event.nextCycleBucketCode ?? null,
    previousCycleBucketLabel: event.previousCycleBucketLabel ?? null,
    nextCycleBucketLabel: event.nextCycleBucketLabel ?? null,
    gatewayInstalledCount: formatCount(event.gatewayInstalledCount),
    cameraCount: formatCount(event.cameraCount),
    activeCameraCount: formatCount(event.activeCameraCount),
    message: compact(event.message),
  };
}

function sanitizeFlockMovementEvent(event, farmMetaMap) {
  const meta = farmMetaMap.get(event.farmId);
  const fallbackCompany = classifyFarm(event);
  const company = meta?.company ?? fallbackCompany;
  const movementKind = event.movementKind === 'shipment' ? 'shipment' : 'placement';
  const reportBucket = event.reportBucket === 'registered_late' ? 'registered_late' : 'actual_date';

  return {
    id: event.id ?? null,
    type: 'flock_movement',
    movementKind,
    movementLabel: FLOCK_MOVEMENT_LABELS[movementKind],
    reportBucket,
    reportBucketLabel: FLOCK_MOVEMENT_BUCKET_LABELS[reportBucket],
    actualDate: event.actualDate,
    actualAt: safeIso(event.actualAt) ?? event.actualAt ?? null,
    registeredAt: safeIso(event.registeredAt) ?? event.registeredAt ?? null,
    farmId: event.farmId,
    farmName: meta?.farmName || event.farmName || event.farmId,
    company,
    companyLabel: COMPANY_LABELS[company],
    farmAffiliates: compact(event.farmAffiliates) || null,
    country: compact(event.country) || null,
    houseId: event.houseId,
    houseName: event.houseName ?? null,
    movementType: event.movementType ?? null,
    birdCount: formatCount(event.birdCount),
    averageWeight: formatCount(event.averageWeight),
    source: compact(event.source) || null,
    breedKind: compact(event.breedKind) || null,
    memo: compact(event.memo) || null,
    inputCount: formatCount(event.inputCount),
    outputCount: formatCount(event.outputCount),
    deadCount: formatCount(event.deadCount),
    killCount: formatCount(event.killCount),
    remainingEstimate: formatCount(event.remainingEstimate),
  };
}

function sanitizeCameraState(state, farmMetaMap) {
  const meta = getEventFarmMeta(state, farmMetaMap);
  return {
    id: state.id ?? null,
    cameraKey: state.cameraKey,
    farmId: state.farmId,
    farmName: meta.farmName,
    company: meta.company,
    companyLabel: meta.companyLabel,
    houseId: state.houseId,
    houseName: state.houseName ?? null,
    moduleId: state.moduleId,
    cameraName: state.cameraName ?? null,
    status: state.status,
    latestImageAt: safeIso(state.latestImageAt),
    lastCheckedAt: safeIso(state.lastCheckedAt) ?? state.lastCheckedAt,
    missCount: formatCount(state.missCount),
    firstMissedAt: safeIso(state.firstMissedAt),
    openedAt: safeIso(state.openedAt),
    resolvedAt: safeIso(state.resolvedAt),
    ageMinutes: formatCount(state.ageMinutes),
    message: compact(state.message),
  };
}

function sanitizeCheckRun(run) {
  return {
    id: run.id ?? null,
    checkedAt: safeIso(run.checkedAt) ?? run.checkedAt,
    source: run.source,
    farmCount: formatCount(run.farmCount),
    cameraCount: formatCount(run.cameraCount),
    okCount: formatCount(run.okCount),
    lateCount: formatCount(run.lateCount),
    missingCount: formatCount(run.missingCount),
    criticalCount: formatCount(run.criticalCount),
    pausedCount: formatCount(run.pausedCount),
    issueCount: formatCount(run.issueCount),
  };
}

function createEmptyCompanySummary(company) {
  return {
    company,
    label: COMPANY_LABELS[company],
    issueEventCount: 0,
    openedCount: 0,
    reopenedCount: 0,
    recoveringCount: 0,
    resolvedCount: 0,
    farmScopeEventCount: 0,
    activatedCount: 0,
    restingStartedCount: 0,
    reviewNeededCount: 0,
    uninstalledCount: 0,
    activeIssueCount: 0,
    placementRecordCount: 0,
    placementBirdCount: 0,
    shipmentRecordCount: 0,
    shipmentBirdCount: 0,
    lateMovementRecordCount: 0,
    notableFarmCount: 0,
  };
}

function createFarmSummary(event) {
  return {
    farmId: event.farmId,
    farmName: event.farmName,
    company: event.company,
    companyLabel: event.companyLabel,
    issueEventCount: 0,
    openedCount: 0,
    reopenedCount: 0,
    recoveringCount: 0,
    resolvedCount: 0,
    farmScopeEventCount: 0,
    activeIssueCount: 0,
    placementRecordCount: 0,
    placementBirdCount: 0,
    shipmentRecordCount: 0,
    shipmentBirdCount: 0,
    lateMovementRecordCount: 0,
    messages: [],
    lastEventAt: event.eventAt,
  };
}

function pushMessage(summary, event) {
  const label = event.eventLabel || event.status || '상태';
  const detail = compact(event.message) || `${label} 이벤트`;
  const line = `${label}: ${detail}`;
  if (!summary.messages.includes(line)) summary.messages.push(line);
  if (!summary.lastEventAt || String(event.eventAt || event.lastCheckedAt || '').localeCompare(summary.lastEventAt) > 0) {
    summary.lastEventAt = event.eventAt || event.lastCheckedAt || summary.lastEventAt;
  }
}

function pushFlockMovementMessage(summary, event) {
  const countText = `${formatBirdCount(event.birdCount)}수`;
  const houseText = event.houseName || event.houseId || '동 미상';
  const remainingText = event.remainingEstimate || event.inputCount || event.outputCount
    ? ` · 잔존 추정 ${formatBirdCount(event.remainingEstimate)}수`
    : '';
  const delayedText = event.reportBucket === 'registered_late' ? ` · 실제일 ${event.actualDate}` : '';
  const line = `${event.movementLabel}: ${houseText} ${countText}${remainingText}${delayedText}`;
  if (!summary.messages.includes(line)) summary.messages.push(line);
  const eventTime = event.registeredAt || event.actualAt || event.actualDate;
  if (!summary.lastEventAt || String(eventTime || '').localeCompare(summary.lastEventAt) > 0) {
    summary.lastEventAt = eventTime || summary.lastEventAt;
  }
}

function compareFarmSummaryPriority(a, b) {
  return compareCompanyOrder(a, b)
    || b.activeIssueCount - a.activeIssueCount
    || (b.openedCount + b.reopenedCount) - (a.openedCount + a.reopenedCount)
    || b.issueEventCount - a.issueEventCount
    || b.farmScopeEventCount - a.farmScopeEventCount
    || (b.shipmentRecordCount + b.placementRecordCount) - (a.shipmentRecordCount + a.placementRecordCount)
    || String(b.lastEventAt || '').localeCompare(String(a.lastEventAt || ''));
}

function buildFarmPriorityMap(notableFarms) {
  return new Map(notableFarms.map((farm, index) => [`${farm.company}:${farm.farmId}`, index]));
}

function activeIssueStatusPriority(status) {
  if (status === 'open') return 3;
  if (status === 'recovering') return 2;
  if (status === 'watching') return 1;
  return 0;
}

function compareActiveIssuePriority(a, b, farmPriorityMap = new Map()) {
  const aFarmPriority = farmPriorityMap.get(`${a.company}:${a.farmId}`) ?? Number.MAX_SAFE_INTEGER;
  const bFarmPriority = farmPriorityMap.get(`${b.company}:${b.farmId}`) ?? Number.MAX_SAFE_INTEGER;
  return compareCompanyOrder(a, b)
    || aFarmPriority - bFarmPriority
    || activeIssueStatusPriority(b.status) - activeIssueStatusPriority(a.status)
    || formatCount(b.missCount) - formatCount(a.missCount)
    || String(a.farmName || '').localeCompare(String(b.farmName || ''), 'ko-KR')
    || String(a.houseName || a.houseId || '').localeCompare(String(b.houseName || b.houseId || ''), 'ko-KR')
    || String(a.cameraName || a.moduleId || '').localeCompare(String(b.cameraName || b.moduleId || ''), 'ko-KR')
    || String(b.lastCheckedAt || '').localeCompare(String(a.lastCheckedAt || ''));
}

function flockMovementKindPriority(kind) {
  return kind === 'shipment' ? 0 : 1;
}

function flockMovementBucketPriority(bucket) {
  return bucket === 'actual_date' ? 0 : 1;
}

function compareFlockMovementPriority(a, b) {
  return flockMovementBucketPriority(a.reportBucket) - flockMovementBucketPriority(b.reportBucket)
    || flockMovementKindPriority(a.movementKind) - flockMovementKindPriority(b.movementKind)
    || compareCompanyOrder(a, b)
    || String(a.farmName || '').localeCompare(String(b.farmName || ''), 'ko-KR')
    || String(a.houseName || a.houseId || '').localeCompare(String(b.houseName || b.houseId || ''), 'ko-KR')
    || String(a.actualAt || a.actualDate || '').localeCompare(String(b.actualAt || b.actualDate || ''));
}

function buildSummaries(issueEvents, farmScopeEvents, activeIssues, flockMovementEvents) {
  const companies = Object.fromEntries(COMPANY_ORDER.map((company) => [company, createEmptyCompanySummary(company)]));
  const farms = new Map();

  for (const event of issueEvents) {
    const company = companies[event.company] ?? companies.other;
    company.issueEventCount += 1;
    if (event.eventKind === 'opened') company.openedCount += 1;
    if (event.eventKind === 'reopened') company.reopenedCount += 1;
    if (event.eventKind === 'recovering') company.recoveringCount += 1;
    if (event.eventKind === 'resolved') company.resolvedCount += 1;

    const key = `${event.company}:${event.farmId}`;
    const farm = farms.get(key) ?? createFarmSummary(event);
    farm.issueEventCount += 1;
    if (event.eventKind === 'opened') farm.openedCount += 1;
    if (event.eventKind === 'reopened') farm.reopenedCount += 1;
    if (event.eventKind === 'recovering') farm.recoveringCount += 1;
    if (event.eventKind === 'resolved') farm.resolvedCount += 1;
    pushMessage(farm, event);
    farms.set(key, farm);
  }

  for (const event of farmScopeEvents) {
    const company = companies[event.company] ?? companies.other;
    company.farmScopeEventCount += 1;
    if (event.eventKind === 'activated') company.activatedCount += 1;
    if (event.eventKind === 'resting_started') company.restingStartedCount += 1;
    if (event.eventKind === 'review_needed') company.reviewNeededCount += 1;
    if (event.eventKind === 'uninstalled') company.uninstalledCount += 1;

    const key = `${event.company}:${event.farmId}`;
    const farm = farms.get(key) ?? createFarmSummary(event);
    farm.farmScopeEventCount += 1;
    pushMessage(farm, event);
    farms.set(key, farm);
  }

  for (const event of flockMovementEvents) {
    const company = companies[event.company] ?? companies.other;
    if (event.movementKind === 'placement') {
      company.placementRecordCount += 1;
      company.placementBirdCount += event.birdCount;
    } else {
      company.shipmentRecordCount += 1;
      company.shipmentBirdCount += event.birdCount;
    }
    if (event.reportBucket === 'registered_late') company.lateMovementRecordCount += 1;

    const key = `${event.company}:${event.farmId}`;
    const farm = farms.get(key) ?? createFarmSummary(event);
    if (event.movementKind === 'placement') {
      farm.placementRecordCount += 1;
      farm.placementBirdCount += event.birdCount;
    } else {
      farm.shipmentRecordCount += 1;
      farm.shipmentBirdCount += event.birdCount;
    }
    if (event.reportBucket === 'registered_late') farm.lateMovementRecordCount += 1;
    pushFlockMovementMessage(farm, event);
    farms.set(key, farm);
  }

  for (const state of activeIssues) {
    const company = companies[state.company] ?? companies.other;
    company.activeIssueCount += 1;
    const key = `${state.company}:${state.farmId}`;
    const farm = farms.get(key) ?? createFarmSummary({
      ...state,
      eventAt: state.lastCheckedAt,
      eventLabel: state.status === 'open' ? '열린 문제' : '회복중',
    });
    farm.activeIssueCount += 1;
    pushMessage(farm, {
      ...state,
      eventAt: state.lastCheckedAt,
      eventLabel: state.status === 'open' ? '열린 문제' : '회복중',
      message: state.message,
    });
    farms.set(key, farm);
  }

  const notableFarms = Array.from(farms.values())
    .sort(compareFarmSummaryPriority)
    .map((farm) => ({
      ...farm,
      messages: farm.messages.slice(0, 5),
    }));

  const notableSet = new Set(notableFarms.map((farm) => `${farm.company}:${farm.farmId}`));
  for (const farm of notableFarms) {
    const company = companies[farm.company] ?? companies.other;
    if (notableSet.has(`${farm.company}:${farm.farmId}`)) company.notableFarmCount += 1;
  }

  return {
    companies: COMPANY_ORDER.map((company) => companies[company]),
    notableFarms,
  };
}

function formatKstDateTime(value) {
  const iso = safeIso(value);
  if (!iso) return '-';
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(iso));
}

function renderCompanyLine(company) {
  const parts = [
    company.openedCount + company.reopenedCount ? `문제확정 ${company.openedCount + company.reopenedCount}건` : '',
    company.recoveringCount ? `이미지 재수신 ${company.recoveringCount}건` : '',
    company.resolvedCount ? `해결 ${company.resolvedCount}건` : '',
    company.farmScopeEventCount ? `감시범위 전환 ${company.farmScopeEventCount}건` : '',
    company.placementRecordCount ? `입추 ${company.placementRecordCount}건/${formatBirdCount(company.placementBirdCount)}수` : '',
    company.shipmentRecordCount ? `출하 ${company.shipmentRecordCount}건/${formatBirdCount(company.shipmentBirdCount)}수` : '',
    company.lateMovementRecordCount ? `지연 등록 ${company.lateMovementRecordCount}건` : '',
    company.activeIssueCount ? `열린 문제 ${company.activeIssueCount}건` : '',
  ].filter(Boolean);
  return parts.length ? parts.join(', ') : '특이사항 없음';
}

function renderFarmSummaryLine(farm) {
  const summary = [
    farm.openedCount + farm.reopenedCount ? `문제확정 ${farm.openedCount + farm.reopenedCount}` : '',
    farm.recoveringCount ? `재수신 ${farm.recoveringCount}` : '',
    farm.resolvedCount ? `해결 ${farm.resolvedCount}` : '',
    farm.farmScopeEventCount ? `감시범위 ${farm.farmScopeEventCount}` : '',
    farm.placementRecordCount ? `입추 ${farm.placementRecordCount}/${formatBirdCount(farm.placementBirdCount)}수` : '',
    farm.shipmentRecordCount ? `출하 ${farm.shipmentRecordCount}/${formatBirdCount(farm.shipmentBirdCount)}수` : '',
    farm.lateMovementRecordCount ? `지연등록 ${farm.lateMovementRecordCount}` : '',
    farm.activeIssueCount ? `열린 문제 ${farm.activeIssueCount}` : '',
  ].filter(Boolean).join(', ');
  return `- ${farm.farmName} ${farm.farmId}: ${summary || '특이사항'}`;
}

function renderFarmSummariesByCompany(lines, farms) {
  if (!farms.length) {
    lines.push('- 특이사항 없음.');
    return;
  }

  for (const group of groupByCompany(farms)) {
    lines.push(`### ${group.label}`);
    for (const farm of group.items.slice(0, 30)) {
      lines.push(renderFarmSummaryLine(farm));
      for (const message of farm.messages.slice(0, 2)) {
        lines.push(`  - ${message}`);
      }
    }
    if (group.items.length > 30) {
      lines.push(`- 외 ${formatBirdCount(group.items.length - 30)}개 농장 생략.`);
    }
    lines.push('');
  }
}

function renderFlockMovementEvent(event, options = {}) {
  const includeCompany = options.includeCompany !== false;
  const farmText = includeCompany
    ? `${event.companyLabel} / ${event.farmName} ${event.farmId}`
    : `${event.farmName} ${event.farmId}`;
  const actualText = event.actualAt ? formatKstDateTime(event.actualAt) : event.actualDate;
  const registeredText = event.registeredAt ? ` · 등록 ${formatKstDateTime(event.registeredAt)}` : '';
  const sourceText = event.source ? ` · ${event.source}` : '';
  const typeText = event.movementType ? ` · ${event.movementType}` : '';
  const weightText = event.averageWeight ? ` · 평균 ${formatBirdCount(event.averageWeight)}g` : '';
  const remainingText = (event.inputCount || event.outputCount || event.deadCount || event.killCount || event.remainingEstimate)
    ? ` · 잔존 추정 ${formatBirdCount(event.remainingEstimate)}수`
    : '';
  const memoText = event.memo ? ` · ${event.memo}` : '';
  return `- ${farmText} / ${event.houseName || event.houseId}: ${event.movementLabel} ${formatBirdCount(event.birdCount)}수 · 실제 ${actualText}${registeredText}${typeText}${weightText}${sourceText}${remainingText}${memoText}`;
}

function renderFlockMovementBucket(lines, title, events) {
  lines.push('', `### ${title}`);
  if (!events.length) {
    lines.push('- 없음.');
    return;
  }

  for (const group of groupByCompany(events)) {
    lines.push(`#### ${group.label}`);
    for (const event of group.items.slice(0, 80)) {
      lines.push(renderFlockMovementEvent(event, { includeCompany: false }));
    }
    if (group.items.length > 80) {
      lines.push(`- 외 ${formatBirdCount(group.items.length - 80)}건 생략.`);
    }
  }
}

function renderActiveIssueLine(issue, options = {}) {
  const includeCompany = options.includeCompany !== false;
  const farmText = includeCompany
    ? `${issue.companyLabel} / ${issue.farmName} ${issue.farmId}`
    : `${issue.farmName} ${issue.farmId}`;
  return `- ${farmText} / ${issue.houseName || issue.houseId} / ${issue.cameraName || issue.moduleId}: ${issue.status} · ${issue.message}`;
}

function renderActiveIssuesByCompany(lines, activeIssues) {
  if (!activeIssues.length) {
    lines.push('- 없음.');
    return;
  }

  for (const group of groupByCompany(activeIssues)) {
    lines.push(`### ${group.label}`);
    for (const issue of group.items.slice(0, 80)) {
      lines.push(renderActiveIssueLine(issue, { includeCompany: false }));
    }
    if (group.items.length > 80) {
      lines.push(`- 외 ${formatBirdCount(group.items.length - 80)}건 생략.`);
    }
    lines.push('');
  }
}

function renderFlockMovementSection(lines, report) {
  const actualPlacements = report.flockMovementEvents.filter((event) => event.reportBucket === 'actual_date' && event.movementKind === 'placement');
  const actualShipments = report.flockMovementEvents.filter((event) => event.reportBucket === 'actual_date' && event.movementKind === 'shipment');
  const lateMovements = report.flockMovementEvents.filter((event) => event.reportBucket === 'registered_late');
  lines.push('', '## 출하·입추 원장');

  renderFlockMovementBucket(lines, '실제 출하', actualShipments);
  renderFlockMovementBucket(lines, '실제 입추', actualPlacements);
  renderFlockMovementBucket(lines, '지연 등록', lateMovements);
}

export function renderCctvUpDailyReportMarkdown(report) {
  const lines = [
    `# ${report.date} CCTVUP 일일 브리핑`,
    '',
    '## 요약',
    `- 문제확정: ${report.summary.openedCount + report.summary.reopenedCount}건`,
    `- 이미지 재수신: ${report.summary.recoveringCount}건`,
    `- 해결: ${report.summary.resolvedCount}건`,
    `- 감시범위 전환: ${report.summary.farmScopeEventCount}건`,
    `- 실제 출하: ${report.summary.shipmentRecordCount}건 / ${formatBirdCount(report.summary.shipmentBirdCount)}수`,
    `- 실제 입추: ${report.summary.placementRecordCount}건 / ${formatBirdCount(report.summary.placementBirdCount)}수`,
    `- 지연 등록: ${report.summary.lateMovementRecordCount}건`,
    `- 계속 열려 있는 문제: ${report.summary.activeIssueCount}건`,
    '',
    '## 업체별 특이사항',
  ];

  for (const company of report.companies) {
    lines.push(`### ${company.label}`, `- ${renderCompanyLine(company)}`, '');
  }

  lines.push('## 업체별 주요 확인 항목');
  renderFarmSummariesByCompany(lines, report.notableFarms);

  renderFlockMovementSection(lines, report);

  lines.push('', '## 계속 열려 있는 문제');
  renderActiveIssuesByCompany(lines, report.activeIssues);

  const latestRun = report.checkRuns[0];
  lines.push(
    '',
    '## 생성 기준',
    `- 기준 기간: ${report.range.fromLabel} ~ ${report.range.toLabel}`,
    `- 생성 시각: ${formatKstDateTime(report.generatedAt)}`,
    `- 원천: tbl_cctvup_issue_events, tbl_cctvup_farm_scope_events, tbl_cctvup_camera_states, tbl_cctvup_check_runs, tbl_farm_diary_input, tbl_farm_diary_output, tbl_farm_diary_dead_kill`,
    `- 잔존 추정: 입추수 - 출하수 - 폐사수 - 도태수 기준`,
    `- 최근 check run: ${latestRun ? `${formatKstDateTime(latestRun.checkedAt)} · issue ${latestRun.issueCount}` : '확인된 run 없음'}`,
    `- raw 파일: ${report.paths.rawPath}`,
  );

  return `${lines.join('\n')}\n`;
}

export function buildCctvUpDailyReportDocument(input) {
  const date = normalizeCctvUpReportDate(input.date, input.now ? new Date(input.now) : new Date());
  const generatedAt = safeIso(input.generatedAt) ?? new Date().toISOString();
  const range = buildKstReportRange(date);
  const paths = buildCctvUpDailyReportPaths(date);
  const farmMetaMap = buildFarmMetaMap(input.farmMetadata ?? []);
  const fromMs = Date.parse(range.fromIso);
  const toMs = Date.parse(range.toIso);
  const inRange = (value) => {
    const iso = safeIso(value);
    if (!iso) return false;
    const ms = Date.parse(iso);
    return ms >= fromMs && ms < toMs;
  };

  const issueEvents = (input.issueEvents ?? [])
    .filter((event) => inRange(event.eventAt))
    .map((event) => sanitizeIssueEvent(event, farmMetaMap))
    .sort((a, b) => String(b.eventAt).localeCompare(String(a.eventAt)));
  const farmScopeEvents = (input.farmScopeEvents ?? [])
    .filter((event) => inRange(event.eventAt))
    .map((event) => sanitizeFarmScopeEvent(event, farmMetaMap))
    .sort((a, b) => String(b.eventAt).localeCompare(String(a.eventAt)));
  const flockMovementEvents = (input.flockMovementEvents ?? [])
    .filter((event) => event.reportBucket === 'registered_late' || String(event.actualDate || '') === date)
    .map((event) => sanitizeFlockMovementEvent(event, farmMetaMap))
    .sort(compareFlockMovementPriority);
  const activeIssues = (input.cameraStates ?? [])
    .filter((state) => state.status === 'open' || state.status === 'recovering' || state.status === 'watching')
    .map((state) => sanitizeCameraState(state, farmMetaMap))
    .sort((a, b) => (
      compareCompanyOrder(a, b)
      || String(a.farmName || '').localeCompare(String(b.farmName || ''), 'ko-KR')
      || String(a.houseName || a.houseId || '').localeCompare(String(b.houseName || b.houseId || ''), 'ko-KR')
      || String(a.cameraName || a.moduleId || '').localeCompare(String(b.cameraName || b.moduleId || ''), 'ko-KR')
      || (b.status === 'open' ? 1 : 0) - (a.status === 'open' ? 1 : 0)
      || formatCount(b.missCount) - formatCount(a.missCount)
      || String(b.lastCheckedAt || '').localeCompare(String(a.lastCheckedAt || ''))
    ));
  const checkRuns = (input.checkRuns ?? [])
    .filter((run) => inRange(run.checkedAt))
    .map(sanitizeCheckRun)
    .sort((a, b) => String(b.checkedAt).localeCompare(String(a.checkedAt)));
  const { companies, notableFarms } = buildSummaries(issueEvents, farmScopeEvents, activeIssues, flockMovementEvents);
  const farmPriorityMap = buildFarmPriorityMap(notableFarms);
  activeIssues.sort((a, b) => (
    compareActiveIssuePriority(a, b, farmPriorityMap)
  ));
  const actualFlockMovementEvents = flockMovementEvents.filter((event) => event.reportBucket === 'actual_date');

  const summary = {
    issueEventCount: issueEvents.length,
    farmScopeEventCount: farmScopeEvents.length,
    openedCount: issueEvents.filter((event) => event.eventKind === 'opened').length,
    reopenedCount: issueEvents.filter((event) => event.eventKind === 'reopened').length,
    recoveringCount: issueEvents.filter((event) => event.eventKind === 'recovering').length,
    resolvedCount: issueEvents.filter((event) => event.eventKind === 'resolved').length,
    placementRecordCount: actualFlockMovementEvents.filter((event) => event.movementKind === 'placement').length,
    placementBirdCount: actualFlockMovementEvents
      .filter((event) => event.movementKind === 'placement')
      .reduce((sum, event) => sum + event.birdCount, 0),
    shipmentRecordCount: actualFlockMovementEvents.filter((event) => event.movementKind === 'shipment').length,
    shipmentBirdCount: actualFlockMovementEvents
      .filter((event) => event.movementKind === 'shipment')
      .reduce((sum, event) => sum + event.birdCount, 0),
    lateMovementRecordCount: flockMovementEvents.filter((event) => event.reportBucket === 'registered_late').length,
    activeIssueCount: activeIssues.length,
    notableFarmCount: notableFarms.length,
    checkRunCount: checkRuns.length,
  };

  const raw = {
    schemaVersion: CCTVUP_DAILY_REPORT_SCHEMA_VERSION,
    date,
    title: `${date} CCTVUP 일일 브리핑`,
    generatedAt,
    range,
    paths,
    status: 'generated',
    summary,
    companies,
    notableFarms,
    issueEvents,
    farmScopeEvents,
    flockMovementEvents,
    activeIssues,
    checkRuns,
  };

  return {
    ...raw,
    markdown: renderCctvUpDailyReportMarkdown(raw),
  };
}

export function normalizeCctvUpDailyReportManifest(value) {
  if (!value || typeof value !== 'object') {
    return { schemaVersion: CCTVUP_DAILY_REPORT_SCHEMA_VERSION, updatedAt: null, reports: [] };
  }
  const reports = Array.isArray(value.reports) ? value.reports : [];
  return {
    schemaVersion: Number(value.schemaVersion || CCTVUP_DAILY_REPORT_SCHEMA_VERSION),
    updatedAt: value.updatedAt ?? null,
    reports: reports
      .filter((report) => report && REPORT_DATE_PATTERN.test(String(report.date || '')))
      .map((report) => ({
        date: report.date,
        title: report.title || `${report.date} CCTVUP 일일 브리핑`,
        companyCount: formatCount(report.companyCount),
        notableFarmCount: formatCount(report.notableFarmCount),
        issueEventCount: formatCount(report.issueEventCount),
        farmScopeEventCount: formatCount(report.farmScopeEventCount),
        placementRecordCount: formatCount(report.placementRecordCount),
        placementBirdCount: formatCount(report.placementBirdCount),
        shipmentRecordCount: formatCount(report.shipmentRecordCount),
        shipmentBirdCount: formatCount(report.shipmentBirdCount),
        lateMovementRecordCount: formatCount(report.lateMovementRecordCount),
        activeIssueCount: formatCount(report.activeIssueCount),
        status: report.status || 'generated',
        markdownPath: report.markdownPath,
        rawPath: report.rawPath,
        generatedAt: report.generatedAt ?? null,
      }))
      .sort((a, b) => b.date.localeCompare(a.date)),
  };
}

export async function readCctvUpDailyReportManifest(rootDir = process.cwd()) {
  const manifestPath = path.join(getCctvUpDailyReportRoot(rootDir), 'manifest.json');
  try {
    const raw = await fs.readFile(manifestPath, 'utf8');
    return normalizeCctvUpDailyReportManifest(JSON.parse(raw));
  } catch (error) {
    if (error && typeof error === 'object' && error.code === 'ENOENT') {
      return normalizeCctvUpDailyReportManifest(null);
    }
    throw error;
  }
}

export async function readCctvUpDailyReportDetail(reportDate, rootDir = process.cwd()) {
  const date = normalizeCctvUpReportDate(reportDate);
  const root = getCctvUpDailyReportRoot(rootDir);
  const paths = buildCctvUpDailyReportPaths(date);
  const [markdown, rawText, manifest] = await Promise.all([
    fs.readFile(path.join(root, paths.markdownPath), 'utf8'),
    fs.readFile(path.join(root, paths.rawPath), 'utf8'),
    readCctvUpDailyReportManifest(rootDir),
  ]);
  const raw = JSON.parse(rawText);
  const reports = manifest.reports;
  const index = reports.findIndex((report) => report.date === date);

  return {
    date,
    markdown,
    raw,
    manifestItem: index >= 0 ? reports[index] : null,
    previousDate: index >= 0 ? reports[index + 1]?.date ?? null : null,
    nextDate: index > 0 ? reports[index - 1]?.date ?? null : null,
  };
}

export async function writeCctvUpDailyReportFiles(report, rootDir = process.cwd()) {
  const root = getCctvUpDailyReportRoot(rootDir);
  const paths = buildCctvUpDailyReportPaths(report.date);
  const targetDirectory = path.join(root, paths.directory);
  await fs.mkdir(targetDirectory, { recursive: true });
  const { markdown: _markdown, ...rawReport } = report;

  await Promise.all([
    fs.writeFile(path.join(root, paths.markdownPath), report.markdown, 'utf8'),
    fs.writeFile(path.join(root, paths.rawPath), `${JSON.stringify(rawReport, null, 2)}\n`, 'utf8'),
  ]);

  const manifest = await readCctvUpDailyReportManifest(rootDir);
  const nextItem = {
    date: report.date,
    title: report.title,
    companyCount: report.companies.filter((company) => (
      company.issueEventCount
      || company.farmScopeEventCount
      || company.activeIssueCount
      || company.notableFarmCount
    )).length,
    notableFarmCount: report.summary.notableFarmCount,
    issueEventCount: report.summary.issueEventCount,
    farmScopeEventCount: report.summary.farmScopeEventCount,
    placementRecordCount: report.summary.placementRecordCount,
    placementBirdCount: report.summary.placementBirdCount,
    shipmentRecordCount: report.summary.shipmentRecordCount,
    shipmentBirdCount: report.summary.shipmentBirdCount,
    lateMovementRecordCount: report.summary.lateMovementRecordCount,
    activeIssueCount: report.summary.activeIssueCount,
    status: report.status,
    markdownPath: paths.markdownPath,
    rawPath: paths.rawPath,
    generatedAt: report.generatedAt,
  };
  const nextReports = [
    nextItem,
    ...manifest.reports.filter((item) => item.date !== report.date),
  ].sort((a, b) => b.date.localeCompare(a.date));
  const nextManifest = {
    schemaVersion: CCTVUP_DAILY_REPORT_SCHEMA_VERSION,
    updatedAt: report.generatedAt,
    reports: nextReports,
  };
  await fs.writeFile(path.join(root, 'manifest.json'), `${JSON.stringify(nextManifest, null, 2)}\n`, 'utf8');

  return {
    manifest: nextManifest,
    paths,
  };
}
