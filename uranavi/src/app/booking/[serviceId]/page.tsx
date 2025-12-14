import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { BookingForm } from '@/components/booking/booking-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Star,
  Clock,
  Video,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Shield,
} from 'lucide-react';
import { formatPrice, getConsultationTypeLabel } from '@/lib/utils';

interface BookingPageProps {
  params: { serviceId: string };
}

const consultationTypeIcons: Record<string, typeof Video> = {
  VIDEO_CALL: Video,
  VOICE_CALL: Phone,
  CHAT: MessageCircle,
  EMAIL: Mail,
  IN_PERSON: MapPin,
};

export async function generateMetadata({ params }: BookingPageProps) {
  const service = await prisma.service.findUnique({
    where: { id: params.serviceId },
    include: {
      diviner: {
        select: { displayName: true },
      },
    },
  });

  if (!service) {
    return { title: 'サービスが見つかりません' };
  }

  return {
    title: `${service.title} - ${service.diviner.displayName}の予約`,
  };
}

export default async function BookingPage({ params }: BookingPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(`/login?callbackUrl=/booking/${params.serviceId}`);
  }

  const service = await prisma.service.findUnique({
    where: { id: params.serviceId, isActive: true },
    include: {
      diviner: {
        include: {
          user: {
            select: { name: true, image: true },
          },
          availabilities: {
            where: { isAvailable: true },
          },
        },
      },
    },
  });

  if (!service || service.diviner.status !== 'APPROVED') {
    notFound();
  }

  // クライアント情報を取得
  const client = await prisma.client.findUnique({
    where: { userId: session.user.id },
  });

  // 初回かどうかをチェック
  const previousBooking = client
    ? await prisma.booking.findFirst({
        where: {
          clientId: client.id,
          divinerId: service.diviner.id,
          status: 'COMPLETED',
        },
      })
    : null;

  const isFirstTime = !previousBooking;
  const finalPrice =
    isFirstTime && service.firstTimePrice
      ? service.firstTimePrice
      : service.price;

  const Icon = consultationTypeIcons[service.consultationType] || Video;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gray-50 py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">予約</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left - Booking Form */}
            <div className="lg:col-span-2">
              <BookingForm
                service={service}
                diviner={service.diviner}
                client={client}
                isFirstTime={isFirstTime}
                finalPrice={finalPrice}
              />
            </div>

            {/* Right - Service Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="text-lg">予約内容</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Diviner Info */}
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={
                          service.diviner.profileImageUrl ||
                          service.diviner.user.image ||
                          ''
                        }
                      />
                      <AvatarFallback>
                        {service.diviner.displayName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900">
                        {service.diviner.displayName}
                      </p>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span>{Number(service.diviner.ratingAvg).toFixed(1)}</span>
                        <span>({service.diviner.reviewCount}件)</span>
                      </div>
                    </div>
                  </div>

                  {/* Service Info */}
                  <div className="p-4 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-primary-100 text-primary-600">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {service.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {getConsultationTypeLabel(service.consultationType)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{service.durationMinutes}分</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">料金</span>
                      <span className="text-gray-900">
                        {formatPrice(service.price)}
                      </span>
                    </div>
                    {isFirstTime && service.firstTimePrice && (
                      <div className="flex justify-between items-center text-primary-600">
                        <span className="flex items-center gap-1">
                          <Badge variant="default" className="text-xs">
                            初回割引
                          </Badge>
                        </span>
                        <span>-{formatPrice(service.price - service.firstTimePrice)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                      <span className="font-semibold text-gray-900">合計</span>
                      <span className="text-2xl font-bold text-primary-600">
                        {formatPrice(finalPrice)}
                      </span>
                    </div>
                  </div>

                  {/* Trust Badge */}
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span>安全な決済システムで保護されています</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
