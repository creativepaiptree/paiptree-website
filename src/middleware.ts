import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import {
  buildCctvUpLoginUrl,
  hasValidCctvUpInternalSecret,
  isCctvUpApiPath,
  isCctvUpAuthRequired,
  isCctvUpCurrentCachePath,
  isCctvUpLoginPath,
  isCctvUpPagePath,
} from '@/lib/cctvup-auth';
import { getSupabasePublicConfig } from '@/lib/supabase/env';

async function verifySupabaseAuth(request: NextRequest) {
  const config = getSupabasePublicConfig();
  let response = NextResponse.next({ request });

  if (!config) {
    return {
      ok: false as const,
      status: 503,
      response,
      message: 'Supabase Auth 환경변수가 설정되어 있지 않습니다.',
    };
  }

  const supabase = createServerClient(config.url, config.publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    return {
      ok: false as const,
      status: 401,
      response,
      message: 'Supabase 로그인이 필요합니다.',
    };
  }

  return {
    ok: true as const,
    status: 200,
    response,
    message: 'Supabase Auth session accepted.',
  };
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const targetsCctvUpPage = isCctvUpPagePath(pathname);
  const targetsCctvUpApi = isCctvUpApiPath(pathname);

  if (!targetsCctvUpPage && !targetsCctvUpApi) {
    return NextResponse.next();
  }

  if (!isCctvUpAuthRequired() || isCctvUpLoginPath(pathname)) {
    return NextResponse.next();
  }

  if (targetsCctvUpApi && isCctvUpCurrentCachePath(pathname)) {
    return NextResponse.next();
  }

  if (targetsCctvUpApi && hasValidCctvUpInternalSecret(request.headers)) {
    return NextResponse.next();
  }

  const auth = await verifySupabaseAuth(request);
  if (auth.ok) return auth.response;

  if (targetsCctvUpApi) {
    return NextResponse.json(
      {
        ok: false,
        source: 'protected',
        mode: auth.status === 503 ? 'supabase-auth-unconfigured' : 'supabase-auth-required',
        message: auth.message,
      },
      { status: auth.status, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  return NextResponse.redirect(buildCctvUpLoginUrl(request.url));
}

export const config = {
  matcher: ['/cctvup/:path*', '/api/cctvup/:path*'],
};
