import type { Metadata } from 'next';
import { Noto_Sans_JP } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  variable: '--font-noto-sans-jp',
});

export const metadata: Metadata = {
  title: {
    default: 'ウラナビ - 占い師特化型予約プラットフォーム',
    template: '%s | ウラナビ',
  },
  description:
    'あなたの運命を、もっと身近に。占い師と相談者をつなぐオンラインプラットフォーム。タロット、西洋占星術、四柱推命など様々な占術の占い師を検索・予約できます。',
  keywords: [
    '占い',
    '占い師',
    '予約',
    'オンライン占い',
    'タロット',
    '西洋占星術',
    '四柱推命',
    'ビデオ通話占い',
    '電話占い',
    'チャット占い',
  ],
  authors: [{ name: 'UraNav Team' }],
  openGraph: {
    title: 'ウラナビ - 占い師特化型予約プラットフォーム',
    description:
      'あなたの運命を、もっと身近に。占い師と相談者をつなぐオンラインプラットフォーム。',
    type: 'website',
    locale: 'ja_JP',
    siteName: 'ウラナビ',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ウラナビ - 占い師特化型予約プラットフォーム',
    description:
      'あなたの運命を、もっと身近に。占い師と相談者をつなぐオンラインプラットフォーム。',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={notoSansJP.variable}>
      <body className="min-h-screen bg-gray-50 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
