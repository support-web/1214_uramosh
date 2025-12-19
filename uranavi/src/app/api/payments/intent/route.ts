import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { createPaymentIntent, PLATFORM_FEE_RATE } from '@/lib/stripe';
import { z } from 'zod';

const paymentIntentSchema = z.object({
  bookingId: z.string().min(1, '予約IDが必要です'),
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
    const validatedData = paymentIntentSchema.parse(body);

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
        diviner: true,
        payment: true,
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
        { error: 'この予約の決済を行う権限がありません' },
        { status: 403 }
      );
    }

    // 既に決済済みかチェック
    if (booking.payment?.status === 'SUCCEEDED') {
      return NextResponse.json(
        { error: 'この予約は既に決済済みです' },
        { status: 400 }
      );
    }

    // 占い師のStripeアカウントを確認
    if (!booking.diviner.stripeAccountId) {
      return NextResponse.json(
        { error: '占い師の決済アカウントが設定されていません' },
        { status: 400 }
      );
    }

    // 決済インテントを作成
    const { paymentIntent, platformFee } = await createPaymentIntent(
      booking.totalAmount,
      booking.divinerId,
      booking.diviner.stripeAccountId,
      booking.id
    );

    // 決済レコードを作成または更新
    await prisma.payment.upsert({
      where: { bookingId: booking.id },
      create: {
        bookingId: booking.id,
        amount: booking.totalAmount,
        platformFee,
        stripePaymentId: paymentIntent.id,
        status: 'PENDING',
      },
      update: {
        stripePaymentId: paymentIntent.id,
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      amount: booking.totalAmount,
      platformFee,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Payment intent creation error:', error);
    return NextResponse.json(
      { error: '決済の準備中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
