import type {
  User,
  Diviner,
  Client,
  Service,
  Booking,
  Review,
  Payment,
  DivinationType,
  ConsultationGenre,
  Availability,
  Coupon,
} from '@prisma/client';

// 拡張型定義

export type DivinerWithRelations = Diviner & {
  user: Pick<User, 'email' | 'name' | 'image'>;
  divinationTypes: {
    divinationType: DivinationType;
    isPrimary: boolean;
  }[];
  consultationGenres: {
    consultationGenre: ConsultationGenre;
  }[];
  services: Service[];
  reviews: (Review & {
    client: Pick<Client, 'nickname'>;
  })[];
};

export type ServiceWithDiviner = Service & {
  diviner: Pick<Diviner, 'id' | 'displayName' | 'profileImageUrl' | 'ratingAvg' | 'reviewCount' | 'isOnline'>;
};

export type BookingWithRelations = Booking & {
  service: Service & {
    diviner: Pick<Diviner, 'id' | 'displayName' | 'profileImageUrl'>;
  };
  client: Pick<Client, 'id' | 'nickname'>;
  payment: Payment | null;
  review: Review | null;
};

export type ReviewWithClient = Review & {
  client: Pick<Client, 'nickname'>;
  booking: Pick<Booking, 'scheduledAt' | 'durationMinutes'>;
};

// 検索フィルター型
export interface SearchFilters {
  keywords?: string;
  divinationTypes?: string[];
  consultationGenres?: string[];
  consultationTypes?: string[];
  priceMin?: number;
  priceMax?: number;
  ratingMin?: number;
  availableNow?: boolean;
  availableDate?: string;
  sortBy?: 'rating' | 'reviews' | 'price_low' | 'price_high' | 'new';
}

// ページネーション型
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// API レスポンス型
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// フォーム型
export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  role: 'CLIENT' | 'DIVINER';
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface DivinerProfileFormData {
  displayName: string;
  bio?: string;
  profileImageUrl?: string;
  coverImageUrl?: string;
  yearsOfExperience?: number;
  divinationTypeIds: string[];
  consultationGenreIds: string[];
}

export interface ServiceFormData {
  title: string;
  description?: string;
  thumbnailUrl?: string;
  consultationType: string;
  durationMinutes: number;
  price: number;
  firstTimePrice?: number;
  isActive: boolean;
}

export interface BookingFormData {
  serviceId: string;
  scheduledAt: string;
  preQuestion?: string;
}

export interface ReviewFormData {
  bookingId: string;
  rating: number;
  comment?: string;
}

// Stripe関連型
export interface StripeConnectAccountStatus {
  isOnboarded: boolean;
  accountId?: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
}

// 統計型
export interface DivinerStats {
  totalBookings: number;
  completedBookings: number;
  totalEarnings: number;
  averageRating: number;
  reviewCount: number;
  repeatCustomerRate: number;
}

export interface AdminStats {
  totalUsers: number;
  totalDiviners: number;
  totalClients: number;
  totalBookings: number;
  totalRevenue: number;
  platformFees: number;
  monthlyActiveUsers: number;
}
