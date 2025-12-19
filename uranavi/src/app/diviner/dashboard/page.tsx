import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Users,
  DollarSign,
  Star,
  Clock,
  Settings,
  Plus,
  TrendingUp,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { formatPrice, formatDateTime, getBookingStatusLabel, getBookingStatusColor } from '@/lib/utils';

export const metadata = {
  title: '占い師ダッシュボード',
};

export default async function DivinerDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'DIVINER') {
    redirect('/login');
  }

  const diviner = await prisma.diviner.findUnique({
    where: { userId: session.user.id },
    include: {
      services: {
        where: { isActive: true },
      },
    },
  });

  if (!diviner) {
    redirect('/diviner/setup');
  }

  // 統計情報を取得
  const [
    totalBookings,
    completedBookings,
    upcomingBookings,
    recentBookings,
    totalEarnings,
    recentReviews,
  ] = await Promise.all([
    prisma.booking.count({ where: { divinerId: diviner.id } }),
    prisma.booking.count({ where: { divinerId: diviner.id, status: 'COMPLETED' } }),
    prisma.booking.findMany({
      where: {
        divinerId: diviner.id,
        status: { in: ['PENDING', 'CONFIRMED'] },
        scheduledAt: { gte: new Date() },
      },
      include: {
        client: { select: { nickname: true } },
        service: true,
      },
      orderBy: { scheduledAt: 'asc' },
      take: 5,
    }),
    prisma.booking.findMany({
      where: { divinerId: diviner.id },
      include: {
        client: { select: { nickname: true } },
        service: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.payment.aggregate({
      where: {
        booking: { divinerId: diviner.id },
        status: 'SUCCEEDED',
      },
      _sum: { amount: true },
    }),
    prisma.review.findMany({
      where: { divinerId: diviner.id },
      include: {
        client: { select: { nickname: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 3,
    }),
  ]);

  const platformFeeRate = 0.186; // 18.6%
  const netEarnings = totalEarnings._sum.amount
    ? totalEarnings._sum.amount * (1 - platformFeeRate)
    : 0;

  // 審査中の場合の表示
  if (diviner.status === 'PENDING') {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-gray-50 flex items-center justify-center">
          <Card className="max-w-md mx-4">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              <h1 className="text-xl font-semibold text-gray-900 mb-2">
                アカウント審査中
              </h1>
              <p className="text-gray-600 mb-6">
                現在、あなたのアカウントは審査中です。
                審査が完了次第、メールにてお知らせいたします。
              </p>
              <Link href="/diviner/profile">
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  プロフィールを確認
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
              <p className="text-gray-600">
                こんにちは、{diviner.displayName}さん
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/diviner/services/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  サービスを追加
                </Button>
              </Link>
              <Link href="/diviner/settings">
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  設定
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">総予約数</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {totalBookings}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-primary-100">
                    <Calendar className="h-6 w-6 text-primary-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">完了した鑑定</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {completedBookings}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-green-100">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">売上（税引前）</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPrice(netEarnings)}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-blue-100">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">平均評価</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Number(diviner.ratingAvg).toFixed(1)}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-yellow-100">
                    <Star className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upcoming Bookings */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  今後の予約
                </CardTitle>
                <Link href="/diviner/bookings">
                  <Button variant="ghost" size="sm">
                    すべて見る
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {upcomingBookings.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {booking.client.nickname || '匿名'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {booking.service.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDateTime(booking.scheduledAt)}
                          </p>
                        </div>
                        <Badge className={getBookingStatusColor(booking.status)}>
                          {getBookingStatusLabel(booking.status)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    今後の予約はありません
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Recent Reviews */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  最近のレビュー
                </CardTitle>
                <Link href="/diviner/reviews">
                  <Button variant="ghost" size="sm">
                    すべて見る
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {recentReviews.length > 0 ? (
                  <div className="space-y-4">
                    {recentReviews.map((review) => (
                      <div key={review.id} className="p-3 rounded-lg bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">
                            {review.client.nickname || '匿名'}
                          </span>
                          <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {review.comment}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    まだレビューはありません
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>クイックアクション</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/diviner/schedule">
                    <Button variant="outline" className="w-full h-auto py-4 flex-col">
                      <Calendar className="h-6 w-6 mb-2" />
                      <span>スケジュール管理</span>
                    </Button>
                  </Link>
                  <Link href="/diviner/services">
                    <Button variant="outline" className="w-full h-auto py-4 flex-col">
                      <TrendingUp className="h-6 w-6 mb-2" />
                      <span>サービス管理</span>
                    </Button>
                  </Link>
                  <Link href="/diviner/customers">
                    <Button variant="outline" className="w-full h-auto py-4 flex-col">
                      <Users className="h-6 w-6 mb-2" />
                      <span>顧客管理</span>
                    </Button>
                  </Link>
                  <Link href="/diviner/earnings">
                    <Button variant="outline" className="w-full h-auto py-4 flex-col">
                      <DollarSign className="h-6 w-6 mb-2" />
                      <span>売上管理</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Services */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>サービス一覧</CardTitle>
                <Link href="/diviner/services">
                  <Button variant="ghost" size="sm">
                    管理
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {diviner.services.length > 0 ? (
                  <div className="space-y-3">
                    {diviner.services.slice(0, 3).map((service) => (
                      <div
                        key={service.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {service.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {service.durationMinutes}分 • {formatPrice(service.price)}
                          </p>
                        </div>
                        <Badge variant={service.isActive ? 'success' : 'outline'}>
                          {service.isActive ? '公開中' : '非公開'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">
                      まだサービスが登録されていません
                    </p>
                    <Link href="/diviner/services/new">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        サービスを追加
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
