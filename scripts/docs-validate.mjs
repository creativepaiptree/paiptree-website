import { promises as fs } from 'node:fs';
import path from 'node:path';
import {
  ROOT_DIR,
  collectMarkdownDocs,
  collectRoutePages,
  extractMarkdownLinks,
  parseFrontmatter,
  resolveMarkdownLinkPath,
  routeToDocRelativePath,
  toPosix,
} from './docs-utils.mjs';

const DATE_PATTERN = /^\d{2}\.\d{2}\.\d{2}$/;
const REQUIRED_FRONTMATTER_KEYS = ['title', 'author', 'last_updated'];

const errors = [];
const warnings = [];

const addError = (message) => errors.push(message);
const addWarning = (message) => warnings.push(message);

const validateFrontmatter = (docRelPath, meta, hasFrontmatter) => {
  if (!hasFrontmatter) {
    addError(`${docRelPath}: frontmatter 누락`);
    return;
  }

  REQUIRED_FRONTMATTER_KEYS.forEach((key) => {
    if (!meta[key]) {
      addError(`${docRelPath}: frontmatter 필수 키 누락 (${key})`);
    }
  });

  const allowsTemplateDatePlaceholder =
    docRelPath.startsWith('docs/templates/') && meta.last_updated === 'YY.MM.DD';

  if (meta.last_updated && !DATE_PATTERN.test(meta.last_updated) && !allowsTemplateDatePlaceholder) {
    addError(`${docRelPath}: last_updated 형식 오류 (${meta.last_updated})`);
  }
};

const validateHeadings = (docRelPath, content) => {
  const headings = content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^#{1,6}\s+/.test(line))
    .map((line) => line.match(/^#{1,6}/)?.[0].length ?? 1);

  for (let i = 1; i < headings.length; i += 1) {
    if (headings[i] > headings[i - 1] + 1) {
      addWarning(`${docRelPath}: 헤더 단계 점프(h${headings[i - 1]} -> h${headings[i]})`);
      break;
    }
  }
};

const validateCodeFenceLanguage = (docRelPath, content) => {
  const lines = content.split('\n');
  for (const line of lines) {
    if (line.startsWith('```') && line.trim() === '```') {
      addWarning(`${docRelPath}: 언어 태그 없는 코드 블록 발견`);
      return;
    }
  }
};

const validateLinks = async (docAbsPath, content) => {
  const docRelPath = toPosix(path.relative(ROOT_DIR, docAbsPath));
  const links = extractMarkdownLinks(content);
  for (const link of links) {
    if (!link || link.startsWith('#')) {
      continue;
    }

    const resolved = resolveMarkdownLinkPath(docAbsPath, link);
    if (!resolved) {
      continue;
    }

    try {
      await fs.access(resolved);
      continue;
    } catch {
      // try .md fallback
    }

    if (!path.extname(resolved)) {
      try {
        await fs.access(`${resolved}.md`);
        continue;
      } catch {
        // noop
      }
    }

    addError(`${docRelPath}: 깨진 링크 (${link})`);
  }
};

const validateRouteCoverage = async () => {
  const routes = await collectRoutePages();
  await Promise.all(
    routes.map(async (routeInfo) => {
      const docRelPath = routeToDocRelativePath(routeInfo.route);
      const docAbsPath = path.join(ROOT_DIR, docRelPath);
      try {
        await fs.access(docAbsPath);
        const [pageStat, docStat] = await Promise.all([
          fs.stat(routeInfo.pageAbsPath),
          fs.stat(docAbsPath),
        ]);
        if (docStat.mtimeMs + 1 < pageStat.mtimeMs) {
          addWarning(`${docRelPath}: 페이지 변경 대비 문서 업데이트 필요 (${routeInfo.pageRelPath})`);
        }
      } catch {
        addError(`${routeInfo.pageRelPath}: 대응 페이지 문서 누락 (${docRelPath})`);
      }
    }),
  );
};

const run = async () => {
  const markdownDocs = await collectMarkdownDocs();
  const titleSet = new Set();

  for (const docAbsPath of markdownDocs) {
    const docRelPath = toPosix(path.relative(ROOT_DIR, docAbsPath));
    const content = await fs.readFile(docAbsPath, 'utf8');
    const parsed = parseFrontmatter(content);
    const hasFrontmatter = content.startsWith('---\n') && content.indexOf('\n---\n', 4) !== -1;

    validateFrontmatter(docRelPath, parsed.meta, hasFrontmatter);
    validateHeadings(docRelPath, parsed.body);
    validateCodeFenceLanguage(docRelPath, parsed.body);
    await validateLinks(docAbsPath, parsed.body);

    const title = parsed.meta.title?.trim();
    if (title) {
      if (titleSet.has(title)) {
        addWarning(`${docRelPath}: 중복 title 감지 (${title})`);
      } else {
        titleSet.add(title);
      }
    }
  }

  await validateRouteCoverage();

  console.log('📊 문서 유효성 검사 결과');
  console.log(`총 문서: ${markdownDocs.length}`);
  console.log(`✅ 통과: ${Math.max(markdownDocs.length - errors.length, 0)}`);
  console.log(`⚠️ 경고: ${warnings.length}`);
  console.log(`❌ 실패: ${errors.length}`);

  if (errors.length > 0) {
    console.log('\n에러:');
    errors.forEach((message) => console.log(`- ${message}`));
  }

  if (warnings.length > 0) {
    console.log('\n경고:');
    warnings.forEach((message) => console.log(`- ${message}`));
  }

  if (errors.length > 0) {
    process.exit(1);
  }
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
