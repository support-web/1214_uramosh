'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, SlidersHorizontal, X } from 'lucide-react';

const divinationTypes = [
  { id: 'tarot', name: 'タロット占い' },
  { id: 'astrology', name: '西洋占星術' },
  { id: 'shichusuimei', name: '四柱推命' },
  { id: 'kyusei', name: '九星気学' },
  { id: 'palmistry', name: '手相占い' },
  { id: 'numerology', name: '数秘術' },
  { id: 'spiritual', name: '霊視・霊感' },
  { id: 'oracle', name: 'オラクルカード' },
  { id: 'rune', name: 'ルーン占い' },
  { id: 'fengshui', name: '風水' },
  { id: 'seimei', name: '姓名判断' },
  { id: 'dream', name: '夢占い' },
];

const consultationGenres = [
  { id: 'love', name: '恋愛・結婚' },
  { id: 'reunion', name: '復縁・復活愛' },
  { id: 'affair', name: '不倫・浮気' },
  { id: 'career', name: '仕事・キャリア' },
  { id: 'job', name: '転職・就職' },
  { id: 'relationship', name: '人間関係' },
  { id: 'family', name: '家庭問題' },
  { id: 'health', name: '健康・病気' },
  { id: 'money', name: '金運・財運' },
  { id: 'fortune', name: '開運・運勢' },
  { id: 'pastlife', name: '前世・過去世' },
  { id: 'pet', name: 'ペット' },
];

const consultationTypes = [
  { id: 'video_call', name: 'ビデオ通話' },
  { id: 'voice_call', name: '電話' },
  { id: 'chat', name: 'チャット' },
  { id: 'email', name: 'メール' },
  { id: 'in_person', name: '対面' },
];

const sortOptions = [
  { id: 'rating', name: '評価が高い順' },
  { id: 'reviews', name: 'レビューが多い順' },
  { id: 'price_low', name: '料金が安い順' },
  { id: 'price_high', name: '料金が高い順' },
  { id: 'new', name: '新着順' },
];

interface DivinerFiltersProps {
  searchParams: Record<string, string | undefined>;
}

export function DivinerFilters({ searchParams }: DivinerFiltersProps) {
  const router = useRouter();
  const [keyword, setKeyword] = useState(searchParams.q || '');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const updateFilters = (key: string, value: string | null) => {
    const params = new URLSearchParams();

    // 既存のパラメータを保持
    Object.entries(searchParams).forEach(([k, v]) => {
      if (v && k !== key) {
        params.set(k, v);
      }
    });

    // 新しい値を設定
    if (value) {
      params.set(key, value);
    }

    // ページをリセット
    params.delete('page');

    router.push(`/diviners?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters('q', keyword || null);
  };

  const clearFilters = () => {
    setKeyword('');
    router.push('/diviners');
  };

  const hasActiveFilters = Object.keys(searchParams).some(
    (key) => searchParams[key] && key !== 'page'
  );

  const FilterContent = () => (
    <div className="space-y-6">
      {/* 検索 */}
      <form onSubmit={handleSearch}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="占い師名で検索"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="pl-10"
          />
        </div>
      </form>

      {/* 並び替え */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">並び替え</h3>
        <select
          value={searchParams.sort || 'rating'}
          onChange={(e) => updateFilters('sort', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          {sortOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </div>

      {/* 鑑定方法 */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">鑑定方法</h3>
        <div className="flex flex-wrap gap-2">
          {consultationTypes.map((type) => (
            <Badge
              key={type.id}
              variant={searchParams.type === type.id ? 'default' : 'outline'}
              className="cursor-pointer hover:bg-primary-100"
              onClick={() =>
                updateFilters('type', searchParams.type === type.id ? null : type.id)
              }
            >
              {type.name}
            </Badge>
          ))}
        </div>
      </div>

      {/* 占術 */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">占術</h3>
        <div className="flex flex-wrap gap-2">
          {divinationTypes.map((divination) => (
            <Badge
              key={divination.id}
              variant={searchParams.divination === divination.id ? 'default' : 'outline'}
              className="cursor-pointer hover:bg-primary-100"
              onClick={() =>
                updateFilters(
                  'divination',
                  searchParams.divination === divination.id ? null : divination.id
                )
              }
            >
              {divination.name}
            </Badge>
          ))}
        </div>
      </div>

      {/* 相談ジャンル */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">相談ジャンル</h3>
        <div className="flex flex-wrap gap-2">
          {consultationGenres.map((genre) => (
            <Badge
              key={genre.id}
              variant={searchParams.genre === genre.id ? 'default' : 'outline'}
              className="cursor-pointer hover:bg-primary-100"
              onClick={() =>
                updateFilters('genre', searchParams.genre === genre.id ? null : genre.id)
              }
            >
              {genre.name}
            </Badge>
          ))}
        </div>
      </div>

      {/* 料金範囲 */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">料金範囲</h3>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="¥下限"
            value={searchParams.priceMin || ''}
            onChange={(e) => updateFilters('priceMin', e.target.value || null)}
            className="text-sm"
          />
          <span className="text-gray-500">〜</span>
          <Input
            type="number"
            placeholder="¥上限"
            value={searchParams.priceMax || ''}
            onChange={(e) => updateFilters('priceMax', e.target.value || null)}
            className="text-sm"
          />
        </div>
      </div>

      {/* 評価 */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">最低評価</h3>
        <select
          value={searchParams.rating || ''}
          onChange={(e) => updateFilters('rating', e.target.value || null)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">指定なし</option>
          <option value="4.5">4.5以上</option>
          <option value="4.0">4.0以上</option>
          <option value="3.5">3.5以上</option>
          <option value="3.0">3.0以上</option>
        </select>
      </div>

      {/* オンライン状態 */}
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={searchParams.available === 'true'}
            onChange={(e) =>
              updateFilters('available', e.target.checked ? 'true' : null)
            }
            className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <span className="ml-2 text-sm text-gray-700">今すぐ鑑定可能</span>
        </label>
      </div>

      {/* フィルターをクリア */}
      {hasActiveFilters && (
        <Button variant="ghost" className="w-full" onClick={clearFilters}>
          <X className="h-4 w-4 mr-2" />
          フィルターをクリア
        </Button>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setShowMobileFilters(true)}
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          フィルター
          {hasActiveFilters && (
            <Badge variant="default" className="ml-2">
              適用中
            </Badge>
          )}
        </Button>
      </div>

      {/* Mobile Filter Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowMobileFilters(false)}
          />
          <div className="absolute right-0 top-0 h-full w-80 max-w-full bg-white overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">フィルター</h2>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <FilterContent />
            </div>
          </div>
        </div>
      )}

      {/* Desktop Filter Sidebar */}
      <Card className="hidden lg:block sticky top-24">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5" />
            フィルター
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FilterContent />
        </CardContent>
      </Card>
    </>
  );
}
