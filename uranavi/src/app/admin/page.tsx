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
  Users,
  Sparkles,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';

export const metadata = {
  title: '管理者ダッシュボード',
};

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  // 統計情報を取得
  const [
    totalUsers,
    totalDiviners,
    totalClients,
    pendingDiviners,
    totalBookings,
    completedBookings,
    totalRevenue,
    recentDiviners,
    recentBookings,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.diviner.count(),
    prisma.client.count(),
    prisma.diviner.count({ where: { status: 'PENDING' } }),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: 'COMPLETED' } }),
    prisma.payment.aggregate({
      where: { status: 'SUCCEEDED' },
      _sum: { platformFee: true, amount: true },
    }),
    prisma.diviner.findMany({
      where: { status: 'PENDING' },
      include: {
        user: { select: { email: true, createdAt: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.booking.findMany({
      include: {
        client: { select: { nickname: true } },
        diviner: { select: { displayName: true } },
        service: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">管理者ダッシュボード</h1>
            <p className="text-gray-600">プラットフォームの管理・監視</p>
          </div>

          {/* Alert: Pending Approvals */}
          {pendingDiviners > 0 && (
            <div className="mb-8 p-4 rounded-lg bg-yellow-50 border border-yellow-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span className="text-yellow-800">
                  {pendingDiviners}件の占い師審査が保留中です
                </span>
              </div>
              <Link href="/admin/diviners?status=pending">
                <Button variant="outline" size="sm">
                  審査する
                </Button>
              </Link>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">総ユーザー数</p>
                    <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
                  </div>
                  <div className="p-3 rounded-full bg-blue-100">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">占い師数</p>
                    <p className="text-2xl font-bold text-gray-900">{totalDiviners}</p>
                  </div>
                  <div className="p-3 rounded-full bg-purple-100">
                    <Sparkles className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">総予約数</p>
                    <p className="text-2xl font-bold text-gray-900">{totalBookings}</p>
                  </div>
                  <div className="p-3 rounded-full bg-green-100">
                    <Calendar className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">プラットフォーム収益</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatPrice(totalRevenue._sum.platformFee || 0)}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-yellow-100">
                    <DollarSign className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pending Diviner Approvals */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  審査待ちの占い師
                </CardTitle>
                <Link href="/admin/diviners?status=pending">
                  <Button variant="ghost" size="sm">
                    すべて見る
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {recentDiviners.length > 0 ? (
                  <div className="space-y-4">
                    {recentDiviners.map((diviner) => (
                      <div
                        key={diviner.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {diviner.displayName}
                          </p>
                          <p className="text-sm text-gray-500">{diviner.user.email}</p>
                          <p className="text-xs text-gray-400">
                            {formatDate(diviner.createdAt)}に登録
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="warning">審査待ち</Badge>
                          <Link href={`/admin/diviners/${diviner.id}`}>
                            <Button size="sm">審査</Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-8 text-gray-500">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                    審査待ちの占い師はいません
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Bookings */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  最近の予約
                </CardTitle>
                <Link href="/admin/bookings">
                  <Button variant="ghost" size="sm">
                    すべて見る
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {recentBookings.length > 0 ? (
                  <div className="space-y-4">
                    {recentBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {booking.service.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {booking.client.nickname || '匿名'} → {booking.diviner.displayName}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatDate(booking.createdAt)}
                          </p>
                        </div>
                        <Badge
                          variant={
                            booking.status === 'COMPLETED'
                              ? 'success'
                              : booking.status === 'CANCELLED'
                              ? 'danger'
                              : 'default'
                          }
                        >
                          {booking.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    まだ予約がありません
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>管理メニュー</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/admin/diviners">
                    <Button variant="outline" className="w-full h-auto py-4 flex-col">
                      <Sparkles className="h-6 w-6 mb-2" />
                      <span>占い師管理</span>
                    </Button>
                  </Link>
                  <Link href="/admin/users">
                    <Button variant="outline" className="w-full h-auto py-4 flex-col">
                      <Users className="h-6 w-6 mb-2" />
                      <span>ユーザー管理</span>
                    </Button>
                  </Link>
                  <Link href="/admin/bookings">
                    <Button variant="outline" className="w-full h-auto py-4 flex-col">
                      <Calendar className="h-6 w-6 mb-2" />
                      <span>予約管理</span>
                    </Button>
                  </Link>
                  <Link href="/admin/revenue">
                    <Button variant="outline" className="w-full h-auto py-4 flex-col">
                      <TrendingUp className="h-6 w-6 mb-2" />
                      <span>売上レポート</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Platform Stats */}
            <Card>
              <CardHeader>
                <CardTitle>プラットフォーム統計</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">相談者数</span>
                    <span className="font-semibold">{totalClients}人</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">完了した鑑定</span>
                    <span className="font-semibold">{completedBookings}件</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">総流通額（GMV）</span>
                    <span className="font-semibold">
                      {formatPrice(totalRevenue._sum.amount || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">プラットフォーム収益</span>
                    <span className="font-semibold text-green-600">
                      {formatPrice(totalRevenue._sum.platformFee || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">完了率</span>
                    <span className="font-semibold">
                      {totalBookings > 0
                        ? ((completedBookings / totalBookings) * 100).toFixed(1)
                        : 0}
                      %
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
