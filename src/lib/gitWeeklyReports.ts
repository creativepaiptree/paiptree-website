import type {
  GitAuthorSummary,
  GitBeforeAfterRow,
  GitDetailBlock,
  GitReportStage,
  GitWeeklyReportSample,
} from '@/content/gitWeeklyReports';

type GitReportsFetchSource = 'supabase' | 'unavailable';

type GitReportsPayload = {
  reports: GitWeeklyReportSample[];
  meta: {
    source: GitReportsFetchSource;
    total: number;
  };
};

type GitReportBlockRow = {
  id: string;
  report_date: string;
  sort_order: number;
  heading_text: string;
  service_label: string;
  service_name: string;
  authored_time_label: string;
  author_name: string;
  author_email: string | null;
  commit_message_label: string;
  commit_messages: unknown;
  service_description: string;
  before_after_heading: string;
  code_heading: string;
  code_block_language: string;
  code_block_markdown: string;
  context_heading: string;
  context_markdown: string;
  raw_block_markdown: string | null;
  source_markdown_path: string | null;
  meta: unknown;
  created_at: string;
  updated_at: string;
  before_after_rows: unknown;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const stripMarkdown = (value: string) =>
  value
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/^#+\s+/gm, '')
    .replace(/^\s*[-*]\s+/gm, '')
    .replace(/\|/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const formatTimestamp = (value: string | null | undefined) => {
  if (!value) {
    return 'generated_at 미설정';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
};

const normalizeStringArray = (value: unknown) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean);
};

const normalizeBeforeAfterRows = (value: unknown): GitBeforeAfterRow[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item, index) => {
      if (!isRecord(item)) {
        return null;
      }

      const fileLabel = typeof item.file_label === 'string' ? item.file_label.trim() : '';
      const changeSummary = typeof item.change_summary === 'string' ? item.change_summary.trim() : '';
      if (!fileLabel) {
        return null;
      }

      return {
        sortOrder: Number(item.sort_order) || index + 1,
        fileLabel,
        changeSummary,
      } satisfies GitBeforeAfterRow;
    })
    .filter((item): item is GitBeforeAfterRow => item !== null);
};

const normalizeBlockRow = (row: GitReportBlockRow): GitDetailBlock => ({
  id: row.id,
  headingText: row.heading_text,
  serviceLabel: row.service_label,
  serviceName: row.service_name,
  authoredTimeLabel: row.authored_time_label,
  authorName: row.author_name,
  authorEmail: row.author_email,
  commitMessageLabel: row.commit_message_label,
  commitMessages: normalizeStringArray(row.commit_messages),
  serviceDescription: row.service_description,
  beforeAfterHeading: row.before_after_heading,
  beforeAfterRows: normalizeBeforeAfterRows(row.before_after_rows),
  codeHeading: row.code_heading,
  codeBlockLanguage: row.code_block_language,
  codeBlockMarkdown: row.code_block_markdown,
  contextHeading: row.context_heading,
  contextMarkdown: row.context_markdown,
  rawBlockMarkdown: row.raw_block_markdown || '',
});

const buildAuthorsFromBlocks = (blocks: GitDetailBlock[]): GitAuthorSummary[] => {
  const authorMap = new Map<
    string,
    {
      authorName: string;
      authorEmail: string | null;
      commitCount: number;
      repoSet: Set<string>;
      workSet: Set<string>;
    }
  >();

  blocks.forEach((block) => {
    const key = `${block.authorName}::${block.authorEmail ?? ''}`;
    const current = authorMap.get(key) ?? {
      authorName: block.authorName,
      authorEmail: block.authorEmail,
      commitCount: 0,
      repoSet: new Set<string>(),
      workSet: new Set<string>(),
    };

    current.commitCount += Math.max(1, block.commitMessages.length);
    current.repoSet.add(block.serviceLabel);
    if (block.commitMessageLabel) {
      current.workSet.add(block.commitMessageLabel);
    }

    authorMap.set(key, current);
  });

  return Array.from(authorMap.values())
    .map((author) => ({
      authorName: author.authorName,
      authorEmail: author.authorEmail,
      commitCount: author.commitCount,
      repoCount: author.repoSet.size,
      keyWork: Array.from(author.workSet).slice(0, 2).join(' / '),
    }))
    .sort((left, right) => right.commitCount - left.commitCount);
};

const buildStages = (blocks: GitDetailBlock[]): GitReportStage[] => {
  const fileRowCount = blocks.reduce((sum, block) => sum + block.beforeAfterRows.length, 0);

  return [
    { step: 1, message: 'Supabase에서 날짜별 블록 조회 완료' },
    { step: 2, message: `${blocks.length}개 상세 변경 블록 조합 완료` },
    { step: 3, message: `Before / After 파일 행 ${fileRowCount}개 연결 완료` },
  ];
};

const buildOverview = (reportDate: string, blocks: GitDetailBlock[]) => {
  const serviceCount = new Set(blocks.map((block) => block.serviceLabel)).size;
  const authorCount = new Set(blocks.map((block) => block.authorName)).size;
  const leadContext = stripMarkdown(blocks[0]?.contextMarkdown || '').slice(0, 180);

  return `${reportDate} 기준 ${blocks.length}개 상세 블록, ${serviceCount}개 서비스, ${authorCount}명 작업자 변경을 묶은 리포트다.${
    leadContext ? ` ${leadContext}` : ''
  }`;
};

const buildHighlights = (blocks: GitDetailBlock[]) =>
  blocks.slice(0, 4).map((block) => `[${block.serviceName}] ${block.commitMessageLabel}`);

const buildMarkdown = (reportDate: string, blocks: GitDetailBlock[]) => {
  const body = blocks
    .map((block) => block.rawBlockMarkdown)
    .filter(Boolean)
    .join('\n\n---\n\n');

  return `# ${reportDate} 코드 변경 리포트\n\n${body}`.trim();
};

const groupRowsToReports = (rows: GitReportBlockRow[]): GitWeeklyReportSample[] => {
  const grouped = new Map<string, GitReportBlockRow[]>();

  rows.forEach((row) => {
    const dateKey = row.report_date;
    const current = grouped.get(dateKey) ?? [];
    current.push(row);
    grouped.set(dateKey, current);
  });

  return Array.from(grouped.entries())
    .sort((left, right) => right[0].localeCompare(left[0]))
    .map(([reportDate, reportRows]) => {
      const sortedRows = [...reportRows].sort((left, right) => {
        const dateCompare = right.report_date.localeCompare(left.report_date);
        if (dateCompare !== 0) {
          return dateCompare;
        }

        return (left.sort_order || 0) - (right.sort_order || 0);
      });

      const blocks = sortedRows.map((row) => normalizeBlockRow(row));
      const commitCount = blocks.reduce((sum, block) => sum + Math.max(1, block.commitMessages.length), 0);
      const repoCount = new Set(blocks.map((block) => block.serviceLabel)).size;
      const authors = buildAuthorsFromBlocks(blocks);
      const generatedAt = formatTimestamp(sortedRows[0]?.updated_at || sortedRows[0]?.created_at || reportDate);

      return {
        id: reportDate,
        monday: reportDate,
        friday: reportDate,
        status: 'done',
        commitCount,
        repoCount,
        generatedAt,
        title: `${reportDate} 코드 변경 리포트`,
        overview: buildOverview(reportDate, blocks),
        highlights: buildHighlights(blocks),
        blockers: [],
        authors,
        overallSections: [],
        focusRepos: Array.from(new Set(blocks.map((block) => block.serviceLabel))),
        markdown: buildMarkdown(reportDate, blocks),
        stages: buildStages(blocks),
        detailBlocks: blocks,
      } satisfies GitWeeklyReportSample;
    });
};

export const fetchGitWeeklyReportsFromSupabase = async ({
  timeoutMs = 5000,
  limit = 250,
}: {
  timeoutMs?: number;
  limit?: number;
} = {}): Promise<GitWeeklyReportSample[] | null> => {
  const supabaseUrl =
    process.env.SUPABASE_URL?.trim() || process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_KEY?.trim();

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  try {
    const endpoint = new URL(
      '/rest/v1/git_report_blocks_export_v1',
      supabaseUrl.endsWith('/') ? supabaseUrl : `${supabaseUrl}/`,
    );

    endpoint.searchParams.set(
      'select',
      [
        'id',
        'report_date',
        'sort_order',
        'heading_text',
        'service_label',
        'service_name',
        'authored_time_label',
        'author_name',
        'author_email',
        'commit_message_label',
        'commit_messages',
        'service_description',
        'before_after_heading',
        'code_heading',
        'code_block_language',
        'code_block_markdown',
        'context_heading',
        'context_markdown',
        'raw_block_markdown',
        'source_markdown_path',
        'meta',
        'created_at',
        'updated_at',
        'before_after_rows',
      ].join(','),
    );
    endpoint.searchParams.set('order', 'report_date.desc');
    endpoint.searchParams.set('limit', String(limit));

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(endpoint.toString(), {
      method: 'GET',
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
      signal: controller.signal,
    }).finally(() => {
      clearTimeout(timeout);
    });

    if (!response.ok) {
      throw new Error(`Supabase request failed (${response.status})`);
    }

    const rows = await response.json();
    if (!Array.isArray(rows)) {
      throw new Error('Supabase payload must be an array');
    }

    return groupRowsToReports(rows.filter((row): row is GitReportBlockRow => isRecord(row)) as GitReportBlockRow[]);
  } catch (error) {
    console.error('[git-report-blocks] Supabase fetch failed', error);
    return null;
  }
};

export const buildGitWeeklyReportsPayload = (
  reports: GitWeeklyReportSample[],
  source: GitReportsFetchSource,
): GitReportsPayload => ({
  reports,
  meta: {
    source,
    total: reports.length,
  },
});

export type { GitReportsFetchSource, GitReportsPayload };
