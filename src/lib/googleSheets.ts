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

const SHEET_ID = '1yZv36dAuFRSkWfbfuW3LBHPPn_kVrJ6Q6jVcPhbnyHw';
const SHEET_NAME = 'news_data';
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY;

export async function fetchNewsData(): Promise<NewsItem[]> {
  try {
    // Sheet name이 명확하지 않을 때는 기본 범위로 접근
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/A:I?key=${API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.values || data.values.length === 0) {
      return [];
    }
    
    // 첫 번째 행은 헤더이므로 제외
    const rows = data.values.slice(1);
    
    return rows.map((row: string[]): NewsItem => ({
      id: row[0] || '',
      title: row[1] || '',
      description: row[2] || '',
      category: row[3] || '',
      tags: row[4] || '',
      upload_date: row[5] || '',
      download_count: row[6] || '',
      thumbnail_url: row[7] || '',
      original_url: row[8] || ''
    }));
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