'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, addDays, setHours, setMinutes, isBefore, isAfter } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/toaster';
import { Calendar, Clock, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Service, Diviner, Client, Availability } from '@prisma/client';

const bookingSchema = z.object({
  scheduledAt: z.string().min(1, '予約日時を選択してください'),
  preQuestion: z.string().max(1000, '事前質問は1000文字以内で入力してください').optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingFormProps {
  service: Service;
  diviner: Diviner & {
    availabilities: Availability[];
    user: { name: string | null; image: string | null };
  };
  client: Client | null;
  isFirstTime: boolean;
  finalPrice: number;
}

// 予約可能な時間帯を生成
function generateTimeSlots(
  date: Date,
  availabilities: Availability[],
  durationMinutes: number
): string[] {
  const dayOfWeek = date.getDay();
  const dayAvailabilities = availabilities.filter((a) => a.dayOfWeek === dayOfWeek);

  const slots: string[] = [];
  const now = new Date();

  dayAvailabilities.forEach((availability) => {
    const [startHour, startMinute] = availability.startTime.split(':').map(Number);
    const [endHour, endMinute] = availability.endTime.split(':').map(Number);

    let current = setMinutes(setHours(date, startHour), startMinute);
    const end = setMinutes(setHours(date, endHour), endMinute);

    while (isBefore(current, end)) {
      const slotEnd = new Date(current.getTime() + durationMinutes * 60000);
      if (isBefore(slotEnd, end) || slotEnd.getTime() === end.getTime()) {
        // 過去の時間は除外
        if (isAfter(current, now)) {
          slots.push(format(current, 'HH:mm'));
        }
      }
      current = new Date(current.getTime() + 30 * 60000); // 30分刻み
    }
  });

  return slots;
}

export function BookingForm({
  service,
  diviner,
  client,
  isFirstTime,
  finalPrice,
}: BookingFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  });

  // カレンダー用の日付を生成
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];

    // 前月の日付を埋める
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // 当月の日付
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 予約可能な日かどうかをチェック
  const isAvailableDay = (date: Date): boolean => {
    if (isBefore(date, today)) return false;
    if (isAfter(date, addDays(today, 30))) return false; // 30日先まで
    const dayOfWeek = date.getDay();
    return diviner.availabilities.some((a) => a.dayOfWeek === dayOfWeek);
  };

  // 日付を選択
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setValue('scheduledAt', '');
  };

  // 時間を選択
  const handleTimeSelect = (time: string) => {
    if (!selectedDate) return;
    setSelectedTime(time);
    const [hours, minutes] = time.split(':').map(Number);
    const scheduledAt = new Date(selectedDate);
    scheduledAt.setHours(hours, minutes, 0, 0);
    setValue('scheduledAt', scheduledAt.toISOString());
  };

  const timeSlots = selectedDate
    ? generateTimeSlots(selectedDate, diviner.availabilities, service.durationMinutes)
    : [];

  const onSubmit = async (data: BookingFormData) => {
    if (!client) {
      toast({
        title: 'エラー',
        description: 'クライアント情報が見つかりません',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: service.id,
          scheduledAt: data.scheduledAt,
          preQuestion: data.preQuestion,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '予約に失敗しました');
      }

      toast({
        title: '予約完了',
        description: '予約が確定しました。決済に進みます。',
        variant: 'success',
      });

      // 決済ページへリダイレクト
      router.push(`/booking/${result.bookingId}/payment`);
    } catch (error) {
      toast({
        title: 'エラー',
        description: error instanceof Error ? error.message : '予約に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 日付選択 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            日付を選択
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* カレンダーナビゲーション */}
          <div className="flex items-center justify-between mb-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium">
              {format(currentMonth, 'yyyy年M月', { locale: ja })}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* 曜日ヘッダー */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['日', '月', '火', '水', '木', '金', '土'].map((day, i) => (
              <div
                key={day}
                className={`text-center text-sm font-medium py-2 ${
                  i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-500'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* 日付グリッド */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date, index) => {
              if (!date) {
                return <div key={index} className="h-10" />;
              }

              const isAvailable = isAvailableDay(date);
              const isSelected =
                selectedDate && date.toDateString() === selectedDate.toDateString();
              const isToday = date.toDateString() === new Date().toDateString();

              return (
                <button
                  key={index}
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => handleDateSelect(date)}
                  className={`h-10 rounded-lg text-sm transition-colors ${
                    isSelected
                      ? 'bg-primary-600 text-white'
                      : isAvailable
                      ? 'hover:bg-primary-100 text-gray-900'
                      : 'text-gray-300 cursor-not-allowed'
                  } ${isToday && !isSelected ? 'ring-2 ring-primary-300' : ''}`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {errors.scheduledAt && (
            <p className="mt-2 text-sm text-red-500">{errors.scheduledAt.message}</p>
          )}
        </CardContent>
      </Card>

      {/* 時間選択 */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              時間を選択
              <Badge variant="outline" className="ml-2">
                {format(selectedDate, 'M月d日(E)', { locale: ja })}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {timeSlots.length > 0 ? (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => handleTimeSelect(time)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      selectedTime === time
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 hover:bg-primary-100 text-gray-900'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                この日は予約可能な時間帯がありません
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* 事前質問 */}
      <Card>
        <CardHeader>
          <CardTitle>事前に伝えたいこと（任意）</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="鑑定の際に知っておいてほしいことや、具体的な相談内容があれば記入してください"
            {...register('preQuestion')}
            error={errors.preQuestion?.message}
          />
          <p className="mt-2 text-sm text-gray-500">
            ※生年月日や出生時刻など、鑑定に必要な情報があれば記入してください
          </p>
        </CardContent>
      </Card>

      {/* 確定ボタン */}
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isLoading || !selectedDate || !selectedTime}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            処理中...
          </>
        ) : (
          '決済に進む'
        )}
      </Button>
    </form>
  );
}
