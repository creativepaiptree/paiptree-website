#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildKstReportDateFromNow } from '../src/lib/cctvup-daily-report.js';

const DEFAULT_BASE_URL = 'http://localhost:3002';

function loadEnvFile(fileName) {
  const filePath = resolve(process.cwd(), fileName);
  if (!existsSync(filePath)) return;

  for (const line of readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match || process.env[match[1]]) continue;

    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[match[1]] = value;
  }
}

function parseArgs(argv) {
  const result = {
    date: '',
    baseUrl: process.env.CCTVUP_DAILY_REPORT_BASE_URL || DEFAULT_BASE_URL,
    yesterday: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--date') {
      result.date = argv[index + 1] || '';
      index += 1;
    } else if (arg.startsWith('--date=')) {
      result.date = arg.slice('--date='.length);
    } else if (arg === '--yesterday') {
      result.yesterday = true;
    } else if (arg === '--base-url') {
      result.baseUrl = argv[index + 1] || result.baseUrl;
      index += 1;
    } else if (arg.startsWith('--base-url=')) {
      result.baseUrl = arg.slice('--base-url='.length);
    }
  }
  return result;
}

async function readJsonResponse(response) {
  const text = await response.text();
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    throw new Error(`JSON 대신 ${contentType || '알 수 없는 형식'} 응답을 받았습니다: ${text.slice(0, 160)}`);
  }
  const payload = text ? JSON.parse(text) : {};
  if (!response.ok || payload.ok === false) {
    throw new Error(payload.message || `일일 브리핑 생성 실패: ${response.status}`);
  }
  return payload;
}

loadEnvFile('.env.local');
loadEnvFile('.env');

const options = parseArgs(process.argv.slice(2));
const reportDate = options.date || (options.yesterday ? buildKstReportDateFromNow(new Date(), -1) : '');
const secret = process.env.CCTVUP_CRON_TRIGGER_SECRET?.trim();
if (!secret) {
  console.error('CCTVUP_CRON_TRIGGER_SECRET 설정이 필요합니다.');
  process.exit(1);
}

const baseUrl = options.baseUrl.replace(/\/+$/, '');
const response = await fetch(`${baseUrl}/api/cctvup/daily-reports/generate/`, {
  method: 'POST',
  cache: 'no-store',
  headers: {
    'Content-Type': 'application/json',
    'x-cctvup-cron-secret': secret,
  },
  body: JSON.stringify({
    date: reportDate || undefined,
  }),
});

const payload = await readJsonResponse(response);
console.log([
  `CCTVUP daily report generated: ${payload.date}`,
  `markdown=${payload.paths?.markdownPath || '-'}`,
  `raw=${payload.paths?.rawPath || '-'}`,
  `issue=${payload.summary?.issueEventCount ?? 0}`,
  `scope=${payload.summary?.farmScopeEventCount ?? 0}`,
  `active=${payload.summary?.activeIssueCount ?? 0}`,
].join(' · '));
