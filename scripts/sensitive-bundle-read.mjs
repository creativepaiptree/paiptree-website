#!/usr/bin/env node

import { createDecipheriv, scryptSync } from 'node:crypto';
import { readFileSync } from 'node:fs';

const PASSPHRASE_ENV = 'PAIPTREE_SENSITIVE_EXPORT_PASSPHRASE';
const APPROVAL_ENV = 'PAIPTREE_SENSITIVE_READ_APPROVED';
const APPROVAL_VALUE = 'I_ACCEPT_LOCAL_SENSITIVE_READ';

function usage() {
  return [
    '사용법:',
    `  read -s ${PASSPHRASE_ENV}`,
    `  export ${PASSPHRASE_ENV}`,
    `  ${APPROVAL_ENV}=${APPROVAL_VALUE} node scripts/sensitive-bundle-read.mjs <bundle.sensitive.json> --list`,
    `  ${APPROVAL_ENV}=${APPROVAL_VALUE} node scripts/sensitive-bundle-read.mjs <bundle.sensitive.json> --print <file-name>`,
    `  unset ${PASSPHRASE_ENV}`,
  ].join('\n');
}

function assertApproved() {
  if (process.env[APPROVAL_ENV] !== APPROVAL_VALUE) {
    throw new Error(
      [
        '민감 암호화 bundle 열람은 기본 차단입니다.',
        '열람하면 원본 운영정보/개인정보/접속정보가 복호화될 수 있습니다.',
        'Codex는 이 명령을 실행하기 전에 사용자에게 경고하고 명시 승인을 받아야 합니다.',
        usage(),
      ].join('\n'),
    );
  }
}

function decryptBundle(bundlePath) {
  const passphrase = process.env[PASSPHRASE_ENV];
  if (!passphrase) {
    throw new Error(`${PASSPHRASE_ENV}가 필요합니다.\n${usage()}`);
  }

  const bundle = JSON.parse(readFileSync(bundlePath, 'utf8'));
  if (bundle.kind !== 'paiptree-sensitive-bundle' || bundle.algorithm !== 'aes-256-gcm' || bundle.kdf !== 'scrypt') {
    throw new Error('지원하지 않는 sensitive bundle 형식입니다.');
  }

  const key = scryptSync(passphrase, Buffer.from(bundle.salt, 'base64'), 32);
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(bundle.iv, 'base64'));
  decipher.setAuthTag(Buffer.from(bundle.authTag, 'base64'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(bundle.payload, 'base64')),
    decipher.final(),
  ]);
  return JSON.parse(decrypted.toString('utf8'));
}

const [bundlePath, command, fileName] = process.argv.slice(2);
if (!bundlePath || !command || !['--list', '--print'].includes(command)) {
  throw new Error(usage());
}

assertApproved();
const payload = decryptBundle(bundlePath);

if (command === '--list') {
  console.log(JSON.stringify({
    metadata: payload.metadata,
    files: payload.files.map((file) => ({
      name: file.name,
      contentType: file.contentType,
      bytes: Buffer.byteLength(file.content, 'utf8'),
    })),
  }, null, 2));
} else {
  const file = payload.files.find((entry) => entry.name === fileName);
  if (!file) {
    throw new Error(`bundle 안에서 파일을 찾을 수 없습니다: ${fileName}`);
  }
  process.stdout.write(file.content);
}
