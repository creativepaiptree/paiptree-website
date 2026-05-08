import { promises as fs } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { ROOT_DIR, parseFrontmatter, toPosix } from './docs-utils.mjs';

const EXCLUDED_DIRS = new Set(['.company-feed', '.git', '.next', 'node_modules', 'out']);
const DEFAULT_OUT_DIR = '.company-feed/company-docs';
const REQUIRED_META_KEYS = ['title', 'author', 'last_updated'];
const ALLOWED_FEED_STATUSES = new Set([
  'active',
  'needs-review',
  'archive',
  'external-context',
  'generated',
  'template',
]);

const PLACEHOLDER_PATTERNS = [
  /이 페이지의 목적과 대상 사용자를 2~3줄로 작성한다/u,
  /^- 상단:\s*$/mu,
  /^- 본문:\s*$/mu,
  /^- 하단:\s*$/mu,
  /^- 주요 사용자 액션:\s*$/mu,
  /^- 라우팅\/네비게이션:\s*$/mu,
  /^- 예외 동작:\s*$/mu,
  /^- 주요 데이터 소스:\s*$/mu,
  /^- 클라이언트 상태:\s*$/mu,
  /^- 서버\/정적 의존성:\s*$/mu,
];

const parseArgs = (argv) => {
  const options = {
    outDir: DEFAULT_OUT_DIR,
    obsidian: false,
    includeArchive: true,
    includeContent: true,
    service: '',
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--out' || arg === '--vault') {
      options.outDir = argv[index + 1] || options.outDir;
      index += 1;
      if (arg === '--vault') options.obsidian = true;
      continue;
    }
    if (arg === '--obsidian') {
      options.obsidian = true;
      continue;
    }
    if (arg === '--no-archive') {
      options.includeArchive = false;
      continue;
    }
    if (arg === '--metadata-only') {
      options.includeContent = false;
      continue;
    }
    if (arg === '--service') {
      options.service = argv[index + 1] || '';
      index += 1;
    }
  }

  return options;
};

const collectMarkdownFiles = async (dirPath) => {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      if (EXCLUDED_DIRS.has(entry.name)) return [];
      const absPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) return collectMarkdownFiles(absPath);
      if (entry.isFile() && entry.name.endsWith('.md')) return [absPath];
      return [];
    }),
  );
  return nested.flat();
};

const classifyDoc = (relPath) => {
  if (['AGENT_CORE.md', 'AGENTS.md', 'CLAUDE.md', 'CODEX.md', 'GEMINI.md'].includes(relPath)) return 'agent_rules';
  if (relPath.startsWith('.claude/')) return 'agent_rules';
  if (relPath.startsWith('.hermes/')) return 'agent_plan';
  if (relPath.startsWith('.kiro/')) return 'agent_spec';
  if (relPath.startsWith('docs/admin/')) return 'generated_admin';
  if (relPath.startsWith('docs/pages/무제 폴더/')) return 'archive_page';
  if (relPath.startsWith('docs/pages/') && relPath.endsWith('.page.md')) return 'page';
  if (relPath.startsWith('docs/pages/')) return 'service_manual_candidate';
  if (relPath.startsWith('docs/plans/')) return 'plan';
  if (relPath.startsWith('docs/standards/')) return 'standard';
  if (relPath.startsWith('docs/guides/old/')) return 'archive_guide';
  if (relPath.startsWith('docs/guides/')) return 'guide';
  if (relPath.startsWith('docs/old/')) return 'archive_legacy';
  if (relPath === 'docs/decisions/_adr-template.md') return 'template';
  if (relPath.startsWith('docs/decisions/')) return 'decision';
  if (relPath.startsWith('docs/templates/')) return 'template';
  if (relPath.startsWith('public/')) return 'public_note';
  if (!relPath.includes('/')) return 'root_note';
  return 'other';
};

const inferService = (relPath, meta) => {
  if (meta.service) return meta.service;
  const lower = relPath.toLowerCase();
  if (lower.includes('cctvup') || lower.includes('cctv')) return 'cctvup';
  if (lower.includes('cherry_tms') || lower.includes('cherry-tms') || lower.includes('cherrybro')) return 'cherry-tms';
  if (lower.includes('git')) return 'git-reports';
  if (lower.includes('poc')) return 'poc';
  if (lower.includes('dash')) return 'dashboard';
  if (lower.includes('i18n')) return 'i18n';
  if (lower.includes('about') || lower.includes('marketing') || lower.includes('main') || lower.includes('m.page')) return 'marketing';
  return '';
};

const inferStatus = (relPath, type, meta, placeholderCount) => {
  if (type === 'template') return 'template';
  if (meta.status && ALLOWED_FEED_STATUSES.has(meta.status)) return meta.status;
  if (meta.status === 'accepted' && type === 'decision') return 'active';
  if (meta.status === 'draft') return 'needs-review';
  if (type.startsWith('archive_')) return 'archive';
  if (type === 'generated_admin') return 'generated';
  if (type === 'agent_plan' || type === 'agent_spec') return 'external-context';
  if (placeholderCount > 0) return 'needs-review';
  if (type === 'page' || type === 'guide' || type === 'plan' || type === 'decision' || type === 'service_manual_candidate' || type === 'standard') return 'active';
  if (!relPath.includes('/')) return 'needs-review';
  return 'needs-review';
};

const inferPriority = (type, status, relPath) => {
  if (status === 'active' && relPath.includes('cctvup')) return 'p0';
  if (status === 'active' && (type === 'service_manual_candidate' || type === 'page' || type === 'guide' || type === 'standard')) return 'p1';
  if (status === 'needs-review') return 'p2';
  if (status === 'external-context') return 'p3';
  if (status === 'archive') return 'p4';
  return 'p3';
};

const slugifyPath = (relPath) => relPath
  .replace(/\.md$/u, '')
  .replace(/[^A-Za-z0-9가-힣._-]+/gu, '-')
  .replace(/-+/g, '-')
  .replace(/^-|-$/g, '');

const toYamlScalar = (value) => {
  if (value === undefined || value === null || value === '') return '""';
  return JSON.stringify(String(value));
};

const buildObsidianNote = (doc) => {
  const aliases = [doc.title].filter(Boolean);
  return `---
title: ${toYamlScalar(doc.title || doc.relPath)}
note_type: repo-doc
repo_name: paiptree-website
source_path: ${toYamlScalar(doc.relPath)}
doc_type: ${toYamlScalar(doc.type)}
status: ${toYamlScalar(doc.status)}
service: ${toYamlScalar(doc.service)}
priority: ${toYamlScalar(doc.priority)}
last_updated: ${toYamlScalar(doc.lastUpdated)}
content_sha256: ${toYamlScalar(doc.sha256)}
aliases: [${aliases.map(toYamlScalar).join(', ')}]
---

# ${doc.title || doc.relPath}

## Agent Summary
- Source: \`${doc.relPath}\`
- Type: \`${doc.type}\`
- Status: \`${doc.status}\`
- Service: \`${doc.service || '-'}\`
- Priority: \`${doc.priority}\`
- Placeholder count: \`${doc.placeholderCount}\`

## Original Content
${doc.content}
`;
};

const buildBrief = (docs, options) => {
  const counts = docs.reduce((acc, doc) => {
    acc[doc.status] = (acc[doc.status] ?? 0) + 1;
    return acc;
  }, {});
  const byService = docs.reduce((acc, doc) => {
    const key = doc.service || '(none)';
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  const priorityDocs = docs
    .filter((doc) => doc.priority === 'p0' || doc.priority === 'p1')
    .slice(0, 40)
    .map((doc) => `- [${doc.status}] [${doc.type}] ${doc.relPath}${doc.service ? ` (${doc.service})` : ''}`)
    .join('\n');

  return `# Paiptree Docs Company Feed

Generated at: ${new Date().toISOString()}

## Purpose
이 묶음은 Company 에이전트나 Obsidian vault가 현재 repo 문서 체계를 이해하도록 먹이는 export다.

## Export Options
- outDir: ${options.outDir}
- obsidian: ${options.obsidian}
- includeArchive: ${options.includeArchive}
- includeContent: ${options.includeContent}
- service filter: ${options.service || '(none)'}

## Totals
- docs: ${docs.length}
- status counts: ${JSON.stringify(counts)}
- service counts: ${JSON.stringify(byService)}

## Reading Rule For Company Agent
1. \`status=active\` 문서를 현재 기준으로 본다.
2. \`status=needs-review\` 문서는 코드와 대조 전까지 확정 기준으로 쓰지 않는다.
3. \`status=archive\` 문서는 이력으로만 본다.
4. \`status=external-context\` 문서는 Hermes/Kiro/agent 맥락이므로 repo 실행 기준보다 낮은 우선순위로 본다.
5. CCTVUP 작업은 \`service=cctvup\` 문서를 먼저 읽는다.

## Priority Docs
${priorityDocs || '- (none)'}
`;
};

const readDoc = async (absPath) => {
  const relPath = toPosix(path.relative(ROOT_DIR, absPath));
  const raw = await fs.readFile(absPath, 'utf8');
  const parsed = parseFrontmatter(raw);
  const type = classifyDoc(relPath);
  const placeholderCount = PLACEHOLDER_PATTERNS.filter((pattern) => pattern.test(parsed.body)).length;
  const service = inferService(relPath, parsed.meta);
  const status = inferStatus(relPath, type, parsed.meta, placeholderCount);
  const sha256 = crypto.createHash('sha256').update(raw).digest('hex');
  const hasRequiredMeta = REQUIRED_META_KEYS.every((key) => Boolean(parsed.meta[key]));

  return {
    id: slugifyPath(relPath),
    relPath,
    absPath,
    title: parsed.meta.title || relPath,
    author: parsed.meta.author || '',
    lastUpdated: parsed.meta.last_updated || '',
    type,
    status,
    originalStatus: parsed.meta.status || '',
    service,
    priority: inferPriority(type, status, relPath),
    hasRequiredMeta,
    placeholderCount,
    charCount: raw.length,
    sha256,
    content: parsed.body.trim(),
  };
};

const writeJsonl = async (filePath, docs, includeContent) => {
  const lines = docs.map((doc) => JSON.stringify({
    id: doc.id,
    source_path: doc.relPath,
    title: doc.title,
    doc_type: doc.type,
    status: doc.status,
    original_status: doc.originalStatus,
    service: doc.service,
    priority: doc.priority,
    last_updated: doc.lastUpdated,
    content_sha256: doc.sha256,
    placeholder_count: doc.placeholderCount,
    has_required_meta: doc.hasRequiredMeta,
    content: includeContent ? doc.content : undefined,
  }));
  await fs.writeFile(filePath, `${lines.join('\n')}\n`, 'utf8');
};

const run = async () => {
  const options = parseArgs(process.argv.slice(2));
  const outDir = path.resolve(ROOT_DIR, options.outDir);
  const docAbsPaths = (await collectMarkdownFiles(ROOT_DIR)).sort((a, b) => a.localeCompare(b));
  let docs = await Promise.all(docAbsPaths.map(readDoc));

  if (!options.includeArchive) {
    docs = docs.filter((doc) => doc.status !== 'archive');
  }
  if (options.service) {
    docs = docs.filter((doc) => doc.service === options.service);
  }

  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(path.join(outDir, 'manifest.json'), JSON.stringify({
    generatedAt: new Date().toISOString(),
    repo: 'paiptree-website',
    rootDir: ROOT_DIR,
    options,
    totals: {
      docs: docs.length,
      active: docs.filter((doc) => doc.status === 'active').length,
      needsReview: docs.filter((doc) => doc.status === 'needs-review').length,
      archive: docs.filter((doc) => doc.status === 'archive').length,
      externalContext: docs.filter((doc) => doc.status === 'external-context').length,
      generated: docs.filter((doc) => doc.status === 'generated').length,
      template: docs.filter((doc) => doc.status === 'template').length,
    },
    docs: docs.map((doc) => ({
      id: doc.id,
      relPath: doc.relPath,
      title: doc.title,
      type: doc.type,
      status: doc.status,
      originalStatus: doc.originalStatus,
      service: doc.service,
      priority: doc.priority,
      lastUpdated: doc.lastUpdated,
      placeholderCount: doc.placeholderCount,
      hasRequiredMeta: doc.hasRequiredMeta,
      charCount: doc.charCount,
      sha256: doc.sha256,
    })),
  }, null, 2), 'utf8');

  await writeJsonl(path.join(outDir, 'company-agent-feed.jsonl'), docs, options.includeContent);
  await fs.writeFile(path.join(outDir, 'company-agent-brief.md'), buildBrief(docs, options), 'utf8');

  if (options.obsidian) {
    const notesDir = path.join(outDir, 'obsidian-notes');
    await fs.mkdir(notesDir, { recursive: true });
    await Promise.all(docs.map(async (doc) => {
      const noteName = `${doc.id}.md`;
      await fs.writeFile(path.join(notesDir, noteName), buildObsidianNote(doc), 'utf8');
    }));
  }

  console.log(JSON.stringify({
    ok: true,
    outDir,
    docs: docs.length,
    files: [
      path.join(outDir, 'manifest.json'),
      path.join(outDir, 'company-agent-feed.jsonl'),
      path.join(outDir, 'company-agent-brief.md'),
      ...(options.obsidian ? [path.join(outDir, 'obsidian-notes')] : []),
    ],
  }, null, 2));
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
