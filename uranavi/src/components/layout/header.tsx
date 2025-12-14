'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Menu,
  X,
  Search,
  Heart,
  Calendar,
  User,
  LogOut,
  Settings,
  LayoutDashboard,
  Sparkles,
} from 'lucide-react';

export function Header() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const isLoading = status === 'loading';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">ウラナビ</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/diviners"
              className="text-gray-600 hover:text-primary-600 transition-colors"
            >
              占い師を探す
            </Link>
            <Link
              href="/about"
              className="text-gray-600 hover:text-primary-600 transition-colors"
            >
              ウラナビとは
            </Link>
            {session?.user?.role === 'DIVINER' && (
              <Link
                href="/diviner/dashboard"
                className="text-gray-600 hover:text-primary-600 transition-colors"
              >
                占い師ダッシュボード
              </Link>
            )}
            {session?.user?.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="text-gray-600 hover:text-primary-600 transition-colors"
              >
                管理画面
              </Link>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Search Button */}
            <Link
              href="/diviners"
              className="hidden sm:flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 transition-colors"
            >
              <Search className="h-4 w-4" />
              <span>占い師を検索</span>
            </Link>

            {isLoading ? (
              <div className="h-10 w-24 animate-pulse rounded-lg bg-gray-200" />
            ) : session ? (
              <div className="flex items-center gap-3">
                {/* Favorites */}
                <Link
                  href="/favorites"
                  className="hidden sm:flex p-2 text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <Heart className="h-5 w-5" />
                </Link>

                {/* Bookings */}
                <Link
                  href="/bookings"
                  className="hidden sm:flex p-2 text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <Calendar className="h-5 w-5" />
                </Link>

                {/* Profile Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center gap-2"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={session.user.image || ''} />
                      <AvatarFallback>
                        {session.user.name?.[0] || session.user.email?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </button>

                  {isProfileMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsProfileMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 rounded-lg border border-gray-100 bg-white py-2 shadow-lg z-20">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">
                            {session.user.name || 'ユーザー'}
                          </p>
                          <p className="text-xs text-gray-500">{session.user.email}</p>
                        </div>
                        {session.user.role === 'DIVINER' && (
                          <Link
                            href="/diviner/dashboard"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            <LayoutDashboard className="h-4 w-4" />
                            占い師ダッシュボード
                          </Link>
                        )}
                        <Link
                          href="/mypage"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <User className="h-4 w-4" />
                          マイページ
                        </Link>
                        <Link
                          href="/bookings"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <Calendar className="h-4 w-4" />
                          予約履歴
                        </Link>
                        <Link
                          href="/favorites"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <Heart className="h-4 w-4" />
                          お気に入り
                        </Link>
                        <Link
                          href="/settings"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <Settings className="h-4 w-4" />
                          設定
                        </Link>
                        <hr className="my-2 border-gray-100" />
                        <button
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            signOut({ callbackUrl: '/' });
                          }}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4" />
                          ログアウト
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost">ログイン</Button>
                </Link>
                <Link href="/register">
                  <Button>新規登録</Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4">
            <nav className="flex flex-col gap-2">
              <Link
                href="/diviners"
                className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                占い師を探す
              </Link>
              <Link
                href="/about"
                className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                ウラナビとは
              </Link>
              {session?.user?.role === 'DIVINER' && (
                <Link
                  href="/diviner/dashboard"
                  className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  占い師ダッシュボード
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
