import { promises as fs } from 'node:fs';
import path from 'node:path';
import {
  ROOT_DIR,
  formatYYMMDD,
  normalizeRoute,
  routeToDocRelativePath,
  routeToPageRelativePath,
  buildPageDocTemplate,
} from './docs-utils.mjs';

const routeArg = process.argv[2];

if (!routeArg) {
  console.error('사용법: node scripts/docs-scaffold-page.mjs <route>');
  console.error('예시: node scripts/docs-scaffold-page.mjs /about');
  process.exit(1);
}

const route = normalizeRoute(routeArg);
const docRelPath = routeToDocRelativePath(route);
const pageRelPath = routeToPageRelativePath(route);
const docAbsPath = path.join(ROOT_DIR, docRelPath);
const pageAbsPath = path.join(ROOT_DIR, pageRelPath);

const run = async () => {
  try {
    await fs.access(docAbsPath);
    console.log(`이미 존재함: ${docRelPath}`);
    return;
  } catch {
    // noop
  }

  let pageExists = false;
  try {
    await fs.access(pageAbsPath);
    pageExists = true;
  } catch {
    pageExists = false;
  }

  const content = buildPageDocTemplate({
    route,
    pagePath: pageRelPath,
    docPath: docRelPath,
    date: formatYYMMDD(),
  });

  await fs.mkdir(path.dirname(docAbsPath), { recursive: true });
  await fs.writeFile(docAbsPath, content, 'utf8');
  console.log(`생성 완료: ${docRelPath}`);

  if (!pageExists) {
    console.warn(`주의: 대응 페이지 파일이 없습니다 (${pageRelPath})`);
  }
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
