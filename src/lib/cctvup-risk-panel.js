export const CCTVUP_ACTIONABLE_WINDOW_MINUTES = 180;

const PROBLEM_TRANSITION_EVENT_KINDS = new Set(['opened', 'reopened', 'recovering']);

function isProblemTransitionEvent(event) {
  return PROBLEM_TRANSITION_EVENT_KINDS.has(event?.eventKind);
}

function getTimeValue(value) {
  if (!value) return 0;
  const time = Date.parse(value);
  return Number.isNaN(time) ? 0 : time;
}

function minutesBetween(now, then) {
  const nowTime = now instanceof Date ? now.getTime() : Date.parse(now);
  const thenTime = getTimeValue(then);
  if (!Number.isFinite(nowTime) || Number.isNaN(nowTime) || !thenTime) return Number.POSITIVE_INFINITY;
  return Math.max(0, Math.floor((nowTime - thenTime) / 60000));
}

export function buildCctvUpProblemTransitionMap(issueEvents = []) {
  const latestByCamera = new Map();

  for (const event of issueEvents) {
    if (!event?.cameraKey || !isProblemTransitionEvent(event)) continue;

    const previous = latestByCamera.get(event.cameraKey);
    if (!previous || getTimeValue(event.eventAt) > getTimeValue(previous.eventAt)) {
      latestByCamera.set(event.cameraKey, event);
    }
  }

  return latestByCamera;
}

export function getCctvUpProblemTransitionAt(row, transitionMap = new Map()) {
  const eventAt = transitionMap.get(row?.id)?.eventAt;
  return eventAt
    || row?.openedAt
    || row?.firstMissedAt
    || row?.lastCheckedAt
    || row?.latestAtIso
    || row?.latestAt
    || '';
}

export function isCctvUpFreshProblemRow(
  row,
  transitionMap = new Map(),
  checkedAt = new Date().toISOString(),
  windowMinutes = CCTVUP_ACTIONABLE_WINDOW_MINUTES,
) {
  if (!row || row.status === 'ok' || row.status === 'paused') return false;
  const transitionAt = getCctvUpProblemTransitionAt(row, transitionMap);
  return minutesBetween(checkedAt, transitionAt) < windowMinutes;
}
