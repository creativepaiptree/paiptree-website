// src/lib/googleSheets.ts
export interface NewsItem {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string;
  upload_date: string;
  download_count: string;
  thumbnail_url: string;
  original_url: string;
}

type NewsApiItem = Record<string, unknown>;

const DEFAULT_NEWS_API_BASE_URL = 'https://paiptree-ds.vercel.app';
const NEWS_API_BASE_URL = (
  process.env.NEXT_PUBLIC_PAIPTREE_NEWS_API_BASE_URL?.trim() || DEFAULT_NEWS_API_BASE_URL
).replace(/\/+$/, '');

const NEWS_API_URL = `${NEWS_API_BASE_URL}/api/news?tab=news&sortBy=date&sortOrder=desc`;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const asString = (value: unknown): string => {
  if (typeof value === 'string') {
    return value.trim();
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }
  return '';
};

const asTags = (value: unknown): string => {
  if (Array.isArray(value)) {
    return value.map((tag) => asString(tag)).filter(Boolean).join(', ');
  }
  return asString(value);
};

const extractRows = (payload: unknown): NewsApiItem[] => {
  if (Array.isArray(payload)) {
    return payload.filter(isRecord);
  }

  if (isRecord(payload) && Array.isArray(payload.data)) {
    return payload.data.filter(isRecord);
  }

  return [];
};

const toNewsItem = (row: NewsApiItem, index: number): NewsItem => {
  const originalUrl = asString(row.original_url || row.originalUrl || row.url || row.link);

  return {
    id: asString(row.id || row.news_id) || `news_${index + 1}`,
    title: asString(row.title),
    description: asString(row.description),
    category: asString(row.category || row.source),
    tags: asTags(row.tags),
    upload_date: asString(row.date || row.upload_date || row.created_at),
    download_count: asString(row.downloadCount ?? row.download_count ?? row.view_count),
    thumbnail_url: asString(row.thumbnail_url || row.thumbnailUrl),
    original_url: originalUrl,
  };
};

export async function fetchNewsData(): Promise<NewsItem[]> {
  try {
    const response = await fetch(NEWS_API_URL, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`뉴스 API 호출 실패: ${response.status}`);
    }

    const payload = await response.json();
    const rows = extractRows(payload);
    return rows.map(toNewsItem);
  } catch (error) {
    console.error('Failed to fetch news data:', error);
    return [];
  }
}

// 최신 뉴스 4개만 가져오는 함수
export async function fetchLatestNews(): Promise<NewsItem[]> {
  const allNews = await fetchNewsData();
  
  // upload_date 기준으로 정렬 (최신순)
  const sortedNews = allNews.sort((a, b) => {
    const dateA = new Date(a.upload_date).getTime();
    const dateB = new Date(b.upload_date).getTime();
    return dateB - dateA; // 내림차순 정렬
  });
  
  // 최신 4개만 반환
  return sortedNews.slice(0, 4);
}
