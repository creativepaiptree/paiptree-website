import { NextResponse } from 'next/server';
import { sanitizeCctvUpNextPath } from '@/lib/cctvup-auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const nextPath = sanitizeCctvUpNextPath(requestUrl.searchParams.get('next'));
  const loginUrl = new URL('/cctvup/login', requestUrl.origin);
  loginUrl.searchParams.set('next', nextPath);

  if (!code) {
    loginUrl.searchParams.set('error', 'missing-code');
    return NextResponse.redirect(loginUrl);
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    loginUrl.searchParams.set('error', 'unconfigured');
    return NextResponse.redirect(loginUrl);
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    loginUrl.searchParams.set('error', 'callback');
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.redirect(new URL(nextPath, requestUrl.origin));
}
