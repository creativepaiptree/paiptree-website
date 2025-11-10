import { redirect } from 'next/navigation';

export default function Home() {
  // 메인 페이지를 /about으로 리다이렉트
  redirect('/about');
}