import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '카드 뒤집기 게임 - 기억력 테스트',
  description: '당신의 순간 기억력을 테스트하세요',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="theme-color" content="#667eea" />
      </head>
      <body>{children}</body>
    </html>
  )
}