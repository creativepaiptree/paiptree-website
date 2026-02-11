import { promises as fs } from 'node:fs';
import path from 'node:path';
import {
  ROOT_DIR,
  DOCS_ADMIN_DIR,
  DOCS_DIR,
  collectMarkdownDocs,
  collectRoutePages,
  buildPageDocTemplate,
  formatYYMMDD,
  toPosix,
} from './docs-utils.mjs';

const now = new Date();
const today = formatYYMMDD(now);

const readSafe = async (absPath) => {
  try {
    return await fs.readFile(absPath, 'utf8');
  } catch {
    return null;
  }
};

const writePageDocIfMissing = async (routeInfo) => {
  const existing = await readSafe(routeInfo.docAbsPath);
  if (existing !== null) {
    return false;
  }

  const content = buildPageDocTemplate({
    route: routeInfo.route,
    pagePath: routeInfo.pageRelPath,
    docPath: routeInfo.docRelPath,
    date: today,
  });

  await fs.mkdir(path.dirname(routeInfo.docAbsPath), { recursive: true });
  await fs.writeFile(routeInfo.docAbsPath, content, 'utf8');
  return true;
};

const syncPageDocLastUpdated = async (routeInfo) => {
  const raw = await readSafe(routeInfo.docAbsPath);
  if (raw === null) {
    return false;
  }

  const frontmatterStart = raw.startsWith('---\n');
  const frontmatterEnd = raw.indexOf('\n---\n', 4);
  if (!frontmatterStart || frontmatterEnd === -1) {
    return false;
  }

  const metaBlock = raw.slice(4, frontmatterEnd);
  const bodyBlock = raw.slice(frontmatterEnd + 5);
  const metaLines = metaBlock.split('\n');
  const nextMetaLines = [...metaLines];
  let found = false;

  for (let index = 0; index < nextMetaLines.length; index += 1) {
    if (/^last_updated\s*:/i.test(nextMetaLines[index].trim())) {
      nextMetaLines[index] = `last_updated: ${today}`;
      found = true;
      break;
    }
  }

  if (!found) {
    nextMetaLines.push(`last_updated: ${today}`);
  }

  const nextMetaBlock = nextMetaLines.join('\n');
  const nextBodyBlock = bodyBlock.startsWith('\n') ? bodyBlock.slice(1) : bodyBlock;
  const nextRaw = `---\n${nextMetaBlock}\n---\n${nextBodyBlock}`;
  if (nextRaw !== raw) {
    await fs.writeFile(routeInfo.docAbsPath, nextRaw, 'utf8');
    return true;
  }

  const nowDate = new Date();
  await fs.utimes(routeInfo.docAbsPath, nowDate, nowDate);
  return true;
};

const formatSectionCounts = (docs) => {
  const countBySection = new Map();
  docs.forEach((absPath) => {
    const rel = toPosix(path.relative(ROOT_DIR, absPath));
    const parts = rel.split('/');
    const section = parts.length > 2 ? parts[1] : 'root';
    countBySection.set(section, (countBySection.get(section) ?? 0) + 1);
  });

  return [...countBySection.entries()].sort(([a], [b]) => a.localeCompare(b));
};

const buildAdminReadme = ({ routes, stats, recentDocs }) => {
  const routeRows = routes
    .map((route) => {
      const statusLabel =
        route.status === 'NEW' ? 'NEW' : route.status === 'STALE' ? 'STALE' : route.status;
      return `| \`${route.route}\` | \`${route.pageRelPath}\` | \`${route.docRelPath}\` | ${statusLabel} |`;
    })
    .join('\n');

  const sectionRows = stats.bySection
    .map(([section, count]) => `| ${section} | ${count} |`)
    .join('\n');

  const recentRows = recentDocs
    .map((doc) => `- \`${doc.path}\` (${doc.updatedAt})`)
    .join('\n');

  return `---
title: 문서 운영 허브
author: SYSTEM
last_updated: ${today}
---

# 문서 운영 허브

## 1. 목적
- 전체 페이지 문서화 상태를 한곳에서 확인한다.
- 신규 페이지 추가 시 문서 생성 누락을 방지한다.
- 이 문서는 \`npm run docs:sync\`로 자동 갱신한다.

## 2. 운영 원칙
- 페이지 문서 대상: \`src/app/**/page.tsx\` 전체
- 상단 문서/버전 버튼 노출: \`/PoC\` 상단 UI 전용
- 페이지 문서 위치: \`docs/pages/*.page.md\`
- 레거시 문서 위치: \`docs/old/**/*.md\`

## 3. 요약
- 총 라우트 페이지: **${stats.totalRoutes}**
- 페이지 문서 생성됨: **${stats.okOrNewRoutes}**
- 자동 신규 생성: **${stats.newRoutes}**
- 자동 메타 갱신(SYNCED): **${stats.syncedRoutes}**
- 업데이트 필요(STALE): **${stats.staleRoutes}**
- 전체 문서 수(\`docs/**/*.md\`): **${stats.totalDocs}**

## 4. 페이지-문서 매핑
| Route | Page File | Doc File | Status |
| --- | --- | --- | --- |
${routeRows}

## 5. 문서 디렉토리 통계
| Section | Count |
| --- | --- |
${sectionRows}

## 6. 최근 수정 문서 (상위 10개)
${recentRows || '- (없음)'}
`;
};

const run = async () => {
  const routePages = await collectRoutePages();
  const createdRoutes = new Set();
  const syncedRoutes = new Set();

  for (const routeInfo of routePages) {
    // 신규 페이지 문서가 없으면 템플릿으로 자동 생성
    const created = await writePageDocIfMissing(routeInfo);
    if (created) {
      createdRoutes.add(routeInfo.route);
      continue;
    }

    const [pageStat, docStat] = await Promise.all([
      fs.stat(routeInfo.pageAbsPath),
      fs.stat(routeInfo.docAbsPath).catch(() => null),
    ]);
    const isStale = Boolean(docStat && docStat.mtimeMs + 1 < pageStat.mtimeMs);

    if (isStale) {
      const synced = await syncPageDocLastUpdated(routeInfo);
      if (synced) {
        syncedRoutes.add(routeInfo.route);
      }
    }
  }

  const routesWithStatus = await Promise.all(
    routePages.map(async (routeInfo) => {
      const [pageStat, docStat] = await Promise.all([
        fs.stat(routeInfo.pageAbsPath),
        fs.stat(routeInfo.docAbsPath).catch(() => null),
      ]);

      let status = 'MISSING';
      if (docStat) {
        if (createdRoutes.has(routeInfo.route)) {
          status = 'NEW';
        } else if (syncedRoutes.has(routeInfo.route)) {
          status = 'SYNCED';
        } else {
          status = docStat.mtimeMs + 1 < pageStat.mtimeMs ? 'STALE' : 'OK';
        }
      }

      return {
        ...routeInfo,
        status,
      };
    }),
  );

  const markdownDocs = await collectMarkdownDocs();
  const adminReadmePath = path.join(DOCS_ADMIN_DIR, 'README.md');
  const docsForStats = markdownDocs.includes(adminReadmePath) ? markdownDocs : [...markdownDocs, adminReadmePath];
  const docsWithStats = await Promise.all(
    docsForStats.map(async (absPath) => {
      const stat = await fs.stat(absPath).catch(() => null);
      return {
        path: toPosix(path.relative(ROOT_DIR, absPath)),
        mtimeMs: stat?.mtimeMs ?? now.getTime(),
        updatedAt: formatYYMMDD(stat?.mtime ?? now),
      };
    }),
  );

  docsWithStats.sort((a, b) => b.mtimeMs - a.mtimeMs);

  const stats = {
    totalRoutes: routesWithStatus.length,
    okOrNewRoutes: routesWithStatus.filter((r) => r.status === 'OK' || r.status === 'NEW').length,
    newRoutes: routesWithStatus.filter((r) => r.status === 'NEW').length,
    syncedRoutes: routesWithStatus.filter((r) => r.status === 'SYNCED').length,
    staleRoutes: routesWithStatus.filter((r) => r.status === 'STALE').length,
    totalDocs: docsForStats.length,
    bySection: formatSectionCounts(docsForStats),
  };

  const adminReadme = buildAdminReadme({
    routes: routesWithStatus,
    stats,
    recentDocs: docsWithStats.slice(0, 10),
  });

  await fs.mkdir(DOCS_ADMIN_DIR, { recursive: true });
  await fs.writeFile(adminReadmePath, adminReadme, 'utf8');

  console.log(`sync 완료: ${toPosix(path.relative(ROOT_DIR, adminReadmePath))}`);
  console.log(
    [
      `routes=${stats.totalRoutes}`,
      `ok_or_new=${stats.okOrNewRoutes}`,
      `new=${stats.newRoutes}`,
      `synced=${stats.syncedRoutes}`,
      `stale=${stats.staleRoutes}`,
      `docs=${stats.totalDocs}`,
      `docs_dir=${toPosix(path.relative(ROOT_DIR, DOCS_DIR))}`,
    ].join(' | '),
  );
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
