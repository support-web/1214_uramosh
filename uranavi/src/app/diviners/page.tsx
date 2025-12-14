import { Suspense } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { DivinerList } from '@/components/diviner/diviner-list';
import { DivinerFilters } from '@/components/diviner/diviner-filters';
import { Loader2 } from 'lucide-react';

export const metadata = {
  title: '占い師を探す',
  description: 'タロット、西洋占星術、四柱推命など様々な占術の占い師を検索・予約できます。',
};

interface DivinersPageProps {
  searchParams: {
    q?: string;
    divination?: string;
    genre?: string;
    type?: string;
    priceMin?: string;
    priceMax?: string;
    rating?: string;
    available?: string;
    sort?: string;
    page?: string;
  };
}

export default function DivinersPage({ searchParams }: DivinersPageProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              占い師を探す
            </h1>
            <p className="text-gray-600">
              あなたにぴったりの占い師を見つけましょう
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <aside className="w-full lg:w-72 shrink-0">
              <DivinerFilters searchParams={searchParams} />
            </aside>

            {/* Diviner List */}
            <div className="flex-1">
              <Suspense
                fallback={
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                  </div>
                }
              >
                <DivinerList searchParams={searchParams} />
              </Suspense>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
