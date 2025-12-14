import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // フィルターパラメータを取得
    const q = searchParams.get('q');
    const divination = searchParams.get('divination');
    const genre = searchParams.get('genre');
    const type = searchParams.get('type');
    const priceMin = searchParams.get('priceMin');
    const priceMax = searchParams.get('priceMax');
    const rating = searchParams.get('rating');
    const available = searchParams.get('available');
    const sort = searchParams.get('sort') || 'rating';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);

    // フィルター条件を構築
    const where: Record<string, unknown> = {
      status: 'APPROVED',
    };

    if (q) {
      where.displayName = {
        contains: q,
        mode: 'insensitive',
      };
    }

    if (available === 'true') {
      where.isOnline = true;
    }

    if (rating) {
      where.ratingAvg = {
        gte: parseFloat(rating),
      };
    }

    // 占術フィルター
    if (divination) {
      where.divinationTypes = {
        some: {
          divinationType: {
            slug: divination,
          },
        },
      };
    }

    // ジャンルフィルター
    if (genre) {
      where.consultationGenres = {
        some: {
          consultationGenre: {
            slug: genre,
          },
        },
      };
    }

    // 並び替え条件
    let orderBy: Record<string, string> = { ratingAvg: 'desc' };
    switch (sort) {
      case 'reviews':
        orderBy = { reviewCount: 'desc' };
        break;
      case 'new':
        orderBy = { createdAt: 'desc' };
        break;
      case 'bookings':
        orderBy = { bookingCount: 'desc' };
        break;
    }

    const skip = (page - 1) * limit;

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
          consultationGenres: {
            include: {
              consultationGenre: true,
            },
          },
          services: {
            where: { isActive: true },
            orderBy: { price: 'asc' },
            take: 5,
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.diviner.count({ where }),
    ]);

    // 価格フィルター（サービスの価格でフィルタリング）
    let filteredDiviners = diviners;
    if (priceMin || priceMax) {
      filteredDiviners = diviners.filter((diviner) => {
        if (diviner.services.length === 0) return false;
        const lowestPrice = Math.min(...diviner.services.map((s) => s.price));
        if (priceMin && lowestPrice < parseInt(priceMin, 10)) return false;
        if (priceMax && lowestPrice > parseInt(priceMax, 10)) return false;
        return true;
      });
    }

    // 鑑定形式フィルター
    if (type) {
      const typeMap: Record<string, string> = {
        video_call: 'VIDEO_CALL',
        voice_call: 'VOICE_CALL',
        chat: 'CHAT',
        email: 'EMAIL',
        in_person: 'IN_PERSON',
      };
      const consultationType = typeMap[type];
      if (consultationType) {
        filteredDiviners = filteredDiviners.filter((diviner) =>
          diviner.services.some((s) => s.consultationType === consultationType)
        );
      }
    }

    return NextResponse.json({
      diviners: filteredDiviners,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Fetch diviners error:', error);
    return NextResponse.json(
      { error: '占い師の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
