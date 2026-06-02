import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const supabase = createSupabaseServerClient();

  if (supabase) {
    await supabase.auth.signOut({ scope: 'local' });
  }

  const loginUrl = new URL('/cctvup/login', requestUrl.origin);
  loginUrl.searchParams.set('next', '/cctvup');
  return NextResponse.redirect(loginUrl);
}
