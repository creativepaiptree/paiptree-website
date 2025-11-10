import { redirect } from 'next/navigation';

export default function NewsPage() {
  // News 페이지는 Newsroom 페이지로 리다이렉트 (뉴스 내용이 Newsroom으로 확장됨)
  redirect('/newsroom');
}
