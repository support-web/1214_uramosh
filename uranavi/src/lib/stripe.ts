import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
  typescript: true,
});

// プラットフォーム手数料率
export const PLATFORM_FEE_RATE = parseFloat(process.env.PLATFORM_FEE_RATE || '0.186');

// 最低振込金額
export const MIN_PAYOUT_AMOUNT = 3000;

// 振込手数料
export const PAYOUT_FEE = 300;

/**
 * Stripe Connect アカウントを作成
 */
export async function createConnectAccount(email: string, divinerId: string) {
  const account = await stripe.accounts.create({
    type: 'express',
    country: 'JP',
    email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    business_type: 'individual',
    metadata: {
      divinerId,
    },
  });

  return account;
}

/**
 * Stripe Connect オンボーディングリンクを作成
 */
export async function createAccountLink(accountId: string, returnUrl: string, refreshUrl: string) {
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: 'account_onboarding',
  });

  return accountLink;
}

/**
 * Stripe Connect アカウントの状態を確認
 */
export async function getAccountStatus(accountId: string) {
  const account = await stripe.accounts.retrieve(accountId);

  return {
    isOnboarded: account.details_submitted,
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
    requirements: account.requirements,
  };
}

/**
 * 決済インテントを作成
 */
export async function createPaymentIntent(
  amount: number,
  divinerId: string,
  connectedAccountId: string,
  bookingId: string
) {
  const platformFee = Math.floor(amount * PLATFORM_FEE_RATE);

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: 'jpy',
    application_fee_amount: platformFee,
    transfer_data: {
      destination: connectedAccountId,
    },
    metadata: {
      bookingId,
      divinerId,
    },
  });

  return {
    paymentIntent,
    platformFee,
  };
}

/**
 * 決済を確定
 */
export async function confirmPayment(paymentIntentId: string, paymentMethodId: string) {
  const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
    payment_method: paymentMethodId,
  });

  return paymentIntent;
}

/**
 * 返金処理
 */
export async function createRefund(
  paymentIntentId: string,
  amount?: number,
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
) {
  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount,
    reason,
  });

  return refund;
}

/**
 * Webhook署名を検証
 */
export function constructWebhookEvent(body: string | Buffer, signature: string) {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not defined');
  }

  return stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );
}
