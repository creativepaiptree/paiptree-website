import {
  hasValidCctvUpInternalSecret,
  isCctvUpAuthRequired,
  isCctvUpLocalRequest,
  isTruthyEnv,
  readCctvUpProvidedSecret,
} from './cctvup-auth';
import { getSupabaseServerClaims } from './supabase/server';

type CctvUpAccessState = {
  ok: boolean;
  status: number;
  mode: string;
  message: string;
};

export async function getCctvUpReadAccessState(request: Request): Promise<CctvUpAccessState> {
  if (isTruthyEnv(process.env.CCTVUP_PUBLIC_READ)) {
    return {
      ok: true,
      status: 200,
      mode: 'public-read',
      message: 'CCTVUP public read access is explicitly enabled.',
    };
  }

  if (!isCctvUpAuthRequired() && isCctvUpLocalRequest(request)) {
    return {
      ok: true,
      status: 200,
      mode: 'local-read',
      message: 'Local CCTVUP read request allowed.',
    };
  }

  if (hasValidCctvUpInternalSecret(request.headers)) {
    return {
      ok: true,
      status: 200,
      mode: 'read-protected',
      message: 'CCTVUP read secret accepted.',
    };
  }

  const supabaseAuth = await getSupabaseServerClaims();
  if (supabaseAuth.ok) {
    return {
      ok: true,
      status: 200,
      mode: supabaseAuth.mode,
      message: supabaseAuth.message,
    };
  }

  const providedSecret = readCctvUpProvidedSecret(request.headers);
  const detail = providedSecret ? 'secret mismatch or Supabase session missing.' : 'missing Supabase session.';

  return {
    ok: false,
    status: supabaseAuth.status,
    mode: supabaseAuth.mode,
    message: `CCTVUP read access denied: ${detail}`,
  };
}

export function buildCctvUpReadDeniedPayload(access: CctvUpAccessState) {
  return {
    ok: false,
    source: 'protected',
    mode: access.mode,
    message: access.message,
  };
}
