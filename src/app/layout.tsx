import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { LanguageProvider } from '@/contexts/LanguageContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Paiptree - AI-driven Smart Agriculture Solutions',
  description: 'SEED THE FUTURE, NOT THE PRESENT. AI 기반 스마트 양계 솔루션으로 농업의 미래를 혁신합니다.',
  keywords: 'AI, smart farming, agriculture, poultry, livestock, FarmersMind, IoT, agtech',
  authors: [{ name: 'paiptree.' }],
  icons: {
    icon: [{ url: '/favicon.ico', sizes: 'any' }],
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
      <body className={inter.className} data-theme="marketing" data-surface="corp">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}
