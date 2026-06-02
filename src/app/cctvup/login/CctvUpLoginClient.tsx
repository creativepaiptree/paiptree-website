'use client';

import { FormEvent, useState } from 'react';
import { ArrowRight, CheckCircle2, KeyRound } from 'lucide-react';
import { createSupabaseBrowserClient, hasSupabaseBrowserConfig } from '@/lib/supabase/client';

type CctvUpLoginClientProps = {
  nextPath: string;
  sharedLoginEmail?: string;
  authError?: string;
  configMissing?: boolean;
};

function formatAuthError(value: string | undefined) {
  if (!value) return '';
  if (value === 'callback') return '로그인 callback 처리에 실패했습니다.';
  if (value === 'missing-code') return '로그인 코드가 없는 요청입니다.';
  return '로그인이 완료되지 않았습니다.';
}

function formatPasswordAuthError(message: string | undefined) {
  if (!message) return '로그인에 실패했습니다.';
  if (message.toLowerCase().includes('invalid login credentials')) {
    return '아이디 또는 비밀번호가 맞지 않습니다.';
  }
  return message;
}

export default function CctvUpLoginClient({
  nextPath,
  sharedLoginEmail,
  authError,
  configMissing,
}: CctvUpLoginClientProps) {
  const [email, setEmail] = useState(sharedLoginEmail || '');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState(formatAuthError(authError));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isConfigMissing = configMissing || !hasSupabaseBrowserConfig();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedEmail = email.trim();

    setStatus('');
    setError('');

    if (!trimmedEmail) {
      setError('아이디를 입력해야 합니다.');
      return;
    }

    if (!password) {
      setError('비밀번호를 입력해야 합니다.');
      return;
    }

    if (isConfigMissing) {
      setError('Supabase Auth 환경변수가 설정되어 있지 않습니다.');
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (signInError) {
        setError(formatPasswordAuthError(signInError.message));
        return;
      }

      setStatus('로그인되었습니다. 이동 중입니다.');
      window.location.assign(nextPath);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : '로그인에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#08111d] text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-[1120px] flex-col justify-center gap-8 px-4 py-10 md:px-6">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/70 pb-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-300">FMS / CCTVUP</p>
            <h1 className="mt-2 text-2xl font-semibold leading-tight text-white">CCTVUP 운영 관제 로그인</h1>
          </div>
          <a
            href="/"
            className="inline-flex h-10 items-center border border-slate-600 px-3 text-sm font-semibold text-slate-200 transition hover:border-slate-400 hover:bg-white/5"
          >
            Paiptree
          </a>
        </header>

        <section className="grid gap-4 lg:grid-cols-[1fr_380px] lg:items-stretch">
          <div className="border border-slate-700 bg-[#0f1722] p-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="border border-slate-700 bg-[#101c2b] p-4">
                <p className="text-xs font-semibold text-slate-400">접근 범위</p>
                <p className="mt-2 text-lg font-semibold text-white">운영 관제</p>
              </div>
              <div className="border border-slate-700 bg-[#101c2b] p-4">
                <p className="text-xs font-semibold text-slate-400">인증 방식</p>
                <p className="mt-2 text-lg font-semibold text-white">비밀번호</p>
              </div>
              <div className="border border-slate-700 bg-[#101c2b] p-4">
                <p className="text-xs font-semibold text-slate-400">다음 경로</p>
                <p className="mt-2 break-all text-lg font-semibold text-white">{nextPath}</p>
              </div>
            </div>
            <div className="mt-5 border border-slate-700 bg-[#08111d] p-4 text-sm leading-6 text-slate-300">
              등록된 공용 계정으로 로그인하면 CCTVUP 관제 화면으로 이동합니다.
            </div>
          </div>

          <form onSubmit={handleSubmit} className="border border-slate-700 bg-[#0f1722] p-5">
            <div className="mb-5 flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center border border-sky-500/40 bg-sky-500/10 text-sky-200">
                <KeyRound size={20} aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-base font-semibold text-white">공용 계정 로그인</h2>
                <p className="text-xs text-slate-400">Supabase Auth</p>
              </div>
            </div>

            <label htmlFor="cctvup-login-email" className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
              ID
            </label>
            <input
              id="cctvup-login-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isSubmitting || isConfigMissing}
              className="mt-2 h-11 w-full border border-slate-600 bg-[#08111d] px-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="공용 계정 이메일"
            />

            <label
              htmlFor="cctvup-login-password"
              className="mt-4 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-400"
            >
              Password
            </label>
            <input
              id="cctvup-login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isSubmitting || isConfigMissing}
              className="mt-2 h-11 w-full border border-slate-600 bg-[#08111d] px-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="비밀번호"
            />

            <button
              type="submit"
              disabled={isSubmitting || isConfigMissing}
              className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 border border-sky-400 bg-sky-400 px-4 text-sm font-semibold text-[#06101d] transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:border-slate-600 disabled:bg-slate-700 disabled:text-slate-400"
            >
              <span>{isSubmitting ? '로그인 중' : '로그인'}</span>
              <ArrowRight size={17} aria-hidden="true" />
            </button>

            {status ? (
              <div className="mt-4 flex items-start gap-2 border border-emerald-500/40 bg-emerald-500/10 px-3 py-3 text-sm text-emerald-100">
                <CheckCircle2 className="mt-0.5 shrink-0" size={17} aria-hidden="true" />
                <span>{status}</span>
              </div>
            ) : null}

            {error || isConfigMissing ? (
              <div className="mt-4 border border-red-500/40 bg-red-500/10 px-3 py-3 text-sm text-red-100">
                {error || 'Supabase Auth 환경변수가 설정되어 있지 않습니다.'}
              </div>
            ) : null}
          </form>
        </section>
      </div>
    </main>
  );
}
