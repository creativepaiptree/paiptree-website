const CRON_SECRET_HEADER = 'x-cctvup-cron-secret';
const ADMIN_SECRET_HEADER = 'x-cctvup-admin-secret';

export function isTruthyEnv(value: string | undefined) {
  return ['1', 'true', 'yes', 'on'].includes((value || '').trim().toLowerCase());
}

export function isCctvUpProductionRuntime() {
  return process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
}

export function isCctvUpAuthRequired() {
  if (isTruthyEnv(process.env.CCTVUP_AUTH_DISABLED)) return false;
  if (isTruthyEnv(process.env.CCTVUP_AUTH_REQUIRED)) return true;
  return isCctvUpProductionRuntime();
}

export function isCctvUpLocalHost(value: string) {
  const normalized = value.trim().toLowerCase();
  if (normalized === '::1' || normalized.startsWith('[::1]')) return true;

  const host = normalized.split(':')[0];
  return host === 'localhost' || host === '127.0.0.1' || host === '::1';
}

export function isCctvUpLocalRequest(request: Request) {
  const url = new URL(request.url);
  const host = request.headers.get('host') || url.host;
  return isCctvUpLocalHost(url.hostname) || isCctvUpLocalHost(host);
}

export function isCctvUpPagePath(pathname: string) {
  return pathname === '/cctvup' || pathname === '/cctvup/';
}

export function isCctvUpLoginPath(pathname: string) {
  return pathname === '/cctvup/login' || pathname === '/cctvup/login/';
}

export function isCctvUpApiPath(pathname: string) {
  return pathname === '/api/cctvup' || pathname === '/api/cctvup/' || pathname.startsWith('/api/cctvup/');
}

export function readCctvUpProvidedSecret(headers: Headers) {
  return (
    headers.get(ADMIN_SECRET_HEADER)?.trim()
    || headers.get(CRON_SECRET_HEADER)?.trim()
    || ''
  );
}

function readExpectedSecrets() {
  return [
    process.env.CCTVUP_READ_SECRET,
    process.env.CCTVUP_REGISTRY_ADMIN_SECRET,
    process.env.CCTVUP_CRON_TRIGGER_SECRET,
  ]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value));
}

export function hasValidCctvUpInternalSecret(headers: Headers) {
  const providedSecret = readCctvUpProvidedSecret(headers);
  if (!providedSecret) return false;
  return readExpectedSecrets().some((expectedSecret) => expectedSecret === providedSecret);
}

export function buildCctvUpLoginUrl(requestUrl: string) {
  const url = new URL(requestUrl);
  const loginUrl = new URL('/cctvup/login', url.origin);
  loginUrl.searchParams.set('next', `${url.pathname}${url.search}`);
  return loginUrl;
}

export function sanitizeCctvUpNextPath(value: string | null | undefined) {
  const fallback = '/cctvup';
  const rawValue = value?.trim();

  if (!rawValue || !rawValue.startsWith('/') || rawValue.startsWith('//')) {
    return fallback;
  }

  try {
    const parsed = new URL(rawValue, 'http://cctvup.local');
    if (parsed.origin !== 'http://cctvup.local') return fallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}
