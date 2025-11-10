import { redirect } from 'next/navigation';

export default function StableImagePage() {
  // Stable Image 페이지는 Services 페이지로 리다이렉트 (서비스 내용이 Services에 통합됨)
  redirect('/services');
}