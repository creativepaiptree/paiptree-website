import { NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import path from 'node:path';

type DevDoc = {
  id: string;
  title: string;
  path: string;
  absolutePath: string;
  editorUri: string;
  updatedAt: string;
  author: string;
  preview: string;
  content: string;
};

const DOCS_DIR = path.join(process.cwd(), 'docs');
const DOC_EDITOR_URI_PREFIX = process.env.DEV_DOC_EDITOR_URI_PREFIX?.trim() || 'vscode://file';

const buildEditorUri = (absolutePath: string) => {
  const normalizedPath = absolutePath.split(path.sep).join('/');
  return `${DOC_EDITOR_URI_PREFIX}${encodeURI(normalizedPath)}`;
};

const formatDate = (date: Date) => {
  const yy = String(date.getFullYear() % 100).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yy}.${mm}.${dd}`;
};

const extractTitle = (content: string, fallback: string) => {
  const firstHeading = content
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line.startsWith('# '));
  return firstHeading ? firstHeading.replace(/^#\s+/, '') : fallback;
};

const extractPreview = (content: string) => {
  const compact = content
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/`/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return compact.slice(0, 140);
};

const normalizeDate = (value: string): string | null => {
  const raw = value.trim();
  const parts = raw.split(/[./-]/).filter(Boolean);
  if (parts.length !== 3 || parts.some((part) => !/^\d+$/.test(part))) {
    return null;
  }

  const [yearPart, monthPart, dayPart] = parts;
  const fullYear = yearPart.length === 4 ? Number(yearPart) : 2000 + Number(yearPart);
  const year2 = fullYear % 100;
  const month = Number(monthPart);
  const day = Number(dayPart);

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  const date = new Date(Date.UTC(fullYear, month - 1, day));
  if (
    date.getUTCFullYear() !== fullYear ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return `${String(year2).padStart(2, '0')}.${String(month).padStart(2, '0')}.${String(day).padStart(2, '0')}`;
};

const parseFrontmatter = (content: string): { meta: Record<string, string>; body: string } => {
  if (!content.startsWith('---\n')) {
    return { meta: {}, body: content };
  }

  const endIndex = content.indexOf('\n---\n', 4);
  if (endIndex === -1) {
    return { meta: {}, body: content };
  }

  const frontmatter = content.slice(4, endIndex);
  const body = content.slice(endIndex + 5);
  const meta: Record<string, string> = {};

  frontmatter.split('\n').forEach((line) => {
    const match = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (!match) {
      return;
    }
    const key = match[1].toLowerCase();
    const value = match[2].trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
    if (value.length > 0) {
      meta[key] = value;
    }
  });

  return { meta, body: body.replace(/^\n+/, '') };
};

const dateToSortableNumber = (value: string | null): number => {
  if (!value) {
    return Number.NEGATIVE_INFINITY;
  }

  const [yy, mm, dd] = value.split('.').map(Number);
  if ([yy, mm, dd].some(Number.isNaN)) {
    return Number.NEGATIVE_INFINITY;
  }

  const fullYear = yy < 100 ? 2000 + yy : yy;
  const date = new Date(Date.UTC(fullYear, mm - 1, dd));
  if (
    date.getUTCFullYear() !== fullYear ||
    date.getUTCMonth() !== mm - 1 ||
    date.getUTCDate() !== dd
  ) {
    return Number.NEGATIVE_INFINITY;
  }

  return date.getTime();
};

const collectMarkdownFiles = async (dir: string): Promise<string[]> => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return collectMarkdownFiles(fullPath);
      }
      if (entry.isFile() && entry.name.endsWith('.md')) {
        return [fullPath];
      }
      return [];
    }),
  );

  return files.flat();
};

export async function GET() {
  try {
    const markdownFiles = await collectMarkdownFiles(DOCS_DIR);

    const docs: DevDoc[] = await Promise.all(
      markdownFiles.map(async (absPath) => {
        const relativePath = path.relative(process.cwd(), absPath).split(path.sep).join('/');
        const fileName = path.basename(absPath);
        const [stat, rawContent] = await Promise.all([fs.stat(absPath), fs.readFile(absPath, 'utf-8')]);
        const { meta, body } = parseFrontmatter(rawContent);
        const updatedAtFromMeta = meta.last_updated ? normalizeDate(meta.last_updated) : null;
        const updatedAt = updatedAtFromMeta ?? formatDate(stat.mtime);
        const author = meta.author?.trim() || 'ZORO';

        return {
          id: relativePath,
          title: meta.title?.trim() || extractTitle(body, fileName),
          path: relativePath,
          absolutePath: absPath,
          editorUri: buildEditorUri(absPath),
          updatedAt,
          author,
          preview: extractPreview(body),
          content: body,
        };
      }),
    );

    docs.sort((a, b) => {
      const aDate = dateToSortableNumber(a.updatedAt);
      const bDate = dateToSortableNumber(b.updatedAt);
      if (aDate !== bDate) {
        return bDate - aDate;
      }
      return a.path.localeCompare(b.path);
    });

    return NextResponse.json(
      { docs },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        docs: [],
        error: 'Failed to load development documents.',
      },
      {
        status: 500,
      },
    );
  }
}
