import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const bookingSchema = z.object({
  serviceId: z.string().min(1, 'サービスIDが必要です'),
  scheduledAt: z.string().datetime('有効な日時を指定してください'),
  preQuestion: z.string().max(1000).optional(),
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
    const validatedData = bookingSchema.parse(body);

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

    // サービス情報を取得
    const service = await prisma.service.findUnique({
      where: { id: validatedData.serviceId, isActive: true },
      include: {
        diviner: true,
      },
    });

    if (!service) {
      return NextResponse.json(
        { error: 'サービスが見つかりません' },
        { status: 404 }
      );
    }

    // 初回かどうかをチェック
    const previousBooking = await prisma.booking.findFirst({
      where: {
        clientId: client.id,
        divinerId: service.diviner.id,
        status: 'COMPLETED',
      },
    });

    const isFirstTime = !previousBooking;
    const totalAmount =
      isFirstTime && service.firstTimePrice
        ? service.firstTimePrice
        : service.price;

    // ダブルブッキングチェック
    const scheduledAt = new Date(validatedData.scheduledAt);
    const scheduledEnd = new Date(
      scheduledAt.getTime() + service.durationMinutes * 60000
    );

    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        divinerId: service.diviner.id,
        status: { in: ['PENDING', 'CONFIRMED'] },
        OR: [
          {
            scheduledAt: {
              gte: scheduledAt,
              lt: scheduledEnd,
            },
          },
          {
            AND: [
              {
                scheduledAt: { lte: scheduledAt },
              },
            ],
          },
        ],
      },
    });

    if (conflictingBooking) {
      return NextResponse.json(
        { error: 'この時間帯は既に予約が入っています' },
        { status: 400 }
      );
    }

    // 予約を作成
    const booking = await prisma.booking.create({
      data: {
        clientId: client.id,
        serviceId: service.id,
        divinerId: service.diviner.id,
        scheduledAt,
        durationMinutes: service.durationMinutes,
        totalAmount,
        preQuestion: validatedData.preQuestion,
        status: 'PENDING',
      },
    });

    return NextResponse.json(
      {
        success: true,
        bookingId: booking.id,
        message: '予約が作成されました',
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

    console.error('Booking creation error:', error);
    return NextResponse.json(
      { error: '予約の作成中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const role = searchParams.get('role'); // 'client' or 'diviner'

    let bookings;

    if (role === 'diviner') {
      // 占い師として自分の予約を取得
      const diviner = await prisma.diviner.findUnique({
        where: { userId: session.user.id },
      });

      if (!diviner) {
        return NextResponse.json(
          { error: '占い師情報が見つかりません' },
          { status: 404 }
        );
      }

      bookings = await prisma.booking.findMany({
        where: {
          divinerId: diviner.id,
          ...(status && { status: status as never }),
        },
        include: {
          client: {
            select: {
              id: true,
              nickname: true,
            },
          },
          service: true,
          payment: true,
        },
        orderBy: { scheduledAt: 'desc' },
      });
    } else {
      // クライアントとして自分の予約を取得
      const client = await prisma.client.findUnique({
        where: { userId: session.user.id },
      });

      if (!client) {
        return NextResponse.json(
          { error: 'クライアント情報が見つかりません' },
          { status: 404 }
        );
      }

      bookings = await prisma.booking.findMany({
        where: {
          clientId: client.id,
          ...(status && { status: status as never }),
        },
        include: {
          service: {
            include: {
              diviner: {
                select: {
                  id: true,
                  displayName: true,
                  profileImageUrl: true,
                },
              },
            },
          },
          payment: true,
          review: true,
        },
        orderBy: { scheduledAt: 'desc' },
      });
    }

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Fetch bookings error:', error);
    return NextResponse.json(
      { error: '予約の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
