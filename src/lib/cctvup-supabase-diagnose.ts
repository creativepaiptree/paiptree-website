import dns from 'node:dns/promises';
import net from 'node:net';

type DiagnoseError = {
  name: string;
  code?: string;
  errno?: number;
  syscall?: string;
  hostname?: string;
  status?: number;
  preview?: string;
  message: string;
};

type DiagnoseStepDetails = {
  host?: string;
  projectRef?: string;
  keyRole?: string | null;
  keyRef?: string | null;
  keyExp?: string | null;
  refMatches?: boolean | null;
  addresses?: Array<{ address: string; family: number }>;
  port?: number;
  status?: number;
  httpOk?: boolean;
  bytes?: number;
  preview?: string;
};

export type CctvUpSupabaseDiagnoseStep = DiagnoseStepDetails & {
  name: string;
  ok: boolean;
  elapsedMs: number;
  error?: DiagnoseError;
};

export type CctvUpSupabaseDiagnosePayload = {
  ok: boolean;
  checkedAt: string;
  timeoutMs: number;
  message: string;
  steps: CctvUpSupabaseDiagnoseStep[];
};

type SupabaseHttpError = Error & {
  code?: string;
  errno?: number;
  syscall?: string;
  hostname?: string;
  status?: number;
  preview?: string;
};

function createTimeoutSignal(timeoutMs: number): AbortSignal | undefined {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) return undefined;
  if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
    return AbortSignal.timeout(timeoutMs);
  }

  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeoutMs);
  return controller.signal;
}

function normalizeError(error: unknown): DiagnoseError {
  if (!(error instanceof Error)) {
    return {
      name: 'UnknownError',
      message: String(error),
    };
  }

  const detail = error as SupabaseHttpError;
  return {
    name: error.name || 'Error',
    code: detail.code,
    errno: detail.errno,
    syscall: detail.syscall,
    hostname: detail.hostname,
    status: detail.status,
    preview: detail.preview,
    message: error.message,
  };
}

function decodeJwtPayload(token: string) {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    return JSON.parse(Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')) as {
      role?: string;
      ref?: string;
      exp?: number;
    };
  } catch {
    return null;
  }
}

async function runStep(name: string, fn: () => Promise<DiagnoseStepDetails>): Promise<CctvUpSupabaseDiagnoseStep> {
  const startedAt = Date.now();
  try {
    const data = await fn();
    return {
      name,
      ok: true,
      elapsedMs: Date.now() - startedAt,
      ...data,
    };
  } catch (error) {
    return {
      name,
      ok: false,
      elapsedMs: Date.now() - startedAt,
      error: normalizeError(error),
    };
  }
}

async function tcpConnect(host: string, port: number, timeoutMs: number): Promise<{ port: number }> {
  return new Promise((resolveConnect, rejectConnect) => {
    const socket = net.createConnection({ host, port });
    const timer = setTimeout(() => {
      socket.destroy();
      rejectConnect(new Error(`TCP ${host}:${port} timeout after ${timeoutMs}ms`));
    }, timeoutMs);

    socket.once('connect', () => {
      clearTimeout(timer);
      socket.end();
      resolveConnect({ port });
    });

    socket.once('error', (error) => {
      clearTimeout(timer);
      rejectConnect(error);
    });
  });
}

async function fetchSupabaseRest(url: string, serviceKey: string, timeoutMs: number): Promise<DiagnoseStepDetails> {
  const response = await fetch(url, {
    cache: 'no-store',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      Accept: 'application/json',
    },
    signal: createTimeoutSignal(timeoutMs),
  });
  const text = await response.text();
  const preview = text.slice(0, 160);
  if (!response.ok) {
    const error = new Error(`Supabase REST ${response.status}: ${preview || response.statusText}`) as SupabaseHttpError;
    error.status = response.status;
    error.preview = preview;
    throw error;
  }

  return {
    status: response.status,
    httpOk: response.ok,
    bytes: Buffer.byteLength(text),
    preview,
  };
}

export async function diagnoseCctvUpSupabase(): Promise<CctvUpSupabaseDiagnosePayload> {
  const supabaseUrl = process.env.SUPABASE_URL?.trim() || process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_KEY?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const timeoutMs = Number(process.env.CCTVUP_SUPABASE_DIAG_TIMEOUT_MS || 5000);
  const checkedAt = new Date().toISOString();

  if (!supabaseUrl || !serviceKey) {
    return {
      ok: false,
      checkedAt,
      timeoutMs,
      message: 'SUPABASE_URL / SUPABASE_SERVICE_KEY 설정이 필요합니다.',
      steps: [],
    };
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(supabaseUrl);
  } catch {
    return {
      ok: false,
      checkedAt,
      timeoutMs,
      message: 'SUPABASE_URL 형식이 올바르지 않습니다.',
      steps: [],
    };
  }

  const projectRef = parsedUrl.hostname.split('.')[0];
  const jwtPayload = decodeJwtPayload(serviceKey);
  const steps: CctvUpSupabaseDiagnoseStep[] = [];

  steps.push(await runStep('env', async () => ({
    host: parsedUrl.hostname,
    projectRef,
    keyRole: jwtPayload?.role ?? null,
    keyRef: jwtPayload?.ref ?? null,
    keyExp: jwtPayload?.exp ? new Date(jwtPayload.exp * 1000).toISOString() : null,
    refMatches: jwtPayload?.ref ? jwtPayload.ref === projectRef : null,
  })));

  steps.push(await runStep('dns.lookup', async () => ({
    addresses: await dns.lookup(parsedUrl.hostname, { all: true }),
  })));

  steps.push(await runStep('tcp.443', async () => tcpConnect(parsedUrl.hostname, 443, timeoutMs)));

  steps.push(await runStep('https.root', async () => {
    const response = await fetch(parsedUrl.origin, {
      cache: 'no-store',
      signal: createTimeoutSignal(timeoutMs),
    });
    const text = await response.text();
    return {
      status: response.status,
      httpOk: response.ok,
      bytes: Buffer.byteLength(text),
    };
  }));

  const restChecks: Array<[string, string]> = [
    ['rest.check_runs', 'tbl_cctvup_check_runs?select=id,checked_at&order=checked_at.desc&limit=1'],
    ['rest.camera_states.any', 'tbl_cctvup_camera_states?select=id,camera_key,status,last_checked_at&limit=1'],
    ['rest.camera_states.active', 'tbl_cctvup_camera_states?select=id,camera_key,status,last_checked_at&status=in.(watching,open,recovering)&order=last_checked_at.desc&limit=1'],
    ['rest.issue_events', 'tbl_cctvup_issue_events?select=id,camera_key,event_kind,event_at&order=event_at.desc&limit=1'],
    ['rest.farm_scope_states', 'tbl_cctvup_farm_scope_states?select=id,farm_id,monitor_scope_code,last_checked_at&limit=1'],
    ['rest.farm_scope_events', 'tbl_cctvup_farm_scope_events?select=id,farm_id,event_kind,event_at&order=event_at.desc&limit=1'],
    ['rest.registry', 'tbl_cctvup_farm_registry?select=farm_id,category&limit=1'],
  ];

  for (const [name, query] of restChecks) {
    steps.push(await runStep(name, async () => fetchSupabaseRest(`${parsedUrl.origin}/rest/v1/${query}`, serviceKey, timeoutMs)));
  }

  const envStep = steps.find((step) => step.name === 'env');
  const refMismatch = envStep?.refMatches === false;
  const ok = steps.every((step) => step.ok) && !refMismatch;
  const failedStep = steps.find((step) => !step.ok);

  return {
    ok,
    checkedAt,
    timeoutMs,
    message: ok
      ? 'Supabase 환경, 네트워크, REST 핵심 테이블 응답이 정상입니다.'
      : refMismatch
        ? 'Supabase URL의 프로젝트 ref와 service key ref가 다릅니다.'
        : `${failedStep?.name ?? 'Supabase'} 단계에서 진단이 실패했습니다.`,
    steps,
  };
}
