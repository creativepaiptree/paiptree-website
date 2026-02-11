import { promises as fs } from 'node:fs';
import path from 'node:path';

export const ROOT_DIR = process.cwd();
export const APP_DIR = path.join(ROOT_DIR, 'src', 'app');
export const DOCS_DIR = path.join(ROOT_DIR, 'docs');
export const DOCS_PAGES_DIR = path.join(DOCS_DIR, 'pages');
export const DOCS_ADMIN_DIR = path.join(DOCS_DIR, 'admin');

const normalizeRouteValue = (route) => {
  if (!route || route === '/') {
    return '/';
  }

  const withLeadingSlash = route.startsWith('/') ? route : `/${route}`;
  return withLeadingSlash.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
};

export const normalizeRoute = (route) => normalizeRouteValue(route.trim());

export const formatYYMMDD = (date = new Date()) => {
  const yy = String(date.getFullYear() % 100).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yy}.${mm}.${dd}`;
};

export const toPosix = (value) => value.split(path.sep).join('/');

export const parseFrontmatter = (content) => {
  if (!content.startsWith('---\n')) {
    return { meta: {}, body: content };
  }

  const endIndex = content.indexOf('\n---\n', 4);
  if (endIndex === -1) {
    return { meta: {}, body: content };
  }

  const rawMeta = content.slice(4, endIndex);
  const body = content.slice(endIndex + 5).replace(/^\n+/, '');
  const meta = {};

  rawMeta.split('\n').forEach((line) => {
    const match = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (!match) {
      return;
    }

    const key = match[1].toLowerCase();
    const value = match[2].trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
    if (value) {
      meta[key] = value;
    }
  });

  return { meta, body };
};

export const collectFiles = async (dirPath, predicate) => {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const absPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        return collectFiles(absPath, predicate);
      }
      if (entry.isFile() && predicate(entry.name, absPath)) {
        return [absPath];
      }
      return [];
    }),
  );
  return nested.flat();
};

export const collectMarkdownDocs = async () => collectFiles(DOCS_DIR, (name) => name.endsWith('.md'));

export const routeToDocSlug = (route) => {
  if (route === '/') {
    return 'home';
  }

  const slug = route
    .slice(1)
    .replace(/\/+/g, '-')
    .replace(/[^\w-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();

  return slug || 'page';
};

export const routeToDocRelativePath = (route) => `docs/pages/${routeToDocSlug(route)}.page.md`;

export const routeToPageRelativePath = (route) => {
  if (route === '/') {
    return 'src/app/page.tsx';
  }
  return `src/app/${route.slice(1)}/page.tsx`;
};

export const buildPageDocTemplate = ({ route, pagePath, docPath, date = formatYYMMDD() }) => {
  const routeLabel = route === '/' ? '홈(/)' : route;
  return `---
title: "${routeLabel} 페이지 운영 문서"
author: ZORO
last_updated: ${date}
---

# ${routeLabel} 페이지 운영 문서

## 1. 문서 정보
- 라우트: \`${route}\`
- 페이지 파일: \`${pagePath}\`
- 문서 파일: \`${docPath}\`

## 2. 목적
- 이 페이지의 목적과 대상 사용자를 2~3줄로 작성한다.

## 3. 화면/기능 구성
- 상단:
- 본문:
- 하단:

## 4. 데이터/상태
- 주요 데이터 소스:
- 클라이언트 상태:
- 서버/정적 의존성:

## 5. 인터랙션 규칙
- 주요 사용자 액션:
- 라우팅/네비게이션:
- 예외 동작:

## 6. QA 체크리스트
- [ ] 핵심 흐름 진입/이탈
- [ ] 데이터 로딩/에러 상태
- [ ] 반응형/접근성 기본 동작
`;
};

const walkRoutes = async (dirPath) => {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const collected = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.')) {
      continue;
    }

    const absPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'api') {
        continue;
      }
      const nested = await walkRoutes(absPath);
      collected.push(...nested);
      continue;
    }

    if (entry.isFile() && entry.name === 'page.tsx') {
      const relPath = toPosix(path.relative(ROOT_DIR, absPath));
      const relFromApp = toPosix(path.relative(APP_DIR, absPath));
      const routeDir = path.dirname(relFromApp);
      const route = routeDir === '.' ? '/' : `/${routeDir}`;
      const normalizedRoute = normalizeRouteValue(route);
      const docRelPath = routeToDocRelativePath(normalizedRoute);

      collected.push({
        route: normalizedRoute,
        pageAbsPath: absPath,
        pageRelPath: relPath,
        docRelPath,
        docAbsPath: path.join(ROOT_DIR, docRelPath),
      });
    }
  }

  return collected;
};

export const collectRoutePages = async () => {
  const routes = await walkRoutes(APP_DIR);
  routes.sort((a, b) => a.route.localeCompare(b.route));
  return routes;
};

export const resolveMarkdownLinkPath = (docAbsPath, rawLink) => {
  const [withoutHash] = rawLink.split('#');
  const [withoutQuery] = withoutHash.split('?');
  if (!withoutQuery) {
    return null;
  }

  if (/^(https?:|mailto:|tel:)/i.test(withoutQuery)) {
    return null;
  }

  if (withoutQuery.startsWith('/')) {
    return path.join(ROOT_DIR, withoutQuery.slice(1));
  }

  return path.resolve(path.dirname(docAbsPath), withoutQuery);
};

export const extractMarkdownLinks = (content) => {
  const links = [];
  const pattern = /\[[^\]]*]\(([^)]+)\)/g;
  let match = pattern.exec(content);

  while (match) {
    links.push(match[1].trim());
    match = pattern.exec(content);
  }

  return links;
};
