import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { getSupabasePublicConfig } from './env';

export function createSupabaseServerClient() {
  const config = getSupabasePublicConfig();
  if (!config) return null;

  const cookieStore = cookies();

  return createServerClient(config.url, config.publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot always set cookies. Middleware refresh handles the normal path.
        }
      },
    },
  });
}

export async function getSupabaseServerClaims() {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return {
      ok: false as const,
      status: 503,
      mode: 'supabase-auth-unconfigured',
      message: 'Supabase Auth 환경변수가 설정되어 있지 않습니다.',
    };
  }

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    return {
      ok: false as const,
      status: 401,
      mode: 'supabase-auth-required',
      message: 'Supabase 로그인이 필요합니다.',
    };
  }

  return {
    ok: true as const,
    status: 200,
    mode: 'supabase-auth',
    claims: data.claims,
    message: 'Supabase Auth session accepted.',
  };
}
