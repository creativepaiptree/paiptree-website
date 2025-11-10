import { redirect } from 'next/navigation';

export default function PartnersPage() {
  // Partners 페이지는 About 페이지로 리다이렉트 (파트너 내용이 About에 통합됨)
  redirect('/about');
}
