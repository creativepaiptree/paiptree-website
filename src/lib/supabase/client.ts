'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

let browserClient: SupabaseClient | null = null;

function getSupabaseBrowserConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()
    || process.env.NEXT_PUBLIC_SUPABASE_KEY?.trim();

  if (!url || !publishableKey) return null;

  return {
    url,
    publishableKey,
  };
}

export function hasSupabaseBrowserConfig() {
  return Boolean(getSupabaseBrowserConfig());
}

export function createSupabaseBrowserClient() {
  const config = getSupabaseBrowserConfig();
  if (!config) {
    throw new Error('Supabase Auth 환경변수가 설정되어 있지 않습니다.');
  }

  if (!browserClient) {
    browserClient = createBrowserClient(config.url, config.publishableKey);
  }

  return browserClient;
}
