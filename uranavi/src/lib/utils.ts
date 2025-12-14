import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
  }).format(price);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  return `${hours}:${minutes}`;
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

export function getConsultationTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    VIDEO_CALL: 'ビデオ通話',
    VOICE_CALL: '電話',
    CHAT: 'チャット',
    EMAIL: 'メール',
    IN_PERSON: '対面',
  };
  return labels[type] || type;
}

export function getBookingStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: '確認待ち',
    CONFIRMED: '予約確定',
    IN_PROGRESS: '鑑定中',
    COMPLETED: '完了',
    CANCELLED: 'キャンセル',
    NO_SHOW: '無断キャンセル',
  };
  return labels[status] || status;
}

export function getBookingStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'badge-warning',
    CONFIRMED: 'badge-primary',
    IN_PROGRESS: 'badge-secondary',
    COMPLETED: 'badge-success',
    CANCELLED: 'badge-danger',
    NO_SHOW: 'badge-danger',
  };
  return colors[status] || '';
}

export function calculatePlatformFee(amount: number): number {
  // サービス手数料 15% + 決済手数料 3.6% = 18.6%
  return Math.floor(amount * 0.186);
}

export function calculateDivinerEarnings(amount: number): number {
  return amount - calculatePlatformFee(amount);
}
