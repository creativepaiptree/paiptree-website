import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Paiptree - AI-driven Smart Agriculture | FarmersMind Platform',
  description: 'AI 기반 스마트 양계 솔루션으로 농장 생산성을 혁신하고, 데이터 중심의 지속가능한 농업 생태계를 구축합니다.',
  keywords: 'AI, 스마트농업, 양계, 농장관리, FarmersMind, 농업혁신, 축산업',
  authors: [{ name: 'Paiptree Inc.' }],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
