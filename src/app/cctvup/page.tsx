import { redirect } from 'next/navigation';
import CctvUpClient from './CctvUpClient';
import DashFloatingNav from '@/components/dash/DashFloatingNav';
import { isCctvUpAuthRequired } from '@/lib/cctvup-auth';
import { getSupabaseServerClaims } from '@/lib/supabase/server';

export const metadata = {
  title: 'CCTVUP | Paiptree',
  description: '농장별 5분 CCTV 데이터 수신 모니터',
};

export const dynamic = 'force-dynamic';

async function requireCctvUpAuth() {
  if (!isCctvUpAuthRequired()) return;

  const auth = await getSupabaseServerClaims();
  if (!auth.ok) {
    redirect('/cctvup/login?next=/cctvup');
  }
}

export default async function CctvUpPage() {
  await requireCctvUpAuth();

  return (
    <>
      <CctvUpClient />
      <DashFloatingNav current="/cctvup" />
    </>
  );
}
