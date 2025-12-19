import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const reviewSchema = z.object({
  bookingId: z.string().min(1, '予約IDが必要です'),
  rating: z.number().min(1).max(5, '評価は1〜5で入力してください'),
  comment: z.string().max(1000, 'コメントは1000文字以内で入力してください').optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = reviewSchema.parse(body);

    // クライアント情報を取得
    const client = await prisma.client.findUnique({
      where: { userId: session.user.id },
    });

    if (!client) {
      return NextResponse.json(
        { error: 'クライアント情報が見つかりません' },
        { status: 404 }
      );
    }

    // 予約情報を取得
    const booking = await prisma.booking.findUnique({
      where: { id: validatedData.bookingId },
      include: {
        review: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: '予約が見つかりません' },
        { status: 404 }
      );
    }

    // 自分の予約かどうかをチェック
    if (booking.clientId !== client.id) {
      return NextResponse.json(
        { error: 'この予約のレビューを投稿する権限がありません' },
        { status: 403 }
      );
    }

    // 予約が完了しているかチェック
    if (booking.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: '完了した予約のみレビューを投稿できます' },
        { status: 400 }
      );
    }

    // 既にレビューがあるかチェック
    if (booking.review) {
      return NextResponse.json(
        { error: 'この予約には既にレビューが投稿されています' },
        { status: 400 }
      );
    }

    // レビューを作成
    const review = await prisma.review.create({
      data: {
        bookingId: booking.id,
        clientId: client.id,
        divinerId: booking.divinerId,
        rating: validatedData.rating,
        comment: validatedData.comment,
      },
    });

    // 占い師の評価を更新
    const divinerReviews = await prisma.review.findMany({
      where: { divinerId: booking.divinerId, isVisible: true },
      select: { rating: true },
    });

    const averageRating =
      divinerReviews.reduce((sum, r) => sum + r.rating, 0) / divinerReviews.length;

    await prisma.diviner.update({
      where: { id: booking.divinerId },
      data: {
        ratingAvg: averageRating,
        reviewCount: divinerReviews.length,
      },
    });

    return NextResponse.json(
      {
        success: true,
        review,
        message: 'レビューが投稿されました',
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Review creation error:', error);
    return NextResponse.json(
      { error: 'レビューの投稿中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const divinerId = searchParams.get('divinerId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    if (!divinerId) {
      return NextResponse.json(
        { error: '占い師IDが必要です' },
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: {
          divinerId,
          isVisible: true,
        },
        include: {
          client: {
            select: { nickname: true },
          },
          booking: {
            select: {
              scheduledAt: true,
              durationMinutes: true,
              service: {
                select: { title: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.review.count({
        where: {
          divinerId,
          isVisible: true,
        },
      }),
    ]);

    return NextResponse.json({
      reviews,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Fetch reviews error:', error);
    return NextResponse.json(
      { error: 'レビューの取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
