import { redirect } from 'next/navigation';
import CctvUpLoginClient from './CctvUpLoginClient';
import { sanitizeCctvUpNextPath } from '@/lib/cctvup-auth';
import { getSupabasePublicConfig } from '@/lib/supabase/env';
import { getSupabaseServerClaims } from '@/lib/supabase/server';

type CctvUpLoginPageProps = {
  searchParams?: {
    next?: string;
    error?: string;
  };
};

export const metadata = {
  title: 'CCTVUP Login | Paiptree',
  description: 'CCTVUP 운영 관제 로그인',
};

export const dynamic = 'force-dynamic';

export default async function CctvUpLoginPage({ searchParams }: CctvUpLoginPageProps) {
  const nextPath = sanitizeCctvUpNextPath(searchParams?.next);
  const configMissing = !getSupabasePublicConfig();
  const sharedLoginEmail = process.env.NEXT_PUBLIC_CCTVUP_SHARED_LOGIN_EMAIL?.trim() || '';

  if (!configMissing) {
    const auth = await getSupabaseServerClaims();
    if (auth.ok) redirect(nextPath);
  }

  return (
    <CctvUpLoginClient
      nextPath={nextPath}
      sharedLoginEmail={sharedLoginEmail}
      authError={searchParams?.error}
      configMissing={configMissing}
    />
  );
}
