import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { constructWebhookEvent } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Stripe signature is missing' },
        { status: 400 }
      );
    }

    const event = constructWebhookEvent(body, signature);

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const bookingId = paymentIntent.metadata?.bookingId;

        if (bookingId) {
          // 決済レコードを更新
          await prisma.payment.update({
            where: { stripePaymentId: paymentIntent.id },
            data: {
              status: 'SUCCEEDED',
              paidAt: new Date(),
            },
          });

          // 予約ステータスを更新
          await prisma.booking.update({
            where: { id: bookingId },
            data: { status: 'CONFIRMED' },
          });

          // 占い師の予約数を更新
          const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            select: { divinerId: true },
          });

          if (booking) {
            await prisma.diviner.update({
              where: { id: booking.divinerId },
              data: {
                bookingCount: { increment: 1 },
              },
            });
          }
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;

        await prisma.payment.update({
          where: { stripePaymentId: paymentIntent.id },
          data: { status: 'FAILED' },
        });
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object;
        const paymentIntentId = charge.payment_intent as string;

        if (paymentIntentId) {
          await prisma.payment.update({
            where: { stripePaymentId: paymentIntentId },
            data: { status: 'REFUNDED' },
          });

          // 予約をキャンセル
          const payment = await prisma.payment.findUnique({
            where: { stripePaymentId: paymentIntentId },
            select: { bookingId: true },
          });

          if (payment) {
            await prisma.booking.update({
              where: { id: payment.bookingId },
              data: {
                status: 'CANCELLED',
                cancelledAt: new Date(),
                cancelReason: '返金処理',
              },
            });
          }
        }
        break;
      }

      case 'account.updated': {
        const account = event.data.object;
        const divinerId = account.metadata?.divinerId;

        if (divinerId && account.details_submitted) {
          await prisma.diviner.update({
            where: { id: divinerId },
            data: { stripeAccountId: account.id },
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 400 }
    );
  }
}
