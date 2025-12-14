import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Star,
  Heart,
  Share2,
  Clock,
  Video,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Calendar,
  Shield,
  Award,
  ChevronRight,
} from 'lucide-react';
import { formatPrice, getConsultationTypeLabel, formatDate } from '@/lib/utils';

interface DivinerPageProps {
  params: { id: string };
}

const consultationTypeIcons: Record<string, typeof Video> = {
  VIDEO_CALL: Video,
  VOICE_CALL: Phone,
  CHAT: MessageCircle,
  EMAIL: Mail,
  IN_PERSON: MapPin,
};

export async function generateMetadata({ params }: DivinerPageProps) {
  const diviner = await prisma.diviner.findUnique({
    where: { id: params.id },
    select: { displayName: true, bio: true },
  });

  if (!diviner) {
    return { title: '占い師が見つかりません' };
  }

  return {
    title: diviner.displayName,
    description: diviner.bio?.slice(0, 160) || `${diviner.displayName}のプロフィールページ`,
  };
}

export default async function DivinerPage({ params }: DivinerPageProps) {
  const diviner = await prisma.diviner.findUnique({
    where: { id: params.id, status: 'APPROVED' },
    include: {
      user: {
        select: {
          name: true,
          image: true,
        },
      },
      divinationTypes: {
        include: {
          divinationType: true,
        },
      },
      consultationGenres: {
        include: {
          consultationGenre: true,
        },
      },
      services: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      },
      reviews: {
        where: { isVisible: true },
        include: {
          client: {
            select: { nickname: true },
          },
          booking: {
            select: { scheduledAt: true, durationMinutes: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  });

  if (!diviner) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gray-50">
        {/* Cover Image */}
        <div className="relative h-48 md:h-64 bg-gradient-to-br from-primary-400 via-secondary-400 to-accent-400">
          {diviner.coverImageUrl && (
            <img
              src={diviner.coverImageUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
          {/* Profile Header */}
          <div className="relative -mt-16 mb-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                <AvatarImage src={diviner.profileImageUrl || diviner.user.image || ''} />
                <AvatarFallback className="text-4xl">
                  {diviner.displayName[0]}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 pt-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        {diviner.displayName}
                      </h1>
                      {diviner.isOnline && (
                        <Badge variant="success">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse" />
                          オンライン
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                        <span className="font-semibold text-gray-900">
                          {Number(diviner.ratingAvg).toFixed(1)}
                        </span>
                        <span className="text-gray-500">
                          ({diviner.reviewCount}件)
                        </span>
                      </div>
                      {diviner.yearsOfExperience && (
                        <div className="flex items-center gap-1 text-gray-500">
                          <Award className="h-4 w-4" />
                          <span>鑑定歴{diviner.yearsOfExperience}年</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span>{diviner.bookingCount}件の鑑定実績</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:ml-auto">
                    <Button variant="outline" size="icon">
                      <Heart className="h-5 w-5" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Share2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Divination Types & Genres */}
                <div className="flex flex-wrap gap-2">
                  {diviner.divinationTypes.map((dt) => (
                    <Badge key={dt.divinationType.id} variant="default">
                      {dt.divinationType.name}
                    </Badge>
                  ))}
                  {diviner.consultationGenres.map((cg) => (
                    <Badge key={cg.consultationGenre.id} variant="secondary">
                      {cg.consultationGenre.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Bio */}
              <Card>
                <CardHeader>
                  <CardTitle>自己紹介</CardTitle>
                </CardHeader>
                <CardContent>
                  {diviner.bio ? (
                    <p className="text-gray-700 whitespace-pre-wrap">{diviner.bio}</p>
                  ) : (
                    <p className="text-gray-500">自己紹介文はまだありません</p>
                  )}
                </CardContent>
              </Card>

              {/* Services */}
              <Card>
                <CardHeader>
                  <CardTitle>サービス一覧</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {diviner.services.length > 0 ? (
                    diviner.services.map((service) => {
                      const Icon = consultationTypeIcons[service.consultationType] || Video;
                      return (
                        <Link
                          key={service.id}
                          href={`/booking/${service.id}`}
                          className="block"
                        >
                          <div className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50/50 transition-all group">
                            <div className="p-3 rounded-lg bg-primary-100 text-primary-600">
                              <Icon className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                                {service.title}
                              </h4>
                              <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {service.durationMinutes}分
                                </span>
                                <span>{getConsultationTypeLabel(service.consultationType)}</span>
                              </div>
                              {service.description && (
                                <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                                  {service.description}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-semibold text-primary-600">
                                {formatPrice(service.price)}
                              </p>
                              {service.firstTimePrice && (
                                <p className="text-sm text-gray-500">
                                  初回 {formatPrice(service.firstTimePrice)}
                                </p>
                              )}
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                          </div>
                        </Link>
                      );
                    })
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      現在提供中のサービスはありません
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Reviews */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>レビュー</CardTitle>
                  {diviner.reviewCount > 5 && (
                    <Link href={`/diviners/${diviner.id}/reviews`}>
                      <Button variant="ghost" size="sm">
                        すべて見る
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  )}
                </CardHeader>
                <CardContent>
                  {diviner.reviews.length > 0 ? (
                    <div className="space-y-4">
                      {diviner.reviews.map((review) => (
                        <div
                          key={review.id}
                          className="p-4 rounded-lg bg-gray-50"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
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
                            <span className="text-sm text-gray-500">
                              {formatDate(review.createdAt)}
                            </span>
                          </div>
                          {review.comment && (
                            <p className="text-gray-700">{review.comment}</p>
                          )}
                          {review.replyText && (
                            <div className="mt-3 pl-4 border-l-2 border-primary-200">
                              <p className="text-sm text-gray-500 mb-1">
                                {diviner.displayName}からの返信
                              </p>
                              <p className="text-gray-700">{review.replyText}</p>
                            </div>
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
            </div>

            {/* Right Column - Booking CTA */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center mb-6">
                      <p className="text-sm text-gray-500 mb-1">最低料金</p>
                      <p className="text-3xl font-bold text-primary-600">
                        {diviner.services.length > 0
                          ? formatPrice(
                              Math.min(...diviner.services.map((s) => s.price))
                            )
                          : '---'}
                        <span className="text-base font-normal text-gray-500">〜</span>
                      </p>
                    </div>

                    <Link
                      href={
                        diviner.services.length > 0
                          ? `/booking/${diviner.services[0].id}`
                          : '#'
                      }
                    >
                      <Button
                        className="w-full"
                        size="lg"
                        disabled={diviner.services.length === 0}
                      >
                        予約する
                      </Button>
                    </Link>

                    <div className="mt-4 flex items-center justify-center gap-4">
                      <Button variant="outline" className="flex-1">
                        <Heart className="h-4 w-4 mr-2" />
                        お気に入り
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        質問する
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Trust Badges */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-100 text-green-600">
                          <Shield className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">本人確認済み</p>
                          <p className="text-sm text-gray-500">
                            身分証明書による確認が完了しています
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                          <Award className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {diviner.bookingCount}件の鑑定実績
                          </p>
                          <p className="text-sm text-gray-500">
                            多くの相談者に支持されています
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
