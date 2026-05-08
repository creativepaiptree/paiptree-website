import { createCipheriv, randomBytes, scryptSync } from 'node:crypto';
import { chmodSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const DEFAULT_SENSITIVE_ROOT = '../../company-ops/.hermes-sensitive/farm-ops/reports';
const PASSPHRASE_ENV = 'PAIPTREE_SENSITIVE_EXPORT_PASSPHRASE';
const MIN_PASSPHRASE_LENGTH = 16;

export function getSensitiveReportDir() {
  return resolve(process.env.PAIPTREE_SENSITIVE_REPORT_DIR || process.env.CCTVUP_SENSITIVE_REPORT_DIR || DEFAULT_SENSITIVE_ROOT);
}

function getPassphrase() {
  const passphrase = process.env[PASSPHRASE_ENV];
  if (!passphrase || passphrase.length < MIN_PASSPHRASE_LENGTH) {
    throw new Error(
      [
        '민감 리포트는 plaintext로 저장할 수 없습니다.',
        `${PASSPHRASE_ENV}에 ${MIN_PASSPHRASE_LENGTH}자 이상의 일회성/로컬 보관용 passphrase를 넣고 다시 실행하세요.`,
        'passphrase는 repo, .env, Company feed, shell history에 남기지 않는 것을 원칙으로 합니다.',
      ].join(' '),
    );
  }
  return passphrase;
}

function encryptPayload(payload, passphrase) {
  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const key = scryptSync(passphrase, salt, 32);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([
    cipher.update(Buffer.from(JSON.stringify(payload), 'utf8')),
    cipher.final(),
  ]);

  return {
    version: 1,
    kind: 'paiptree-sensitive-bundle',
    encryptedAt: new Date().toISOString(),
    algorithm: 'aes-256-gcm',
    kdf: 'scrypt',
    salt: salt.toString('base64'),
    iv: iv.toString('base64'),
    authTag: cipher.getAuthTag().toString('base64'),
    payload: encrypted.toString('base64'),
  };
}

export function writeSensitiveBundle({ bundleName, files, metadata = {} }) {
  const passphrase = getPassphrase();
  const outputDir = getSensitiveReportDir();
  mkdirSync(outputDir, { recursive: true, mode: 0o700 });

  const bundlePath = join(outputDir, `${bundleName}.sensitive.json`);
  const payload = {
    metadata,
    files: files.map((file) => ({
      name: file.name,
      contentType: file.contentType || 'text/plain; charset=utf-8',
      content: String(file.content ?? ''),
    })),
  };

  writeFileSync(bundlePath, `${JSON.stringify(encryptPayload(payload, passphrase), null, 2)}\n`, {
    encoding: 'utf8',
    mode: 0o600,
  });
  chmodSync(bundlePath, 0o600);

  return { bundlePath, outputDir, fileCount: files.length };
}
