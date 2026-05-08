import { promises as fs } from 'node:fs';
import path from 'node:path';
import {
  ROOT_DIR,
  collectRoutePages,
  extractMarkdownLinks,
  parseFrontmatter,
  resolveMarkdownLinkPath,
  routeToDocRelativePath,
  toPosix,
} from './docs-utils.mjs';

const EXCLUDED_DIRS = new Set(['.git', '.next', 'node_modules', 'out']);
const REQUIRED_FRONTMATTER_KEYS = ['title', 'author', 'last_updated'];

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

const PATH_PREFIXES = [
  '.claude/',
  '.github/',
  '.hermes/',
  '.kiro/',
  'docs/',
  'public/',
  'scripts/',
  'src/',
  'supabase/',
  'tms/',
];

const FILE_EXTENSIONS = [
  '.css',
  '.html',
  '.js',
  '.json',
  '.md',
  '.mjs',
  '.sql',
  '.ts',
  '.tsx',
  '.yml',
  '.yaml',
];

const posixPath = (value) => toPosix(value);

const shouldSkipDir = (dirName) => EXCLUDED_DIRS.has(dirName);

const collectMarkdownFiles = async (dirPath) => {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const absPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        if (shouldSkipDir(entry.name)) return [];
        return collectMarkdownFiles(absPath);
      }
      if (entry.isFile() && entry.name.endsWith('.md')) return [absPath];
      return [];
    }),
  );
  return nested.flat();
};

const classifyDoc = (relPath) => {
  if (['AGENT_CORE.md', 'AGENTS.md', 'CLAUDE.md', 'CODEX.md', 'GEMINI.md'].includes(relPath)) return 'agent_rules';
  if (!relPath.includes('/')) return 'root_misc';
  if (relPath.startsWith('docs/pages/무제 폴더/')) return 'archive_pages_legacy_name';
  if (relPath === 'docs/decisions/_adr-template.md') return 'template';
  if (relPath.startsWith('docs/pages/') && relPath.endsWith('.page.md')) return 'active_page_doc';
  if (relPath.startsWith('docs/pages/')) return 'page_adjacent_service_doc';
  if (relPath.startsWith('docs/plans/')) return 'plan';
  if (relPath.startsWith('docs/standards/')) return 'active_standard';
  if (relPath.startsWith('docs/guides/old/')) return 'archive_guides_old';
  if (relPath.startsWith('docs/guides/')) return 'active_guide';
  if (relPath.startsWith('docs/old/')) return 'archive_old';
  if (relPath.startsWith('docs/templates/')) return 'template';
  if (relPath.startsWith('docs/decisions/')) return 'decision';
  if (relPath.startsWith('docs/admin/')) return 'admin_generated';
  if (relPath.startsWith('.hermes/')) return 'hermes_plan';
  if (relPath.startsWith('.kiro/')) return 'kiro_spec';
  if (relPath.startsWith('.claude/')) return 'claude_rule';
  if (relPath.startsWith('public/')) return 'public_doc';
  return 'other';
};

const isProbablyPath = (value) => {
  const cleaned = value.trim().replace(/^["']|["']$/g, '');
  if (!cleaned || cleaned.includes('*') || cleaned.includes('${') || cleaned.includes(' ')) return false;
  if (cleaned.startsWith('/Users/')) return true;
  if (PATH_PREFIXES.some((prefix) => cleaned.startsWith(prefix))) return true;
  return FILE_EXTENSIONS.some((extension) => cleaned.endsWith(extension)) && cleaned.includes('/');
};

const extractInlineCodePaths = (content) => {
  const paths = [];
  const pattern = /`([^`]+)`/g;
  let match = pattern.exec(content);
  while (match) {
    if (isProbablyPath(match[1])) paths.push(match[1].trim().replace(/^["']|["']$/g, ''));
    match = pattern.exec(content);
  }
  return paths;
};

const normalizeReferencedPath = (docAbsPath, rawPath) => {
  if (/^(https?:|mailto:|tel:|#)/iu.test(rawPath)) return null;
  if (rawPath.startsWith('/Users/')) return rawPath;
  if (rawPath.startsWith('/')) return path.join(ROOT_DIR, rawPath.slice(1));
  if (PATH_PREFIXES.some((prefix) => rawPath.startsWith(prefix))) return path.join(ROOT_DIR, rawPath);
  return path.resolve(path.dirname(docAbsPath), rawPath);
};

const pathExists = async (absPath) => {
  try {
    await fs.access(absPath);
    return true;
  } catch {
    return false;
  }
};

const readDocAudit = async (docAbsPath) => {
  const relPath = posixPath(path.relative(ROOT_DIR, docAbsPath));
  const content = await fs.readFile(docAbsPath, 'utf8');
  const parsed = parseFrontmatter(content);
  const hasFrontmatter = content.startsWith('---\n') && content.indexOf('\n---\n', 4) !== -1;
  const missingFrontmatterKeys = REQUIRED_FRONTMATTER_KEYS.filter((key) => !parsed.meta[key]);
  const placeholderCount = PLACEHOLDER_PATTERNS.filter((pattern) => pattern.test(parsed.body)).length;
  const markdownLinks = extractMarkdownLinks(content);
  const inlineCodePaths = extractInlineCodePaths(content);
  const missingReferences = [];

  const references = [
    ...markdownLinks.map((value) => ({ kind: 'link', value })),
    ...inlineCodePaths.map((value) => ({ kind: 'code', value })),
  ];

  for (const reference of references) {
    if (/^(https?:|mailto:|tel:|#)/iu.test(reference.value)) continue;
    if (reference.value.includes('*') || reference.value.includes('${')) continue;

    const resolved =
      reference.kind === 'link'
        ? resolveMarkdownLinkPath(docAbsPath, reference.value)
        : normalizeReferencedPath(docAbsPath, reference.value);
    if (!resolved) continue;

    const exists = await pathExists(resolved) || (!path.extname(resolved) && await pathExists(`${resolved}.md`));
    if (!exists) {
      missingReferences.push({
        kind: reference.kind,
        value: reference.value,
      });
    }
  }

  return {
    relPath,
    type: classifyDoc(relPath),
    title: parsed.meta.title ?? '',
    status: parsed.meta.status ?? '',
    service: parsed.meta.service ?? '',
    docType: parsed.meta.doc_type ?? '',
    hasFrontmatter,
    missingFrontmatterKeys,
    placeholderCount,
    missingReferences,
  };
};

const run = async () => {
  const docAbsPaths = (await collectMarkdownFiles(ROOT_DIR)).sort((a, b) => a.localeCompare(b));
  const docs = await Promise.all(docAbsPaths.map(readDocAudit));
  const routePages = await collectRoutePages();
  const expectedPageDocs = new Set(routePages.map((route) => routeToDocRelativePath(route.route)));
  const activePageDocs = docs.filter((doc) => doc.type === 'active_page_doc');
  const extraPageDocs = activePageDocs.filter((doc) => !expectedPageDocs.has(doc.relPath));
  const missingPageDocs = [...expectedPageDocs].filter((docRelPath) => !activePageDocs.some((doc) => doc.relPath === docRelPath));
  const countsByType = docs.reduce((acc, doc) => {
    acc[doc.type] = (acc[doc.type] ?? 0) + 1;
    return acc;
  }, {});

  const result = {
    generatedAt: new Date().toISOString(),
    totals: {
      markdownFiles: docs.length,
      routePages: routePages.length,
      activePageDocs: activePageDocs.length,
      missingPageDocs: missingPageDocs.length,
      extraPageDocs: extraPageDocs.length,
      docsWithPlaceholders: docs.filter((doc) => doc.placeholderCount > 0).length,
      docsWithMissingReferences: docs.filter((doc) => doc.missingReferences.length > 0).length,
      docsWithMissingFrontmatter: docs.filter((doc) => !doc.hasFrontmatter || doc.missingFrontmatterKeys.length > 0).length,
    },
    countsByType,
    missingPageDocs,
    extraPageDocs: extraPageDocs.map((doc) => doc.relPath),
    placeholderDocs: docs
      .filter((doc) => doc.placeholderCount > 0)
      .map((doc) => ({ relPath: doc.relPath, type: doc.type, placeholderCount: doc.placeholderCount })),
    missingReferenceDocs: docs
      .filter((doc) => doc.missingReferences.length > 0)
      .map((doc) => ({ relPath: doc.relPath, type: doc.type, missingReferences: doc.missingReferences.slice(0, 12) })),
    missingFrontmatterDocs: docs
      .filter((doc) => !doc.hasFrontmatter || doc.missingFrontmatterKeys.length > 0)
      .map((doc) => ({ relPath: doc.relPath, type: doc.type, hasFrontmatter: doc.hasFrontmatter, missingFrontmatterKeys: doc.missingFrontmatterKeys })),
  };

  console.log(JSON.stringify(result, null, 2));
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
