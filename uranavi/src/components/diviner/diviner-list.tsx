import Link from 'next/link';
import { prisma } from '@/lib/db';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Star,
  Heart,
  Video,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { formatPrice, getConsultationTypeLabel } from '@/lib/utils';

interface DivinerListProps {
  searchParams: {
    q?: string;
    divination?: string;
    genre?: string;
    type?: string;
    priceMin?: string;
    priceMax?: string;
    rating?: string;
    available?: string;
    sort?: string;
    page?: string;
  };
}

const ITEMS_PER_PAGE = 12;

const consultationTypeIcons: Record<string, typeof Video> = {
  VIDEO_CALL: Video,
  VOICE_CALL: Phone,
  CHAT: MessageCircle,
  EMAIL: Mail,
  IN_PERSON: MapPin,
};

export async function DivinerList({ searchParams }: DivinerListProps) {
  const page = parseInt(searchParams.page || '1', 10);
  const skip = (page - 1) * ITEMS_PER_PAGE;

  // フィルター条件を構築
  const where: Record<string, unknown> = {
    status: 'APPROVED',
  };

  if (searchParams.q) {
    where.displayName = {
      contains: searchParams.q,
      mode: 'insensitive',
    };
  }

  if (searchParams.available === 'true') {
    where.isOnline = true;
  }

  if (searchParams.rating) {
    where.ratingAvg = {
      gte: parseFloat(searchParams.rating),
    };
  }

  // 並び替え条件を構築
  let orderBy: Record<string, string> = { ratingAvg: 'desc' };
  switch (searchParams.sort) {
    case 'reviews':
      orderBy = { reviewCount: 'desc' };
      break;
    case 'new':
      orderBy = { createdAt: 'desc' };
      break;
    case 'price_low':
    case 'price_high':
      // 価格での並び替えはサービスの最低価格で行う必要があるが、
      // 簡略化のためデフォルトの評価順を使用
      break;
  }

  // 占い師一覧を取得
  const [diviners, total] = await Promise.all([
    prisma.diviner.findMany({
      where,
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
        services: {
          where: { isActive: true },
          orderBy: { price: 'asc' },
          take: 1,
        },
      },
      orderBy,
      skip,
      take: ITEMS_PER_PAGE,
    }),
    prisma.diviner.count({ where }),
  ]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  if (diviners.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-4">
          条件に一致する占い師が見つかりませんでした
        </p>
        <Link href="/diviners">
          <Button variant="outline">フィルターをクリア</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* 結果件数 */}
      <div className="mb-4 text-sm text-gray-500">
        {total}件の占い師が見つかりました
      </div>

      {/* 占い師一覧 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {diviners.map((diviner) => {
          const lowestPrice = diviner.services[0]?.price;
          const consultationTypes = [...new Set(diviner.services.map(s => s.consultationType))];

          return (
            <Link key={diviner.id} href={`/diviners/${diviner.id}`}>
              <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden group">
                {/* Header Image / Avatar */}
                <div className="relative h-32 bg-gradient-to-br from-primary-100 to-secondary-100">
                  {diviner.coverImageUrl && (
                    <img
                      src={diviner.coverImageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  )}
                  {diviner.isOnline && (
                    <div className="absolute top-3 left-3">
                      <Badge variant="success" className="text-xs">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse" />
                        オンライン
                      </Badge>
                    </div>
                  )}
                  <button
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/80 text-gray-400 hover:text-red-500 transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      // お気に入り機能
                    }}
                  >
                    <Heart className="h-4 w-4" />
                  </button>
                </div>

                {/* Profile */}
                <div className="p-4 -mt-10 relative">
                  <Avatar className="h-16 w-16 border-4 border-white shadow-md">
                    <AvatarImage src={diviner.profileImageUrl || diviner.user.image || ''} />
                    <AvatarFallback className="text-lg">
                      {diviner.displayName[0]}
                    </AvatarFallback>
                  </Avatar>

                  <div className="mt-3">
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                      {diviner.displayName}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span className="font-medium text-gray-900">
                        {Number(diviner.ratingAvg).toFixed(1)}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({diviner.reviewCount}件)
                      </span>
                    </div>

                    {/* Divination Types */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {diviner.divinationTypes.slice(0, 3).map((dt) => (
                        <Badge
                          key={dt.divinationType.id}
                          variant="outline"
                          className="text-xs"
                        >
                          {dt.divinationType.name}
                        </Badge>
                      ))}
                      {diviner.divinationTypes.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{diviner.divinationTypes.length - 3}
                        </Badge>
                      )}
                    </div>

                    {/* Consultation Types */}
                    <div className="flex items-center gap-2 mt-3 text-gray-400">
                      {consultationTypes.map((type) => {
                        const Icon = consultationTypeIcons[type] || Video;
                        return (
                          <Icon
                            key={type}
                            className="h-4 w-4"
                            title={getConsultationTypeLabel(type)}
                          />
                        );
                      })}
                    </div>

                    {/* Price */}
                    {lowestPrice && (
                      <p className="mt-3 text-primary-600 font-semibold">
                        {formatPrice(lowestPrice)}〜
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <Link
            href={`/diviners?${new URLSearchParams({
              ...searchParams,
              page: String(Math.max(1, page - 1)),
            }).toString()}`}
            className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
          >
            <Button variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }

              return (
                <Link
                  key={pageNum}
                  href={`/diviners?${new URLSearchParams({
                    ...searchParams,
                    page: String(pageNum),
                  }).toString()}`}
                >
                  <Button
                    variant={pageNum === page ? 'default' : 'ghost'}
                    size="sm"
                    className="w-10"
                  >
                    {pageNum}
                  </Button>
                </Link>
              );
            })}
          </div>

          <Link
            href={`/diviners?${new URLSearchParams({
              ...searchParams,
              page: String(Math.min(totalPages, page + 1)),
            }).toString()}`}
            className={page >= totalPages ? 'pointer-events-none opacity-50' : ''}
          >
            <Button variant="outline" size="sm">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
