import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Sparkles className="h-8 w-8 text-primary-400" />
              <span className="text-xl font-bold text-white">ウラナビ</span>
            </Link>
            <p className="text-sm text-gray-400 max-w-md">
              あなたの運命を、もっと身近に。
              占い師と相談者をつなぐオンラインプラットフォーム。
              タロット、西洋占星術、四柱推命など様々な占術の占い師を検索・予約できます。
            </p>
          </div>

          {/* サービス */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">サービス</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/diviners"
                  className="text-sm hover:text-primary-400 transition-colors"
                >
                  占い師を探す
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-sm hover:text-primary-400 transition-colors"
                >
                  ウラナビとは
                </Link>
              </li>
              <li>
                <Link
                  href="/register?role=diviner"
                  className="text-sm hover:text-primary-400 transition-colors"
                >
                  占い師として登録
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-sm hover:text-primary-400 transition-colors"
                >
                  よくある質問
                </Link>
              </li>
            </ul>
          </div>

          {/* サポート */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">サポート</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/contact"
                  className="text-sm hover:text-primary-400 transition-colors"
                >
                  お問い合わせ
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm hover:text-primary-400 transition-colors"
                >
                  利用規約
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm hover:text-primary-400 transition-colors"
                >
                  プライバシーポリシー
                </Link>
              </li>
              <li>
                <Link
                  href="/legal"
                  className="text-sm hover:text-primary-400 transition-colors"
                >
                  特定商取引法に基づく表記
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-500">
              &copy; {new Date().getFullYear()} ウラナビ All rights reserved.
            </p>
            <p className="text-xs text-gray-500">
              ※占いは娯楽目的であり、医療・法律相談の代替ではありません。
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
